"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Tags, Settings, LogOut, ShoppingBag, Zap, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const navItems = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Categories", href: "/admin/categories", icon: Tags },
        { name: "Products", href: "/admin/products", icon: Package },
        { name: "Promo", href: "/admin/promo", icon: Zap },
        { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
        { name: "Users", href: "/admin/users", icon: Users },
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
            <main className="flex-1 md:ml-64 min-h-screen pb-24 md:pb-0">
                <div className="p-8">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation for Admin */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-4 py-3 flex items-center justify-between z-[1000] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom,12px)]">
                <Link href="/admin" className={cn(
                    "flex flex-col items-center gap-1 transition-all active:scale-90 flex-1",
                    pathname === "/admin" ? "text-blue-600" : "text-slate-400"
                )}>
                    <LayoutDashboard className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Dash</span>
                </Link>

                <Link href="/admin/products" className={cn(
                    "flex flex-col items-center gap-1 transition-all active:scale-90 flex-1",
                    pathname === "/admin/products" ? "text-blue-600" : "text-slate-400"
                )}>
                    <Package className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Prod</span>
                </Link>

                <Link href="/admin/orders" className={cn(
                    "flex flex-col items-center gap-1 transition-all active:scale-90 flex-1",
                    pathname === "/admin/orders" ? "text-blue-600" : "text-slate-400"
                )}>
                    <ShoppingBag className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Order</span>
                </Link>

                <Link href="/admin/promo" className={cn(
                    "flex flex-col items-center gap-1 transition-all active:scale-90 flex-1",
                    pathname === "/admin/promo" ? "text-blue-600" : "text-slate-400"
                )}>
                    <Zap className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Promo</span>
                </Link>

                <Link href="/admin/settings" className={cn(
                    "flex flex-col items-center gap-1 transition-all active:scale-90 flex-1",
                    pathname === "/admin/settings" ? "text-blue-600" : "text-slate-400"
                )}>
                    <Settings className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Set</span>
                </Link>
            </div>
        </div>
    );
}


