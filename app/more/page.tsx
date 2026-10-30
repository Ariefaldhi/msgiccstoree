"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
    User, 
    Handshake, 
    Star, 
    MessageSquare, 
    Store, 
    LogOut, 
    LogIn, 
    ChevronRight,
    ShieldCheck,
    Megaphone,
    LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MorePage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
                setProfile(prof);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const menuItems = [
        {
            title: "Profil Saya",
            description: "Kelola akun dan status profil",
            icon: <User className="size-5 text-blue-600" />,
            href: "/profile",
            reqAuth: true
        },
        {
            title: "Partnership",
            description: "Program kerja sama & kemitraan khusus",
            icon: <Handshake className="size-5 text-indigo-600" />,
            href: "/partnership"
        },
        {
            title: "Testimoni",
            description: "Bukti transaksi dan kepuasan pelanggan",
            icon: <Star className="size-5 text-amber-500" />,
            href: "/testimonies"
        },
        {
            title: "Review",
            description: "Ulasan dari pengguna layanan kami",
            icon: <MessageSquare className="size-5 text-emerald-600" />,
            href: "/reviews"
        },
        {
            title: "Program Reseller",
            description: "Akses harga modal untuk jualan kembali",
            icon: <Store className="size-5 text-purple-600" />,
            href: "/reseller"
        },
        {
            title: "Program Afiliasi",
            description: "Dapatkan komisi dari setiap referral",
            icon: <Megaphone className="size-5 text-pink-500" />,
            href: "/afiliator",
            reqAuth: true
        },
        ...(profile?.role === 'admin' ? [{
            title: "Admin Dashboard",
            description: "Kelola pesanan, produk & pengaturan",
            icon: <LayoutDashboard className="size-5 text-slate-900" />,
            href: "/admin",
            reqAuth: true
        }] : [])
    ];

    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-32">
            <div className="container mx-auto px-4 max-w-lg md:max-w-3xl">
                
                {/* User Snapshot */}
                <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200/90 mb-6">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="size-14 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xl shrink-0">
                                {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="font-bold text-slate-900 text-base md:text-lg truncate">{profile?.full_name || "Pelanggan"}</h2>
                                <p className="text-xs md:text-sm text-slate-500 truncate">{user.email}</p>
                                {profile?.role === 'admin' && (
                                    <span className="inline-flex mt-1 px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded uppercase tracking-wider">Administrator</span>
                                )}
                            </div>
                            <Link href="/profile" className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                                <ChevronRight className="size-5" />
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <h2 className="font-bold text-slate-900 text-lg mb-1">Masuk ke Akun Anda</h2>
                            <p className="text-slate-500 text-xs mb-4">Login untuk mempermudah pemesanan dan mengakses riwayat.</p>
                            <Link href="/login" className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-xs hover:bg-slate-800 transition-colors shadow-2xs">
                                <LogIn className="size-4" /> Masuk Sekarang
                            </Link>
                        </div>
                    )}
                </div>

                <div className="mb-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Menu Layanan</h3>
                </div>

                {/* Grid Menu */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {menuItems.map((item, i) => (
                        <Link 
                            key={i} 
                            href={item.reqAuth && !user ? "/login" : item.href}
                            className="flex items-center gap-3.5 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors group"
                        >
                            <div className="size-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                {item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors truncate">{item.title}</h4>
                                <p className="text-xs text-slate-500 truncate mt-0.5">{item.description}</p>
                            </div>
                            <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0" />
                        </Link>
                    ))}
                </div>

                {/* Logout Button */}
                {user && (
                    <div className="mt-8 flex justify-center">
                        <button 
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors"
                        >
                            <LogOut className="size-4" /> Keluar dari Akun
                        </button>
                    </div>
                )}

                {/* Footer Info */}
                <div className="mt-12 text-center text-slate-400 text-xs">
                    <p className="font-mono text-[11px]">MsgiccStore v2.3.0</p>
                    <div className="inline-flex items-center gap-1.5 mt-1 text-[11px]">
                        <ShieldCheck className="size-3.5" />
                        Platform Terverifikasi & Aman
                    </div>
                </div>

            </div>
        </div>
    );
}
