"use client";

import Link from "next/link";
import { Search, Menu, X, Rocket, Home as HomeIcon, Grid2X2, MessageCircle, ShoppingBag, Store, Megaphone, User } from "lucide-react";
import { cn } from "@/lib/utils";
import AuthButton from "./AuthButton";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Navbar({ storeName = "MSGICC STORE", logoUrl }: { storeName?: string, logoUrl?: string }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleSearchClick = () => {
        if (pathname === "/") {
            const input = document.getElementById("search-input");
            if (input) {
                input.scrollIntoView({ behavior: "smooth", block: "center" });
                (input as HTMLInputElement).focus();
            }
        } else {
            router.push("/?search=true#products");
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
                setProfile(prof);
            } else {
                setProfile(null);
            }
        };
        fetchProfile();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            fetchProfile();
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        setIsMenuOpen(false); // Close menu on route change
    }, [pathname]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Hide Navbar on Admin Dashboard
    if (pathname.startsWith("/admin")) return null;

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-xl border-b border-gray-100 py-4' : 'bg-transparent py-6'} `}>
                <div className="container mx-auto flex items-center gap-6 px-4 py-3">
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-3">
                        {logoUrl ? (
                            <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-md">
                                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-11 h-11 rounded-xl bg-[#18181b] flex items-center justify-center text-white relative overflow-hidden shrink-0 shadow-md">
                                <span className="font-bold text-xl italic select-none">{storeName.charAt(0).toUpperCase()}</span>
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
                            </div>
                        )}
                        <div className="flex flex-col justify-center">
                            <span className="text-2xl font-black tracking-tight text-[#09090b] leading-none uppercase">
                                {storeName}
                            </span>
                            <span className="text-[0.65rem] font-bold tracking-[0.2em] text-gray-400 uppercase leading-none mt-1">
                                MARKETPLACE V2.3
                            </span>
                        </div>
                    </Link>

                    {/* Mobile Menu Toggle - Hidden as we use Bottom Nav now */}
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="hidden ml-auto p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                    {/* Desktop Navigation - Separated 3D Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/" className="px-6 py-2.5 rounded-xl bg-blue-500 text-white font-bold text-sm shadow-[0_6px_0_theme(colors.blue.700)] hover:shadow-[0_3px_0_theme(colors.blue.700)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all flex items-center gap-2 border-2 border-blue-500">
                            <HomeIcon className="w-4 h-4" /> Home
                        </Link>
                        <Link href="/reseller" className="px-6 py-2.5 rounded-xl bg-white text-gray-500 font-bold text-sm shadow-[0_6px_0_#cbd5e1] hover:shadow-[0_3px_0_#cbd5e1] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all flex items-center gap-2 border-2 border-gray-100">
                            <Store className="w-4 h-4" /> Reseller
                        </Link>
                        <Link href="/afiliator" className="px-6 py-2.5 rounded-xl bg-white text-gray-500 font-bold text-sm shadow-[0_6px_0_#cbd5e1] hover:shadow-[0_3px_0_#cbd5e1] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all flex items-center gap-2 border-2 border-gray-100">
                            <Megaphone className="w-4 h-4" /> Afiliator
                        </Link>

                        <button 
                            onClick={handleSearchClick}
                            className="px-6 py-2.5 rounded-xl bg-white text-gray-500 font-bold text-sm shadow-[0_6px_0_#cbd5e1] hover:shadow-[0_3px_0_#cbd5e1] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all flex items-center gap-2 border-2 border-gray-100"
                        >
                            <Search className="w-4 h-4" /> Cari
                        </button>
                    </div>

                    {/* Partner Balance Display */}
                    {profile && (profile.is_reseller || profile.is_affiliator || profile.role === 'admin') && (
                        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800 ml-auto group transition-all hover:scale-105">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Saldo Anda</span>
                                <span className="text-sm font-black text-emerald-400 leading-none">
                                    Rp {profile.balance?.toLocaleString('id-ID') || '0'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Auth Button */}
                    <div className={cn("flex items-center gap-4", !profile && "ml-auto")}>
                        <AuthButton />
                    </div>

                    {/* Hubungi Admin */}
                    <div className="hidden md:block ml-auto">
                        <button className="bg-[#1e293b] hover:bg-[#2c3e50] text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-[0_4px_0_#0f172a] hover:shadow-[0_2px_0_#0f172a] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all">
                            Hubungi Admin
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay - Still available if needed */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-xl p-4 space-y-3 animate-in slide-in-from-top-4 duration-200">
                        <Link 
                            href="/" 
                            className={cn(
                                "flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all",
                                pathname === "/" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"
                            )}
                        >
                            <HomeIcon className="w-5 h-5" /> Home
                        </Link>
                        <Link 
                            href="/reseller" 
                            className={cn(
                                "flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all",
                                pathname === "/reseller" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"
                            )}
                        >
                            <Store className="w-5 h-5" /> Reseller
                        </Link>
                        <Link 
                            href="/afiliator" 
                            className={cn(
                                "flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all",
                                pathname === "/afiliator" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"
                            )}
                        >
                            <Megaphone className="w-5 h-5" /> Afiliator
                        </Link>
                    </div>
                )}
            </nav>

            {/* Mobile Bottom Navigation Bar - Fixed at the very bottom of the viewport */}
            <div className="md:hidden fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-xl border border-gray-100 px-6 py-3 flex items-center justify-between z-[1000] shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-3xl pb-[calc(12px+env(safe-area-inset-bottom,0px))]">
                <Link href="/" className={cn(
                    "flex flex-col items-center gap-1 transition-all active:scale-90",
                    pathname === "/" ? "text-blue-600" : "text-gray-400"
                )}>
                    <HomeIcon className={cn("w-6 h-6", pathname === "/" ? "fill-blue-600/10" : "")} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Home</span>
                </Link>

                <Link href="/reseller" className={cn(
                    "flex flex-col items-center gap-1 transition-all active:scale-90",
                    pathname === "/reseller" ? "text-blue-600" : "text-gray-400"
                )}>
                    <Store className={cn("w-6 h-6", pathname === "/reseller" ? "fill-blue-600/10" : "")} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Reseller</span>
                </Link>

                <div className="flex flex-col items-center -mt-10">
                    <button 
                        onClick={handleSearchClick}
                        className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 border-4 border-white active:scale-95 transition-all"
                    >
                        <Search className="w-6 h-6" />
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-tight text-gray-400 mt-1">Cari</span>
                </div>

                <Link href="/afiliator" className={cn(
                    "flex flex-col items-center gap-1 transition-all active:scale-90",
                    pathname === "/afiliator" ? "text-blue-600" : "text-gray-400"
                )}>
                    <Megaphone className={cn("w-6 h-6", pathname === "/afiliator" ? "fill-blue-600/10" : "")} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Afiliator</span>
                </Link>

                <Link href={profile ? "/profile" : "/login"} className={cn(
                    "flex flex-col items-center gap-1 transition-all active:scale-90",
                    pathname.includes("/profile") || pathname === "/login" ? "text-blue-600" : "text-gray-400"
                )}>
                    <User className={cn("w-6 h-6", pathname.includes("/profile") || pathname === "/login" ? "fill-blue-600/10" : "")} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">{profile ? 'Profil' : 'Masuk'}</span>
                </Link>
            </div>
        </>
    );
}
