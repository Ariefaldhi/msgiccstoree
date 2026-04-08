"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { 
    User, Mail, ShoppingBag, CreditCard, History, 
    ChevronRight, ArrowLeft, Loader2, Wallet, 
    Calendar, Package, CheckCircle2, Clock, XCircle 
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

            // Fetch Profile & Orders in parallel
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

    // Statistics Calculations
    const totalTransactions = orders.length;
    const totalSpent = orders
        .filter(o => o.status === "Pesanan Selesai")
        .reduce((sum, o) => sum + (o.sell_price || 0), 0);
    const lastOrder = orders.length > 0 ? orders[0] : null;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <span className="text-sm font-bold text-slate-500">Memuat profil Anda...</span>
                </div>
            </div>
        );
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Menunggu Konfirmasi': return 'bg-yellow-100 text-yellow-700';
            case 'Sedang Diproses': return 'bg-blue-100 text-blue-700';
            case 'Pesanan Selesai': return 'bg-green-100 text-green-700';
            case 'Dibatalkan': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-32">
            {/* Header / Cover */}
            <div className="bg-blue-600 pt-12 pb-32 px-4">
                <div className="container mx-auto max-w-2xl">
                    <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8 group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold text-sm">Kembali ke Home</span>
                    </Link>

                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-xl">
                            <User className="w-10 h-10" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-black text-white capitalize">
                                {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                            </h1>
                            <div className="flex items-center gap-2 text-blue-100 text-sm font-bold mt-1">
                                <Mail className="w-4 h-4" />
                                {user?.email}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Stats Cards */}
            <div className="container mx-auto max-w-2xl px-4 -mt-16">
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Total Pengeluaran</p>
                        <h3 className="text-xl font-black text-slate-900 leading-none">
                            Rp {totalSpent.toLocaleString('id-ID')}
                        </h3>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Total Transaksi</p>
                        <h3 className="text-xl font-black text-slate-900 leading-none">
                            {totalTransactions} <span className="text-xs text-slate-400 font-bold ml-1 uppercase">Item</span>
                        </h3>
                    </div>
                </div>

                {/* Last Transaction Card */}
                {lastOrder && (
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16"></div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-slate-900 flex items-center gap-2">
                                <History className="w-5 h-5 text-blue-600" />
                                Transaksi Terakhir
                            </h3>
                            <span className={cn(
                                "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter",
                                getStatusStyle(lastOrder.status)
                            )}>
                                {lastOrder.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                <Package className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col">
                                <p className="text-sm font-bold text-slate-900 leading-tight">{lastOrder.product_name}</p>
                                <p className="text-xs text-slate-500 font-medium">{lastOrder.package_name}</p>
                            </div>
                            <div className="ml-auto text-right">
                                <p className="text-sm font-black text-blue-600">Rp {lastOrder.sell_price.toLocaleString('id-ID')}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">
                                    {new Date(lastOrder.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* All Transactions List */}
                <h3 className="font-black text-slate-900 flex items-center gap-2 mb-4 px-2">
                    <History className="w-5 h-5 text-slate-400" />
                    Riwayat Transaksi
                </h3>
                
                <div className="space-y-3">
                    {orders.length === 0 ? (
                        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShoppingBag className="w-8 h-8 text-slate-200" />
                            </div>
                            <p className="text-slate-500 font-bold">Belum ada transaksi.</p>
                            <Link href="/" className="text-blue-600 font-black text-sm mt-2 inline-block uppercase tracking-widest hover:underline">Mulai Belanja Sekarang</Link>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div key={order.id} className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group cursor-pointer shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-slate-900 truncate tracking-tight uppercase leading-none mb-1">{order.product_name}</h4>
                                        <p className="text-[11px] text-slate-500 font-bold truncate leading-none uppercase tracking-tighter opacity-70">{order.package_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-slate-900 leading-none">Rp {order.sell_price.toLocaleString('id-ID')}</p>
                                        <p className={cn(
                                            "text-[9px] font-black uppercase tracking-tighter mt-1 leading-none",
                                            order.status === "Pesanan Selesai" ? "text-green-500" : "text-slate-400"
                                        )}>
                                            {order.status}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Quick Links / Actions */}
                <div className="mt-12 space-y-3">
                    <Link href="/afiliator" className="flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-100 hover:border-blue-100 transition-all shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Megaphone className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900">Program Afiliasi</span>
                                <span className="text-xs text-slate-500 font-medium">Hasilkan uang dengan berbagi tautan.</span>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300" />
                    </Link>

                    <button 
                        onClick={() => supabase.auth.signOut().then(() => router.push("/login"))}
                        className="w-full mt-4 py-4 text-red-500 font-black text-sm uppercase tracking-widest border-2 border-red-50 hover:bg-red-50 rounded-3xl transition-all"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}

// Reuse cn from lib/utils if possible, or define locally if needed
