import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyHermesAuth } from "../auth";

export async function PATCH(req: NextRequest) {
    if (!verifyHermesAuth(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { package_id, updates } = body;

        if (!package_id || !updates) {
            return NextResponse.json({ error: "Missing package_id or updates in payload" }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase
            .from("packages")
            .update(updates)
            .eq("id", package_id)
            .select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, updated: data });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}
