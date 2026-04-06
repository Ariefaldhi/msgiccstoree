import { X, CheckCircle2, ChevronLeft, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

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
    category: string;
    tag?: string;
    tagColor?: "yellow" | "red" | "blue" | "purple";
    image_url?: string;
    terms_conditions?: string;
    packages?: Package[];
}

interface ProductModalProps {
    product: Product | null;
    activePromos?: any[];
    isOpen: boolean;
    onClose: () => void;
    isResellerContext?: boolean;
}

export default function ProductModal({ product, activePromos, isOpen, onClose, isResellerContext = false }: ProductModalProps) {
    const [step, setStep] = useState<"selection" | "payment">("selection");
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [agreed, setAgreed] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [waNumber, setWaNumber] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [adminPhone, setAdminPhone] = useState("6285720892082");
    const supabase = createClient();

    const [salesCounts, setSalesCounts] = useState<Record<string, number>>({});


    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setStep("selection");
            setSelectedPackage(null);
            setAgreed(false);
            setIsSubmitting(false);
            fetchSalesCounts();
            checkUser();
            // Fetch admin WhatsApp number
            supabase.from("store_settings").select("whatsapp_number").eq("id", 1).single().then(({ data }) => {
                if (data?.whatsapp_number) setAdminPhone(data.whatsapp_number);
            });
        }
    }, [isOpen, product?.id]);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
            setCustomerName(user.user_metadata?.full_name || user.email?.split('@')[0] || "");
            setWaNumber(user.email || ""); // Using email as a placeholder for WA if logged in
        } else {
            setCustomerName("");
            setWaNumber("");
        }
    };

    const fetchSalesCounts = async () => {
        if (!product) return;
        const { data, error } = await supabase
            .from("orders")
            .select("package_name, status")
            .eq("product_name", product.title)
            .eq("status", "Pesanan Selesai");
        
        if (data) {
            const counts: Record<string, number> = {};
            data.forEach(order => {
                counts[order.package_name] = (counts[order.package_name] || 0) + 1;
            });
            setSalesCounts(counts);
        }
    };

    if (!isOpen || !product) return null;

    const handleSelectPackage = (pkg: Package) => {
        setSelectedPackage(pkg);
        setStep("payment");
    };

    const handleOrder = async () => {
        if (!selectedPackage || !agreed || !customerName || !waNumber) return;

        setIsSubmitting(true);

        const promoInfo = !isResellerContext && activePromos?.find(fs => fs.package_id === selectedPackage.id);
        const discount_percent = promoInfo ? promoInfo.discount_percent : null;

        const rawPrice = parseInt(selectedPackage.price.replace(/\D/g, "")) || 0;
        
        let sellPriceRaw = rawPrice;
        if (isResellerContext && selectedPackage.reseller_price) {
           sellPriceRaw = selectedPackage.reseller_price;
        } else if (discount_percent) {
           sellPriceRaw = Math.round(rawPrice * (1 - discount_percent / 100));
        }

        const costPriceRaw = selectedPackage.cost_price || 0;
        let profitRaw = sellPriceRaw - costPriceRaw;
        if (profitRaw < 0) profitRaw = 0; // Prevent negative profit

        const finalPriceDisplay = `Rp ${sellPriceRaw.toLocaleString("id-ID")}`;

        // Affiliate Tracking Logic
        let affiliator_id = null;
        let commission = 0;
        let affiliate_code_used = null;

        const refCode = localStorage.getItem("msgicc_affiliate_ref");
        if (refCode) {
            const { data: affl } = await supabase.from("profiles").select("id").eq("affiliate_code", refCode).single();
            if (affl) {
                const { data: st } = await supabase.from("store_settings").select("affiliate_commission_percent").eq("id", 1).single();
                affiliator_id = affl.id;
                affiliate_code_used = refCode;
                const percent = st?.affiliate_commission_percent || 5;
                commission = Math.floor(profitRaw * (percent / 100));
            }
        }

        // Simpan ke database
        const { error } = await supabase.from("orders").insert([{
            wa_number: waNumber,
            customer_name: customerName,
            email: user?.email || null,
            user_id: user?.id || null,
            product_name: product.title,
            package_name: selectedPackage.name,
            sell_price: sellPriceRaw,
            cost_price: costPriceRaw,
            profit: profitRaw,
            affiliator_id: affiliator_id,
            commission: commission,
            affiliate_code_used: affiliate_code_used,
            status: "Menunggu Konfirmasi"
        }]);

        setIsSubmitting(false);

        if (error) {
            alert("Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.");
            return;
        }

        const message = `Halo Admin, saya mau order paket ini:%0A%0A*${product.title}*%0A📦 ${selectedPackage.name}%0A💰 ${finalPriceDisplay}%0A⏳ ${selectedPackage.duration}%0A👤 Nama: ${customerName}%0A📱 WA: ${waNumber}%0A%0A_Mohon diproses ya kak!_`;
        window.open(`https://wa.me/${adminPhone}?text=${message}`, "_blank");
        
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-lg transform rounded-[2.5rem] bg-white shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col">

                {/* Header Section with Gradient/Blur */}
                <div className="relative h-32 bg-slate-100 overflow-hidden shrink-0">
                    {/* Blurred Banner Image - Soft, Diffused Look */}
                    {product.image_url ? (
                        <>
                            <div
                                className="absolute inset-0 bg-cover bg-center blur-[60px] scale-150 opacity-60 saturate-150"
                                style={{ backgroundImage: `url(${product.image_url})` }}
                            />
                            {/* Extra overlay to ensure it's not too dark */}
                            <div className="absolute inset-0 bg-white/40 mix-blend-overlay"></div>
                        </>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-300/40 to-purple-300/40 blur-3xl opacity-70"></div>
                    )}

                    {/* Gradient Overlay for better blend with content */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent"></div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute right-5 top-5 p-2 rounded-full bg-white/40 hover:bg-white backdrop-blur-md transition-all z-20 text-slate-600 shadow-sm border border-white/20"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Overlapping Icon & Title */}
                <div className="px-6 -mt-16 relative z-10 mb-4 shrink-0">
                    <div className="flex items-end gap-5">
                        <div className="w-28 h-28 rounded-[2rem] bg-white p-1.5 shadow-2xl">
                            <div className="w-full h-full rounded-[1.6rem] overflow-hidden bg-slate-900 flex items-center justify-center">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-black text-white">{product.title.charAt(0)}</span>
                                )}
                            </div>
                        </div>
                        <div className="mb-2">
                            <h2 className="text-2xl font-black text-slate-900 leading-none mb-2">{product.title}</h2>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">APP</span>
                                {product.tag && (
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                        product.tagColor === "yellow" && "bg-yellow-100 text-yellow-700",
                                        product.tagColor === "red" && "bg-red-100 text-red-700",
                                        product.tagColor === "blue" && "bg-blue-100 text-blue-700",
                                    )}>
                                        {product.tag}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6">

                    {step === "payment" && (
                        <button
                            onClick={() => setStep("selection")}
                            className="mb-4 text-slate-400 hover:text-slate-600 flex items-center gap-1 text-xs font-bold transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Kembali ke Paket
                        </button>
                    )}

                    <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">
                        {step === "selection" ? "Pilih Paket Layanan" : "Konfirmasi Pesanan"}
                    </h3>

                    {step === "selection" ? (
                        <div className="space-y-4">
                            {[...(product.packages || [])]
                                .sort((a, b) => {
                                    // 1. Availability first
                                    const aAvail = a.is_available !== false;
                                    const bAvail = b.is_available !== false;
                                    if (aAvail && !bAvail) return -1;
                                    if (!aAvail && bAvail) return 1;
                                    
                                    // 2. Price (Lowest first)
                                    const aPrice = isResellerContext && a.reseller_price ? a.reseller_price : parseInt(a.price.replace(/\D/g, "")) || 0;
                                    const bPrice = isResellerContext && b.reseller_price ? b.reseller_price : parseInt(b.price.replace(/\D/g, "")) || 0;
                                    return aPrice - bPrice;
                                })
                                .map((pkg, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "group border rounded-[2rem] p-5 bg-white shadow-sm transition-all relative overflow-hidden",
                                        (pkg.is_available === false) 
                                            ? "opacity-60 grayscale-[0.5] border-slate-200 cursor-not-allowed" 
                                            : "hover:shadow-lg hover:border-blue-200 border-slate-100"
                                    )}
                                >
                                    {pkg.is_available === false && (
                                        <div className="absolute top-4 right-20 z-20">
                                            <span className="bg-slate-800 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-xl">
                                                STOK HABIS
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-4">

                                        {/* Header */}
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-base text-slate-900 w-2/3">{product.title} {pkg.name}</h4>
                                            {/* Order Button in Reference Style */}
                                            <button
                                                onClick={() => pkg.is_available !== false && handleSelectPackage(pkg)}
                                                disabled={pkg.is_available === false}
                                                className={cn(
                                                    "px-5 py-2 rounded-xl text-xs font-bold shadow-lg active:scale-95 transition-all text-white",
                                                    pkg.is_available === false 
                                                        ? "bg-slate-400 cursor-not-allowed shadow-none" 
                                                        : "bg-[#0f172a] hover:bg-[#1e293b]"
                                                )}
                                            >
                                                {pkg.is_available === false ? "TUTUP" : "ORDER"}
                                            </button>
                                        </div>

                                        {/* Price & Sales Count */}
                                        <div className="flex justify-between items-end">
                                            <div className="text-2xl font-black text-blue-600 flex items-center gap-3 flex-wrap">
                                                {(() => {
                                                    const fs = !isResellerContext && activePromos?.find(f => f.package_id === pkg.id);
                                                    const rawPrice = parseInt(pkg.price.replace(/\D/g, "")) || 0;
                                                    
                                                    if (isResellerContext && pkg.reseller_price) {
                                                        return (
                                                            <>
                                                                <span>Rp {pkg.reseller_price.toLocaleString("id-ID")}</span>
                                                                <span className="text-xs font-bold text-slate-400 line-through">{pkg.price}</span>
                                                            </>
                                                        );
                                                    }
                                                    
                                                    if (fs) {
                                                        const discounted = Math.round(rawPrice * (1 - fs.discount_percent / 100));
                                                        return (
                                                            <>
                                                                <span>Rp {discounted.toLocaleString("id-ID")}</span>
                                                                <span className="text-xs font-bold text-slate-400 line-through">{pkg.price}</span>
                                                                <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-md">-{fs.discount_percent}%</span>
                                                            </>
                                                        );
                                                    }
                                                    return <span>{pkg.price}</span>;
                                                })()}
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 flex items-center gap-1.5">
                                                <ShieldCheck className="w-3 h-3 text-blue-400" />
                                                Terjual {salesCounts[pkg.name] || 0}
                                            </div>
                                        </div>

                                        {/* Features List (Reference Style) */}
                                        <div className="space-y-2 pt-2 border-t border-dashed border-slate-100">
                                            {pkg.features && pkg.features.length > 0 ? (
                                                pkg.features.map((feature, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                                        <span>{feature}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                                        <span>Garansi {pkg.duration}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                                        <span>Type: {pkg.type}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                                        <span>Support All Device</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                                        <span>Proses Cepat & Aman</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!product.packages || product.packages.length === 0) && (
                                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-3xl">
                                    <p className="text-gray-400 text-sm font-bold">Belum ada paket tersedia.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">

                            {/* Selected Package Summary */}
                            <div className="border border-blue-100 rounded-[2rem] p-6 bg-blue-50/30">
                                <h4 className="font-bold text-lg text-slate-900 mb-1">{selectedPackage?.name}</h4>
                                <div className="text-3xl font-black text-blue-600 mb-4 flex items-center gap-3 flex-wrap">
                                    {(() => {
                                        const fs = !isResellerContext && selectedPackage && activePromos?.find(f => f.package_id === selectedPackage.id);
                                        const rawPrice = parseInt(selectedPackage?.price?.replace(/\D/g, "") || "0");
                                        
                                        if (isResellerContext && selectedPackage?.reseller_price) {
                                            return (
                                                <>
                                                    <span className="text-purple-600">Rp {selectedPackage.reseller_price.toLocaleString("id-ID")}</span>
                                                    <span className="text-sm font-bold text-slate-400 line-through">{selectedPackage.price}</span>
                                                </>
                                            );
                                        }

                                        if (fs) {
                                            const discounted = Math.round(rawPrice * (1 - fs.discount_percent / 100));
                                            return (
                                                <>
                                                    <span>Rp {discounted.toLocaleString("id-ID")}</span>
                                                    <span className="text-sm font-bold text-slate-400 line-through">{selectedPackage?.price}</span>
                                                </>
                                            )
                                        }
                                        return <span className={cn(isResellerContext && "text-purple-600")}>{selectedPackage?.price}</span>;
                                    })()}
                                </div>

                                <div className="space-y-2">
                                    {selectedPackage?.features && selectedPackage.features.length > 0 ? (
                                        selectedPackage.features.map((feature, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                                <span>{feature}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                                <span>Garansi {selectedPackage?.duration}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                                <span>Type: {selectedPackage?.type}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Customer Form */}
                            <div className="space-y-4 px-1">
                                {user ? (
                                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                            <span className="text-white font-black text-lg uppercase">{customerName.charAt(0)}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Sudah Login</p>
                                            <p className="text-sm font-black text-slate-900 truncate">{customerName}</p>
                                            <p className="text-[11px] font-bold text-slate-500 truncate">{user.email}</p>
                                        </div>
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <ShieldCheck className="w-5 h-5 text-blue-600" />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between px-1">
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Detail Pemesan</label>
                                            <Link href="/register" className="text-[10px] font-black text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tighter transition-all">
                                                Daftar agar otomatis
                                            </Link>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <input 
                                                type="text" 
                                                required 
                                                placeholder="Nama Pelanggan" 
                                                value={customerName}
                                                onChange={(e) => setCustomerName(e.target.value)}
                                                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                            <input 
                                                type="text" 
                                                required 
                                                placeholder="Nomor WhatsApp" 
                                                value={waNumber}
                                                onChange={(e) => setWaNumber(e.target.value.replace(/\D/g, ''))}
                                                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>


                            {/* Terms Checkbox */}
                            <label className="flex items-start gap-4 cursor-pointer group p-4 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all bg-white shadow-sm">
                                <div className="relative flex items-center mt-0.5">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                    />
                                    <div className="w-6 h-6 border-2 border-slate-300 rounded-lg peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                                        <CheckCircle2 className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Setuju dengan Syarat & Ketentuan</span>
                                    <div className="mt-2 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed max-h-32 overflow-y-auto custom-scrollbar italic font-medium whitespace-pre-wrap">
                                        {product.terms_conditions || "Pesanan akan diproses melalui WhatsApp. Pastikan nomor WhatsApp Anda aktif dan data yang dimasukkan sudah benar."}
                                    </div>
                                </div>
                            </label>

                            {/* Order Button */}
                            <button
                                onClick={handleOrder}
                                disabled={!agreed || !customerName || !waNumber || isSubmitting}
                                className={cn(
                                    "w-full py-4 rounded-2xl text-sm font-bold shadow-xl transition-all flex items-center justify-center gap-3",
                                    (agreed && customerName && waNumber && !isSubmitting)
                                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-300 hover:-translate-y-1 active:scale-95 cursor-pointer"
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                                )}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>KONFIRMASI VIA WHATSAPP</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
