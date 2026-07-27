import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyHermesAuth } from "../../auth";

export async function POST(req: NextRequest) {
    if (!verifyHermesAuth(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { order_id } = body;

        if (!order_id) {
            return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Fetch the order
        const { data: order, error: orderErr } = await supabase
            .from("orders")
            .select("*")
            .eq("id", order_id)
            .single();

        if (orderErr || !order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        if (order.status === "Pesanan Selesai") {
            return NextResponse.json({ error: "Order is already completed" }, { status: 400 });
        }

        let commissionToPay = 0;

        // If order belongs to an affiliator, calculate and distribute commission
        if (order.affiliator_id) {
            const { data: st } = await supabase.from("store_settings").select("affiliate_commission_percent").eq("id", 1).single();
            const currentPercent = st?.affiliate_commission_percent ?? 25;
            commissionToPay = Math.floor(order.profit * (currentPercent / 100));

            // Distribute commission to affiliator
            const { data: prof, error: profErr } = await supabase.from("profiles").select("balance").eq("id", order.affiliator_id).single();
            
            if (prof && !profErr) {
                await supabase.from("profiles").update({ 
                    balance: (prof.balance || 0) + commissionToPay 
                }).eq("id", order.affiliator_id);
            }
        }

        // Complete the order
        const { data: updatedOrder, error: updateErr } = await supabase
            .from("orders")
            .update({ 
                status: "Pesanan Selesai",
                ...(commissionToPay > 0 ? { commission: commissionToPay } : {})
            })
            .eq("id", order_id)
            .select()
            .single();

        if (updateErr) {
            return NextResponse.json({ error: updateErr.message }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            message: "Order confirmed successfully", 
            order: updatedOrder,
            commissionDistributed: commissionToPay
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}
