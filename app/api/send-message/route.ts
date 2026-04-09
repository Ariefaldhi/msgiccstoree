import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { target, adminTarget, message } = await request.json();

        if (!target || !message) {
            return NextResponse.json({ error: "Missing target or message" }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: settings } = await supabase.from("store_settings").select("fonnte_token").eq("id", 1).single();

        const token = settings?.fonnte_token || process.env.FONNTE_TOKEN;

        if (!token) {
            return NextResponse.json({ error: "Fonnte token not configured" }, { status: 500 });
        }

        // Clean targets: remove + and spaces
        const cleanTarget = target.replace(/\D/g, '');
        const cleanAdmin = adminTarget ? adminTarget.replace(/\D/g, '') : null;

        // Combine targets
        const allTargets = cleanAdmin ? `${cleanTarget},${cleanAdmin}` : cleanTarget;

        const response = await fetch("https://api.fonnte.com/send", {
            method: "POST",
            headers: {
                Authorization: token,
            },
            body: new URLSearchParams({
                target: allTargets,
                message: message,
                countryCode: "62",
                delay: "2-5", // Recommended when sending to multiple targets
            }),
        });

        const result = await response.json();

        if (result.status) {
            return NextResponse.json({ success: true, result });
        } else {
            console.error("Fonnte API Error:", result);
            return NextResponse.json({ error: result.reason || "Failed to send message" }, { status: 500 });
        }
    } catch (error: any) {
        console.error("Internal Server Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
