"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Tags, Settings, LogOut, ShoppingBag, Zap, Users, Wallet, MoreVertical, X, Star, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
        { name: "Testimoni", href: "/admin/testimonies", icon: Star },
        { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
        { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Withdrawals", href: "/admin/withdrawals", icon: Wallet },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 fixed h-full hidden md:flex flex-col z-50">
                <div className="p-6 border-b border-slate-100">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-lg">
                            M
                        </div>
                        <span className="font-bold text-xl text-slate-900 tracking-tight">MsgiccAdmin</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive
                                        ? "bg-blue-50 text-blue-600 shadow-sm"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 w-full transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 min-h-screen pb-24 md:pb-10 pt-4 md:pt-32">
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation for Admin - Fixed at the very bottom of the viewport */}
            <div className="md:hidden fixed bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xl border border-slate-200 px-4 py-3 flex items-center justify-between z-[1001] shadow-[0_8px_30px_rgba(0,0,0,0.15)] rounded-[2rem] animate-in slide-in-from-bottom-5 duration-300">
                <Link href="/admin" className={cn(
                    "flex flex-col items-center gap-1 transition-all active:scale-90 flex-1",
                    pathname === "/admin" ? "text-blue-600" : "text-slate-400"
                )}>
                    <LayoutDashboard className={cn("w-6 h-6", pathname === "/admin" ? "fill-blue-600/10" : "")} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Dashboard</span>
                </Link>

                <Link href="/admin/products" className={cn(
                    "flex flex-col items-center gap-1 transition-all active:scale-90 flex-1",
                    pathname === "/admin/products" ? "text-blue-600" : "text-slate-400"
                )}>
                    <Package className={cn("w-6 h-6", pathname === "/admin/products" ? "fill-blue-600/10" : "")} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Produk</span>
                </Link>

                <Link href="/admin/promo" className={cn(
                    "flex flex-col items-center gap-1 transition-all active:scale-90 flex-1",
                    pathname === "/admin/promo" ? "text-blue-600" : "text-slate-400"
                )}>
                    <Zap className={cn("w-6 h-6", pathname === "/admin/promo" ? "fill-blue-600/10" : "")} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Promo</span>
                </Link>

                <button 
                    onClick={() => setIsMoreOpen(!isMoreOpen)}
                    className={cn(
                        "flex flex-col items-center gap-1 transition-all active:scale-90 flex-1 relative",
                        isMoreOpen ? "text-blue-600" : "text-slate-400"
                    )}
                >
                    <div className={cn("p-1 rounded-lg transition-colors", isMoreOpen ? "bg-blue-100" : "")}>
                        {isMoreOpen ? <X className="w-5 h-5" /> : <MoreVertical className="w-6 h-6" />}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-tight">Lainnya</span>
                </button>

                {/* More Menu Popup */}
                {isMoreOpen && (
                    <div className="absolute bottom-[calc(100%+16px)] left-0 right-0 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-[2rem] p-4 shadow-2xl animate-in slide-in-from-bottom-4 zoom-in-95 duration-200 grid grid-cols-2 gap-3">
                        <Link href="/admin/orders" className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-xs text-slate-700 active:scale-95 transition-all">
                            <ShoppingBag className="w-4 h-4 text-blue-500" /> Pesanan
                        </Link>
                        <Link href="/admin/testimonies" className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-xs text-slate-700 active:scale-95 transition-all">
                            <Star className="w-4 h-4 text-amber-500" /> Testimoni
                        </Link>
                        <Link href="/admin/reviews" className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-xs text-slate-700 active:scale-95 transition-all">
                            <MessageSquare className="w-4 h-4 text-emerald-500" /> Reviews
                        </Link>
                        <Link href="/admin/categories" className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-xs text-slate-700 active:scale-95 transition-all">
                            <Tags className="w-4 h-4 text-orange-500" /> Kategori
                        </Link>
                        <Link href="/admin/users" className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-xs text-slate-700 active:scale-95 transition-all">
                            <Users className="w-4 h-4 text-indigo-500" /> Pengguna
                        </Link>
                        <Link href="/admin/withdrawals" className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-xs text-slate-700 active:scale-95 transition-all">
                            <Wallet className="w-4 h-4 text-purple-500" /> Penarikan
                        </Link>
                        <Link href="/admin/settings" className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-xs text-slate-700 active:scale-95 transition-all col-span-2">
                            <Settings className="w-4 h-4 text-slate-500" /> Settings
                        </Link>
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 font-bold text-xs text-red-600 active:scale-95 transition-all col-span-2"
                        >
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}


