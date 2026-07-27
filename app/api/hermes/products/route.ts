import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyHermesAuth } from "../auth";

export async function GET(req: NextRequest) {
    if (!verifyHermesAuth(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
        .from("products")
        .select("id, title, packages(id, name, price, cost_price, reseller_price, is_available, type, duration)");

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
}
