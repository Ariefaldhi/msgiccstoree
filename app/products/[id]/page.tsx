"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
    Loader2, Star, CheckCircle2, ShieldCheck, 
    ArrowLeft, ShoppingBag, Info, MessageSquare, 
    Users, Clock, Zap, Share2, X
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import ShareButtons from "@/components/ShareButtons";
import ProductModal from "@/components/ProductModal";

interface Package {
    id: string;
    name: string;
    price: string;
    cost_price: number;
    duration: string;
    type: string;
    is_available?: boolean;
    features?: string[];
    reseller_price?: number;
}

interface Product {
    id: string;
    title: string;
    price: string;
    tag?: string;
    tag_color?: string;
    image_url?: string;
    description?: string;
    terms_conditions?: string;
    packages?: Package[];
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [product, setProduct] = useState<Product | null>(null);
    const [testimonies, setTestimonies] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isAffiliator, setIsAffiliator] = useState(false);
    const [commissionPercent, setCommissionPercent] = useState(25);
    
    // Modal State for Ordering
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    
    const supabase = createClient();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);

            // Fetch Product
            const { data: prod } = await supabase
                .from("products")
                .select("*, packages(*)")
                .eq("id", id)
                .single();
            
            if (prod) {
                setProduct(prod);
                
                // Fetch Testimonies (Filtered by slug)
                const slug = prod.title.toLowerCase().replace(/\s+/g, '-');
                const { data: tests } = await supabase
                    .from("testimonies")
                    .select("*")
                    .eq("product_slug", slug);
                if (tests) setTestimonies(tests);

                // Fetch Reviews
                const { data: revs } = await supabase
                    .from("reviews")
                    .select("*")
                    .eq("product_id", id);
                if (revs) setReviews(revs);
            }

            // Fetch User & Affiliate Status
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
                setProfile(prof);
                if (prof?.is_affiliator || prof?.role === 'admin') {
                    setIsAffiliator(true);
                }
            }

            // Fetch Commission Percent
            const { data: settings } = await supabase.from("store_settings").select("affiliate_commission_percent").eq("id", 1).single();
            if (settings?.affiliate_commission_percent) {
                setCommissionPercent(settings.affiliate_commission_percent);
            }

            setLoading(false);
        }
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
                <h1 className="text-2xl font-black text-slate-900 mb-4">Produk Tidak Ditemukan</h1>
                <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">Kembali ke Beranda</Link>
            </div>
        );
    }

    // Commission Range Calculation
    let commissionRange = "";
    if (isAffiliator && product.packages) {
        const commissions = product.packages.map(pkg => {
            const sellPrice = parseInt(pkg.price.replace(/\D/g, "")) || 0;
            const costPrice = pkg.cost_price || 0;
            const profit = Math.max(0, sellPrice - costPrice);
            return Math.floor(profit * (commissionPercent / 100));
        }).filter(c => c > 0);

        if (commissions.length > 0) {
            const minComm = Math.min(...commissions);
            const maxComm = Math.max(...commissions);
            commissionRange = minComm === maxComm ? `Rp ${minComm.toLocaleString()}` : `Rp ${minComm.toLocaleString()} - ${maxComm.toLocaleString()}`;
        }
    }

    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/products/${id}` : "";
    const affiliateShareUrl = profile?.affiliate_code ? `${shareUrl}?ref=${profile.affiliate_code}` : "";

    return (
        <div className="min-h-screen bg-slate-50 pt-10 pb-20">
            <main className="container mx-auto px-4 max-w-6xl">
                
                {/* Header Navigation */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold transition-all group">
                        <div className="p-2 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-all">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                        Kembali
                    </Link>
                </div>

                <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
                    
                    {/* Right Column: Packages & Share - PRIORITY ON MOBILE */}
                    <div className="order-first lg:order-last space-y-8">
                        
                        {/* Summary & Order Button */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-blue-100 sticky top-28 overflow-hidden relative">
                             {/* Decorative Background for CTA */}
                             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                             
                             <h4 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4">Pesan Sekarang</h4>
                             <p className="text-slate-500 text-sm font-medium mb-8">Pilih paket yang sesuai dengan kebutuhan Anda dan lakukan pemesanan melalui sistem konfirmasi WhatsApp kami.</p>
                             
                             <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 active:scale-95 group"
                             >
                                <ShoppingBag className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                LIHAT PAKET & ORDER
                             </button>

                             <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col gap-4">
                                 <div className="hidden md:flex items-center gap-4 text-xs font-bold text-slate-400">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center"><ShieldCheck className="w-4 h-4 text-blue-400" /></div>
                                    Garansi Full Proteksi
                                 </div>
                                 <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center"><Zap className="w-4 h-4 text-amber-400" /></div>
                                    Proses Kilat 5-15 Menit
                                 </div>
                             </div>
                        </div>

                        {/* Share Section */}
                        <ShareButtons 
                            url={shareUrl} 
                            affiliateUrl={affiliateShareUrl} 
                            title={`Nonton @${product.title} murah mulai dari ${product.price} hanya di MsgiccStore!`} 
                            isAffiliator={isAffiliator}
                        />

                    </div>

                    {/* Left Column: Product Info & Banner */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Hero Section */}
                        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden relative">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                            
                            <div className="flex flex-col md:flex-row items-center gap-10">
                                <div className="w-48 h-48 md:w-64 md:h-64 rounded-[2.5rem] bg-slate-900 overflow-hidden shadow-2xl ring-8 ring-slate-50 shrink-0">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-6xl font-black text-white">
                                            {product.title.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                                        <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">Premium App</span>
                                        {product.tag && (
                                            <span className={cn(
                                                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                product.tag_color === 'red' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                                            )}>
                                                {product.tag}
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-tight">{product.title}</h1>
                                    <p className="text-2xl font-black text-blue-600 mb-6">Mulai {product.price}</p>
                                    
                                    {isAffiliator && (
                                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl animate-in fade-in zoom-in duration-500">
                                            <Zap className="w-5 h-5 text-emerald-500 animate-pulse" />
                                            <div>
                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter leading-none mb-1">Potensi Komisi Afiliasi:</p>
                                                <p className="text-lg font-black text-emerald-700 leading-none">{commissionRange}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description & Terms */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
                                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                                    <Info className="w-5 h-5 text-blue-600" /> Deskripsi Produk
                                </h3>
                                <div className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap text-sm">
                                    {product.description || "Nikmati layanan aplikasi premium dengan harga terbaik melalui MsgiccStore. Proses cepat, aman, dan bergaransi penuh."}
                                </div>
                            </div>
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
                                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-amber-500" /> Syarat & Ketentuan
                                </h3>
                                <div className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap text-sm italic">
                                    {product.terms_conditions || "Harap baca deskripsi paket dengan teliti. Pesanan diproses otomatis setelah konfirmasi pembayaran via WhatsApp."}
                                </div>
                            </div>
                        </div>

                        {/* Testimonials Filtered */}
                        <div className="space-y-6">
                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <Users className="w-6 h-6 text-purple-600" /> Bukti Testimoni
                            </h3>
                            {testimonies.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {testimonies.map((test, i) => (
                                        <div 
                                            key={i} 
                                            onClick={() => setSelectedImage(test.image_url)}
                                            className="aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer bg-slate-100 group relative"
                                        >
                                            <img src={test.image_url} alt="Testimony" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Zap className="w-6 h-6 text-white drop-shadow-lg" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold">Belum ada testimoni khusus untuk @{product.title.toLowerCase().replace(/\s+/g, '')}</p>
                                </div>
                            )}
                        </div>

                        {/* Reviews */}
                        <div className="space-y-6">
                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <MessageSquare className="w-6 h-6 text-emerald-500" /> Ulasan Pelanggan
                            </h3>
                            {reviews.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {reviews.map((rev, i) => (
                                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="flex items-center gap-0.5">
                                                    {[...Array(5)].map((_, j) => (
                                                        <Star key={j} className={cn("w-3 h-3", rev.rating >= j+1 ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-black text-slate-300 uppercase">{rev.user_name}</span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-600 italic">"{rev.comment}"</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold">Belum ada ulasan untuk produk ini.</p>
                                    <Link href="/reviews" className="text-blue-600 text-xs font-black mt-2 inline-block uppercase">Berikan Ulasan Pertama</Link>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

            </main>

            {/* Fullscreen Image Preview */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-[20000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
                        <img 
                            src={selectedImage} 
                            alt="Full Preview" 
                            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
                        />
                        <button 
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}

            {/* Reuse ProductModal for order flow */}
            <ProductModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={{
                    ...product,
                    category: "Apps", // Default for now
                    packages: product.packages
                }}
            />
        </div>
    );
}
