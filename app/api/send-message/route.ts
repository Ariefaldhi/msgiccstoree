import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { 
            customerTarget, 
            customerMessage, 
            groupTarget, 
            groupMessage 
        } = await request.json();

        if (!customerTarget || !customerMessage) {
            return NextResponse.json({ error: "Missing customer target or message" }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: settings } = await supabase.from("store_settings").select("fonnte_token, fonnte_group_id").eq("id", 1).single();

        const token = settings?.fonnte_token || process.env.FONNTE_TOKEN;

        if (!token) {
            return NextResponse.json({ error: "Fonnte token not configured" }, { status: 500 });
        }

        // 1. Send to Customer
        const cleanCustomerTarget = customerTarget.replace(/\D/g, '');
        const customerResponse = await fetch("https://api.fonnte.com/send", {
            method: "POST",
            headers: { Authorization: token },
            body: new URLSearchParams({
                target: cleanCustomerTarget,
                message: customerMessage,
                countryCode: "62",
            }),
        });
        const customerResult = await customerResponse.json();

        // 2. Send to Group (if target and message provided)
        let groupResult = null;
        const finalGroupTarget = groupTarget || settings?.fonnte_group_id;
        
        if (finalGroupTarget && groupMessage) {
            // Small delay to prevent issues with simultaneous sending
            await new Promise(resolve => setTimeout(resolve, 1000));

            const groupResponse = await fetch("https://api.fonnte.com/send", {
                method: "POST",
                headers: { Authorization: token },
                body: new URLSearchParams({
                    target: finalGroupTarget,
                    message: groupMessage,
                    delay: "2-5",
                }),
            });
            groupResult = await groupResponse.json();
        }

        if (customerResult.status) {
            return NextResponse.json({ 
                success: true, 
                customerResult, 
                groupResult 
            });
        } else {
            console.error("Fonnte Customer API Error:", customerResult);
            return NextResponse.json({ error: customerResult.reason || "Failed to send message to customer" }, { status: 500 });
        }
    } catch (error: any) {
        console.error("Internal Server Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
