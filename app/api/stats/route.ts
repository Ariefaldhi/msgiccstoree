import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: orders } = await supabase
        .from("orders")
        .select("package_name, product_name")
        .eq("status", "Pesanan Selesai");

    return NextResponse.json({ orders: orders || [] });
}
