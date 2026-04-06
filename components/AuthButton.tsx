"use client";

import { createClient } from "@/lib/supabase/client";
import { User, LogOut, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthButton() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (_event === 'SIGNED_OUT') {
                router.refresh();
            }
        });

        return () => subscription.unsubscribe();
    }, [router, supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    if (!user) {
        return (
            <Link
                href="/login"
                className="hidden md:flex items-center gap-2 bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-[0_6px_0_theme(colors.blue.700)] hover:shadow-[0_3px_0_theme(colors.blue.700)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all border-2 border-blue-500"
            >
                <User className="w-4 h-4" />
                <span>Login</span>
            </Link>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Link
                href="/admin"
                className="hidden md:flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-[0_6px_0_theme(colors.blue.800)] hover:shadow-[0_3px_0_theme(colors.blue.800)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all border-2 border-blue-600"
            >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
            </Link>
            <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl bg-red-50 text-red-500 shadow-[0_4px_0_theme(colors.red.200)] hover:shadow-[0_2px_0_theme(colors.red.200)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all border-2 border-red-50 border-b-0"
                title="Logout"
            >
                <LogOut className="w-4 h-4" />
            </button>
        </div>
    );
}
