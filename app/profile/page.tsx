"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { 
    User, Mail, ShoppingBag, History, 
    ChevronRight, ArrowLeft, Loader2, Wallet, 
    Package, LogOut, Megaphone 
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Order {
    id: string;
    product_name: string;
    package_name: string;
    sell_price: number;
    status: string;
    created_at: string;
}

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (!authUser) {
                router.push("/login");
                return;
            }

            setUser(authUser);

            const [profileRes, ordersRes] = await Promise.all([
                supabase.from("profiles").select("*").eq("id", authUser.id).single(),
                supabase.from("orders")
                    .select("*")
                    .or(`user_id.eq.${authUser.id},email.eq.${authUser.email}`)
                    .order("created_at", { ascending: false })
            ]);

            if (profileRes.data) setProfile(profileRes.data);
            if (ordersRes.data) setOrders(ordersRes.data);
            
            setLoading(false);
        };

        fetchUserData();
    }, [router]);

    const totalTransactions = orders.length;
    const totalSpent = orders
        .filter(o => o.status === "Pesanan Selesai")
        .reduce((sum, o) => sum + (o.sell_price || 0), 0);
    const lastOrder = orders.length > 0 ? orders[0] : null;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="size-8 text-blue-600 animate-spin" />
                    <span className="text-xs font-semibold text-slate-500">Memuat profil...</span>
                </div>
            </div>
        );
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Menunggu Konfirmasi': return 'bg-amber-50 text-amber-700 border border-amber-200';
            case 'Sedang Diproses': return 'bg-blue-50 text-blue-700 border border-blue-200';
            case 'Pesanan Selesai': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
            case 'Dibatalkan': return 'bg-rose-50 text-rose-700 border border-rose-200';
            default: return 'bg-slate-100 text-slate-700 border border-slate-200';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-28 pt-8">
            <div className="container mx-auto max-w-4xl px-4">
                
                {/* Back Button */}
                <div className="mb-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-semibold">
                        <ArrowLeft className="size-4" />
                        Kembali ke Katalog
                    </Link>
                </div>

                {/* Profile Header Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="size-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-2xs">
                            <User className="size-8" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 capitalize leading-snug">
                                {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                            </h1>
                            <div className="inline-flex items-center gap-1.5 text-slate-500 text-xs font-medium mt-0.5">
                                <Mail className="size-3.5 text-slate-400" />
                                {user?.email}
                            </div>
                        </div>
                        {profile?.role === 'admin' && (
                            <span className="px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">
                                Administrator
                            </span>
                        )}
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                        <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 border border-blue-100">
                            <Wallet className="size-5" />
                        </div>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Pengeluaran</p>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                            Rp {totalSpent.toLocaleString('id-ID')}
                        </h3>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                        <div className="size-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 border border-purple-100">
                            <ShoppingBag className="size-5" />
                        </div>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Transaksi</p>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-baseline gap-1">
                            {totalTransactions} <span className="text-xs text-slate-400 font-normal">item</span>
                        </h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column (Transactions) */}
                    <div className="md:col-span-2 space-y-4">
                        {/* Last Transaction Card */}
                        {lastOrder && (
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                        <History className="size-4 text-blue-600" />
                                        Pesanan Terakhir
                                    </h3>
                                    <span className={cn(
                                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                                        getStatusStyle(lastOrder.status)
                                    )}>
                                        {lastOrder.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                                    <div className="size-10 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-slate-500 shrink-0">
                                        <Package className="size-5" />
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-900 truncate">{lastOrder.product_name}</p>
                                        <p className="text-[11px] text-slate-500 truncate">{lastOrder.package_name}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-bold text-blue-600">Rp {lastOrder.sell_price.toLocaleString('id-ID')}</p>
                                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                            {new Date(lastOrder.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* All Transactions List */}
                        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
                            <h3 className="font-bold text-slate-900 text-sm mb-4">
                                Riwayat Semua Transaksi ({orders.length})
                            </h3>
                            
                            <div className="space-y-2">
                                {orders.length === 0 ? (
                                    <div className="py-8 text-center text-slate-400 text-xs">
                                        Belum ada transaksi di akun Anda.
                                    </div>
                                ) : (
                                    orders.map((order) => (
                                        <div key={order.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-slate-900 text-xs truncate">{order.product_name}</h4>
                                                <p className="text-[11px] text-slate-500 truncate">{order.package_name}</p>
                                                <span className="text-[10px] text-slate-400 font-mono">{new Date(order.created_at).toLocaleDateString('id-ID')}</span>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-xs font-bold text-slate-900">Rp {order.sell_price.toLocaleString('id-ID')}</p>
                                                <span className={cn(
                                                    "inline-block mt-0.5 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                                                    getStatusStyle(order.status)
                                                )}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Actions) */}
                    <div className="space-y-3">
                        <Link href="/afiliator" className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="size-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                                    <Megaphone className="size-4" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-600 transition-colors">Program Afiliasi</span>
                                    <span className="text-[11px] text-slate-500">Dapatkan komisi referral</span>
                                </div>
                            </div>
                            <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                        </Link>

                        <button 
                            onClick={() => supabase.auth.signOut().then(() => router.push("/login"))}
                            className="w-full flex items-center justify-center gap-2 py-3 text-rose-600 hover:text-rose-700 font-semibold text-xs border border-rose-200 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                        >
                            <LogOut className="size-4" /> Keluar dari Akun
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
