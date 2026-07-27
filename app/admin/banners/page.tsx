"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Loader2, Edit, X, Star } from "lucide-react";
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
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xs font-black text-slate-900 tracking-tight">App Store Today Banners</h1>
                    <p className="text-slate-500 mt-1 text-xs">Kelola korsel banner premium di beranda.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Tambah Banner
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center h-64"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:p-6">
                    {banners.map((banner) => (
                        <div key={banner.id} className={`bg-white/60 backdrop-blur-3xl rounded-[2rem] border ${banner.is_active ? 'border-white/60 shadow-sm' : 'border-white/40 opacity-70'} overflow-hidden flex flex-col transition-all hover:bg-white/80 hover:shadow-md`}>
                            {/* Preview Area (Mimic actual card but smaller) */}
                            <div className="h-40 relative bg-slate-900/80 overflow-hidden group">
                                {banner.products?.image_url && (
                                    <div 
                                        className="absolute inset-0 bg-cover bg-center opacity-40 blur-sm scale-110 group-hover:scale-100 transition-transform duration-700" 
                                        style={{ backgroundImage: `url(${banner.products.image_url})` }}
                                    />
                                )}
                                <div className="absolute inset-0 p-4 flex flex-col justify-between z-10 text-white">
                                    <span className="text-[8px] font-black tracking-widest bg-white/20 px-2 py-0.5 rounded-full w-fit backdrop-blur-md">
                                        {banner.tag}
                                    </span>
                                    <div>
                                        <h3 className="font-black text-sm leading-tight">{banner.title}</h3>
                                        <p className="text-xs text-white/80">{banner.subtitle}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Controls */}
                            <div className="p-4 flex flex-col justify-between flex-1">
                                <div className="mb-4">
                                    <p className="text-xs font-bold text-slate-500 uppercase">Terkait Produk:</p>
                                    <p className="text-xs font-black text-slate-900 truncate">{banner.products?.title || 'Unknown Product'}</p>
                                    <p className="text-xs text-blue-600 font-bold mt-1">Diskon Text: {banner.discount_text}</p>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={banner.is_active} onChange={() => toggleActive(banner)} />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        <span className="ml-2 text-xs font-bold text-slate-600">{banner.is_active ? 'Aktif' : 'Nonaktif'}</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <button onClick={() => openModal(banner)} className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(banner.id)} className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {banners.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-white/40 backdrop-blur-xl rounded-[2rem] border border-dashed border-white/60 text-slate-500 font-medium">
                            Belum ada banner. Tambahkan banner untuk membuat beranda lebih hidup!
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white/80 backdrop-blur-3xl rounded-[2rem] border border-white/60 p-5 md:p-6 md:p-8 max-w-md w-full shadow-2xl max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xs font-black text-slate-900">{editingBanner ? 'Edit Banner' : 'New Banner'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-white/50 rounded-full">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">Pilih Produk</label>
                                <select
                                    required
                                    className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3.5 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-xs"
                                    value={form.product_id}
                                    onChange={e => setForm({ ...form, product_id: e.target.value })}
                                >
                                    <option value="">Pilih Produk Asli...</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">Judul Banner</label>
                                <input 
                                    required type="text" 
                                    className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3.5 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-xs" 
                                    placeholder="Contoh: Canva Pro 1 Tahun"
                                    value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} 
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">Subtitle</label>
                                <input 
                                    required type="text" 
                                    className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3.5 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-xs" 
                                    placeholder="Contoh: Desain tanpa batas untuk semua"
                                    value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">Diskon Text</label>
                                    <input 
                                        required type="text" 
                                        className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3.5 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-xs" 
                                        placeholder="Cuma Rp15.000"
                                        value={form.discount_text} onChange={e => setForm({ ...form, discount_text: e.target.value })} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">Tag Kecil</label>
                                    <input 
                                        required type="text" 
                                        className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3.5 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-xs" 
                                        placeholder="TERLARIS"
                                        value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} 
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting} 
                                className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Simpan Banner'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
