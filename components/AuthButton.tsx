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

    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const getUserAndProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single();
                setProfile(prof);
            }
        };
        getUserAndProfile();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                supabase.from("profiles").select("role").eq("id", session.user.id).single().then(({ data }) => setProfile(data));
            } else {
                setProfile(null);
            }
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
                className="hidden md:inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold text-xs transition-colors shadow-xs"
            >
                <User className="w-4 h-4" />
                <span>Masuk</span>
            </Link>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Link
                href="/profile"
                className="hidden md:inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl font-semibold text-xs transition-colors border border-slate-200/80"
            >
                <User className="w-4 h-4 text-slate-500" />
                <span>Profil</span>
            </Link>
            {profile?.role === 'admin' && (
                <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-xl font-semibold text-xs transition-colors shadow-xs"
                >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Admin</span>
                </Link>
            )}
            <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200/80 transition-colors"
                title="Logout"
            >
                <LogOut className="w-4 h-4" />
            </button>
        </div>
    );
}
