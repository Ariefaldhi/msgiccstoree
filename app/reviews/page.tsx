"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Star, Loader2, MessageSquare, Send, Quote, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    
    // Form State
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoveredRating, setHoveredRating] = useState(0);

    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
                setProfile(prof);
            }

            const { data: revs } = await supabase
                .from("reviews")
                .select("*")
                .order("created_at", { ascending: false });
            if (revs) setReviews(revs);
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return alert("Silakan login terlebih dahulu untuk memberikan review.");
        if (!comment.trim()) return alert("Komentar tidak boleh kosong.");

        setIsSubmitting(true);
        const { error } = await supabase.from("reviews").insert([
            {
                user_id: user.id,
                user_name: profile?.full_name || user.email.split('@')[0],
                rating,
                comment,
            }
        ]);

        if (error) {
            alert("Gagal mengirim review: " + error.message);
        } else {
            setComment("");
            setRating(5);
            // Refresh reviews
            const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
            if (data) setReviews(data);
        }
        setIsSubmitting(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20">
            <main className="container mx-auto px-4 max-w-4xl">
                
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                        What They Say <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">About Our Services</span>
                    </h1>
                </div>

                {/* Submision Form */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-200 border border-slate-100 mb-16 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Berikan Ulasan Anda</h2>
                    <p className="text-slate-500 font-medium mb-8">Pengalaman Anda sangat berharga bagi kami dan komunitas.</p>

                    {user ? (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Rating Layanan</label>
                                <div className="flex items-center gap-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoveredRating(star)}
                                            onMouseLeave={() => setHoveredRating(0)}
                                            className="transition-all transform hover:scale-125 hover:-rotate-12 active:scale-90"
                                        >
                                            <Star 
                                                className={cn(
                                                    "w-10 h-10",
                                                    (hoveredRating || rating) >= star 
                                                        ? "fill-amber-400 text-amber-400" 
                                                        : "text-slate-200"
                                                )} 
                                            />
                                        </button>
                                    ))}
                                    <span className="ml-4 font-black text-slate-900 text-xl">{rating}.0</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Komentar Penilaian</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Ceritakan pengalaman Anda belanja di sini..."
                                    className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl p-6 font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full md:w-auto px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Kirim Review <Send className="w-5 h-5" /></>}
                            </button>
                        </form>
                    ) : (
                        <div className="bg-slate-50 rounded-3xl p-10 text-center border-2 border-dashed border-slate-200">
                             <p className="text-slate-500 font-bold mb-6">Anda harus masuk untuk memberikan ulasan.</p>
                             <a href="/login" className="inline-flex px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">Login Sekarang</a>
                        </div>
                    )}
                </div>

                {/* Review List */}
                <div className="space-y-8">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-8">
                        Penilaian Pelanggan ({reviews.length})
                    </h3>

                    {reviews.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {reviews.map((rev) => (
                                <div key={rev.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative group hover:shadow-xl transition-all duration-500">
                                    <Quote className="absolute top-6 right-8 w-12 h-12 text-slate-50 opacity-10 group-hover:opacity-100 group-hover:text-emerald-500 group-hover:-translate-y-2 transition-all duration-500" />
                                    
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                            <UserIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 leading-none mb-1">{rev.user_name}</h4>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        className={cn(
                                                            "w-3 h-3",
                                                            rev.rating >= i + 1 ? "fill-amber-400 text-amber-400" : "text-slate-200"
                                                        )} 
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <span className="ml-auto text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                            {new Date(rev.created_at).toLocaleDateString('id-ID')}
                                        </span>
                                    </div>

                                    <p className="text-slate-600 font-medium leading-relaxed italic">
                                        "{rev.comment}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-slate-400 font-medium italic">Belum ada ulasan untuk saat ini.</p>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
