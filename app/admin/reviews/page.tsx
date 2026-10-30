"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Trash2, MessageSquare, Star, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminReviews() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchReviews();
    }, []);

    async function fetchReviews() {
        setLoading(true);
        const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
        if (data) setReviews(data);
        setLoading(false);
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus review ini secara permanen?")) return;
        const { error } = await supabase.from("reviews").delete().eq("id", id);
        if (error) alert(error.message);
        else fetchReviews();
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-200">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                        <MessageSquare className="w-6 h-6 text-emerald-600" />
                        Manajemen Review
                    </h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-0.5">Pantau dan kelola ulasan dari para pelanggan.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 bg-white border border-slate-200/90 rounded-2xl">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Memuat Ulasan...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reviews.map((rev) => (
                        <div key={rev.id} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs relative group hover:border-slate-300 transition-colors flex flex-col justify-between">
                            <div>
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-slate-900 text-xs truncate">{rev.user_name || "Pelanggan"}</h3>
                                            <div className="flex items-center gap-0.5 mt-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={cn("w-3 h-3", rev.rating >= i + 1 ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(rev.id)}
                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                                        title="Hapus Review"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <p className="text-slate-600 text-xs leading-relaxed bg-slate-50 border border-slate-100 p-3 rounded-xl mb-3 italic">
                                    &ldquo;{rev.comment}&rdquo;
                                </p>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                                <div className="flex flex-col gap-0.5">
                                    <span>{new Date(rev.created_at).toLocaleDateString('id-ID')}</span>
                                    {rev.product_name && (
                                        <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded w-fit font-medium">{rev.product_name}</span>
                                    )}
                                </div>
                                <span className={cn(
                                    "px-2 py-0.5 rounded text-[11px] font-semibold border",
                                    rev.rating >= 4 ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
                                )}>
                                    {rev.rating} Bintang
                                </span>
                            </div>
                        </div>
                    ))}
                    {reviews.length === 0 && (
                        <div className="col-span-full py-16 text-center text-slate-400 text-sm bg-white border border-dashed border-slate-200 rounded-2xl">
                             <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                             <p>Belum ada ulasan pelanggan.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
