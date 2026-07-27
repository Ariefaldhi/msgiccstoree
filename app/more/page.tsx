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
    const [loading, setLoading] = useState(true);
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
            setLoading(false);
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
            description: "Kelola akun dan riwayat pesanan",
            icon: <User className="w-6 h-6 text-blue-600" />,
            href: "/profile",
            reqAuth: true
        },
        {
            title: "Partnership",
            description: "Program kerja sama organisasi elite",
            icon: <Handshake className="w-6 h-6 text-indigo-600" />,
            href: "/partnership"
        },
        {
            title: "Testimoni",
            description: "Bukti transaksi & ulasan pelanggan",
            icon: <Star className="w-6 h-6 text-amber-500" />,
            href: "/testimonies"
        },
        {
            title: "Review",
            description: "Suara komunitas pelanggan kami",
            icon: <MessageSquare className="w-6 h-6 text-emerald-500" />,
            href: "/reviews"
        },
        {
            title: "Reseller VIP",
            description: "Mulai bisnis top-up Anda sendiri",
            icon: <Store className="w-6 h-6 text-purple-600" />,
            href: "/reseller"
        },
        {
            title: "Afiliator",
            description: "Cuan modal sebar link referal",
            icon: <Megaphone className="w-6 h-6 text-pink-500" />,
            href: "/afiliator",
            reqAuth: true
        },
        ...(profile?.role === 'admin' ? [{
            title: "Admin Dashboard",
            description: "Kelola seluruh sistem & pesanan",
            icon: <LayoutDashboard className="w-6 h-6 text-slate-900" />,
            href: "/admin",
            reqAuth: true
        }] : [])
    ];

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-32">
            {/* Background Orbs for Glassmorphism */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none translate-y-1/3 -translate-x-1/3"></div>

            <div className="container mx-auto px-4 max-w-lg md:max-w-4xl relative z-10">
                
                {/* User Snapshot */}
                <div className="bg-white/60 backdrop-blur-3xl rounded-[2.5rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 mb-8 md:mb-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500"></div>
                    
                    {user ? (
                        <div className="flex items-center gap-4 md:gap-6 relative z-10">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center text-white text-xl md:text-3xl font-black shadow-lg shadow-blue-200">
                                {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="font-black text-slate-900 text-lg md:text-2xl truncate">{profile?.full_name || "Pelanggan Setia"}</h2>
                                <p className="text-sm md:text-base font-medium text-slate-500 truncate">{user.email}</p>
                                {profile?.role === 'admin' && (
                                    <span className="inline-flex mt-2 px-3 py-1 bg-slate-900 text-white text-[10px] md:text-xs font-black rounded-md uppercase tracking-widest shadow-sm">Administrator</span>
                                )}
                            </div>
                            <Link href="/profile" className="p-3 md:p-4 bg-white/50 backdrop-blur-md rounded-xl md:rounded-2xl border border-white text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-sm">
                                <ChevronRight className="w-6 h-6" />
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center py-6 md:py-8">
                            <h2 className="font-black text-slate-900 text-xl md:text-2xl mb-2">Belum Masuk</h2>
                            <p className="text-slate-500 font-medium text-sm md:text-base mb-6">Silakan login untuk mengakses semua fitur akun.</p>
                            <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">
                                <LogIn className="w-4 h-4" /> Login ke Akun
                            </Link>
                        </div>
                    )}
                </div>

                <div className="mb-6 hidden md:block">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Menu Utama</h3>
                </div>

                {/* Grid Menu */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {menuItems.map((item, i) => (
                        <Link 
                            key={i} 
                            href={item.reqAuth && !user ? "/login" : item.href}
                            className="flex items-center gap-4 bg-white/60 backdrop-blur-3xl p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all active:scale-[0.98] group"
                        >
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-white/80 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-blue-50 transition-all duration-300">
                                {item.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900 text-sm md:text-base group-hover:text-blue-600 transition-colors">{item.title}</h3>
                                <p className="text-[11px] md:text-xs font-medium text-slate-500 mt-0.5">{item.description}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        </Link>
                    ))}
                </div>

                {/* Logout Button */}
                {user && (
                    <div className="mt-10 md:mt-12 flex justify-center">
                        <button 
                            onClick={handleLogout}
                            className="w-full md:w-auto md:px-12 flex items-center justify-center gap-3 py-4 text-red-500 font-bold text-sm bg-red-50 rounded-2xl hover:bg-red-100 hover:text-red-600 transition-colors"
                        >
                            <LogOut className="w-4 h-4" /> Logout dari Akun
                        </button>
                    </div>
                )}

                {/* Footer Info */}
                <div className="mt-12 md:mt-16 text-center">
                    <p className="text-[10px] md:text-xs font-black text-slate-300 uppercase tracking-[0.3em]">MsgiccStore v2.3.0</p>
                    <div className="flex items-center justify-center gap-2 mt-3 opacity-30">
                        <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="text-[10px] md:text-xs font-bold">Secure Transactions</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
