import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyHermesAuth } from "../auth";

export async function GET(req: NextRequest) {
    if (!verifyHermesAuth(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });

    if (status) {
        query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
}
