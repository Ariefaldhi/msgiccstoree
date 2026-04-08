"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, RefreshCw, CheckCircle2, Clock, XCircle, ShoppingBag, Plus, Edit, Trash2, X, Save, Megaphone } from "lucide-react";

interface Order {
    id: string;
    user_id?: string;
    email?: string;
    wa_number: string;
    customer_name: string;
    product_name: string;
    package_name: string;
    sell_price: number;
    cost_price: number;
    profit: number;
    status: string;
    affiliator_id?: string;
    commission?: number;
    created_at: string;
}

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const [products, setProducts] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderForm, setOrderForm] = useState({
        customer_name: "", wa_number: "", product_id: "", package_id: "", status: "Pesanan Selesai", created_at: "",
        affiliator_id: "", commission: 0, sell_price: 0, cost_price: 0
    });
    const [globalCommissionPercent, setGlobalCommissionPercent] = useState(25);

    const supabase = createClient();

    const fetchOrdersAndProducts = async () => {
        setLoading(true);
        const [ordersRes, productsRes, settingsRes] = await Promise.all([
            supabase.from("orders").select("*").order("created_at", { ascending: false }),
            supabase.from("products").select("*, packages(*)"),
            supabase.from("store_settings").select("affiliate_commission_percent").eq("id", 1).single()
        ]);
 
        if (ordersRes.data) setOrders(ordersRes.data);
        if (productsRes.data) setProducts(productsRes.data);
        if (settingsRes.data) setGlobalCommissionPercent(settingsRes.data.affiliate_commission_percent ?? 25);
        setLoading(false);
    };

    useEffect(() => {
        fetchOrdersAndProducts();
    }, []);

    // Auto-calculate commission in modal
    useEffect(() => {
        if (isModalOpen && orderForm.affiliator_id) {
            const profit = orderForm.sell_price - orderForm.cost_price;
            if (profit > 0) {
                const autoCommission = Math.floor(profit * (globalCommissionPercent / 100));
                setOrderForm(prev => ({ ...prev, commission: autoCommission }));
            }
        }
    }, [orderForm.sell_price, orderForm.cost_price, orderForm.affiliator_id, isModalOpen]);

    const updateStatus = async (id: string, newStatus: string) => {
        setUpdatingId(id);
        const order = orders.find(o => o.id === id);

        const { error } = await supabase
            .from("orders")
            .update({ status: newStatus })
            .eq("id", id);
        
        if (!error) {
            // Automatic Balance Adjustment for Affiliators
            if (newStatus === "Pesanan Selesai" && order?.status !== "Pesanan Selesai" && order?.affiliator_id) {
                // FRESH FETCH: Get settings directly from DB to avoid any state synchronization issues
                const { data: st } = await supabase.from("store_settings").select("affiliate_commission_percent").eq("id", 1).single();
                const currentPercent = st?.affiliate_commission_percent ?? 25;
                
                // CALCULATION: Explicitly calculate the commission share (25%)
                const commissionToPay = Math.floor(order.profit * (currentPercent / 100));
                
                // 🧪 GHOST TEST: Melakukan pengetesan "pemicu tersembunyi" (hidden triggers)
                const confirmed = window.confirm(
                    `🧪 GHOST TEST (DIAGNOSTIK):\n\n` +
                    `SAYA TELAH MENONAKTIFKAN KODE SAYA. Jika saldo tetap bertambah menjadi Rp 3.000 setelah Anda klik OK, berarti ada "DATABASE TRIGGER" di Supabase Dashboard Anda yang salah hitung.\n\n` +
                    `- Profit: Rp ${order.profit.toLocaleString("id-ID")}\n` +
                    `- Target Jatah Afiliator (Seharusnya): Rp ${commissionToPay.toLocaleString("id-ID")}\n\n` +
                    `Klik OK untuk memulai tes.`
                );

                if (confirmed) {
                    /* 
                       KODE SAYA DIKOMENTARI UNTUK PENGETESAN:
                       const { data: prof, error: fetchErr } = await supabase.from("profiles").select("balance").eq("id", order.affiliator_id).single();
                       if (prof && !fetchErr) {
                           await supabase.from("profiles").update({ balance: (prof.balance || 0) + commissionToPay }).eq("id", order.affiliator_id);
                       }
                    */
                    console.log("🧪 Diagnostic: My code is bypassed. If balance still changes, a DB trigger exists.");
                } else {
                    // Revert status if cancelled
                    await supabase.from("orders").update({ status: order.status }).eq("id", id);
                    setUpdatingId(null);
                    return;
                }
            } else if (newStatus !== "Pesanan Selesai" && order?.status === "Pesanan Selesai" && order?.affiliator_id) {
                // Refund / Rollback commission if status is changed back
                const { data: st } = await supabase.from("store_settings").select("affiliate_commission_percent").eq("id", 1).single();
                const currentPercent = st?.affiliate_commission_percent ?? 25;
                const commissionToRefund = Math.floor(order.profit * (currentPercent / 100));
                
                const { data: prof, error: fetchErr } = await supabase.from("profiles").select("balance").eq("id", order.affiliator_id).single();
                if (prof && !fetchErr) {
                    await supabase.from("profiles").update({ balance: Math.max(0, (prof.balance || 0) - commissionToRefund) }).eq("id", order.affiliator_id);
                }
            }

            setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        } else {
            alert("Gagal mengupdate status: " + error.message);
        }
        setUpdatingId(null);
    };

    const handleDeleteOrder = async (id: string) => {
        if(!confirm("Yakin ingin menghapus pesanan ini?")) return;
        const { error } = await supabase.from("orders").delete().eq("id", id);
        if (!error) {
            setOrders(orders.filter(o => o.id !== id));
        } else {
            alert("Error deleting: " + error.message);
        }
    };

    const handleSaveOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const selectedProduct = products.find(p => p.id === orderForm.product_id);
        const selectedPackage = selectedProduct?.packages?.find((pkg: any) => pkg.id === orderForm.package_id);

        if (!selectedProduct || !selectedPackage) {
            alert("Harap pilih produk dan paket!");
            setIsSubmitting(false);
            return;
        }

        const rawPrice = parseInt(selectedPackage.price.replace(/\D/g, "")) || 0;
        const profitRaw = rawPrice - selectedPackage.cost_price;

        const payload: any = {
            customer_name: orderForm.customer_name,
            wa_number: orderForm.wa_number,
            package_id: selectedPackage.id,
            product_name: selectedProduct.title,
            package_name: selectedPackage.name,
            sell_price: orderForm.sell_price,
            cost_price: orderForm.cost_price,
            profit: orderForm.sell_price - orderForm.cost_price,
            status: orderForm.status,
            affiliator_id: orderForm.affiliator_id || null,
            commission: orderForm.commission || 0,
            created_at: new Date(orderForm.created_at).toISOString()
        };

        if (editingOrder) {
            payload.user_id = editingOrder.user_id;
            payload.email = editingOrder.email;
        }

        if (editingOrder) {
            const { error } = await supabase.from("orders").update(payload).eq("id", editingOrder.id);
            if (!error) {
                setOrders(orders.map(o => o.id === editingOrder.id ? { ...o, ...payload } : o));
                setIsModalOpen(false);
            } else {
                alert("Error: " + error.message);
            }
        } else {
            const { data, error } = await supabase.from("orders").insert([payload]).select();
            if (!error && data) {
                setOrders([data[0], ...orders]);
                setIsModalOpen(false);
            } else {
                alert("Error: " + error?.message);
            }
        }

        setIsSubmitting(false);
    };

    const openModal = (order?: Order) => {
        if (order) {
            setEditingOrder(order);
            // find product_id from products array via package_id or name
            let prodId = "";
            let pkgId = "";
            for (const prod of products) {
                const pkg = prod.packages?.find((p: any) => p.name === order.package_name);
                if (pkg) {
                    prodId = prod.id;
                    pkgId = pkg.id;
                    break;
                }
            }
            setOrderForm({
                customer_name: order.customer_name,
                wa_number: order.wa_number,
                product_id: prodId,
                package_id: pkgId,
                status: order.status,
                created_at: new Date(order.created_at).toISOString().slice(0, 16),
                affiliator_id: order.affiliator_id || "",
                commission: order.commission || 0,
                sell_price: order.sell_price,
                cost_price: order.cost_price
            });
        } else {
            setEditingOrder(null);
            setOrderForm({ 
                customer_name: "", 
                wa_number: "", 
                product_id: "", 
                package_id: "", 
                status: "Pesanan Selesai",
                created_at: new Date().toISOString().slice(0, 16),
                affiliator_id: "",
                commission: 0,
                sell_price: 0,
                cost_price: 0
            });
        }
        setIsModalOpen(true);
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
                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchOrdersAndProducts}
                        className="flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-200 text-slate-600 hover:text-blue-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button 
                        onClick={() => openModal()}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-blue-500 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Manual
                    </button>
                </div>
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
                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Afiliasi</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Aksi</th>
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
                                            <div className="flex flex-col text-[10px]">
                                                <span className="text-sm font-bold text-slate-900">{order.customer_name}</span>
                                                <span className="font-medium text-slate-500 mt-0.5 whitespace-nowrap leading-tight">{order.wa_number}</span>
                                                {order.email && <span className="text-blue-500 font-bold truncate lowercase max-w-[150px]">{order.email}</span>}
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
                                                <div className="flex flex-col items-end gap-1 mt-1">
                                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 rounded" title="Total Profit: Jual - Modal">Profit: Rp {order.profit.toLocaleString("id-ID")}</span>
                                                    <span className="text-xs font-black text-green-500 bg-green-50 px-1.5 rounded" title="Diterima Owner: Profit - Jatah Afiliator">Net Owner: Rp {(order.profit - (Math.floor(order.profit * (globalCommissionPercent / 100)))).toLocaleString("id-ID")}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.affiliator_id ? (
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider">Jatah Afiliator</span>
                                                    <span className="text-sm font-black text-slate-900 leading-tight">Rp {(Math.floor(order.profit * (globalCommissionPercent / 100))).toLocaleString("id-ID")}</span>
                                                    <span className="text-[9px] text-slate-400 font-bold bg-slate-100 px-1 py-0.5 rounded mt-1 inline-block w-fit">MODAL: {globalCommissionPercent}%</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-300 font-bold italic">Tanpa Ref</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <StatusDropdown order={order} />
                                                {updatingId === order.id && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 text-slate-400">
                                                <button onClick={() => openModal(order)} className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => handleDeleteOrder(order.id)} className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-900">{editingOrder ? "Edit Pesanan" : "Tambah Pesanan Manual"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveOrder} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Pemesan</label>
                                <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Arief" 
                                    value={orderForm.customer_name} onChange={e => setOrderForm({...orderForm, customer_name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">No WA</label>
                                <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 085720..." 
                                    value={orderForm.wa_number} onChange={e => setOrderForm({...orderForm, wa_number: e.target.value})} />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pilih Produk</label>
                                <select required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={orderForm.product_id} onChange={e => setOrderForm({...orderForm, product_id: e.target.value, package_id: ""})}
                                >
                                    <option value="">-- Pilih Produk --</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                </select>
                            </div>

                            {orderForm.product_id && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pilih Paket</label>
                                    <select required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={orderForm.package_id} 
                                        onChange={e => {
                                            const pkgId = e.target.value;
                                            const pkg = products.find(p => p.id === orderForm.product_id)?.packages?.find((p: any) => p.id === pkgId);
                                            setOrderForm({
                                                ...orderForm, 
                                                package_id: pkgId,
                                                sell_price: pkg ? (parseInt(pkg.price.replace(/\D/g, "")) || 0) : 0,
                                                cost_price: pkg ? (pkg.cost_price || 0) : 0
                                            });
                                        }}
                                    >
                                        <option value="">-- Pilih Paket --</option>
                                        {products.find(p => p.id === orderForm.product_id)?.packages?.map((pkg: any) => (
                                            <option key={pkg.id} value={pkg.id}>{pkg.name} - {pkg.price}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {orderForm.package_id && (
                                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Harga Jual (Rp)</label>
                                        <input required type="number" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-900" 
                                            value={orderForm.sell_price} onChange={e => setOrderForm({...orderForm, sell_price: parseInt(e.target.value) || 0})} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Harga Modal (Rp)</label>
                                        <input required type="number" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-900" 
                                            value={orderForm.cost_price} onChange={e => setOrderForm({...orderForm, cost_price: parseInt(e.target.value) || 0})} />
                                    </div>
                                </div>
                            )}
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tanggal & Waktu Pesanan</label>
                                <input required type="datetime-local" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    value={orderForm.created_at} onChange={e => setOrderForm({...orderForm, created_at: e.target.value})} />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                                <select required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={orderForm.status} onChange={e => setOrderForm({...orderForm, status: e.target.value})}
                                >
                                    <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                                    <option value="Sedang Diproses">Sedang Diproses</option>
                                    <option value="Pesanan Selesai">Pesanan Selesai</option>
                                    <option value="Dibatalkan">Dibatalkan</option>
                                </select>
                            </div>

                            <hr className="border-slate-100 my-4" />

                            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 space-y-4">
                                <h3 className="text-xs font-black text-purple-600 uppercase tracking-widest flex items-center gap-2">
                                    <Megaphone className="w-4 h-4" /> Informasi Afiliasi
                                </h3>
                                <div>
                                    <label className="block text-[10px] font-black text-purple-400 uppercase tracking-wider mb-2">ID Afiliator (UUID)</label>
                                    <input type="text" className="w-full bg-white border border-purple-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Paste UUID from Users page" 
                                        value={orderForm.affiliator_id} onChange={e => setOrderForm({...orderForm, affiliator_id: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-purple-400 uppercase tracking-wider mb-2">Jumlah Komisi (Rp)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-purple-400">Rp</span>
                                        <input type="number" className="w-full bg-white border border-purple-200 rounded-xl px-4 py-2 pl-8 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500" 
                                            value={orderForm.commission} onChange={e => setOrderForm({...orderForm, commission: parseInt(e.target.value) || 0})} />
                                    </div>
                                    
                                    {/* Breakdown display */}
                                    <div className="mt-3 space-y-1 pt-3 border-t border-purple-100">
                                        <div className="flex justify-between text-[10px] font-bold">
                                            <span className="text-slate-400 uppercase">Jatah Afiliator:</span>
                                            <span className="text-purple-600">Rp {orderForm.commission.toLocaleString('id-ID')} ({globalCommissionPercent}%)</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-bold">
                                            <span className="text-slate-400 uppercase">Laba Bersih Anda:</span>
                                            <span className="text-emerald-600">Rp {( (orderForm.sell_price - orderForm.cost_price) - orderForm.commission ).toLocaleString('id-ID')} ({100 - globalCommissionPercent}%)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-blue-900/20">
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin"/> : <><Save className="w-5 h-5"/> {editingOrder ? "Simpan Perubahan" : "Simpan Pesanan"}</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
