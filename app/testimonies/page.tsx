"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Star, Loader2, Sparkles, MessageCircle, ExternalLink } from "lucide-react";

export default function TestimoniesPage() {
    const [testimonies, setTestimonies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchTestimonies = async () => {
            const { data, error } = await supabase
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
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            <main className="container mx-auto px-4">
                
                <div className="text-center mb-16 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight relative z-10">
                        Real Transactions, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Real Happiness</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto relative z-10">
                        Lihat bukti transaksi dan testimoni dari pelanggan yang telah mempercayakan kebutuhan digitalnya kepada kami.
                    </p>
                </div>

                {testimonies.length > 0 ? (
                    <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                        {testimonies.map((item) => (
                            <div 
                                key={item.id} 
                                onClick={() => setSelectedImage(item.image_url)}
                                className="break-inside-avoid bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 group cursor-zoom-in"
                            >
                                <div className="relative overflow-hidden aspect-auto">
                                    <img 
                                        src={item.image_url} 
                                        alt="Testimony" 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                        <p className="text-white font-bold text-[10px] leading-tight line-clamp-2">{item.caption || "Terima kasih MsgiccStore!"}</p>
                                    </div>
                                </div>
                                {item.caption && (
                                    <div className="p-3 bg-white border-t border-slate-50">
                                        <p className="text-slate-600 text-[10px] font-medium italic line-clamp-2">"{item.caption}"</p>
                                        <div className="flex items-center gap-0.5 mt-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="w-2 h-2 fill-amber-400 text-amber-400" />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100 text-slate-200">
                            <Sparkles className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">Belum ada testimoni</h3>
                        <p className="text-slate-400 font-medium">Bantu kami menjadi lebih baik dengan memberikan ulasan Anda!</p>
                    </div>
                )}

                {/* Lightbox Modal */}
                {selectedImage && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-300">
                        <div className="absolute inset-0" onClick={() => setSelectedImage(null)}></div>
                        <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center animate-in zoom-in-95 duration-300">
                            <img 
                                src={selectedImage} 
                                alt="Full Testimony" 
                                className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" 
                            />
                            <button 
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-4 -right-4 bg-white text-slate-900 p-2 rounded-full shadow-xl hover:bg-slate-100 transition-all font-bold"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Call to Action Review */}
                <div className="mt-20 p-8 md:p-12 bg-blue-600 rounded-[3rem] text-center text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black mb-4">Punya Pengalaman Menarik?</h2>
                        <p className="text-blue-100 font-medium mb-8 max-w-xl mx-auto">Tuliskan ulasan Anda langsung di website dan dapatkan kesempatan diskon khusus untuk pembelian berikutnya!</p>
                        <a href="/reviews" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-800/20">
                            Tulis Review <MessageCircle className="w-5 h-5" />
                        </a>
                    </div>
                </div>

            </main>
        </div>
    );
}

// X icon needs import
import { X } from "lucide-react";
