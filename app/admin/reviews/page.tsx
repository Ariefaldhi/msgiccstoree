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
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-emerald-500" />
                        Manajemen Review
                    </h1>
                    <p className="text-slate-500 font-medium tracking-tight">Pantau dan kelola ulasan dari para pelanggan.</p>
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-emerald-600" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.map((rev) => (
                        <div key={rev.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative group hover:shadow-lg transition-all">
                            <button 
                                onClick={() => handleDelete(rev.id)}
                                className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-lg md:opacity-0 md:group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-slate-900 text-sm truncate">{rev.user_name}</h3>
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={cn("w-2.5 h-2.5", rev.rating >= i + 1 ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <p className="text-slate-600 text-sm font-medium leading-relaxed bg-slate-50 p-4 rounded-xl mb-4 italic">
                                "{rev.comment}"
                            </p>

                            <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span>{new Date(rev.created_at).toLocaleDateString('id-ID')}</span>
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full",
                                    rev.rating >= 4 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                )}>
                                    {rev.rating} Stars
                                </span>
                            </div>
                        </div>
                    ))}
                    {reviews.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
                             <MessageSquare className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Belum ada review pelanggan</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
