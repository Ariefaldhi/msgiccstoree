"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Megaphone, Users, Wallet, History, Search, TrendingUp, DollarSign } from "lucide-react";
import { useAdminCurrency } from "@/components/admin/AdminCurrencyProvider";
import Link from "next/link";

export default function AffiliateManagement() {
    const { formatCurrency } = useAdminCurrency();
    const [stats, setStats] = useState({
        totalBalance: 0,
        totalCommissionPaid: 0,
        activeAffiliates: 0,
        totalReferrals: 0,
    });
    const [affiliates, setAffiliates] = useState<any[]>([]);
    const [commissions, setCommissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    const supabase = createClient();

    const fetchData = async () => {
        setLoading(true);
        const { data: profs, error: profError } = await supabase
            .from("profiles")
            .select("*")
            .or("is_affiliator.eq.true,balance.gt.0");

        if (profError) {
            console.error(profError);
            setLoading(false);
            return;
        }

        const { data: ords, error: ordError } = await supabase
            .from("orders")
            .select("*, profiles!inner(full_name)")
            .not("affiliator_id", "is", null)
            .order("created_at", { ascending: false });

        if (ordError) {
            console.error(ordError);
            setLoading(false);
            return;
        }

        // Process Stats
        let bal = 0;
        let paid = 0;
        let active = profs?.length || 0;
        let refs = ords?.length || 0;

        profs?.forEach(p => {
            bal += p.balance || 0;
        });

        // Sum commissions from finished orders
        ords?.forEach(o => {
            if (o.status === "Pesanan Selesai") {
                // This is total earned by all affiliates
                // We don't have a "paid" status in orders, but withdrawals track paid amounts
            }
        });

        // Let's get total paid from withdrawals
        const { data: wds } = await supabase.from("withdrawals").select("amount").eq("status", "APPROVED");
        wds?.forEach(w => paid += w.amount);

        // Map Affiliates to their specific stats
        const affList = profs?.map(p => {
            const myOrds = ords?.filter(o => o.affiliator_id === p.id) || [];
            const totalEarned = myOrds.filter(o => o.status === "Pesanan Selesai").reduce((sum, o) => sum + (o.commission || 0), 0);
            return {
                ...p,
                totalOrders: myOrds.length,
                totalEarned
            };
        }).sort((a, b) => b.totalEarned - a.totalEarned);

        setAffiliates(affList || []);
        setCommissions(ords || []);
        setStats({
            totalBalance: bal,
            totalCommissionPaid: paid,
            activeAffiliates: active,
            totalReferrals: refs
        });
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredAffiliates = affiliates.filter(a => 
        a.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.affiliate_code?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-white border border-slate-200/90 rounded-2xl">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Memuat Data Afiliasi...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-slate-200 gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                        <Megaphone className="w-6 h-6 text-purple-600" />
                        Manajemen Afiliasi
                    </h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-0.5">Kelola affiliator, pantau saldo, dan statistik referral.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Link href="/admin/withdrawals" className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg px-4 py-2 text-xs font-semibold transition-colors">
                        <Wallet className="w-4 h-4 text-purple-600" /> Cek Penarikan
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Saldo Belum Ditarik", value: stats.totalBalance, icon: Wallet, color: "purple", isMoney: true },
                    { label: "Total Komisi Dibayar", value: stats.totalCommissionPaid, icon: DollarSign, color: "emerald", isMoney: true },
                    { label: "Total Referral", value: stats.totalReferrals, icon: TrendingUp, color: "blue", isMoney: false },
                    { label: "Affiliator Aktif", value: stats.activeAffiliates, icon: Users, color: "orange", isMoney: false },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                stat.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                                stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                'bg-orange-50 text-orange-600'
                            }`}>
                                <stat.icon className="w-4 h-4" />
                            </div>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                            {stat.isMoney ? formatCurrency(stat.value) : stat.value.toLocaleString()}
                        </h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Affiliators List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                        <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Users className="w-4 h-4 text-purple-600" /> Daftar Affiliator
                            </h2>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Cari affiliator..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            {/* Desktop Affiliators View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left text-xs whitespace-nowrap">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                            <th className="px-4 py-3">Affiliator</th>
                                            <th className="px-4 py-3">Kode</th>
                                            <th className="px-4 py-3">Saldo</th>
                                            <th className="px-4 py-3">Total Referral</th>
                                            <th className="px-4 py-3 text-right">Penghasilan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredAffiliates.map((aff, i) => (
                                            <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                                                            {aff.full_name?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-900">{aff.full_name || 'No Name'}</div>
                                                            <div className="text-[11px] text-slate-400">{aff.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md font-mono font-semibold text-xs border border-purple-100">
                                                        {aff.affiliate_code || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 font-bold text-slate-900">{formatCurrency(aff.balance)}</td>
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-semibold text-slate-700">{aff.totalOrders}</span>
                                                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Trx</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5 text-right font-bold text-emerald-600">
                                                    {formatCurrency(aff.totalEarned)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Affiliators View */}
                            <div className="md:hidden space-y-3 p-4">
                                {filteredAffiliates.map((aff, i) => (
                                    <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                                                    {aff.full_name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-900 leading-tight">{aff.full_name || 'Tanpa Nama'}</h3>
                                                    <p className="text-[11px] text-slate-500">{aff.email}</p>
                                                </div>
                                            </div>
                                            <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-mono font-semibold text-[11px] border border-purple-100">
                                                {aff.affiliate_code || '-'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Saldo</p>
                                                <p className="font-bold text-slate-900 text-xs">{formatCurrency(aff.balance)}</p>
                                            </div>
                                            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Total Ref</p>
                                                <p className="font-bold text-slate-900 text-xs">{aff.totalOrders} <span className="text-[10px] text-slate-400 font-normal">Trx</span></p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Penghasilan</p>
                                            <p className="font-bold text-emerald-600 text-sm">{formatCurrency(aff.totalEarned)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredAffiliates.length === 0 && (
                                <div className="py-16 text-center text-slate-400 text-sm">Data affiliator tidak ditemukan.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Referral History */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden h-fit">
                        <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <History className="w-4 h-4 text-slate-500" /> Aktivitas Referral
                            </h2>
                        </div>
                        <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto divide-y divide-slate-100">
                            {commissions.slice(0, 15).map((order, i) => (
                                <div key={i} className={`pt-3 first:pt-0`}>
                                    <div className="flex justify-between items-start mb-1.5">
                                        <div className="pr-2">
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{new Date(order.created_at).toLocaleDateString("id-ID")}</p>
                                            <h4 className="font-semibold text-slate-900 text-xs line-clamp-1">{order.product_name}</h4>
                                        </div>
                                        <span className="shrink-0 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100 font-bold text-xs">
                                            +{formatCurrency(order.commission)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-5 h-5 rounded bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                                            {order.affiliate_code?.charAt(4) || 'A'}
                                        </div>
                                        <p className="text-xs text-slate-500">Oleh: <span className="font-semibold text-slate-700">{(order.profiles as any)?.full_name || order.affiliate_code || 'REF-UNK'}</span></p>
                                    </div>
                                </div>
                            ))}
                            {commissions.length === 0 && (
                                <p className="py-12 text-center text-slate-400 text-xs">Belum ada aktivitas referral.</p>
                            )}
                        </div>
                        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Menampilkan 15 Aktivitas Terakhir</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
