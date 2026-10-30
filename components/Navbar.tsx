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
            <nav className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200/80 py-2.5 shadow-xs' : 'bg-slate-50/80 backdrop-blur-sm border-b border-slate-200/40 py-3.5'}`}>
                <div className="container mx-auto flex items-center gap-3 lg:gap-6 px-4">
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-2.5 shrink-0">
                        {logoUrl ? (
                            <div className="size-9 lg:size-10 rounded-xl overflow-hidden shrink-0 border border-slate-200/80 shadow-xs">
                                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="size-9 lg:size-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-xs">
                                <span className="font-bold text-base lg:text-lg select-none">{storeName.charAt(0).toUpperCase()}</span>
                            </div>
                        )}
                        <div className="flex flex-col justify-center">
                            <span className="text-base lg:text-lg font-bold tracking-tight text-slate-900 leading-none">
                                {storeName}
                            </span>
                            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase leading-none mt-1">
                                Marketplace
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

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1 lg:gap-1.5 ml-2">
                        <Link 
                            href="/" 
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-colors flex items-center gap-2",
                                pathname === "/" 
                                    ? "bg-slate-900 text-white shadow-2xs" 
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            )}
                        >
                            <HomeIcon className="size-4" /> Home
                        </Link>
                        <Link 
                            href="/reseller" 
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-colors flex items-center gap-2",
                                pathname === "/reseller" 
                                    ? "bg-slate-900 text-white shadow-2xs" 
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            )}
                        >
                            <Store className="size-4" /> Reseller
                        </Link>
                        <Link 
                            href="/afiliator" 
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-colors flex items-center gap-2",
                                pathname === "/afiliator" 
                                    ? "bg-slate-900 text-white shadow-2xs" 
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            )}
                        >
                            <Megaphone className="size-4" /> Afiliator
                        </Link>
                        <Link 
                            href="/more" 
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-colors flex items-center gap-2",
                                pathname === "/more" 
                                    ? "bg-slate-900 text-white shadow-2xs" 
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            )}
                        >
                            <MoreHorizontal className="size-4" /> Lainnya
                        </Link>
                    </div>

                    {/* Search Bar Trigger */}
                    <div 
                        className="flex-1 max-w-[200px] lg:max-w-xs hidden md:flex items-center bg-white border border-slate-200/90 rounded-xl px-3.5 py-1.5 text-xs text-slate-400 hover:border-slate-300 hover:text-slate-600 shadow-2xs transition-all cursor-text" 
                        onClick={handleSearchClick}
                    >
                        <Search className="size-3.5 text-slate-400 mr-2 shrink-0" />
                        <span className="truncate font-medium">Cari aplikasi...</span>
                    </div>

                    {/* Auth Button */}
                    <div className={cn("flex items-center gap-3 ml-auto shrink-0")}>
                        <AuthButton />
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg p-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
                        <Link 
                            href="/" 
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-xl font-semibold text-sm transition-colors",
                                pathname === "/" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            <HomeIcon className="size-4" /> Home
                        </Link>
                        <Link 
                            href="/reseller" 
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-xl font-semibold text-sm transition-colors",
                                pathname === "/reseller" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            <Store className="size-4" /> Reseller
                        </Link>
                        <Link 
                            href="/afiliator" 
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-xl font-semibold text-sm transition-colors",
                                pathname === "/afiliator" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            <Megaphone className="size-4" /> Afiliator
                        </Link>
                    </div>
                )}
            </nav>

            {/* Mobile Bottom Navigation Bar */}
            <div className="md:hidden fixed bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md border border-slate-200/90 px-4 py-2 flex items-center justify-around z-[1000] shadow-lg shadow-slate-900/5 rounded-2xl pb-[calc(8px+env(safe-area-inset-bottom,0px))]">
                <Link href="/" className={cn(
                    "flex flex-col items-center gap-1 transition-colors px-2 py-1",
                    pathname === "/" ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-600"
                )}>
                    <HomeIcon className="size-5" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold">Home</span>
                </Link>

                <Link href="/reseller" className={cn(
                    "flex flex-col items-center gap-1 transition-colors px-2 py-1",
                    pathname === "/reseller" ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-600"
                )}>
                    <Store className="size-5" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold">Reseller</span>
                </Link>

                <button 
                    onClick={handleSearchClick}
                    className="size-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-sm -mt-5 active:scale-95 transition-all"
                    aria-label="Cari Produk"
                >
                    <Search className="size-5" />
                </button>

                <Link href="/afiliator" className={cn(
                    "flex flex-col items-center gap-1 transition-colors px-2 py-1",
                    pathname === "/afiliator" ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-600"
                )}>
                    <Megaphone className="size-5" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold">Afiliasi</span>
                </Link>

                <Link href="/more" className={cn(
                    "flex flex-col items-center gap-1 transition-colors px-2 py-1",
                    pathname === "/more" ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-600"
                )}>
                    <MoreHorizontal className="size-5" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold">Lainnya</span>
                </Link>
            </div>
        </>
    );
}
