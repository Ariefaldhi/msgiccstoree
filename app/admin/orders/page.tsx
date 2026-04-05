"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, RefreshCw, CheckCircle2, Clock, XCircle, ShoppingBag } from "lucide-react";

interface Order {
    id: string;
    wa_number: string;
    customer_name: string;
    product_name: string;
    package_name: string;
    sell_price: number;
    cost_price: number;
    profit: number;
    status: string;
    created_at: string;
}

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const supabase = createClient();

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setOrders(data);
        } else {
            console.error("Failed to fetch orders", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        setUpdatingId(id);
        const { error } = await supabase
            .from("orders")
            .update({ status: newStatus })
            .eq("id", id);
        
        if (!error) {
            setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        } else {
            alert("Gagal mengupdate status: " + error.message);
        }
        setUpdatingId(null);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Menunggu Konfirmasi': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Sedang Diproses': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Pesanan Selesai': return 'bg-green-100 text-green-700 border-green-200';
            case 'Dibatalkan': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const StatusDropdown = ({ order }: { order: Order }) => (
        <select 
            value={order.status}
            onChange={(e) => updateStatus(order.id, e.target.value)}
            disabled={updatingId === order.id}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border appearance-none outline-none cursor-pointer transition-all ${getStatusStyle(order.status)} ${updatingId === order.id ? 'opacity-50' : ''}`}
        >
            <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
            <option value="Sedang Diproses">Sedang Diproses</option>
            <option value="Pesanan Selesai">Pesanan Selesai</option>
            <option value="Dibatalkan">Dibatalkan</option>
        </select>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6 text-blue-600" />
                        Kelola Pesanan
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        Pantau dan update status pesanan yang masuk.
                    </p>
                </div>
                <button 
                    onClick={fetchOrders}
                    className="flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-200 text-slate-600 hover:text-blue-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {loading && orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-100">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                    <p className="text-sm font-bold text-slate-500">Memuat data pesanan...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-100 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <ShoppingBag className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Belum Ada Pesanan</h3>
                    <p className="text-sm text-slate-500 max-w-sm">Pesanan dari website akan otomatis muncul di sini setelah pembeli mengklik Konfirmasi.</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Tanggal & Order ID</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Pelanggan</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Produk / Paket</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Harga / Profit</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">{new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                                                <span className="text-[10px] uppercase text-slate-400 font-mono mt-0.5">{order.id.split('-')[0]}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">{order.customer_name}</span>
                                                <span className="text-xs font-medium text-slate-500 mt-0.5 whitespace-nowrap">{order.wa_number}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col max-w-[200px]">
                                                <span className="text-sm font-bold text-slate-900 truncate" title={order.product_name}>{order.product_name}</span>
                                                <span className="text-xs font-medium text-slate-500 truncate" title={order.package_name}>{order.package_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-black text-blue-600">Rp {order.sell_price.toLocaleString("id-ID")}</span>
                                                <span className="text-xs font-bold text-green-500 bg-green-50 px-1.5 rounded mt-1">+Rp {order.profit.toLocaleString("id-ID")}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <StatusDropdown order={order} />
                                                {updatingId === order.id && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
