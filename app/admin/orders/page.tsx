"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ShoppingBag, Search, Plus, Loader2, Megaphone, X, Save, Edit, Trash2, RefreshCw } from "lucide-react";
import { useAdminCurrency } from "@/components/admin/AdminCurrencyProvider";
import { toLocalISOString } from "@/lib/utils";

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

const formatToIDR = (val: string | number) => {
    const num = typeof val === 'string' ? val.replace(/\D/g, '') : val.toString();
    if (!num) return "";
    return Number(num).toLocaleString('id-ID');
};

export default function AdminOrders() {
    const { isUSD, formatCurrency } = useAdminCurrency();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const [products, setProducts] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [affiliators, setAffiliators] = useState<any[]>([]);
    const [affSearch, setAffSearch] = useState("");
    const [showAffSuggestions, setShowAffSuggestions] = useState(false);
    const [orderForm, setOrderForm] = useState<any>({
        customer_name: "", wa_number: "", product_id: "", package_id: "", status: "Pesanan Selesai", created_at: "",
        affiliator_id: "", commission: "0", sell_price: "0", cost_price: "0"
    });
    const [globalCommissionPercent, setGlobalCommissionPercent] = useState(25);

    // Payout Confirmation Modal
    const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
    const [payoutData, setPayoutData] = useState<any>(null);

    const supabase = createClient();

    const fetchOrdersAndProducts = async () => {
        setLoading(true);
        const [ordersRes, productsRes, settingsRes, affRes] = await Promise.all([
            supabase.from("orders").select("*").order("created_at", { ascending: false }),
            supabase.from("products").select("*, packages(*)"),
            supabase.from("store_settings").select("affiliate_commission_percent").eq("id", 1).single(),
            supabase.from("profiles").select("id, full_name, affiliate_code").eq("is_affiliator", true)
        ]);
 
        if (ordersRes.data) setOrders(ordersRes.data);
        if (productsRes.data) setProducts(productsRes.data);
        if (settingsRes.data) setGlobalCommissionPercent(settingsRes.data.affiliate_commission_percent ?? 25);
        if (affRes.data) setAffiliators(affRes.data);
        setLoading(false);
    };

    useEffect(() => {
        fetchOrdersAndProducts();
    }, []);

    // Auto-calculate commission in modal
    useEffect(() => {
        if (isModalOpen && orderForm.affiliator_id) {
            const sellPrice = parseInt(orderForm.sell_price.toString().replace(/\D/g, '')) || 0;
            const costPrice = parseInt(orderForm.cost_price.toString().replace(/\D/g, '')) || 0;
            const profit = sellPrice - costPrice;
            if (profit > 0) {
                const autoCommission = Math.floor(profit * (globalCommissionPercent / 100));
                setOrderForm((prev: any) => ({ ...prev, commission: autoCommission }));
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
                const { data: st } = await supabase.from("store_settings").select("affiliate_commission_percent").eq("id", 1).single();
                const currentPercent = st?.affiliate_commission_percent ?? 25;
                const commissionToPay = Math.floor(order.profit * (currentPercent / 100));
                
                setPayoutData({
                    id,
                    newStatus,
                    oldStatus: order.status,
                    profit: order.profit,
                    percent: currentPercent,
                    commission: commissionToPay,
                    ownerNet: order.profit - commissionToPay,
                    affiliatorId: order.affiliator_id,
                    affiliatorName: "Memuat..."
                });
                setIsPayoutModalOpen(true);

                supabase.from("profiles").select("full_name").eq("id", order.affiliator_id).single().then(({ data }) => {
                    if (data?.full_name) {
                        setPayoutData((prev: any) => ({ ...prev, affiliatorName: data.full_name }));
                    }
                });
                setUpdatingId(null);
                return;
            } else if (newStatus !== "Pesanan Selesai" && order?.status === "Pesanan Selesai" && order?.affiliator_id) {
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

        const payload: any = {
            customer_name: orderForm.customer_name,
            wa_number: orderForm.wa_number,
            package_id: selectedPackage.id,
            product_name: selectedProduct.title,
            package_name: selectedPackage.name,
            sell_price: parseInt(orderForm.sell_price.toString().replace(/\D/g, '')) || 0,
            cost_price: parseInt(orderForm.cost_price.toString().replace(/\D/g, '')) || 0,
            profit: (parseInt(orderForm.sell_price.toString().replace(/\D/g, '')) || 0) - (parseInt(orderForm.cost_price.toString().replace(/\D/g, '')) || 0),
            status: orderForm.status,
            affiliator_id: orderForm.affiliator_id || null,
            commission: parseInt(orderForm.commission.toString().replace(/\D/g, '')) || 0,
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
                created_at: toLocalISOString(new Date(order.created_at)),
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
                created_at: toLocalISOString(new Date()),
                affiliator_id: "",
                commission: 0,
                sell_price: 0,
                cost_price: 0
            });
        }
        setAffSearch("");
        setShowAffSuggestions(false);
        setIsModalOpen(true);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Menunggu Konfirmasi': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Sedang Diproses': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Pesanan Selesai': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Dibatalkan': return 'bg-rose-50 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const StatusDropdown = ({ order }: { order: Order }) => (
        <select 
            value={order.status}
            onChange={(e) => updateStatus(order.id, e.target.value)}
            disabled={updatingId === order.id}
            className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border appearance-none outline-none cursor-pointer transition-colors ${getStatusStyle(order.status)} ${updatingId === order.id ? 'opacity-50' : ''}`}
        >
            <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
            <option value="Sedang Diproses">Sedang Diproses</option>
            <option value="Pesanan Selesai">Pesanan Selesai</option>
            <option value="Dibatalkan">Dibatalkan</option>
        </select>
    );

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-200 gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                        <ShoppingBag className="w-6 h-6 text-blue-600" />
                        Kelola Pesanan
                    </h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-0.5">
                        Pantau dan update status pesanan yang masuk.
                    </p>
                </div>
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button 
                        onClick={fetchOrdersAndProducts}
                        className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg px-4 py-2 text-xs font-semibold transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button 
                        onClick={() => openModal()}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-xs font-semibold transition-colors shadow-xs"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Manual
                    </button>
                </div>
            </div>

            {loading && orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 bg-white border border-slate-200/90 rounded-2xl">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Memuat data pesanan...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="py-20 text-center bg-white border border-slate-200/90 rounded-2xl">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3 border border-slate-100">
                        <ShoppingBag className="w-6 h-6 text-slate-400" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Belum Ada Pesanan</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">Pesanan dari website akan otomatis muncul di sini setelah pembeli mengklik Konfirmasi.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                    <th className="px-4 py-3">Tanggal & ID</th>
                                    <th className="px-4 py-3">Pelanggan</th>
                                    <th className="px-4 py-3">Produk / Paket</th>
                                    <th className="px-4 py-3 text-right">Harga / Profit</th>
                                    <th className="px-4 py-3">Afiliasi</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-4 py-3.5">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900">{new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                                                <span className="text-[10px] uppercase text-slate-400 font-mono mt-0.5">{order.id.split('-')[0]}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900">{order.customer_name}</span>
                                                <span className="font-normal text-slate-500 mt-0.5 whitespace-nowrap">{order.wa_number}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex flex-col max-w-[200px]">
                                                <span className="font-semibold text-slate-900 truncate" title={order.product_name}>{order.product_name}</span>
                                                <span className="text-[11px] text-slate-500 truncate" title={order.package_name}>{order.package_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="font-bold text-blue-600">{formatCurrency(order.sell_price)}</span>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded" title="Total Profit: Jual - Modal">Profit: {formatCurrency(order.profit)}</span>
                                                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100" title="Diterima Owner: Profit - Jatah Afiliator">Net: {formatCurrency(order.profit - (Math.floor(order.profit * (globalCommissionPercent / 100))))}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {order.affiliator_id ? (
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-semibold text-purple-700 uppercase tracking-wider">Komisi Ref</span>
                                                    <span className="font-semibold text-slate-900 truncate max-w-[120px] mt-0.5" title={affiliators.find(a => a.id === order.affiliator_id)?.full_name || 'Afiliator'}>
                                                        {affiliators.find(a => a.id === order.affiliator_id)?.full_name || 'Afiliator'}
                                                    </span>
                                                    <span className="text-[11px] font-bold text-purple-600 mt-0.5">{formatCurrency(Math.floor(order.profit * (globalCommissionPercent / 100)))}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 font-medium">Tanpa Ref</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <StatusDropdown order={order} />
                                                {updatingId === order.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1 text-slate-400">
                                                <button onClick={() => openModal(order)} className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors" title="Edit">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteOrder(order.id)} className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors" title="Hapus">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Orders View */}
                    <div className="md:hidden space-y-3 p-4">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">ID: {order.id.split('-')[0]}</span>
                                        <h3 className="font-semibold text-slate-900 leading-tight">{order.customer_name}</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">{order.wa_number}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => openModal(order)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteOrder(order.id)} className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-lg p-3 space-y-2 border border-slate-100">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-semibold text-slate-700">{order.product_name}</span>
                                        <span className="text-slate-500">{order.package_name}</span>
                                    </div>
                                    <div className="h-px bg-slate-200" />
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Harga Jual</p>
                                            <p className="font-bold text-blue-600 text-xs">{formatCurrency(order.sell_price)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Profit</p>
                                            <p className="font-bold text-slate-900 text-xs">{formatCurrency(order.profit)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <div className="text-[11px] text-slate-400">
                                        {new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {updatingId === order.id && <Loader2 className="w-3 h-3 animate-spin text-blue-600" />}
                                        <StatusDropdown order={order} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Edit / Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
                            <h2 className="text-base font-bold text-slate-900">{editingOrder ? "Edit Pesanan" : "Tambah Pesanan Manual"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveOrder} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Nama Pemesan</label>
                                    <input required type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" value={orderForm.customer_name} onChange={e => setOrderForm({...orderForm, customer_name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">No WhatsApp</label>
                                    <input required type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" value={orderForm.wa_number} onChange={e => setOrderForm({...orderForm, wa_number: e.target.value})} />
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Layanan Produk</label>
                                    <select required className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors cursor-pointer" value={orderForm.product_id} onChange={e => setOrderForm({...orderForm, product_id: e.target.value, package_id: ""})}>
                                        <option value="">-- Pilih Produk --</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                    </select>
                                </div>

                                {orderForm.product_id && (
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Paket Item</label>
                                        <select required className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors cursor-pointer" value={orderForm.package_id} onChange={e => { const pkgId = e.target.value; const pkg = products.find(p => p.id === orderForm.product_id)?.packages?.find((p: any) => p.id === pkgId); setOrderForm({ ...orderForm, package_id: pkgId, sell_price: pkg ? (parseInt(pkg.price.replace(/\D/g, "")) || 0) : 0, cost_price: pkg ? (pkg.cost_price || 0) : 0 }); }}>
                                            <option value="">-- Pilih Paket --</option>
                                            {products.find(p => p.id === orderForm.product_id)?.packages?.map((pkg: any) => <option key={pkg.id} value={pkg.id}>{pkg.name} - {pkg.price}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {orderForm.package_id && (
                                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                                    <div>
                                        <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Harga Jual (Rp)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Rp</span>
                                            <input required type="text" className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600" value={formatToIDR(orderForm.sell_price)} onChange={e => setOrderForm({...orderForm, sell_price: formatToIDR(e.target.value)})} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Modal (Rp)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Rp</span>
                                            <input required type="text" className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600" value={formatToIDR(orderForm.cost_price)} onChange={e => setOrderForm({...orderForm, cost_price: formatToIDR(e.target.value)})} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Waktu Transaksi</label>
                                    <input required type="datetime-local" className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" value={orderForm.created_at} onChange={e => setOrderForm({...orderForm, created_at: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Status Pesanan</label>
                                    <select required className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors cursor-pointer" value={orderForm.status} onChange={e => setOrderForm({...orderForm, status: e.target.value})}>
                                        <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                                        <option value="Sedang Diproses">Sedang Diproses</option>
                                        <option value="Pesanan Selesai">Pesanan Selesai</option>
                                        <option value="Dibatalkan">Dibatalkan</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                                        <Megaphone className="w-4 h-4" /> Informasi Afiliator
                                    </h3>
                                    {orderForm.affiliator_id && (
                                        <button type="button" onClick={() => { setOrderForm({...orderForm, affiliator_id: ""}); setAffSearch(""); }} className="text-[11px] font-semibold text-rose-600 hover:underline">
                                            Hapus Ref
                                        </button>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-purple-600 uppercase tracking-wider mb-1">Cari Nama/Kode Referral</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                                        <input 
                                            type="text" 
                                            className="w-full bg-white border border-purple-200 rounded-lg pl-9 pr-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                                            placeholder="Ketik nama atau kode..." 
                                            value={affSearch} 
                                            onFocus={() => setShowAffSuggestions(true)} 
                                            onChange={e => { setAffSearch(e.target.value); setShowAffSuggestions(true); }} 
                                        />
                                    </div>
                                    {showAffSuggestions && affSearch && (
                                        <div className="mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100">
                                            {affiliators.filter(a => a.full_name?.toLowerCase().includes(affSearch.toLowerCase()) || a.affiliate_code?.toLowerCase().includes(affSearch.toLowerCase())).map(aff => (
                                                <button key={aff.id} type="button" onClick={() => { setOrderForm({ ...orderForm, affiliator_id: aff.id }); setAffSearch(aff.full_name); setShowAffSuggestions(false); }} className="w-full text-left px-3.5 py-2.5 hover:bg-purple-50 text-xs font-semibold text-slate-900">
                                                    {aff.full_name} <span className="font-mono text-[10px] text-purple-600 ml-1">({aff.affiliate_code})</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-purple-600 uppercase tracking-wider mb-1">Jumlah Komisi (Rp)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-purple-400">Rp</span>
                                        <input type="text" className="w-full bg-white border border-purple-200 rounded-lg pl-9 pr-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500" value={formatToIDR(orderForm.commission)} onChange={e => setOrderForm({...orderForm, commission: formatToIDR(e.target.value)})} />
                                    </div>
                                    <div className="mt-2.5 space-y-1 pt-2.5 border-t border-purple-100 text-xs">
                                        <div className="flex justify-between items-center font-medium">
                                            <span className="text-purple-600">Jatah Afiliator:</span>
                                            <span className="font-bold text-purple-700">{formatCurrency(parseInt(orderForm.commission.toString().replace(/\D/g, '') || '0'))} ({globalCommissionPercent}%)</span>
                                        </div>
                                        <div className="flex justify-between items-center font-medium">
                                            <span className="text-slate-500">Net Owner (Anda):</span>
                                            <span className="font-bold text-emerald-600">{formatCurrency( (parseInt(orderForm.sell_price.toString().replace(/\D/g, '')) || 0) - (parseInt(orderForm.cost_price.toString().replace(/\D/g, '')) || 0) - (parseInt(orderForm.commission.toString().replace(/\D/g, '')) || 0) )} ({100 - globalCommissionPercent}%)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : <><Save className="w-4 h-4"/> {editingOrder ? "Simpan Perubahan" : "Simpan Pesanan"}</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Payout Confirmation Modal */}
            {isPayoutModalOpen && payoutData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full shadow-xl">
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 border border-purple-100 text-purple-600">
                            <Megaphone className="w-6 h-6" />
                        </div>
                        <h2 className="text-base font-bold text-slate-900 mb-1">Konfirmasi Komisi</h2>
                        <p className="text-xs text-slate-500 mb-4">Pesanan selesai akan menambahkan saldo komisi ke afiliator terkait.</p>
                        <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100 mb-4 text-xs">
                            <div className="flex justify-between items-center font-medium">
                                <span className="text-slate-500">Total Profit</span>
                                <span className="font-bold text-slate-900">{formatCurrency(payoutData.profit)}</span>
                            </div>
                            <div className="flex justify-between items-center font-medium">
                                <span className="text-slate-500">Persentase</span>
                                <span className="font-bold text-slate-900">{payoutData.percent}%</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-5">
                            <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                                <span className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider block mb-0.5">Jatah Afiliator</span>
                                <span className="text-xs font-bold text-purple-700">{formatCurrency(payoutData.commission)}</span>
                            </div>
                            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                                <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider block mb-0.5">Bersih Owner</span>
                                <span className="text-xs font-bold text-emerald-700">{formatCurrency(payoutData.ownerNet)}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button onClick={async () => {
                                        setIsSubmitting(true);
                                        const { data: prof, error: fetchErr } = await supabase.from("profiles").select("balance").eq("id", payoutData.affiliatorId).single();
                                        if (prof && !fetchErr) {
                                            await supabase.from("profiles").update({ balance: (prof.balance || 0) + payoutData.commission }).eq("id", payoutData.affiliatorId);
                                        }
                                        setIsPayoutModalOpen(false);
                                        setIsSubmitting(false);
                                        setOrders(orders.map(o => o.id === payoutData.id ? { ...o, status: payoutData.newStatus } : o));
                                    }}
                                    disabled={isSubmitting}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Konfirmasi & Selesai"}
                            </button>
                            <button 
                                onClick={() => {
                                    setIsPayoutModalOpen(false);
                                    setOrders(orders.map(o => o.id === payoutData.id ? { ...o, status: payoutData.oldStatus } : o));
                                }}
                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg py-2 text-xs font-semibold transition-colors border border-slate-200"
                            >
                                Batalkan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
