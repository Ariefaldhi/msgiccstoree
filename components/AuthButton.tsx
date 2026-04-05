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
                className="hidden md:flex items-center gap-2 bg-[#1e293b] hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all duration-300 text-sm shadow-lg shadow-blue-900/20 hover:shadow-blue-600/30"
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
                className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold transition-all text-xs shadow-lg"
            >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
            </Link>
            <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                title="Logout"
            >
                <LogOut className="w-4 h-4" />
            </button>
        </div>
    );
}
