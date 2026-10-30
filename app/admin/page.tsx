"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, TrendingUp, TrendingDown, DollarSign, ShoppingBag, PieChart, Users, Package, ArrowUpRight, ArrowDownRight, Wallet, Eye, EyeOff } from "lucide-react";
import { useAdminCurrency } from "@/components/admin/AdminCurrencyProvider";
import Link from "next/link";
import DashboardChart, { TopProductsChart } from "@/components/admin/DashboardChart";

export default function AdminDashboard() {
    const { formatCurrency } = useAdminCurrency();
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
    const [isCensored, setIsCensored] = useState(true);

    const displayMoney = (val: number) => isCensored ? "Rp ••••••" : formatCurrency(val);

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
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-slate-200 gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                        Admin Analytics
                    </h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-0.5">Laporan keuangan & performa bisnis real-time.</p>
                </div>
                <div className="flex flex-row items-center gap-2.5">
                    <button 
                        onClick={() => setIsCensored(!isCensored)} 
                        className="bg-white hover:bg-slate-50 p-2 rounded-lg border border-slate-200 transition-colors text-slate-600 flex items-center justify-center shadow-xs"
                        title={isCensored ? "Tampilkan Nominal" : "Sembunyikan Nominal"}
                    >
                        {isCensored ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <div className="bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Sistem Operasional Normal
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 bg-white border border-slate-200/80 rounded-2xl">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Menganalisa Data Keuangan...</p>
                </div>
            ) : (
                <>
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Total Omset", value: stats.revenue, icon: DollarSign, color: "blue", trend: "+12%" },
                            { label: "Profit Bersih", value: stats.profit, icon: TrendingUp, color: "emerald", trend: "+8%" },
                            { label: "Modal Keluar", value: stats.cost, icon: TrendingDown, color: "rose", trend: "-2%" },
                            { label: "Potongan Komisi", value: stats.commission, icon: PieChart, color: "purple", trend: "+5%" },
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                        stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                        stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                        stat.color === 'rose' ? 'bg-rose-50 text-rose-600' :
                                        'bg-purple-50 text-purple-600'
                                    }`}>
                                        <stat.icon className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="flex items-baseline justify-between gap-2">
                                    <h3 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">{displayMoney(stat.value)}</h3>
                                    <div className={`flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                        {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        {stat.trend}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Trend Chart */}
                        <div className="lg:col-span-2 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/90 shadow-xs">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Tren Pendapatan</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Statistik performa 14 hari terakhir</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                                        <span className="text-xs font-medium text-slate-600">Omset</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                        <span className="text-xs font-medium text-slate-600">Profit</span>
                                    </div>
                                </div>
                            </div>
                            <DashboardChart data={chartData} />
                        </div>

                        {/* Top Products & Order Stats */}
                        <div className="space-y-6">
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                                <h3 className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">Produk Terlaris</h3>
                                <TopProductsChart data={topProducts} />
                            </div>

                            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-white shadow-xs">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Informasi Pesanan</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                                                <ShoppingBag className="w-4 h-4 text-blue-400" />
                                            </div>
                                            <span className="text-xs font-medium text-slate-300">Total Transaksi</span>
                                        </div>
                                        <span className="text-sm font-bold">{stats.totalOrders}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                                                <Package className="w-4 h-4 text-orange-400" />
                                            </div>
                                            <span className="text-xs font-medium text-slate-300">Pesanan Aktif</span>
                                        </div>
                                        <span className="text-sm font-bold text-orange-400">{stats.activeOrders}</span>
                                    </div>
                                    <Link href="/admin/withdrawals" className="flex items-center justify-between group/wd hover:bg-slate-800/60 p-2 -m-2 rounded-lg transition-colors">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                                                <Wallet className="w-4 h-4 text-purple-400" />
                                            </div>
                                            <span className="text-xs font-medium text-slate-300">Tarik Saldo Pending</span>
                                        </div>
                                        <span className={`text-sm font-bold ${stats.pendingWithdrawals > 0 ? 'text-purple-400' : 'text-slate-500'}`}>
                                            {stats.pendingWithdrawals}
                                        </span>
                                    </Link>
                                    <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                                        <Users className="w-3.5 h-3.5 text-slate-500" />
                                        <p className="text-[10px] font-medium text-slate-400">Data diperbarui otomatis</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Daily Financial Report */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Laporan Harian</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Rincian performa keuangan per hari</p>
                            </div>
                            <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-100">
                                Update Real-time
                            </div>
                        </div>

                        {/* Desktop View Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-xs whitespace-nowrap">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                        <th className="px-4 py-3">Tanggal</th>
                                        <th className="px-4 py-3">Pesanan</th>
                                        <th className="px-4 py-3">Omset (Revenue)</th>
                                        <th className="px-4 py-3 text-rose-600">Modal (Cost)</th>
                                        <th className="px-4 py-3 text-purple-600">Komisi</th>
                                        <th className="px-4 py-3 text-emerald-600">Laba (Profit)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(stats.dailyReport || []).slice(0, 14).map((day, i) => (
                                        <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-4 py-3 font-semibold text-slate-900">{day.date}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-xs">
                                                        {day.orders}
                                                    </span>
                                                    <span className="text-[11px] text-slate-500">trx</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-bold text-slate-900">{displayMoney(day.revenue)}</td>
                                            <td className="px-4 py-3 font-medium text-rose-600">{displayMoney(day.cost)}</td>
                                            <td className="px-4 py-3 font-medium text-purple-600">{displayMoney(day.commission)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-emerald-600 text-xs">{displayMoney(day.profit)}</span>
                                                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold border border-emerald-100">
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
                        <div className="md:hidden space-y-3 p-4 bg-slate-50/50">
                            {(stats.dailyReport || []).slice(0, 10).map((day, i) => (
                                <div key={i} className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
                                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                                        <h4 className="font-bold text-slate-900 text-xs">{day.date}</h4>
                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold">
                                            {day.orders} TRANSAKSI
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Omset</span>
                                            <p className="font-bold text-slate-900 mt-0.5">{displayMoney(day.revenue)}</p>
                                        </div>
                                        <div className="p-2.5 bg-rose-50/60 rounded-lg border border-rose-100">
                                            <span className="text-[10px] text-rose-500 font-medium uppercase tracking-wider block">Modal</span>
                                            <p className="font-bold text-rose-600 mt-0.5">{displayMoney(day.cost)}</p>
                                        </div>
                                        <div className="p-2.5 bg-purple-50/60 rounded-lg border border-purple-100">
                                            <span className="text-[10px] text-purple-500 font-medium uppercase tracking-wider block">Komisi</span>
                                            <p className="font-bold text-purple-600 mt-0.5">{displayMoney(day.commission)}</p>
                                        </div>
                                        <div className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-100">
                                            <span className="text-[10px] text-emerald-600 font-medium uppercase tracking-wider block">Profit</span>
                                            <p className="font-bold text-emerald-700 mt-0.5">{displayMoney(day.profit)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {(stats.dailyReport || []).length === 0 && (
                            <div className="p-12 text-center text-slate-400 font-medium">Belum ada data keuangan untuk ditampilkan.</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
