"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
    Loader2, Star, CheckCircle2, ShieldCheck, 
    ArrowLeft, ShoppingBag, Info, MessageSquare, 
    Users, Clock, Zap, X
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import ShareButtons from "@/components/ShareButtons";
import ProductModal from "@/components/ProductModal";
import TermsAndConditions from "@/components/TermsAndConditions";

interface Package {
    id: string;
    product_id?: string;
    name: string;
    price: string;
    cost_price: number;
    duration: string;
    type: string;
    is_available: boolean;
    features?: string[];
    reseller_price?: number;
    terms_and_conditions?: string;
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
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="size-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
                <h1 className="text-xl font-bold text-slate-900 mb-4">Produk Tidak Ditemukan</h1>
                <Link href="/" className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold">Kembali ke Katalog</Link>
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
        <div className="min-h-screen bg-slate-50 pt-8 pb-20">
            <main className="container mx-auto px-4 max-w-6xl">
                
                {/* Header Navigation */}
                <div className="mb-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-semibold transition-colors">
                        <div className="p-1.5 bg-white border border-slate-200/90 rounded-lg shadow-2xs">
                            <ArrowLeft className="size-4" />
                        </div>
                        Kembali ke Katalog
                    </Link>
                </div>

                <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 md:gap-8">
                    
                    {/* Right Column: Packages & Share */}
                    <div className="order-first lg:order-last space-y-6">
                        
                        {/* Summary & Order Button */}
                        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/90 sticky top-24">
                             <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-2">Pemesanan Instan</span>
                             <h4 className="text-base font-bold text-slate-900 mb-2">Beli Akun {product.title}</h4>
                             <p className="text-slate-500 text-xs md:text-sm font-normal mb-6 leading-relaxed">Pilih paket yang sesuai kebutuhan Anda dan lakukan pemesanan cepat melalui WhatsApp.</p>
                             
                             <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs active:scale-95"
                             >
                                <ShoppingBag className="size-4" />
                                Pilih Paket & Pesan Sekarang
                             </button>

                             <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2.5">
                                 <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                                    <ShieldCheck className="size-4 text-blue-600 shrink-0" />
                                    Garansi ganti baru selama masa aktif
                                 </div>
                                 <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                                    <Clock className="size-4 text-emerald-600 shrink-0" />
                                    Proses aktivasi 5–15 menit
                                 </div>
                             </div>
                        </div>

                        {/* Share Section */}
                        <ShareButtons 
                            url={shareUrl} 
                            affiliateUrl={affiliateShareUrl} 
                            title={`Langganan @${product.title} murah mulai dari ${product.price} hanya di MsgiccStore!`} 
                            isAffiliator={isAffiliator}
                        />

                    </div>

                    {/* Left Column: Product Info & Banner */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Hero Section */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xs border border-slate-200/90">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                <div className="size-36 md:size-44 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl font-extrabold text-slate-800">
                                            {product.title.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <div className="flex flex-wrap gap-2 mb-2 justify-center sm:justify-start">
                                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                                            Akun Premium
                                        </span>
                                        {product.tag && (
                                            <span className={cn(
                                                "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                                product.tag_color === 'red' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                                            )}>
                                                {product.tag}
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">{product.title}</h1>
                                    <p className="text-xl font-extrabold text-blue-600 mb-4">Mulai {product.price}</p>
                                    
                                    {isAffiliator && (
                                        <div className="inline-flex items-center gap-2.5 px-3.5 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
                                            <Zap className="size-4 text-emerald-600" />
                                            <div>
                                                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider leading-none mb-0.5">Potensi Komisi Afiliasi:</p>
                                                <p className="text-sm font-bold text-emerald-800 leading-none">{commissionRange}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description & Terms */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/90">
                                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <Info className="size-4 text-blue-600" /> Deskripsi Layanan
                                </h3>
                                <div className="text-slate-600 font-normal leading-relaxed whitespace-pre-wrap text-xs md:text-sm">
                                    {product.description || "Nikmati layanan aplikasi premium dengan harga terbaik melalui MsgiccStore. Proses cepat, aman, dan bergaransi penuh."}
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/90 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                        <Clock className="size-4 text-slate-600" /> Ketentuan Penggunaan
                                    </h3>
                                    <TermsAndConditions 
                                        termsText={product.terms_conditions} 
                                        productTitle={product.title} 
                                        maxHeight="max-h-64" 
                                        className="bg-transparent border-0 p-0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Testimonials Filtered */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Users className="size-5 text-purple-600" /> Bukti Transaksi & Testimoni
                            </h3>
                            {testimonies.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {testimonies.map((test, i) => (
                                        <div 
                                            key={i} 
                                            onClick={() => setSelectedImage(test.image_url)}
                                            className="aspect-square rounded-xl overflow-hidden border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all cursor-pointer bg-slate-50 group relative"
                                        >
                                            <img src={test.image_url} alt="Testimony" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-200">
                                    <p className="text-slate-400 text-xs font-medium">Belum ada testimoni khusus untuk produk ini.</p>
                                </div>
                            )}
                        </div>

                        {/* Reviews */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <MessageSquare className="size-5 text-emerald-600" /> Ulasan Pembeli
                            </h3>
                            {reviews.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {reviews.map((rev, i) => (
                                        <div key={i} className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-slate-800">{rev.user_name}</span>
                                                <div className="flex items-center gap-0.5">
                                                    {[...Array(5)].map((_, j) => (
                                                        <Star key={j} className={cn("size-3", rev.rating >= j+1 ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-600 font-normal leading-relaxed">"{rev.comment}"</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-200">
                                    <p className="text-slate-400 text-xs font-medium">Belum ada ulasan untuk produk ini.</p>
                                    <Link href="/reviews" className="text-blue-600 text-xs font-semibold mt-1.5 inline-block">Berikan ulasan pertama</Link>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

            </main>

            {/* Fullscreen Image Preview */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-[20000] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
                        <img 
                            src={selectedImage} 
                            alt="Full Preview" 
                            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                        />
                        <button 
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 p-2 bg-slate-900/80 text-white rounded-lg hover:bg-slate-900 transition-colors"
                        >
                            <X className="size-5" />
                        </button>
                    </div>
                </div>
            )}

            <ProductModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={{
                    ...product,
                    category: "App",
                    packages: product.packages
                }}
            />
        </div>
    );
}
