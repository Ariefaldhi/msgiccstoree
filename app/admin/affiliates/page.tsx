"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Megaphone, Users, Wallet, History, Search, ArrowRight, TrendingUp, DollarSign } from "lucide-react";
import Link from "next/link";

export default function AffiliateManagement() {
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
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Memuat Data Afiliasi...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-6 border-b border-slate-200 gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Megaphone className="w-8 h-8 text-purple-600" />
                        Manajemen Afiliasi
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Kelola affiliator, pantau saldo, dan statistik referral.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                     <Link href="/admin/withdrawals" className="flex-1 md:flex-none justify-center bg-white border border-slate-200 px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                        <Wallet className="w-4 h-4 text-purple-500" /> Cek Penarikan
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Saldo Belum Ditarik", value: stats.totalBalance, icon: Wallet, color: "purple" },
                    { label: "Total Komisi Dibayar", value: stats.totalCommissionPaid, icon: DollarSign, color: "emerald" },
                    { label: "Total Referral", value: stats.totalReferrals, icon: TrendingUp, color: "blue" },
                    { label: "Affiliator Aktif", value: stats.activeAffiliates, icon: Users, color: "orange" },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full bg-${stat.color}-50 opacity-50`}></div>
                        <div className={`bg-${stat.color}-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}>
                            <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">
                            {typeof stat.value === 'number' && stat.label.includes('Total') && !stat.label.includes('Komisi') ? stat.value.toLocaleString() : `Rp ${stat.value.toLocaleString()}`}
                        </h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Affiliators List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <h2 className="font-bold text-slate-900 flex items-center gap-3">
                                <Users className="w-5 h-5 text-purple-400" /> Daftar Affiliator
                            </h2>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Cari affiliator..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="bg-white md:bg-white rounded-[2.5rem] md:border-t border-slate-100 overflow-hidden">
                            {/* Desktop Affiliators View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <th className="p-4">Affiliator</th>
                                            <th className="p-4">Kode</th>
                                            <th className="p-4">Saldo</th>
                                            <th className="p-4">Total Referral</th>
                                            <th className="p-4 text-right">Penghasilan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredAffiliates.map((aff, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xs">
                                                            {aff.full_name?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900">{aff.full_name || 'No Name'}</div>
                                                            <div className="text-[10px] text-slate-400">{aff.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-lg font-mono font-bold text-xs border border-purple-100">
                                                        {aff.affiliate_code || '-'}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-black text-slate-900">Rp {aff.balance?.toLocaleString() || '0'}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-700">{aff.totalOrders}</span>
                                                        <span className="text-[10px] text-slate-400 uppercase font-bold">Trx</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right font-black text-emerald-600">
                                                    Rp {aff.totalEarned.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Affiliators View */}
                            <div className="md:hidden space-y-4 p-4 bg-slate-50/50">
                                {filteredAffiliates.map((aff, i) => (
                                    <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-md shadow-slate-200">
                                                    {aff.full_name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 leading-tight">{aff.full_name || 'Tanpa Nama'}</h3>
                                                    <p className="text-[10px] text-slate-500 font-medium">{aff.email}</p>
                                                </div>
                                            </div>
                                            <span className="bg-purple-50 text-purple-600 px-2.5 py-1 rounded-xl font-mono font-black text-[10px] border border-purple-100">
                                                {aff.affiliate_code || '-'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Saldo</p>
                                                <p className="font-black text-slate-900 text-sm">Rp {aff.balance?.toLocaleString() || '0'}</p>
                                            </div>
                                            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Ref</p>
                                                <p className="font-black text-slate-900 text-sm">{aff.totalOrders} <span className="text-[10px] text-slate-400 font-normal ml-0.5">Trx</span></p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Penghasilan</p>
                                            <p className="font-black text-emerald-600">Rp {aff.totalEarned.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredAffiliates.length === 0 && (
                                <div className="p-12 text-center text-slate-400 font-medium italic">Data affiliator tidak ditemukan.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Referral History */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden h-fit">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="font-bold text-slate-900 flex items-center gap-3">
                                <History className="w-5 h-5 text-slate-400" /> Aktivitas Referral
                            </h2>
                        </div>
                        <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                            {commissions.slice(0, 15).map((order, i) => (
                                <div key={i} className="group p-4 bg-slate-50 hover:bg-white rounded-[1.5rem] border border-transparent hover:border-slate-100 hover:shadow-lg transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()}</p>
                                            <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{order.product_name}</h4>
                                        </div>
                                        <div className="bg-white px-2 py-1 rounded-lg border border-slate-100 font-black text-[10px] text-purple-600">
                                            + Rp {order.commission?.toLocaleString() || '0'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black">
                                            {order.affiliate_code?.charAt(4) || 'A'}
                                        </div>
                                        <p className="text-xs font-medium text-slate-500">Oleh: <span className="font-bold text-slate-700">{(order.profiles as any)?.full_name || order.affiliate_code || 'REF-UNK'}</span></p>
                                    </div>
                                </div>
                            ))}
                            {commissions.length === 0 && (
                                <p className="p-8 text-center text-slate-400 font-medium italic text-sm">Belum ada aktivitas referral.</p>
                            )}
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menampilkan 15 Aktivitas Terakhir</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
