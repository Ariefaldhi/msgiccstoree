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
            <div className="container mx-auto px-4 max-w-lg">
                
                {/* User Snapshot */}
                <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100 mb-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500"></div>
                    
                    {user ? (
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-200">
                                {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="font-black text-slate-900 text-lg truncate">{profile?.full_name || "Pelanggan Setia"}</h2>
                                <p className="text-sm font-medium text-slate-500 truncate">{user.email}</p>
                                {profile?.role === 'admin' && (
                                    <span className="inline-flex mt-1 px-2 py-0.5 bg-slate-900 text-white text-[10px] font-black rounded uppercase tracking-widest">Administrator</span>
                                )}
                            </div>
                            <Link href="/profile" className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-colors">
                                <ChevronRight className="w-6 h-6" />
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <h2 className="font-black text-slate-900 text-lg mb-4">Masuk ke MsgiccStore</h2>
                            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-200 hover:bg-blue-500 transition-all">
                                <LogIn className="w-4 h-4" /> Login Sekarang
                            </Link>
                        </div>
                    )}
                </div>

                {/* Grid Menu */}
                <div className="grid grid-cols-1 gap-4">
                    {menuItems.map((item, i) => (
                        <Link 
                            key={i} 
                            href={item.reqAuth && !user ? "/login" : item.href}
                            className="flex items-center gap-4 bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group"
                        >
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                {item.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{item.title}</h3>
                                <p className="text-[11px] font-medium text-slate-400">{item.description}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300" />
                        </Link>
                    ))}
                </div>

                {/* Logout Button */}
                {user && (
                    <button 
                        onClick={handleLogout}
                        className="w-full mt-10 flex items-center justify-center gap-3 py-4 text-red-500 font-bold text-sm bg-red-50 rounded-2xl hover:bg-red-100 transition-colors"
                    >
                        <LogOut className="w-4 h-4" /> Logout dari Akun
                    </button>
                )}

                {/* Footer Info */}
                <div className="mt-12 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">MsgiccStore v2.3.0</p>
                    <div className="flex items-center justify-center gap-2 mt-2 opacity-20">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] font-bold">Secure Transactions</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
