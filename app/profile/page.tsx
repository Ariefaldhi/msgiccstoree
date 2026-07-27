"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { 
    User, Mail, ShoppingBag, CreditCard, History, 
    ChevronRight, ArrowLeft, Loader2, Wallet, 
    Calendar, Package, CheckCircle2, Clock, XCircle, Megaphone 
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
        <div className="min-h-screen bg-slate-50 relative overflow-hidden pb-32">
            {/* Background Orbs for Glassmorphism */}
            <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 -translate-x-1/3"></div>
            <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none translate-y-1/3 translate-x-1/3"></div>

            {/* Header / Cover */}
            <div className="bg-white/60 backdrop-blur-3xl pt-12 pb-32 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-b border-white/60 relative z-10">
                <div className="container mx-auto max-w-lg md:max-w-4xl">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold text-sm">Kembali ke Home</span>
                    </Link>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="w-20 h-20 md:w-28 md:h-28 rounded-3xl md:rounded-[2rem] bg-blue-600 flex items-center justify-center text-white border border-blue-500 shadow-xl shadow-blue-200">
                            <User className="w-10 h-10 md:w-12 md:h-12" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 capitalize drop-shadow-sm mb-1">
                                {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                            </h1>
                            <div className="inline-flex items-center gap-2 text-slate-600 text-sm md:text-base font-bold bg-white/80 px-3 py-1.5 rounded-xl shadow-sm border border-slate-200 w-fit">
                                <Mail className="w-4 h-4 text-blue-500" />
                                {user?.email}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Stats Cards */}
            <div className="container mx-auto max-w-lg md:max-w-4xl px-4 -mt-16 relative z-20">
                <div className="grid grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
                    <div className="bg-white/60 backdrop-blur-3xl p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all group">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-3xl bg-white/80 shadow-sm flex items-center justify-center text-blue-600 mb-4 md:mb-6 group-hover:scale-110 group-hover:bg-blue-50 transition-transform">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Total Pengeluaran</p>
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-none">
                            Rp {totalSpent.toLocaleString('id-ID')}
                        </h3>
                    </div>
                    <div className="bg-white/60 backdrop-blur-3xl p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all group">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-3xl bg-white/80 shadow-sm flex items-center justify-center text-purple-600 mb-4 md:mb-6 group-hover:scale-110 group-hover:bg-purple-50 transition-transform">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Total Transaksi</p>
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-none flex items-baseline">
                            {totalTransactions} <span className="text-xs md:text-sm text-slate-400 font-bold ml-1.5 uppercase">Item</span>
                        </h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {/* Left Column (Transactions) */}
                    <div className="md:col-span-2">
                        {/* Last Transaction Card */}
                        {lastOrder && (
                            <div className="bg-white/60 backdrop-blur-3xl p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 mb-8 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 bg-blue-500/5 rounded-full -mr-16 -mt-16 md:-mr-24 md:-mt-24 pointer-events-none"></div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-black text-slate-900 flex items-center gap-2 md:text-lg">
                                        <History className="w-5 h-5 text-blue-600" />
                                        Transaksi Terakhir
                                    </h3>
                                    <span className={cn(
                                        "text-[10px] md:text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-sm",
                                        getStatusStyle(lastOrder.status)
                                    )}>
                                        {lastOrder.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 md:gap-6 bg-white/40 p-4 md:p-5 rounded-2xl md:rounded-[1.5rem] border border-white">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 shrink-0">
                                        <Package className="w-6 h-6 md:w-7 md:h-7" />
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <p className="text-sm md:text-base font-bold text-slate-900 leading-tight truncate">{lastOrder.product_name}</p>
                                        <p className="text-xs md:text-sm text-slate-500 font-medium truncate mt-0.5">{lastOrder.package_name}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm md:text-base font-black text-blue-600">Rp {lastOrder.sell_price.toLocaleString('id-ID')}</p>
                                        <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-tight mt-1">
                                            {new Date(lastOrder.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* All Transactions List */}
                        <h3 className="font-black text-slate-900 flex items-center gap-2 mb-4 px-2 md:text-lg">
                            <History className="w-5 h-5 text-slate-400" />
                            Riwayat Transaksi
                        </h3>
                        
                        <div className="space-y-3">
                            {orders.length === 0 ? (
                                <div className="bg-white/60 backdrop-blur-3xl p-12 rounded-[2.5rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center">
                                    <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ShoppingBag className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <p className="text-slate-500 font-bold">Belum ada transaksi.</p>
                                    <Link href="/" className="text-blue-600 font-black text-sm mt-2 inline-block uppercase tracking-widest hover:underline">Mulai Belanja Sekarang</Link>
                                </div>
                            ) : (
                                orders.map((order) => (
                                    <div key={order.id} className="bg-white/60 backdrop-blur-xl p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] border border-white hover:shadow-md transition-all group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors shrink-0">
                                                <Package className="w-5 h-5 md:w-6 md:h-6" />
                                            </div>
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <h4 className="text-sm md:text-base font-bold text-slate-900 truncate tracking-tight uppercase leading-none mb-1.5">{order.product_name}</h4>
                                                <p className="text-[11px] md:text-xs text-slate-500 font-bold truncate leading-none uppercase tracking-tighter opacity-70">{order.package_name}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm md:text-base font-black text-slate-900 leading-none">Rp {order.sell_price.toLocaleString('id-ID')}</p>
                                                <p className={cn(
                                                    "text-[9px] md:text-[10px] font-black uppercase tracking-tighter mt-1.5 leading-none",
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
                    </div>

                    {/* Right Column (Actions) */}
                    <div className="space-y-4 md:mt-0 mt-8">
                        <Link href="/afiliator" className="flex items-center justify-between p-5 md:p-6 bg-white/60 backdrop-blur-3xl rounded-3xl md:rounded-[2rem] border border-white/60 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-50 transition-transform">
                                    <Megaphone className="w-6 h-6" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm md:text-base font-bold text-slate-900">Program Afiliasi</span>
                                    <span className="text-xs text-slate-500 font-medium">Hasilkan uang.</span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 group-hover:text-blue-500 transition-all" />
                        </Link>

                        <button 
                            onClick={() => supabase.auth.signOut().then(() => router.push("/login"))}
                            className="w-full flex items-center justify-center gap-3 py-5 text-red-500 font-black text-sm uppercase tracking-widest border-2 border-red-50 hover:bg-red-50 hover:text-red-600 rounded-3xl transition-all"
                        >
                            <XCircle className="w-5 h-5" /> Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Reuse cn from lib/utils if possible, or define locally if needed
