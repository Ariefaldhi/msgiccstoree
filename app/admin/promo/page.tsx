"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Loader2, X, Zap, Calendar } from "lucide-react";
import { toLocalISOString } from "@/lib/utils";

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
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Zap className="w-7 h-7 text-[#ff2d55]" /> Promo & Produk Spesial
                    </h1>
                    <p className="text-slate-500 mt-1">Kelola promo produk dan diskon terbatas.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#ff2d55] hover:bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-900/20 transition-all"
                >
                    <Plus className="w-5 h-5" /> Buat Promo Baru
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center h-40"><Loader2 className="w-8 h-8 text-red-500 animate-spin" /></div>
            ) : (
                <div className="space-y-3">
                    {flashSales.map(item => {
                        const rawPrice = parseInt(item.package.price.replace(/\D/g, ""), 10) || 0;
                        const discounted = Math.round(rawPrice * (1 - item.discount_percent / 100));
                        return (
                            <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
                                {/* Product Image */}
                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                                    {item.package.product.image_url
                                        ? <img src={item.package.product.image_url} className="w-full h-full object-cover" alt="" />
                                        : <span className="text-xl font-black text-slate-300">{item.package.product.title.charAt(0)}</span>
                                    }
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-slate-900 truncate">{item.package.product.title} - {item.package.name}</p>
                                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                                        <span className="text-xs bg-red-50 text-[#ff2d55] font-bold px-2 py-0.5 rounded-lg">-{item.discount_percent}%</span>
                                        <span className="text-xs text-slate-400 line-through">{item.package.price}</span>
                                        <span className="text-xs font-black text-[#ff2d55]">Rp {discounted.toLocaleString("id-ID")}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 font-bold">⏱ Sisa: {timeLeft(item.end_time)}</p>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => handleToggle(item)}
                                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${item.is_active ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}
                                    >
                                        {item.is_active ? "Aktif" : "Nonaktif"}
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {flashSales.length === 0 && (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                            Belum ada promo aktif. Buat sekarang!
                        </div>
                    )}
                </div>
            )}

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-900">Buat Promo Baru</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="label-admin">Paket</label>
                                <select required className="input-admin" value={form.package_id} onChange={e => setForm({ ...form, package_id: e.target.value })}>
                                    <option value="">Pilih Paket</option>
                                    {packages.map(p => <option key={p.id} value={p.id}>{p.product.title} - {p.name}</option>)}
                                </select>
                            </div>
                                <div>
                                    <label className="label-admin">Disk (%)</label>
                                    <input required type="number" min="1" max="100" className="input-admin" placeholder="30"
                                        value={form.discount_percent} onChange={e => setForm({ ...form, discount_percent: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label-admin">Label</label>
                                    <input type="text" className="input-admin" placeholder="FLASH SALE"
                                        value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} />
                                </div>

                            <div>
                                <label className="label-admin">Waktu Mulai</label>
                                <input required type="datetime-local" className="input-admin"
                                    value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
                            </div>
                            <div>
                                <label className="label-admin">Waktu Selesai</label>
                                <input required type="datetime-local" className="input-admin"
                                    value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
                            </div>

                            <div>
                                <label className="label-admin">Maks Transaksi (0 = Tanpa Batas)</label>
                                <input type="number" min="0" className="input-admin"
                                    value={form.max_orders} onChange={e => setForm({ ...form, max_orders: e.target.value })} />
                            </div>
                            <button type="submit" disabled={isSubmitting} className="w-full bg-[#ff2d55] hover:bg-red-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2">
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Zap className="w-4 h-4" /> Aktifkan Promo</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .label-admin { @apply block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2; }
                .input-admin { @apply w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all; }
            `}</style>
        </div>
    );
}
