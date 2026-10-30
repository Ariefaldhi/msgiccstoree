"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Loader2, Edit, X, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface Product {
    id: string;
    title: string;
    image_url?: string;
}

interface Banner {
    id: string;
    product_id: string;
    title: string;
    subtitle: string;
    discount_text: string;
    tag: string;
    is_active: boolean;
    products?: Product;
}

export default function AdminBanners() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

    const [form, setForm] = useState({
        product_id: "",
        title: "",
        subtitle: "",
        discount_text: "",
        tag: "",
        is_active: true
    });

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);

        // Fetch active products for dropdown
        const { data: prods } = await supabase.from("products").select("id, title, image_url").order("title");
        if (prods) setProducts(prods);

        // Fetch banners joined with products
        const { data: bans, error } = await supabase
            .from("hero_banners")
            .select("*, products(id, title, image_url)")
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error);
        } else if (bans) {
            setBanners(bans as any);
        }
        
        setLoading(false);
    };

    const openModal = (banner?: Banner) => {
        if (banner) {
            setEditingBanner(banner);
            setForm({
                product_id: banner.product_id,
                title: banner.title,
                subtitle: banner.subtitle,
                discount_text: banner.discount_text,
                tag: banner.tag,
                is_active: banner.is_active
            });
        } else {
            setEditingBanner(null);
            setForm({ product_id: "", title: "", subtitle: "", discount_text: "", tag: "PROMO HARI INI", is_active: true });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = { ...form };

        if (editingBanner) {
            const { error } = await supabase.from("hero_banners").update(payload).eq("id", editingBanner.id);
            if (!error) {
                fetchData();
                setIsModalOpen(false);
            } else {
                alert("Error: " + error.message);
            }
        } else {
            const { error } = await supabase.from("hero_banners").insert([payload]);
            if (!error) {
                fetchData();
                setIsModalOpen(false);
            } else {
                alert("Error: " + error.message);
            }
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus banner ini?")) return;
        const { error } = await supabase.from("hero_banners").delete().eq("id", id);
        if (!error) {
            setBanners(banners.filter(b => b.id !== id));
        }
    };

    const toggleActive = async (banner: Banner) => {
        const newVal = !banner.is_active;
        const { error } = await supabase.from("hero_banners").update({ is_active: newVal }).eq("id", banner.id);
        if (!error) {
            setBanners(banners.map(b => b.id === banner.id ? { ...b, is_active: newVal } : b));
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-200 gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                        <Sparkles className="w-6 h-6 text-blue-600" />
                        App Store Today Banners
                    </h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-0.5">Kelola banner promo featured di halaman beranda.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-xs font-semibold transition-colors shadow-xs"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Banner
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 bg-white border border-slate-200/90 rounded-2xl">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Memuat Banner...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {banners.map((banner) => (
                        <div 
                            key={banner.id} 
                            className={`bg-white rounded-2xl border ${banner.is_active ? 'border-slate-200/90 shadow-xs' : 'border-slate-200 opacity-60'} overflow-hidden flex flex-col hover:border-slate-300 transition-colors`}
                        >
                            {/* Preview Area */}
                            <div className="h-40 relative bg-slate-900 overflow-hidden group">
                                {banner.products?.image_url && (
                                    <div 
                                        className="absolute inset-0 bg-cover bg-center opacity-40 blur-sm scale-105 group-hover:scale-100 transition-transform duration-500" 
                                        style={{ backgroundImage: `url(${banner.products.image_url})` }}
                                    />
                                )}
                                <div className="absolute inset-0 p-4 flex flex-col justify-between z-10 text-white">
                                    <span className="text-[10px] font-semibold tracking-wider bg-white/20 px-2 py-0.5 rounded w-fit border border-white/20">
                                        {banner.tag}
                                    </span>
                                    <div>
                                        <h3 className="font-bold text-sm leading-tight text-white">{banner.title}</h3>
                                        <p className="text-xs text-white/80 mt-0.5">{banner.subtitle}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Controls */}
                            <div className="p-4 flex flex-col justify-between flex-1">
                                <div className="mb-4">
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Terkait Produk:</p>
                                    <p className="text-xs font-semibold text-slate-900 truncate mt-0.5">{banner.products?.title || 'Unknown Product'}</p>
                                    <p className="text-xs text-blue-600 font-semibold mt-1">Diskon: {banner.discount_text}</p>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={banner.is_active} onChange={() => toggleActive(banner)} />
                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                        <span className="ml-2 text-xs font-medium text-slate-600">{banner.is_active ? 'Aktif' : 'Nonaktif'}</span>
                                    </label>
                                    <div className="flex gap-1.5">
                                        <button 
                                            onClick={() => openModal(banner)} 
                                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(banner.id)} 
                                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Hapus"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {banners.length === 0 && (
                        <div className="col-span-full py-16 text-center text-slate-400 text-sm bg-white border border-dashed border-slate-200 rounded-2xl">
                            Belum ada banner. Tambahkan banner untuk membuat beranda lebih hidup!
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-xl max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <h2 className="text-base font-bold text-slate-900">{editingBanner ? 'Edit Banner' : 'Tambah Banner Baru'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Pilih Produk</label>
                                <select
                                    required
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                                    value={form.product_id}
                                    onChange={e => setForm({ ...form, product_id: e.target.value })}
                                >
                                    <option value="">Pilih Produk Asli...</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Judul Banner</label>
                                <input 
                                    required type="text" 
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" 
                                    placeholder="Contoh: Canva Pro 1 Tahun"
                                    value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} 
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Subtitle</label>
                                <input 
                                    required type="text" 
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" 
                                    placeholder="Contoh: Desain tanpa batas untuk semua"
                                    value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Diskon Text</label>
                                    <input 
                                        required type="text" 
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" 
                                        placeholder="Cuma Rp15.000"
                                        value={form.discount_text} onChange={e => setForm({ ...form, discount_text: e.target.value })} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Tag Kecil</label>
                                    <input 
                                        required type="text" 
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" 
                                        placeholder="TERLARIS"
                                        value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} 
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting} 
                                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Banner'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
