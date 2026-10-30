"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Loader2, X, Zap } from "lucide-react";
import { toLocalISOString } from "@/lib/utils";
import { useAdminCurrency } from "@/components/admin/AdminCurrencyProvider";

interface Package {
    id: string;
    name: string;
    price: string;
    product: {
        title: string;
        image_url?: string;
    };
}

interface PromoRow {
    id: string;
    discount_percent: number;
    label: string;
    end_time: string;
    is_active: boolean;
    max_orders: number;
    package: Package;
}

export default function AdminPromo() {
    const { formatCurrency } = useAdminCurrency();
    const [packages, setPackages] = useState<Package[]>([]);
    const [flashSales, setFlashSales] = useState<PromoRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        package_id: "",
        discount_percent: "20",
        label: "PROMO",
        start_time: toLocalISOString(new Date()),
        end_time: toLocalISOString(new Date(Date.now() + 24 * 3600000)),
        max_orders: "0",
    });

    const supabase = createClient();

    useEffect(() => { fetchData(); }, []);

    async function fetchData() {
        setLoading(true);
        const { data: pkgs } = await supabase.from("packages").select("id, name, price, product:products(title, image_url)");
        if (pkgs) setPackages(pkgs as any);

        const { data: sales } = await supabase
            .from("flash_sales")
            .select("*, package:packages(name, price, product:products(title, image_url))")
            .order("created_at", { ascending: false });
        if (sales) setFlashSales(sales as any);
        setLoading(false);
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const startTime = new Date(form.start_time).toISOString();
        const endTime = new Date(form.end_time).toISOString();

        const { error } = await supabase.from("flash_sales").insert([{
            package_id: form.package_id,
            discount_percent: parseInt(form.discount_percent),
            label: form.label,
            start_time: startTime,
            end_time: endTime,
            is_active: true,
            max_orders: parseInt(form.max_orders) || 0,
        }]);

        if (!error) {
            setIsModalOpen(false);
            setForm({ 
                package_id: "", 
                discount_percent: "20", 
                label: "PROMO", 
                start_time: toLocalISOString(new Date()),
                end_time: toLocalISOString(new Date(Date.now() + 24 * 3600000)),
                max_orders: "0" 
            });
            fetchData();
        } else {
            alert("Error: " + error.message);
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus promo ini?")) return;
        await supabase.from("flash_sales").delete().eq("id", id);
        setFlashSales(prev => prev.filter(f => f.id !== id));
    };

    const handleToggle = async (item: PromoRow) => {
        const { error } = await supabase
            .from("flash_sales")
            .update({ is_active: !item.is_active })
            .eq("id", item.id);
        if (!error) {
            setFlashSales(prev => prev.map(f => f.id === item.id ? { ...f, is_active: !f.is_active } : f));
        }
    };

    const timeLeft = (endTime: string) => {
        const diff = new Date(endTime).getTime() - Date.now();
        if (diff <= 0) return "Berakhir";
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        return `${h}j ${m}m`;
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-200 gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                        <Zap className="w-6 h-6 text-rose-500" />
                        Promo & Produk Spesial
                    </h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-0.5">Kelola diskon flash sale dan penawaran terbatas.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-xs font-semibold transition-colors shadow-xs"
                >
                    <Plus className="w-4 h-4" />
                    Buat Promo Baru
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 bg-white border border-slate-200/90 rounded-2xl">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Memuat Data Promo...</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {flashSales.map(item => {
                        const rawPrice = parseInt(item.package.price.replace(/\D/g, ""), 10) || 0;
                        const discounted = Math.round(rawPrice * (1 - item.discount_percent / 100));
                        return (
                            <div key={item.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex items-center gap-4 hover:border-slate-300 transition-colors">
                                {/* Product Image */}
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 flex items-center justify-center">
                                    {item.package.product.image_url
                                        ? <img src={item.package.product.image_url} className="w-full h-full object-cover" alt="" />
                                        : <span className="text-sm font-bold text-slate-400">{item.package.product.title.charAt(0)}</span>
                                    }
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-900 truncate text-xs">{item.package.product.title} - {item.package.name}</p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-1.5 py-0.5 rounded border border-rose-100">-{item.discount_percent}%</span>
                                        <span className="text-[11px] text-slate-400 line-through">{formatCurrency(item.package.price)}</span>
                                        <span className="text-xs font-bold text-rose-600">{formatCurrency(discounted)}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-1 font-medium">⏱ Sisa waktu: {timeLeft(item.end_time)}</p>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => handleToggle(item)}
                                        className={`text-xs font-semibold px-2.5 py-1 rounded-md border transition-colors ${item.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"}`}
                                    >
                                        {item.is_active ? "Aktif" : "Nonaktif"}
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.id)} 
                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                        title="Hapus"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {flashSales.length === 0 && (
                        <div className="py-16 text-center text-slate-400 text-sm bg-white border border-dashed border-slate-200 rounded-2xl">
                            Belum ada promo aktif. Klik &apos;Buat Promo Baru&apos; untuk memulai.
                        </div>
                    )}
                </div>
            )}

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full shadow-xl max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <h2 className="text-base font-bold text-slate-900">Buat Promo Baru</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Paket Layanan</label>
                                <select 
                                    required 
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors cursor-pointer" 
                                    value={form.package_id} 
                                    onChange={e => setForm({ ...form, package_id: e.target.value })}
                                >
                                    <option value="">Pilih Paket...</option>
                                    {packages.map(p => <option key={p.id} value={p.id}>{p.product.title} - {p.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Diskon (%)</label>
                                    <input 
                                        required 
                                        type="number" 
                                        min="1" 
                                        max="100" 
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" 
                                        placeholder="30"
                                        value={form.discount_percent} 
                                        onChange={e => setForm({ ...form, discount_percent: e.target.value })} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Label Tag</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" 
                                        placeholder="FLASH SALE"
                                        value={form.label} 
                                        onChange={e => setForm({ ...form, label: e.target.value })} 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Waktu Mulai</label>
                                <input 
                                    required 
                                    type="datetime-local" 
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                                    value={form.start_time} 
                                    onChange={e => setForm({ ...form, start_time: e.target.value })} 
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Waktu Selesai</label>
                                <input 
                                    required 
                                    type="datetime-local" 
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                                    value={form.end_time} 
                                    onChange={e => setForm({ ...form, end_time: e.target.value })} 
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Maks Transaksi (0 = Tanpa Batas)</label>
                                <input 
                                    type="number" 
                                    min="0" 
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                                    value={form.max_orders} 
                                    onChange={e => setForm({ ...form, max_orders: e.target.value })} 
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isSubmitting} 
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Zap className="w-4 h-4" /> Aktifkan Promo</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
