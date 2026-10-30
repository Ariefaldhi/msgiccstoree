"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Star, Loader2, Send, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
            const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
            if (data) setReviews(data);
        }
        setIsSubmitting(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="size-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-20">
            <main className="container mx-auto px-4 max-w-4xl">
                
                <div className="text-center mb-10">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2 block">
                        Ulasan Komunitas
                    </span>
                    <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                        Apa Kata Pelanggan Kami
                    </h1>
                    <p className="text-slate-500 text-xs md:text-sm max-w-md mx-auto">
                        Ulasan dan feedback nyata dari pelanggan yang berlangganan melalui layanan kami.
                    </p>
                </div>

                {/* Submission Form */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xs border border-slate-200/90 mb-10">
                    <h2 className="text-lg font-bold text-slate-900 mb-1">Berikan Ulasan Anda</h2>
                    <p className="text-slate-500 text-xs mb-6">Ceritakan pengalaman belanja dan penggunaan akun premium Anda.</p>

                    {user ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-2">Rating Layanan</label>
                                <div className="flex items-center gap-1.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoveredRating(star)}
                                            onMouseLeave={() => setHoveredRating(0)}
                                            className="p-1 transition-transform hover:scale-110 active:scale-95"
                                        >
                                            <Star 
                                                className={cn(
                                                    "size-6",
                                                    (hoveredRating || rating) >= star 
                                                        ? "fill-amber-400 text-amber-400" 
                                                        : "text-slate-200"
                                                )} 
                                            />
                                        </button>
                                    ))}
                                    <span className="ml-2 font-bold text-slate-900 text-sm">{rating}.0</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-2">Komentar Ulasan</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Ceritakan pengalaman Anda belanja di sini..."
                                    className="w-full h-28 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all resize-none placeholder:text-slate-400"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-colors inline-flex items-center gap-2 shadow-xs disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <>Kirim Ulasan <Send className="size-3.5" /></>}
                            </button>
                        </form>
                    ) : (
                        <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-200">
                             <p className="text-slate-500 text-xs font-medium mb-3">Silakan masuk ke akun Anda terlebih dahulu untuk memberikan ulasan.</p>
                             <Link href="/login" className="inline-flex px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors">Masuk Sekarang</Link>
                        </div>
                    )}
                </div>

                {/* Review List */}
                <div className="space-y-4">
                    <h3 className="text-base font-bold text-slate-900">
                        Semua Ulasan ({reviews.length})
                    </h3>

                    {reviews.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {reviews.map((rev) => (
                                <div key={rev.id} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="size-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                                            <UserIcon className="size-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-slate-900 text-xs truncate">{rev.user_name}</h4>
                                            <div className="flex items-center gap-0.5 mt-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        className={cn(
                                                            "size-3",
                                                            rev.rating >= i + 1 ? "fill-amber-400 text-amber-400" : "text-slate-200"
                                                        )} 
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <span className="ml-auto text-[10px] font-mono text-slate-400">
                                            {new Date(rev.created_at).toLocaleDateString('id-ID')}
                                        </span>
                                    </div>

                                    <p className="text-slate-600 text-xs leading-relaxed font-normal">
                                        "{rev.comment}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-slate-400 text-xs">
                            Belum ada ulasan yang masuk saat ini.
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
