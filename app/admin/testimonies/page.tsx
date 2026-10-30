"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Plus, Trash2, Image as ImageIcon, Star, Upload } from "lucide-react";

export default function AdminTestimonies() {
    const [testimonies, setTestimonies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form State
    const [imageUrl, setImageUrl] = useState("");
    const [caption, setCaption] = useState("");
    const [productSlug, setProductSlug] = useState("");
    const [products, setProducts] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        fetchTestimonies();
    }, []);

    async function fetchTestimonies() {
        setLoading(true);
        const { data } = await supabase.from("testimonies").select("*").order("created_at", { ascending: false });
        if (data) setTestimonies(data);
        
        // Fetch products for slug dropdown
        const { data: prods } = await supabase.from("products").select("title");
        if (prods) setProducts(prods);
        
        setLoading(false);
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageUrl) return alert("URL Gambar wajib diisi!");

        setIsSaving(true);
        const { error } = await supabase.from("testimonies").insert([{ 
            image_url: imageUrl, 
            caption,
            product_slug: productSlug 
        }]);
        
        if (error) {
            alert("Error: " + error.message);
        } else {
            setImageUrl("");
            setCaption("");
            setProductSlug("");
            setShowForm(false);
            fetchTestimonies();
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus testimoni ini?")) return;
        const { error } = await supabase.from("testimonies").delete().eq("id", id);
        if (error) alert(error.message);
        else fetchTestimonies();
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSaving(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `testimonies/${fileName}`;

        const { data, error } = await supabase.storage.from('testimonies').upload(filePath, file);

        if (error) {
            alert("Upload Gagal (Pastikan bucket 'testimonies' sudah dibuat di Supabase): " + error.message);
        } else {
            const { data: { publicUrl } } = supabase.storage.from('testimonies').getPublicUrl(filePath);
            setImageUrl(publicUrl);
        }
        setIsSaving(false);
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-200">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                        <Star className="w-6 h-6 text-amber-500" />
                        Kelola Testimoni
                    </h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-0.5">Unggah bukti kepuasan pelanggan dan screenshot chat.</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-xs font-semibold transition-colors shadow-xs"
                >
                    {showForm ? "Batal" : <><Plus className="w-4 h-4" /> Tambah Testimoni</>}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/90 shadow-xs">
                    <form onSubmit={handleSave} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-3">
                                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Unggah Foto / URL Gambar</label>
                                <input 
                                    type="text" 
                                    placeholder="https://..." 
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                                />
                                <div>
                                    <input 
                                        type="file" 
                                        id="file-upload"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                    <label htmlFor="file-upload" className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg text-slate-600 font-medium text-xs cursor-pointer hover:bg-slate-100 transition-colors">
                                        <Upload className="w-4 h-4" /> Klik untuk Upload Foto
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Keterangan (Opsional)</label>
                                    <textarea 
                                        placeholder="Contoh: Testimoni Netflix Cepat & Aman" 
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                        className="w-full h-20 bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors resize-none"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Pilih Produk (Opsional)</label>
                                    <select 
                                        value={productSlug}
                                        onChange={(e) => setProductSlug(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors cursor-pointer"
                                    >
                                        <option value="">Umum (Tanpa Produk)</option>
                                        {products.map(p => (
                                            <option key={p.title} value={p.title.toLowerCase().replace(/\s+/g, '-')}>
                                                {p.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {imageUrl && (
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl w-fit">
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Preview</p>
                                <div className="w-28 h-28 rounded-lg overflow-hidden border border-slate-200">
                                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Testimoni"}
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 bg-white border border-slate-200/90 rounded-2xl">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Memuat Testimoni...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {testimonies.map((item) => (
                        <div key={item.id} className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden hover:border-slate-300 transition-colors relative flex flex-col">
                            <div className="aspect-square bg-slate-100 relative overflow-hidden">
                                <img src={item.image_url} alt="Testimony" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button 
                                        onClick={() => handleDelete(item.id)}
                                        className="p-3 bg-white text-rose-600 rounded-full shadow-lg hover:bg-rose-50 transition-colors"
                                        title="Hapus Testimoni"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-3.5 border-t border-slate-100 flex justify-between items-center text-xs mt-auto">
                                <p className="font-medium text-slate-600 line-clamp-1 italic">
                                    {item.caption || "Tanpa keterangan"}
                                </p>
                                {item.product_slug && (
                                    <span className="shrink-0 text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded uppercase">
                                        {item.product_slug}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                    {testimonies.length === 0 && (
                        <div className="col-span-full py-16 text-center text-slate-400 text-sm bg-white border border-dashed border-slate-200 rounded-2xl">
                             <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                             <p>Belum ada data testimoni.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
