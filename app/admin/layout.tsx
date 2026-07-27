"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Tags, Settings, LogOut, ShoppingBag, Zap, Users, Wallet, MoreVertical, X, Star, MessageSquare, Megaphone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AdminCurrencyProvider } from "@/components/admin/AdminCurrencyProvider";
import { CurrencyToggle } from "@/components/admin/CurrencyToggle";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        setIsMoreOpen(false); // Close menu on route change
    }, [pathname]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const navItems = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Categories", href: "/admin/categories", icon: Tags },
        { name: "Products", href: "/admin/products", icon: Package },
        { name: "Promo", href: "/admin/promo", icon: Zap },
        { name: "Banners", href: "/admin/banners", icon: Star },
        { name: "Testimoni", href: "/admin/testimonies", icon: Star },
        { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
        { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Afiliasi", href: "/admin/affiliates", icon: Megaphone },
        { name: "Withdrawals", href: "/admin/withdrawals", icon: Wallet },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ];

    return (
        <AdminCurrencyProvider>
        <div className="fixed inset-0 z-[99999] bg-slate-50 flex overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 -translate-x-1/3 z-0"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none translate-y-1/3 translate-x-1/3 z-0"></div>

            {/* Sidebar */}
            <aside className="w-64 bg-white/60 backdrop-blur-3xl border-r border-white/60 h-full hidden md:flex flex-col shrink-0 relative z-10 shadow-[8px_0_30px_rgb(0,0,0,0.02)]">
                <div className="p-4 md:p-6 border-b border-white/40">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
                            M
                        </div>
                        <span className="font-bold text-sm text-slate-900 tracking-tight">MsgiccAdmin</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive
                                        ? "bg-white text-blue-600 shadow-sm border border-white"
                                        : "text-slate-500 hover:bg-white/50 hover:text-slate-900"
                                    }`}
                            >
                                <item.icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/40 space-y-2">
                    <CurrencyToggle />
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 w-full transition-all border border-transparent hover:border-red-100"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-full overflow-y-auto bg-transparent relative z-10">
                <div className="p-3 md:p-8 pb-32 md:pb-10 min-h-full">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation for Admin - Fixed at the very bottom of the viewport */}
            <div className="md:hidden fixed bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xl border border-slate-200 px-4 py-3 flex items-center justify-between z-[1001] shadow-[0_8px_30px_rgba(0,0,0,0.15)] rounded-[2rem] animate-in slide-in-from-bottom-5 duration-300">
                <Link href="/admin" className={cn(
                    "flex flex-col items-center gap-1 transition-all active:scale-90 flex-1",
                    pathname === "/admin" ? "text-blue-600" : "text-slate-400"
                )}>
                    <LayoutDashboard className={cn("w-5 h-5", pathname === "/admin" ? "fill-blue-600/10" : "")} />
                    <span className="text-[9px] font-bold uppercase tracking-tight">Dashboard</span>
                </Link>

                <Link href="/admin/products" className={cn(
                    "flex flex-col items-center gap-1 transition-all active:scale-90 flex-1",
                    pathname === "/admin/products" ? "text-blue-600" : "text-slate-400"
                )}>
                    <Package className={cn("w-5 h-5", pathname === "/admin/products" ? "fill-blue-600/10" : "")} />
                    <span className="text-[9px] font-bold uppercase tracking-tight">Produk</span>
                </Link>

                <Link href="/admin/promo" className={cn(
                    "flex flex-col items-center gap-1 transition-all active:scale-90 flex-1",
                    pathname === "/admin/promo" ? "text-blue-600" : "text-slate-400"
                )}>
                    <Zap className={cn("w-5 h-5", pathname === "/admin/promo" ? "fill-blue-600/10" : "")} />
                    <span className="text-[9px] font-bold uppercase tracking-tight">Promo</span>
                </Link>

                <button 
                    onClick={() => setIsMoreOpen(!isMoreOpen)}
                    className={cn(
                        "flex flex-col items-center gap-1 transition-all active:scale-90 flex-1 relative",
                        isMoreOpen ? "text-blue-600" : "text-slate-400"
                    )}
                >
                    <div className={cn("p-0.5 rounded-lg transition-colors", isMoreOpen ? "bg-white/50 shadow-sm border border-white/60" : "")}>
                        {isMoreOpen ? <X className="w-4 h-4" /> : <MoreVertical className="w-4 h-4" />}
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-tight">Lainnya</span>
                </button>

                {/* More Menu Popup */}
                {isMoreOpen && (
                    <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 bg-white/60 backdrop-blur-3xl border border-white/60 rounded-[1.5rem] p-2 shadow-2xl animate-in slide-in-from-bottom-2 zoom-in-95 duration-200 grid grid-cols-3 gap-1.5">
                        <Link href="/admin/orders" className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white/50 border border-white/60 font-bold text-[9px] text-slate-700 active:scale-95 transition-all shadow-sm">
                            <ShoppingBag className="w-4 h-4 text-blue-500" /> Pesanan
                        </Link>
                        <Link href="/admin/testimonies" className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white/50 border border-white/60 font-bold text-[9px] text-slate-700 active:scale-95 transition-all shadow-sm">
                            <Star className="w-4 h-4 text-amber-500" /> Testimoni
                        </Link>
                        <Link href="/admin/reviews" className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white/50 border border-white/60 font-bold text-[9px] text-slate-700 active:scale-95 transition-all shadow-sm">
                            <MessageSquare className="w-4 h-4 text-emerald-500" /> Reviews
                        </Link>
                        <Link href="/admin/categories" className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white/50 border border-white/60 font-bold text-[9px] text-slate-700 active:scale-95 transition-all shadow-sm">
                            <Tags className="w-4 h-4 text-orange-500" /> Kategori
                        </Link>
                        <Link href="/admin/users" className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white/50 border border-white/60 font-bold text-[9px] text-slate-700 active:scale-95 transition-all shadow-sm">
                            <Users className="w-4 h-4 text-indigo-500" /> User
                        </Link>
                        <Link href="/admin/affiliates" className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white/50 border border-white/60 font-bold text-[9px] text-slate-700 active:scale-95 transition-all shadow-sm">
                            <Megaphone className="w-4 h-4 text-purple-500" /> Afiliasi
                        </Link>
                        <Link href="/admin/withdrawals" className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white/50 border border-white/60 font-bold text-[9px] text-slate-700 active:scale-95 transition-all shadow-sm">
                            <Wallet className="w-4 h-4 text-purple-500" /> Tarik
                        </Link>
                        <Link href="/admin/settings" className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white/50 border border-white/60 font-bold text-[9px] text-slate-700 active:scale-95 transition-all shadow-sm">
                            <Settings className="w-4 h-4 text-slate-500" /> Seting
                        </Link>
                        <button 
                            onClick={handleLogout}
                            className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-red-500/10 border border-red-500/20 font-bold text-[9px] text-red-600 active:scale-95 transition-all shadow-sm"
                        >
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
        </AdminCurrencyProvider>
    );
}


