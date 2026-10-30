"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Loader2, TrendingUp, TrendingDown, DollarSign, ShoppingBag,
    Users, Package, ArrowUpRight, ArrowDownRight, Wallet, Eye, EyeOff,
    BarChart2, Activity, Percent, Calendar
} from "lucide-react";
import { useAdminCurrency } from "@/components/admin/AdminCurrencyProvider";
import Link from "next/link";
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Order {
    id: string;
    status: string;
    sell_price: number;
    cost_price: number;
    profit: number;
    commission?: number;
    product_name: string;
    package_name: string;
    created_at: string;
}

type Period = "7d" | "30d" | "90d" | "365d" | "all";

const PERIODS: { label: string; value: Period }[] = [
    { label: "7 Hari", value: "7d" },
    { label: "30 Hari", value: "30d" },
    { label: "3 Bulan", value: "90d" },
    { label: "1 Tahun", value: "365d" },
    { label: "Semua", value: "all" },
];

// ─── Chart Tooltip Styles ─────────────────────────────────────────────────────
const tooltipStyle = {
    contentStyle: {
        backgroundColor: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        fontSize: "12px",
        padding: "10px 14px",
    },
    labelStyle: { fontWeight: 700, color: "#1e293b", marginBottom: 4 },
};

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function filterOrdersByPeriod(orders: Order[], period: Period): Order[] {
    if (period === "all") return orders;
    const days = { "7d": 7, "30d": 30, "90d": 90, "365d": 365 }[period];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return orders.filter(o => new Date(o.created_at) >= cutoff);
}

function groupByDay(orders: Order[], period: Period) {
    const buckets: Record<string, { date: string; revenue: number; cost: number; profit: number; commission: number; orders: number }> = {};
    const fmt = period === "365d" || period === "all"
        ? (d: Date) => d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" })
        : (d: Date) => d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });

    orders.forEach(o => {
        if (o.status !== "Pesanan Selesai") return;
        const key = fmt(new Date(o.created_at));
        if (!buckets[key]) buckets[key] = { date: key, revenue: 0, cost: 0, profit: 0, commission: 0, orders: 0 };
        buckets[key].revenue += o.sell_price;
        buckets[key].cost += o.cost_price;
        buckets[key].profit += o.profit - (o.commission || 0);
        buckets[key].commission += o.commission || 0;
        buckets[key].orders += 1;
    });
    return Object.values(buckets);
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionCard({ title, subtitle, children, className }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("bg-white rounded-2xl border border-slate-200/90 shadow-xs", className)}>
            <div className="px-5 pt-5 pb-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            <div className="p-5">
                {children}
            </div>
        </div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const { formatCurrency } = useAdminCurrency();
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCensored, setIsCensored] = useState(true);
    const [period, setPeriod] = useState<Period>("30d");
    const [pendingWithdrawals, setPendingWithdrawals] = useState(0);

    const displayMoney = (val: number) => isCensored ? "Rp ••••••" : formatCurrency(val);
    const supabase = createClient();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const [{ data: orders }, { data: wds }] = await Promise.all([
                supabase.from("orders").select("*").order("created_at", { ascending: true }),
                supabase.from("withdrawals").select("id").eq("status", "PENDING"),
            ]);
            if (orders) setAllOrders(orders);
            if (wds) setPendingWithdrawals(wds.length);
            setLoading(false);
        }
        fetchData();
    }, []);

    // ── Derived stats based on period ──────────────────────────────────────────
    const filtered = useMemo(() => filterOrdersByPeriod(allOrders, period), [allOrders, period]);
    const completed = useMemo(() => filtered.filter(o => o.status === "Pesanan Selesai"), [filtered]);

    const stats = useMemo(() => {
        const revenue = completed.reduce((s, o) => s + o.sell_price, 0);
        const cost = completed.reduce((s, o) => s + o.cost_price, 0);
        const commission = completed.reduce((s, o) => s + (o.commission || 0), 0);
        const profit = completed.reduce((s, o) => s + o.profit - (o.commission || 0), 0);
        const active = filtered.filter(o => ["Menunggu Konfirmasi", "Sedang Diproses"].includes(o.status)).length;
        const marginPercent = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : "0";
        const avgOrderValue = completed.length > 0 ? revenue / completed.length : 0;
        return { revenue, cost, profit, commission, active, total: filtered.length, marginPercent, avgOrderValue };
    }, [completed, filtered]);

    // ── Chart data ─────────────────────────────────────────────────────────────
    const trendData = useMemo(() => groupByDay(filtered, period), [filtered, period]);

    const topProducts = useMemo(() => {
        const map: Record<string, number> = {};
        allOrders.forEach(o => { map[o.product_name] = (map[o.product_name] || 0) + 1; });
        return Object.entries(map).map(([name, sales]) => ({ name, sales }))
            .sort((a, b) => b.sales - a.sales).slice(0, 6);
    }, [allOrders]);

    const categoryData = useMemo(() => {
        const map: Record<string, number> = {};
        completed.forEach(o => { map[o.product_name] = (map[o.product_name] || 0) + o.sell_price; });
        return Object.entries(map).map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value).slice(0, 5);
    }, [completed]);

    const statusData = useMemo(() => {
        const map: Record<string, number> = {};
        filtered.forEach(o => { map[o.status] = (map[o.status] || 0) + 1; });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }, [filtered]);

    const profitMarginData = useMemo(() => trendData.map(d => ({
        date: d.date,
        margin: d.revenue > 0 ? parseFloat(((d.profit / d.revenue) * 100).toFixed(1)) : 0,
        orders: d.orders,
    })), [trendData]);

    const dailyReport = useMemo(() => [...trendData].reverse(), [trendData]);

    // ── Prev period comparison ─────────────────────────────────────────────────
    const prevPeriodOrders = useMemo(() => {
        if (period === "all") return [];
        const days = { "7d": 7, "30d": 30, "90d": 90, "365d": 365 }[period];
        const now = new Date();
        const cutoff = new Date(); cutoff.setDate(now.getDate() - days);
        const prevCutoff = new Date(); prevCutoff.setDate(now.getDate() - days * 2);
        return allOrders.filter(o => {
            const d = new Date(o.created_at);
            return d >= prevCutoff && d < cutoff && o.status === "Pesanan Selesai";
        });
    }, [allOrders, period]);

    const prevRevenue = prevPeriodOrders.reduce((s, o) => s + o.sell_price, 0);
    const revGrowth = prevRevenue > 0 ? (((stats.revenue - prevRevenue) / prevRevenue) * 100).toFixed(1) : null;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Memuat data analytics...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-16">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-slate-200 gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                        <Activity className="w-6 h-6 text-blue-600" />
                        Analytics Dashboard
                    </h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-0.5">Performa bisnis & laporan keuangan real-time.</p>
                </div>
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => setIsCensored(!isCensored)}
                        className="bg-white hover:bg-slate-50 p-2 rounded-lg border border-slate-200 transition-colors text-slate-600 shadow-xs"
                        title={isCensored ? "Tampilkan Nominal" : "Sembunyikan"}
                    >
                        {isCensored ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <div className="bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Sistem Normal
                    </div>
                </div>
            </div>

            {/* ── Period Filter ── */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                <Calendar className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1 shrink-0" />
                {PERIODS.map(p => (
                    <button
                        key={p.value}
                        onClick={() => setPeriod(p.value)}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                            period === p.value
                                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: "Total Omset", value: displayMoney(stats.revenue), icon: DollarSign,
                        color: "blue", sub: revGrowth ? `${Number(revGrowth) >= 0 ? "+" : ""}${revGrowth}% vs periode lalu` : "Semua waktu",
                        up: revGrowth ? Number(revGrowth) >= 0 : true
                    },
                    {
                        label: "Profit Bersih", value: displayMoney(stats.profit), icon: TrendingUp,
                        color: "emerald", sub: `Margin ${stats.marginPercent}%`,
                        up: true
                    },
                    {
                        label: "Modal Keluar", value: displayMoney(stats.cost), icon: TrendingDown,
                        color: "rose", sub: `${completed.length} transaksi selesai`,
                        up: false
                    },
                    {
                        label: "Komisi Afiliasi", value: displayMoney(stats.commission), icon: Users,
                        color: "purple", sub: `Rata-rata ${displayMoney(stats.avgOrderValue)}/order`,
                        up: true
                    },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 hover:border-slate-300 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
                            <div className={cn("size-8 rounded-lg flex items-center justify-center", {
                                "bg-blue-50 text-blue-600": kpi.color === "blue",
                                "bg-emerald-50 text-emerald-600": kpi.color === "emerald",
                                "bg-rose-50 text-rose-600": kpi.color === "rose",
                                "bg-purple-50 text-purple-600": kpi.color === "purple",
                            })}>
                                <kpi.icon className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-xl font-bold text-slate-900 mb-1">{kpi.value}</p>
                        <p className={cn("text-[11px] font-medium flex items-center gap-1", kpi.up ? "text-emerald-600" : "text-rose-600")}>
                            {kpi.up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                            {kpi.sub}
                        </p>
                    </div>
                ))}
            </div>

            {/* ── Secondary KPIs ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Order Aktif", value: stats.active, icon: ShoppingBag, href: "/admin/orders" },
                    { label: "Total Order", value: stats.total, icon: Package, href: "/admin/orders" },
                    { label: "Margin Rata-rata", value: `${stats.marginPercent}%`, icon: Percent, href: null },
                    { label: "Tarik Pending", value: pendingWithdrawals, icon: Wallet, href: "/admin/withdrawals" },
                ].map((item, i) => {
                    const inner = (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-medium text-slate-500">{item.label}</p>
                                <p className="text-xl font-bold text-slate-900 mt-0.5">{item.value}</p>
                            </div>
                            <item.icon className="size-5 text-slate-300" />
                        </div>
                    );
                    return item.href ? (
                        <Link key={i} href={item.href} className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs hover:border-slate-300 transition-colors">
                            {inner}
                        </Link>
                    ) : (
                        <div key={i} className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
                            {inner}
                        </div>
                    );
                })}
            </div>

            {/* ── Revenue & Profit Trend ── */}
            <SectionCard title="Tren Omset & Profit" subtitle={`Data periode ${PERIODS.find(p2 => p2.value === period)?.label}`}>
                <div className="flex gap-4 mb-4">
                    {[{ label: "Omset", color: "#3b82f6" }, { label: "Profit", color: "#10b981" }, { label: "Modal", color: "#f59e0b" }].map(l => (
                        <div key={l.label} className="flex items-center gap-1.5">
                            <div className="size-2.5 rounded-full" style={{ background: l.color }} />
                            <span className="text-xs font-medium text-slate-600">{l.label}</span>
                        </div>
                    ))}
                </div>
                <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gCost" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.08} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} dy={8} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }}
                                tickFormatter={v => `${v >= 1000000 ? (v / 1000000).toFixed(1) + "jt" : v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
                            <Tooltip {...tooltipStyle} formatter={(v: any, name: any): any => [formatCurrency(v), name]} />
                            <Area type="monotone" name="Omset" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#gRevenue)" />
                            <Area type="monotone" name="Profit" dataKey="profit" stroke="#10b981" strokeWidth={2} fill="url(#gProfit)" />
                            <Area type="monotone" name="Modal" dataKey="cost" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2" fill="url(#gCost)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </SectionCard>

            {/* ── Margin % & Volume ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard title="Profit Margin (%)" subtitle="Persentase keuntungan bersih per periode">
                    <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={profitMarginData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} dy={8} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }}
                                    tickFormatter={v => `${v}%`} domain={[0, "auto"]} />
                                <Tooltip {...tooltipStyle} formatter={(v: any): any => [`${v}%`, "Margin"]} />
                                <Line type="monotone" dataKey="margin" name="Margin" stroke="#8b5cf6" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>

                <SectionCard title="Volume Transaksi Harian" subtitle="Jumlah pesanan selesai per periode">
                    <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} dy={8} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                                <Tooltip {...tooltipStyle} formatter={(v: any): any => [v, "Pesanan"]} />
                                <Bar dataKey="orders" name="Pesanan" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>
            </div>

            {/* ── Top Products & Status Distribution ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard title="Produk Terlaris" subtitle="Berdasarkan total pesanan masuk">
                    <div className="h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={topProducts} margin={{ top: 0, right: 16, left: 4, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false}
                                    tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }} width={90} />
                                <Tooltip {...tooltipStyle} formatter={(v: any): any => [`${v} pesanan`, "Volume"]} />
                                <Bar dataKey="sales" name="Pesanan" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>

                <SectionCard title="Status Order" subtitle="Distribusi status pesanan pada periode ini">
                    <div className="h-[240px] flex items-center">
                        <ResponsiveContainer width="50%" height="100%">
                            <PieChart>
                                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                                    dataKey="value" paddingAngle={3}>
                                    {statusData.map((_, idx) => (
                                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip {...tooltipStyle} formatter={(v: any, name: any): any => [v + " pesanan", name]} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex-1 flex flex-col gap-2 pl-2">
                            {statusData.map((s, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs">
                                    <div className="size-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                                    <span className="text-slate-600 font-medium flex-1 truncate">{s.name}</span>
                                    <span className="font-bold text-slate-900">{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionCard>
            </div>

            {/* ── Revenue by Product (Pie) ── */}
            <SectionCard title="Kontribusi Omset per Produk" subtitle="Proporsi revenue dari 5 produk teratas periode ini">
                <div className="h-[240px] flex items-center gap-8">
                    <ResponsiveContainer width="40%" height="100%">
                        <PieChart>
                            <Pie data={categoryData} cx="50%" cy="50%" outerRadius={90} dataKey="value" paddingAngle={2}>
                                {categoryData.map((_, idx) => (
                                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip {...tooltipStyle} formatter={(v: any): any => [formatCurrency(v as number), "Omset"]} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2.5">
                        {categoryData.map((d, idx) => {
                            const total = categoryData.reduce((s, x) => s + x.value, 0);
                            const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : "0";
                            return (
                                <div key={idx}>
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="size-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                                            <span className="font-medium text-slate-700 truncate max-w-[140px]">{d.name}</span>
                                        </div>
                                        <span className="font-bold text-slate-900">{pct}%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </SectionCard>

            {/* ── Daily Financial Log ── */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">Laporan Harian</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">Rincian per periode — {PERIODS.find(p2 => p2.value === period)?.label}</p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-emerald-100">
                        {dailyReport.length} entri
                    </span>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                <th className="px-5 py-3">Tanggal</th>
                                <th className="px-5 py-3">Order</th>
                                <th className="px-5 py-3">Omset</th>
                                <th className="px-5 py-3 text-rose-600">Modal</th>
                                <th className="px-5 py-3 text-purple-600">Komisi</th>
                                <th className="px-5 py-3 text-emerald-600">Profit</th>
                                <th className="px-5 py-3 text-slate-500">Margin</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {dailyReport.map((day, i) => {
                                const margin = day.revenue > 0 ? ((day.profit / day.revenue) * 100).toFixed(1) : "0";
                                return (
                                    <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-5 py-3 font-semibold text-slate-900">{day.date}</td>
                                        <td className="px-5 py-3">
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-bold">{day.orders}</span>
                                        </td>
                                        <td className="px-5 py-3 font-bold text-slate-900">{displayMoney(day.revenue)}</td>
                                        <td className="px-5 py-3 font-medium text-rose-600">{displayMoney(day.cost)}</td>
                                        <td className="px-5 py-3 font-medium text-purple-600">{displayMoney(day.commission)}</td>
                                        <td className="px-5 py-3 font-bold text-emerald-700">{displayMoney(day.profit)}</td>
                                        <td className="px-5 py-3">
                                            <span className={cn("text-[11px] px-1.5 py-0.5 rounded font-semibold",
                                                Number(margin) >= 20 ? "bg-emerald-50 text-emerald-700" :
                                                    Number(margin) >= 10 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                                            )}>
                                                {margin}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {dailyReport.length === 0 && (
                        <div className="py-16 text-center text-slate-400 text-sm">Belum ada data untuk periode ini.</div>
                    )}
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3 p-4 bg-slate-50/50">
                    {dailyReport.slice(0, 15).map((day, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
                            <div className="flex justify-between mb-3 pb-2 border-b border-slate-100">
                                <span className="font-bold text-slate-900 text-xs">{day.date}</span>
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold">{day.orders} order</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="p-2 bg-slate-50 rounded-lg">
                                    <p className="text-[10px] text-slate-400 font-medium mb-0.5">Omset</p>
                                    <p className="font-bold text-slate-900">{displayMoney(day.revenue)}</p>
                                </div>
                                <div className="p-2 bg-rose-50/60 rounded-lg">
                                    <p className="text-[10px] text-rose-500 font-medium mb-0.5">Modal</p>
                                    <p className="font-bold text-rose-600">{displayMoney(day.cost)}</p>
                                </div>
                                <div className="p-2 bg-purple-50/60 rounded-lg">
                                    <p className="text-[10px] text-purple-500 font-medium mb-0.5">Komisi</p>
                                    <p className="font-bold text-purple-600">{displayMoney(day.commission)}</p>
                                </div>
                                <div className="p-2 bg-emerald-50/60 rounded-lg">
                                    <p className="text-[10px] text-emerald-600 font-medium mb-0.5">Profit</p>
                                    <p className="font-bold text-emerald-700">{displayMoney(day.profit)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {dailyReport.length === 0 && (
                        <div className="py-12 text-center text-slate-400 text-sm">Belum ada data untuk periode ini.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
