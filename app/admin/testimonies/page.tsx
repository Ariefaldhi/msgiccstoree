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
    const [showForm, setShowForm] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        fetchTestimonies();
    }, []);

    async function fetchTestimonies() {
        setLoading(true);
        const { data } = await supabase.from("testimonies").select("*").order("created_at", { ascending: false });
        if (data) setTestimonies(data);
        setLoading(false);
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageUrl) return alert("URL Gambar wajib diisi!");

        setIsSaving(true);
        const { error } = await supabase.from("testimonies").insert([{ image_url: imageUrl, caption }]);
        
        if (error) {
            alert("Error: " + error.message);
        } else {
            setImageUrl("");
            setCaption("");
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Star className="w-8 h-8 text-amber-500" />
                        Kelola Testimoni
                    </h1>
                    <p className="text-slate-500 font-medium">Unggah bukti kepuasan pelanggan.</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-500 transition-all"
                >
                    {showForm ? "Batal" : <><Plus className="w-5 h-5" /> Tambah Testimoni</>}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-xl shadow-blue-50 animate-in zoom-in-95 duration-300">
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Unggah Foto / Paste URL</label>
                                <div className="flex flex-col gap-4">
                                    <input 
                                        type="text" 
                                        placeholder="https://..." 
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                                    />
                                    <div className="relative">
                                        <input 
                                            type="file" 
                                            id="file-upload"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                        <label htmlFor="file-upload" className="flex items-center justify-center gap-2 w-full py-4 bg-slate-100 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-bold text-sm cursor-pointer hover:bg-slate-200 transition-all">
                                            <Upload className="w-4 h-4" /> Klik untuk Upload Image
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Keterangan (Optional)</label>
                                <textarea 
                                    placeholder="Contoh: 'Testimoni Netflix Murah'" 
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    className="w-full h-32 px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 resize-none"
                                />
                            </div>
                        </div>

                        {imageUrl && (
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Preview Gambar</p>
                                <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-white shadow-md">
                                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-500 transition-all disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Simpan Testimoni"}
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {testimonies.map((item) => (
                        <div key={item.id} className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all relative">
                            <div className="aspect-square bg-slate-100 relative overflow-hidden">
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
                            <div className="p-4">
                                <p className="text-xs font-medium text-slate-500 line-clamp-2 italic">
                                    {item.caption || "No caption"}
                                </p>
                            </div>
                        </div>
                    ))}
                    {testimonies.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
                             <ImageIcon className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Belum ada data testimoni</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
