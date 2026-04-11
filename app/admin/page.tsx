"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, TrendingUp, TrendingDown, DollarSign, ShoppingBag, PieChart, Users, Package, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import Link from "next/link";
import DashboardChart, { TopProductsChart } from "@/components/admin/DashboardChart";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        revenue: 0,
        cost: 0,
        profit: 0,
        activeOrders: 0,
        totalOrders: 0,
        commission: 0,
        pendingWithdrawals: 0,
        dailyReport: [] as any[],
    });
    const [chartData, setChartData] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        async function fetchStats() {
            setLoading(true);
            const { data: orders } = await supabase.from("orders").select("*").order('created_at', { ascending: true });
            
            if (orders) {
                let rev = 0;
                let cost = 0;
                let prof = 0;
                let active = 0;
                let comm = 0;

                const dailyStats: Record<string, { revenue: number; cost: number; profit: number; commission: number; orders: number }> = {};
                const productSales: Record<string, number> = {};

                orders.forEach(o => {
                    if (o.status === "Pesanan Selesai") {
                        rev += o.sell_price;
                        cost += o.cost_price;
                        comm += o.commission || 0;
                        prof += (o.profit - (o.commission || 0));

                        // Daily Trend Logic
                        const date = new Date(o.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' });
                        if (!dailyStats[date]) dailyStats[date] = { revenue: 0, cost: 0, profit: 0, commission: 0, orders: 0 };
                        dailyStats[date].revenue += o.sell_price;
                        dailyStats[date].cost += o.cost_price;
                        dailyStats[date].commission += (o.commission || 0);
                        dailyStats[date].profit += (o.profit - (o.commission || 0));
                        dailyStats[date].orders += 1;
                    }

                    // Top Products Logic
                    productSales[o.product_name] = (productSales[o.product_name] || 0) + 1;

                    if (o.status === "Menunggu Konfirmasi" || o.status === "Sedang Diproses") {
                        active++;
                    }
                });

                // Convert records to arrays for charts
                const chartArr = Object.entries(dailyStats).map(([date, vals]) => ({
                    date,
                    revenue: vals.revenue,
                    profit: vals.profit
                })).slice(-14); // Last 14 days

                const dailyReportArr = Object.entries(dailyStats).map(([date, vals]) => ({
                    date,
                    ...vals
                })).reverse();

                const topProdsArr = Object.entries(productSales)
                    .map(([name, sales]) => ({ name, sales }))
                    .sort((a, b) => b.sales - a.sales)
                    .slice(0, 5);

                setChartData(chartArr);
                setTopProducts(topProdsArr);
                setStats({
                    revenue: rev,
                    cost: cost,
                    profit: prof,
                    activeOrders: active,
                    totalOrders: orders.length,
                    commission: comm,
                    pendingWithdrawals: 0,
                    dailyReport: dailyReportArr
                });

                // Fetch Pending Withdrawals
                const { data: wds } = await supabase.from("withdrawals").select("id").eq("status", "PENDING");
                if (wds) {
                    setStats(prev => ({ ...prev, pendingWithdrawals: wds.length }));
                }
            }
            setLoading(false);
        }

        fetchStats();
    }, []);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-4 border-b border-slate-100 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-blue-600" />
                        Admin Analytics
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Laporan Keuangan & Performa Bisnis Real-time.</p>
                </div>
                <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-500 w-fit">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Sistem Operasional Normal
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                    <p className="text-sm font-bold text-slate-400 animate-pulse uppercase tracking-widest">Menganalisa Data Keuangan...</p>
                </div>
            ) : (
                <>
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: "Total Omset", value: stats.revenue, icon: DollarSign, color: "blue", trend: "+12%" },
                            { label: "Profit Bersih", value: stats.profit, icon: TrendingUp, color: "emerald", trend: "+8%" },
                            { label: "Modal Keluar", value: stats.cost, icon: TrendingDown, color: "rose", trend: "-2%" },
                            { label: "Potongan Komisi", value: stats.commission, icon: PieChart, color: "purple", trend: "+5%" },
                        ].map((stat, idx) => (
                            <div key={idx} className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 relative overflow-hidden">
                                <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full bg-${stat.color}-50 opacity-50 group-hover:scale-110 transition-transform`}></div>
                                <div className={`bg-${stat.color}-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}>
                                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                                </div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <div className="flex items-end justify-between">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Rp {stat.value.toLocaleString('id-ID')}</h3>
                                    <div className={`flex items-center gap-0.5 text-[10px] font-black px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        {stat.trend}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Trend Chart */}
                        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)]">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Tren Pendapatan</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Statistik 14 Hari Terakhir</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase">Omset</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase">Profit</span>
                                    </div>
                                </div>
                            </div>
                            <DashboardChart data={chartData} />
                        </div>

                        {/* Top Products & Order Stats */}
                        <div className="space-y-8">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)]">
                                <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6">Produk Terlaris</h3>
                                <TopProductsChart data={topProducts} />
                            </div>

                            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white overflow-hidden relative group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-20 blur-[80px] -mr-16 -mt-16 group-hover:opacity-30 transition-opacity"></div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Informasi Pesanan</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                                                <ShoppingBag className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-300">Total Transaksi</span>
                                        </div>
                                        <span className="text-xl font-black">{stats.totalOrders}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                                                <Package className="w-5 h-5 text-orange-400" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-300">Pesanan Aktif</span>
                                        </div>
                                        <span className="text-xl font-black text-orange-400">{stats.activeOrders}</span>
                                    </div>
                                    <Link href="/admin/withdrawals" className="flex items-center justify-between group/wd hover:bg-slate-800/50 p-2 -m-2 rounded-xl transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                                                <Wallet className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-300">Tarik Saldo Pending</span>
                                        </div>
                                        <span className={`text-xl font-black ${stats.pendingWithdrawals > 0 ? 'text-purple-400 animate-pulse' : 'text-slate-500'}`}>
                                            {stats.pendingWithdrawals}
                                        </span>
                                    </Link>
                                    <div className="flex items-center gap-2 mt-4 pt-6 border-t border-slate-800">
                                        <Users className="w-4 h-4 text-slate-500" />
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Data diperbarui otomatis</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Daily Financial Report */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">Laporan Harian</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Rincian Keuangan Per Hari</p>
                            </div>
                            <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-100">
                                Update Real-time
                            </div>
                        </div>

                        {/* Desktop View Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="p-6">Tanggal</th>
                                        <th className="p-6">Pesanan Selesai</th>
                                        <th className="p-6">Omset (Revenue)</th>
                                        <th className="p-6 text-rose-500">Modal (Cost)</th>
                                        <th className="p-6 text-purple-600">Komisi</th>
                                        <th className="p-6 text-emerald-600">Laba (Profit)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(stats.dailyReport || []).slice(0, 14).map((day, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-6 font-bold text-slate-900">{day.date}</td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs">
                                                        {day.orders}
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-500 uppercase">Trx</span>
                                                </div>
                                            </td>
                                            <td className="p-6 font-black text-slate-900">Rp {day.revenue.toLocaleString('id-ID')}</td>
                                            <td className="p-6 font-bold text-rose-500">Rp {day.cost.toLocaleString('id-ID')}</td>
                                            <td className="p-6 font-bold text-purple-600">Rp {day.commission.toLocaleString('id-ID')}</td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-emerald-600 text-base">Rp {day.profit.toLocaleString('id-ID')}</span>
                                                    <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-black">
                                                        {day.revenue > 0 ? ((day.profit / day.revenue) * 100).toFixed(0) : 0}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View Cards */}
                        <div className="md:hidden space-y-4 p-4 bg-slate-50/50">
                            {(stats.dailyReport || []).slice(0, 10).map((day, i) => (
                                <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-black text-slate-900 text-sm">{day.date}</h4>
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">
                                            {day.orders} TRXS
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Revenue</p>
                                            <p className="font-black text-slate-900 text-xs">Rp {day.revenue.toLocaleString('id-ID')}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Modal (Cost)</p>
                                            <p className="font-black text-rose-500 text-xs">Rp {day.cost.toLocaleString('id-ID')}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Komisi</p>
                                            <p className="font-black text-purple-600 text-xs">Rp {day.commission.toLocaleString('id-ID')}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Profit</p>
                                            <div className="flex items-center gap-1">
                                                <p className="font-black text-emerald-600 text-xs">Rp {day.profit.toLocaleString('id-ID')}</p>
                                                <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1 py-0.5 rounded-md font-black">
                                                    {day.revenue > 0 ? ((day.profit / day.revenue) * 100).toFixed(0) : 0}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {(stats.dailyReport || []).length === 0 && (
                            <div className="p-12 text-center text-slate-400 font-medium italic">Belum ada data keuangan untuk ditampilkan.</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
