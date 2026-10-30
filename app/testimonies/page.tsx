"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Star, Loader2, Image as ImageIcon, X } from "lucide-react";

export default function TestimoniesPage() {
    const [testimonies, setTestimonies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchTestimonies = async () => {
            const { data } = await supabase
                .from("testimonies")
                .select("*")
                .order("created_at", { ascending: false });
            if (data) setTestimonies(data);
            setLoading(false);
        };
        fetchTestimonies();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="size-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-20">
            <main className="container mx-auto px-4 max-w-6xl">
                
                <div className="text-center mb-10">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2 block">
                        Bukti Transaksi
                    </span>
                    <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                        Galeri Testimoni Pelanggan
                    </h1>
                    <p className="text-slate-500 text-xs md:text-sm max-w-lg mx-auto">
                        Bukti riil transaksi dan tangkapan layar kepuasan pelanggan yang berlangganan di MsgiccStore.
                    </p>
                </div>

                {testimonies.length > 0 ? (
                    <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
                        {testimonies.map((item) => (
                            <div 
                                key={item.id} 
                                onClick={() => setSelectedImage(item.image_url)}
                                className="break-inside-avoid bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all cursor-zoom-in group"
                            >
                                <div className="relative overflow-hidden aspect-auto bg-slate-50">
                                    <img 
                                        src={item.image_url} 
                                        alt="Testimony" 
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                                    />
                                </div>
                                {item.caption && (
                                    <div className="p-3 bg-white border-t border-slate-100">
                                        <p className="text-slate-600 text-xs font-normal line-clamp-2">"{item.caption}"</p>
                                        <div className="flex items-center gap-0.5 mt-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="size-2.5 fill-amber-400 text-amber-400" />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                        <div className="size-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                            <ImageIcon className="size-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-1">Belum Ada Testimoni</h3>
                        <p className="text-slate-400 text-xs">Testimoni transaksi terbaru akan segera ditampilkan di sini.</p>
                    </div>
                )}

                {/* Lightbox Modal */}
                {selectedImage && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
                        <div className="absolute inset-0" onClick={() => setSelectedImage(null)}></div>
                        <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center animate-in zoom-in-95 duration-200">
                            <img 
                                src={selectedImage} 
                                alt="Full Testimony" 
                                className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" 
                            />
                            <button 
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg transition-colors"
                            >
                                <X className="size-5" />
                            </button>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}
