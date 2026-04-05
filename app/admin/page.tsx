"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        revenue: 0,
        cost: 0,
        profit: 0,
        activeOrders: 0,
        totalOrders: 0,
    });
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        async function fetchStats() {
            setLoading(true);
            const { data: orders } = await supabase.from("orders").select("*");
            
            if (orders) {
                let rev = 0;
                let cost = 0;
                let prof = 0;
                let active = 0;

                orders.forEach(o => {
                    if (o.status === "Pesanan Selesai") {
                        rev += o.sell_price;
                        cost += o.cost_price;
                        prof += o.profit;
                    }
                    if (o.status === "Menunggu Konfirmasi" || o.status === "Sedang Diproses") {
                        active++;
                    }
                });

                setStats({
                    revenue: rev,
                    cost: cost,
                    profit: prof,
                    activeOrders: active,
                    totalOrders: orders.length
                });
            }
            setLoading(false);
        }

        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
                    <p className="text-slate-500 mt-1">Laporan Keuangan & Performa Toko Anda.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Stat Cards */}
                    {[
                        { label: "Keuntungan Bersih", value: `Rp ${stats.profit.toLocaleString('id-ID')}`, color: "green" },
                        { label: "Total Pendapatan", value: `Rp ${stats.revenue.toLocaleString('id-ID')}`, color: "blue" },
                        { label: "Total Modal", value: `Rp ${stats.cost.toLocaleString('id-ID')}`, color: "red" },
                        { label: "Pesanan Aktif", value: stats.activeOrders.toString(), color: "orange" },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1 h-full bg-${stat.color}-500`}></div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                            <div className="mt-2 flex items-baseline gap-2">
                                <span className="text-2xl font-black text-slate-900">{stat.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[300px]">
                    <h3 className="font-bold text-lg text-slate-900 mb-4">Recent Activity</h3>
                    <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                        Chart Placeholder
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[300px]">
                    <h3 className="font-bold text-lg text-slate-900 mb-4">Top Products</h3>
                    <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                        List Placeholder
                    </div>
                </div>
            </div>
        </div>
    );
}
