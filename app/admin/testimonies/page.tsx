"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Plus, Trash2, Image as ImageIcon, Star, Sparkles, Upload } from "lucide-react";

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

    // Helper for file upload (simulated or direct to storage if bucket exists)
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSaving(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `testimonies/${fileName}`;

        // Attempt upload to 'testimonies' bucket
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
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/40">
                <div>
                    <h1 className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Star className="w-6 h-6 text-amber-500" />
                        Kelola Testimoni
                    </h1>
                    <p className="text-slate-500 font-medium mt-1 text-xs">Unggah bukti kepuasan pelanggan.</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white/60 backdrop-blur-md border border-white/60 text-slate-700 rounded-2xl font-bold shadow-sm hover:bg-white/80 transition-all"
                >
                    {showForm ? "Batal" : <><Plus className="w-5 h-5" /> Tambah Testimoni</>}
                </button>
            </div>

            {showForm && (
                <div className="bg-white/60 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/60 shadow-sm animate-in zoom-in-95 duration-300">
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Unggah Foto / Paste URL</label>
                                <div className="flex flex-col gap-4">
                                    <input 
                                        type="text" 
                                        placeholder="https://..." 
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        className="w-full px-5 py-4 bg-white/50 border border-white/60 rounded-xl text-xs font-bold text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 backdrop-blur-md"
                                    />
                                    <div className="relative">
                                        <input 
                                            type="file" 
                                            id="file-upload"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                        <label htmlFor="file-upload" className="flex items-center justify-center gap-2 w-full py-4 bg-white/50 border-2 border-dashed border-white/60 rounded-xl text-slate-500 shadow-sm font-bold text-xs cursor-pointer hover:bg-white/70 transition-all backdrop-blur-md">
                                            <Upload className="w-4 h-4" /> Klik untuk Upload Image
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Keterangan (Optional)</label>
                                <textarea 
                                    placeholder="Contoh: 'Testimoni Netflix Murah'" 
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    className="w-full h-20 px-5 py-4 bg-white/50 border border-white/60 rounded-xl text-xs font-bold text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 resize-none backdrop-blur-md"
                                />
                                
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Pilih Produk (Slug)</label>
                                <select 
                                    value={productSlug}
                                    onChange={(e) => setProductSlug(e.target.value)}
                                    className="w-full px-5 py-4 bg-white/50 border border-white/60 rounded-xl text-xs font-bold text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 backdrop-blur-md"
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

                        {imageUrl && (
                            <div className="p-4 bg-white/50 border border-white/60 shadow-sm rounded-2xl backdrop-blur-md">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Preview Gambar</p>
                                <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-white shadow-sm">
                                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-900/20 border border-blue-500 hover:bg-blue-500 transition-all disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Simpan Testimoni"}
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="py-20 flex justify-center">
                    <div className="flex items-center justify-center p-12 bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-sm">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {testimonies.map((item) => (
                        <div key={item.id} className="group bg-white/60 backdrop-blur-3xl rounded-[2rem] border border-white/60 shadow-sm overflow-hidden hover:bg-white/80 transition-all relative">
                            <div className="aspect-square bg-white/50 relative overflow-hidden">
                                <img src={item.image_url} alt="Testimony" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/40 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button 
                                        onClick={() => handleDelete(item.id)}
                                        className="p-4 bg-white text-red-600 rounded-full shadow-xl hover:bg-red-50 active:scale-95 transition-all"
                                    >
                                        <Trash2 className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 border-t border-white/60 bg-transparent flex justify-between items-center">
                                <p className="text-xs font-bold text-slate-600 line-clamp-1 italic">
                                    {item.caption || "No caption"}
                                </p>
                                {item.product_slug && (
                                    <span className="text-[9px] font-black bg-white/50 border border-white/60 shadow-sm text-blue-600 px-2 py-0.5 rounded-md uppercase">
                                        {item.product_slug}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                    {testimonies.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white/40 backdrop-blur-md rounded-[2rem] border border-white/60 shadow-sm">
                             <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Belum ada data testimoni</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
