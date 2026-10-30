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
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200/80 h-full hidden md:flex flex-col shrink-0 relative z-10">
                <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-xs transition-transform group-hover:scale-105">
                            M
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-sm text-slate-900 tracking-tight leading-none">MsgiccAdmin</span>
                            <span className="text-[10px] text-slate-400 font-medium tracking-wide">Workspace</span>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
                                    isActive
                                        ? "bg-slate-900 text-white shadow-xs"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                )}
                            >
                                <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400")} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50">
                    <CurrencyToggle />
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 w-full transition-colors border border-transparent hover:border-rose-100"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-full overflow-y-auto bg-slate-50 relative z-10">
                <div className="p-4 md:p-8 pb-32 md:pb-10 min-h-full max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation for Admin */}
            <div className="md:hidden fixed bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-slate-200/90 px-3 py-2 flex items-center justify-between z-[1001] shadow-lg rounded-2xl">
                <Link href="/admin" className={cn(
                    "flex flex-col items-center gap-0.5 transition-colors flex-1 py-1 rounded-lg",
                    pathname === "/admin" ? "text-blue-600 font-bold" : "text-slate-500 font-medium"
                )}>
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="text-[10px] tracking-tight">Dashboard</span>
                </Link>

                <Link href="/admin/products" className={cn(
                    "flex flex-col items-center gap-0.5 transition-colors flex-1 py-1 rounded-lg",
                    pathname === "/admin/products" ? "text-blue-600 font-bold" : "text-slate-500 font-medium"
                )}>
                    <Package className="w-4 h-4" />
                    <span className="text-[10px] tracking-tight">Produk</span>
                </Link>

                <Link href="/admin/promo" className={cn(
                    "flex flex-col items-center gap-0.5 transition-colors flex-1 py-1 rounded-lg",
                    pathname === "/admin/promo" ? "text-blue-600 font-bold" : "text-slate-500 font-medium"
                )}>
                    <Zap className="w-4 h-4" />
                    <span className="text-[10px] tracking-tight">Promo</span>
                </Link>

                <button 
                    onClick={() => setIsMoreOpen(!isMoreOpen)}
                    className={cn(
                        "flex flex-col items-center gap-0.5 transition-colors flex-1 py-1 rounded-lg relative",
                        isMoreOpen ? "text-blue-600 font-bold" : "text-slate-500 font-medium"
                    )}
                >
                    <div className="p-0.5">
                        {isMoreOpen ? <X className="w-4 h-4" /> : <MoreVertical className="w-4 h-4" />}
                    </div>
                    <span className="text-[10px] tracking-tight">Menu</span>
                </button>

                {/* More Menu Popup */}
                {isMoreOpen && (
                    <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-200/90 rounded-2xl p-2 shadow-xl animate-in slide-in-from-bottom-2 zoom-in-95 duration-200 grid grid-cols-3 gap-1.5">
                        <Link href="/admin/orders" className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-[10px] text-slate-700 hover:bg-slate-100 transition-colors">
                            <ShoppingBag className="w-4 h-4 text-blue-600" /> Pesanan
                        </Link>
                        <Link href="/admin/testimonies" className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-[10px] text-slate-700 hover:bg-slate-100 transition-colors">
                            <Star className="w-4 h-4 text-amber-500" /> Testimoni
                        </Link>
                        <Link href="/admin/reviews" className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-[10px] text-slate-700 hover:bg-slate-100 transition-colors">
                            <MessageSquare className="w-4 h-4 text-emerald-600" /> Reviews
                        </Link>
                        <Link href="/admin/categories" className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-[10px] text-slate-700 hover:bg-slate-100 transition-colors">
                            <Tags className="w-4 h-4 text-orange-500" /> Kategori
                        </Link>
                        <Link href="/admin/users" className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-[10px] text-slate-700 hover:bg-slate-100 transition-colors">
                            <Users className="w-4 h-4 text-indigo-600" /> User
                        </Link>
                        <Link href="/admin/affiliates" className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-[10px] text-slate-700 hover:bg-slate-100 transition-colors">
                            <Megaphone className="w-4 h-4 text-purple-600" /> Afiliasi
                        </Link>
                        <Link href="/admin/withdrawals" className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-[10px] text-slate-700 hover:bg-slate-100 transition-colors">
                            <Wallet className="w-4 h-4 text-purple-600" /> Tarik
                        </Link>
                        <Link href="/admin/settings" className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-[10px] text-slate-700 hover:bg-slate-100 transition-colors">
                            <Settings className="w-4 h-4 text-slate-600" /> Setting
                        </Link>
                        <button 
                            onClick={handleLogout}
                            className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-rose-50 border border-rose-100 font-semibold text-[10px] text-rose-600 hover:bg-rose-100 transition-colors"
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
