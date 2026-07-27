"use client";

import Link from "next/link";
import { Search, Menu, X, Rocket, Home as HomeIcon, Grid2X2, MessageCircle, ShoppingBag, Store, Megaphone, User, MoreHorizontal } from "lucide-react";
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

    // Hide Navbar completely on Admin Dashboard for full screen layout
    if (pathname.startsWith("/admin")) {
        return null;
    }

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-500 ${isScrolled ? 'bg-white/20 backdrop-blur-3xl border-b border-white/40 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.03)]' : 'bg-transparent py-5'} `}>
                <div className="container mx-auto flex items-center gap-3 lg:gap-6 px-4 py-2">
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-2 lg:gap-3 shrink-0">
                        {logoUrl ? (
                            <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-xl overflow-hidden shrink-0 shadow-md">
                                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-xl bg-[#18181b] flex items-center justify-center text-white relative overflow-hidden shrink-0 shadow-md">
                                <span className="font-bold text-lg lg:text-xl italic select-none">{storeName.charAt(0).toUpperCase()}</span>
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
                            </div>
                        )}
                        <div className="flex flex-col justify-center">
                            <span className="text-xl lg:text-2xl font-black tracking-tight text-[#09090b] leading-none uppercase">
                                {storeName}
                            </span>
                            <span className="text-[0.55rem] lg:text-[0.65rem] font-bold tracking-[0.2em] text-gray-400 uppercase leading-none mt-1">
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

                    {/* Desktop Navigation - Premium Glass Buttons */}
                    <div className="hidden md:flex items-center gap-2 lg:gap-3">
                        <Link href="/" className="px-3 py-1.5 lg:px-5 lg:py-2 rounded-xl lg:rounded-[1.25rem] bg-blue-500/10 text-blue-700 font-black text-xs lg:text-sm hover:bg-blue-500/20 active:scale-95 transition-all flex items-center gap-1.5 lg:gap-2 border border-blue-500/10 backdrop-blur-xl shrink-0">
                            <HomeIcon className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Home
                        </Link>
                        <Link href="/reseller" className="px-3 py-1.5 lg:px-5 lg:py-2 rounded-xl lg:rounded-[1.25rem] bg-white/30 text-slate-700 font-bold text-xs lg:text-sm hover:bg-white/50 active:scale-95 transition-all flex items-center gap-1.5 lg:gap-2 border border-white/40 backdrop-blur-xl shadow-sm shrink-0">
                            <Store className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Reseller
                        </Link>
                        <Link href="/afiliator" className="px-3 py-1.5 lg:px-5 lg:py-2 rounded-xl lg:rounded-[1.25rem] bg-white/30 text-slate-700 font-bold text-xs lg:text-sm hover:bg-white/50 active:scale-95 transition-all flex items-center gap-1.5 lg:gap-2 border border-white/40 backdrop-blur-xl shadow-sm shrink-0">
                            <Megaphone className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Afiliator
                        </Link>
                        <Link href="/more" className="px-3 py-1.5 lg:px-5 lg:py-2 rounded-xl lg:rounded-[1.25rem] bg-white/60 text-slate-600 font-bold text-xs lg:text-sm hover:bg-white/90 active:scale-95 transition-all flex items-center gap-1.5 lg:gap-2 border border-white/80 backdrop-blur-md shadow-sm shrink-0">
                            <MoreHorizontal className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Lainnya
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-[200px] lg:max-w-sm hidden md:flex items-center bg-white/30 border border-white/50 backdrop-blur-2xl rounded-xl lg:rounded-[1.5rem] px-3 py-1.5 lg:px-5 lg:py-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:bg-white/70 transition-all cursor-text group shrink" onClick={handleSearchClick}>
                        <Search className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-blue-500 mr-2 lg:mr-3 group-hover:scale-110 transition-transform shrink-0" />
                        <span className="text-slate-500 font-semibold text-xs lg:text-sm truncate">Cari aplikasi...</span>
                    </div>

                    {/* Auth Button */}
                    <div className={cn("flex items-center gap-4 ml-auto shrink-0")}>
                        <AuthButton />
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

                <Link href="/more" className={cn(
                    "flex flex-col items-center gap-1 transition-all active:scale-90",
                    pathname === "/more" ? "text-blue-600" : "text-gray-400"
                )}>
                    <MoreHorizontal className={cn("w-6 h-6", pathname === "/more" ? "fill-blue-600/10" : "")} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Lainnya</span>
                </Link>
            </div>
        </>
    );
}
