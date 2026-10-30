import { X, CheckCircle2, ChevronLeft, ArrowRight, ShieldCheck, Loader2, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import TermsAndConditions from "@/components/TermsAndConditions";

interface Package {
    id: string;
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
    isAffiliator?: boolean;
    commissionPercent?: number;
}

export default function ProductModal({ 
    product, 
    activePromos, 
    isOpen, 
    onClose, 
    isResellerContext = false,
    isAffiliator = false,
    commissionPercent = 25
}: ProductModalProps) {
    const [step, setStep] = useState<"selection" | "payment" | "success" | "cooldown">("selection");
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [agreed, setAgreed] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [waNumber, setWaNumber] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [remainingMinutes, setRemainingMinutes] = useState(0);
    const [cooldownSeconds, setCooldownSeconds] = useState(0);
    const [adminPhone, setAdminPhone] = useState("6285720892082");
    const [fallbackCounter, setFallbackCounter] = useState(15);
    const [automationStatus, setAutomationStatus] = useState<"idle" | "sending" | "success" | "failed">("idle");
    const supabase = createClient();

    const [salesCounts, setSalesCounts] = useState<Record<string, number>>({});
    const [activeRefCode, setActiveRefCode] = useState<string | null>(null);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            const lastTime = localStorage.getItem("msgicc_order_cooldown");
            if (lastTime) {
                const diff = Date.now() - parseInt(lastTime);
                const remaining = Math.max(0, Math.ceil((60000 - diff) / 1000));
                if (remaining > 0) setCooldownSeconds(remaining);
            }

            setStep("selection");
            setSelectedPackage(null);
            setAgreed(false);
            setIsSubmitting(false);
            setFallbackCounter(15);
            setAutomationStatus("idle");
            fetchSalesCounts();
            checkUser();

            const savedRef = localStorage.getItem("msgicc_affiliate_ref");
            if (savedRef) {
                try {
                    const parsed = JSON.parse(savedRef);
                    let code = parsed.code || parsed.CODE || "";
                    if (code.includes("?ref=")) {
                        code = code.split("?ref=")[1].split("&")[0];
                    }
                    setActiveRefCode(code || null);
                } catch (e) {
                    setActiveRefCode(savedRef.includes("?ref=") ? savedRef.split("?ref=")[1].split("&")[0] : savedRef);
                }
            } else {
                setActiveRefCode(null);
            }

            supabase.from("store_settings").select("whatsapp_number").eq("id", 1).single().then(({ data }) => {
                if (data?.whatsapp_number) setAdminPhone(data.whatsapp_number);
            });
        }
    }, [isOpen, product?.id]);

    // Cooldown Timer
    useEffect(() => {
        if (cooldownSeconds > 0) {
            const timer = setTimeout(() => {
                setCooldownSeconds(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldownSeconds]);

    // Manual Fallback Timer
    useEffect(() => {
        let timer: any;
        if (step === "success" && fallbackCounter > 0) {
            timer = setInterval(() => {
                setFallbackCounter(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [step, fallbackCounter]);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
            setCustomerName(user.user_metadata?.full_name || user.email?.split('@')[0] || "");
            setWaNumber(""); 
            const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single();
            if (prof?.role === 'admin') setIsAdmin(true);
        } else {
            setCustomerName("");
            setWaNumber("");
            setIsAdmin(false);
        }
    };

    const fetchSalesCounts = async () => {
        if (!product) return;
        try {
            const res = await fetch('/api/stats');
            const data = await res.json();
            if (data.orders) {
                const counts: Record<string, number> = {};
                data.orders.forEach((order: any) => {
                    if (order.product_name === product.title) {
                        counts[order.package_name] = (counts[order.package_name] || 0) + 1;
                    }
                });
                setSalesCounts(counts);
            }
        } catch (e) {
            console.error("Failed to fetch sales counts", e);
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

        if (!isAdmin) {
            const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
            const { data: recentOrders } = await supabase
                .from("orders")
                .select("created_at")
                .eq("wa_number", waNumber)
                .gt("created_at", thirtyMinsAgo)
                .order("created_at", { ascending: false })
                .limit(1);

            if (recentOrders && recentOrders.length > 0) {
                const lastOrderTime = new Date(recentOrders[0].created_at).getTime();
                const diff = Date.now() - lastOrderTime;
                const remaining = Math.ceil((30 * 60 * 1000 - diff) / (60 * 1000));
                
                if (remaining > 0) {
                    setRemainingMinutes(remaining);
                    setStep("cooldown");
                    setIsSubmitting(false);
                    return;
                }
            }
        }

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
        if (profitRaw < 0) profitRaw = 0;

        const finalPriceDisplay = `Rp ${sellPriceRaw.toLocaleString("id-ID")}`;

        let affiliator_id = null;
        let commission = 0;
        let affiliate_code_used = null;

        const savedRef = localStorage.getItem("msgicc_affiliate_ref");
        if (savedRef) {
            try {
                const { code } = JSON.parse(savedRef);
                if (code) {
                    const { data: affl } = await supabase.from("profiles").select("id").eq("affiliate_code", code).single();
                    if (affl) {
                        const { data: st } = await supabase.from("store_settings").select("affiliate_commission_percent").eq("id", 1).single();
                        affiliator_id = affl.id;
                        affiliate_code_used = code;
                        const percent = st?.affiliate_commission_percent ?? 25;
                        commission = Math.floor(profitRaw * (percent / 100));
                    }
                }
            } catch (e) {
                console.error("Failed to parse affiliate ref:", e);
            }
        }

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

        if (error) {
            setIsSubmitting(false);
            alert("Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.");
            return;
        }

        localStorage.setItem("msgicc_order_cooldown", Date.now().toString());
        setCooldownSeconds(60);

        const currentTnc = selectedPackage?.terms_and_conditions || product.terms_conditions || "Pesanan akan diproses melalui WhatsApp. Pastikan nomor WhatsApp Anda aktif dan data yang dimasukkan sudah benar.";

        const customerMessage = `Halo Kak ${customerName},\n\nTerima kasih telah melakukan pesanan di *MsgiccStore*!\n\n*Detail Pesanan:*\n📦 Produk: *${product.title}*\n🎁 Paket: ${selectedPackage.name}\n💰 Total: ${finalPriceDisplay}\n⏳ Durasi: ${selectedPackage.duration}\n\n*Syarat & Ketentuan:*\n_${currentTnc}_\n\n_Mohon tunggu sebentar ya kak, Admin kami sedang menyiapkan detail pesanan Anda. Admin akan segera membalas pesan ini untuk memberikan *Info Pembayaran* dan *Instruksi Selanjutnya*._\n\n📌 *Harap tidak spam pesan agar antrian Anda tetap terjaga.*\n\nTerima kasih atas kesabarannya! 🙏`;
        
        let affiliatorName = "-";
        if (affiliate_code_used) {
            const { data: afflProf } = await supabase.from("profiles").select("full_name").eq("affiliate_code", affiliate_code_used).single();
            if (afflProf) affiliatorName = afflProf.full_name || "-";
        }

        const groupMessage = `📢 *PESANAN BARU!*\n\n📦 Produk: *${product.title}*\n🎁 Paket: ${selectedPackage.name}\n👤 Buyer: ${customerName}\n📱 WA: ${waNumber}\n🔗 Ref: ${affiliatorName}\n💰 Harga: ${finalPriceDisplay}\n\n🔗 *Kelola Pesanan:* ${window.location.origin}/admin/orders`;

        try {
            setAutomationStatus("sending");
            const res = await fetch("/api/send-message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerTarget: waNumber,
                    customerMessage: customerMessage,
                    groupMessage: groupMessage
                })
            });

            if (res.ok) {
                setTimeout(() => {
                    setAutomationStatus("success");
                }, 3000);
            } else {
                setAutomationStatus("failed");
                const data = await res.json();
                console.error("Fonnte failed:", data.error);
            }
        } catch (err) {
            setAutomationStatus("failed");
            console.error("Fetch error:", err);
        }

        setIsSubmitting(false);
        setStep("success");
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-lg md:max-w-2xl bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in zoom-in-95 duration-200">
                
                {/* Clean Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-4 shrink-0 bg-white">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="size-14 sm:size-16 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                            {product.image_url ? (
                                <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xl font-bold text-slate-800">{product.title.charAt(0)}</span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
                                    {product.category || "App"}
                                </span>
                                {product.tag && (
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                                        product.tagColor === "yellow" && "bg-amber-50 text-amber-700 border-amber-200/60",
                                        product.tagColor === "red" && "bg-rose-50 text-rose-700 border-rose-200/60",
                                        product.tagColor === "blue" && "bg-blue-50 text-blue-700 border-blue-200/60",
                                    )}>
                                        {product.tag}
                                    </span>
                                )}
                                {activeRefCode && (
                                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200/60 text-[10px] font-bold uppercase tracking-wider">
                                        Ref: {activeRefCode}
                                    </span>
                                )}
                            </div>
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate leading-snug">{product.title}</h2>
                            <Link 
                                href={`/products/${product.id}`}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 mt-0.5 group/link"
                            >
                                Detail & Ulasan Lengkap 
                                <ArrowRight className="size-3 group-hover/link:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-5 py-5 custom-scrollbar bg-slate-50/50">

                    {step === "payment" && (
                        <button
                            onClick={() => setStep("selection")}
                            className="mb-4 text-slate-500 hover:text-slate-800 flex items-center gap-1 text-xs font-semibold transition-colors"
                        >
                            <ChevronLeft className="size-4" />
                            Kembali ke Paket
                        </button>
                    )}

                    <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
                        {step === "selection" ? "Pilih Paket Layanan" : step === "cooldown" ? "Akses Dibatasi" : "Konfirmasi Pesanan"}
                    </h3>

                    {step === "cooldown" ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in-95 fade-in duration-300">
                            <div className="size-16 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center text-rose-600 mb-4">
                                <ShieldCheck className="size-8" />
                            </div>
                            
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Mohon Tunggu Sebentar</h3>
                            <div className="bg-white border border-rose-100 rounded-xl p-4 mb-6 max-w-sm w-full">
                                <p className="text-xs text-rose-600 font-medium mb-1">
                                    Anda baru saja melakukan transaksi baru-baru ini.
                                </p>
                                <p className="text-xs text-slate-500">
                                    Silakan order kembali dalam:
                                </p>
                                <div className="text-2xl font-extrabold text-rose-600 mt-2 font-mono">
                                    {remainingMinutes} Menit
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full max-w-sm py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
                            >
                                Mengerti & Tutup
                            </button>
                        </div>
                    ) : step === "success" ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in-95 fade-in duration-300">
                            <div className="mb-4">
                                {automationStatus === "sending" ? (
                                    <div className="size-16 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center">
                                        <Loader2 className="size-8 text-blue-600 animate-spin" />
                                    </div>
                                ) : automationStatus === "success" ? (
                                    <div className="size-16 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center text-emerald-600">
                                        <CheckCircle2 className="size-8" />
                                    </div>
                                ) : (
                                    <div className="size-16 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center text-rose-500">
                                        <MessageCircle className="size-8" />
                                    </div>
                                )}
                            </div>
                            
                            <h3 className="text-lg font-bold text-slate-900 mb-2">
                                {automationStatus === "sending" ? "Mengirim Pesan Konfirmasi..." : 
                                 automationStatus === "success" ? "Pesanan Terkonfirmasi!" : 
                                 "Pesan Belum Masuk?"}
                            </h3>
                            
                            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6 leading-relaxed">
                                {automationStatus === "sending" ? (
                                    <>Sistem sedang mengirim rincian pesanan otomatis ke WhatsApp Anda. Mohon tunggu beberapa detik...</>
                                ) : automationStatus === "success" ? (
                                    <>Pesanan <span className="text-slate-900 font-bold">{selectedPackage?.name}</span> sedang diproses. Silakan periksa pesan masuk di WhatsApp Anda.</>
                                ) : (
                                    <>Jika dalam <span className="text-rose-600 font-semibold">15 detik</span> tidak ada pesan masuk, Anda dapat langsung menghubungi admin secara manual.</>
                                )}
                            </p>

                            <div className="w-full max-w-sm space-y-3">
                                {automationStatus === "success" ? (
                                    <button
                                        onClick={onClose}
                                        className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
                                    >
                                        Selesai & Tutup
                                    </button>
                                ) : (
                                    <>
                                        {(fallbackCounter === 0 || automationStatus === "failed") && (
                                            <a 
                                                href={`https://wa.me/${adminPhone}?text=Halo%20Admin,%20saya%20sudah%20melakukan%20pesanan%20${product.title}%20(${selectedPackage?.name})%20tetapi%20belum%20menerima%20konfirmasi%20otomatis.%20Mohon%20dibantu.`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                            >
                                                <MessageCircle className="size-4" />
                                                Hubungi WhatsApp Manual
                                            </a>
                                        )}
                                        
                                        {automationStatus === "sending" && (
                                            <div className="py-2 text-xs font-medium text-slate-400 flex items-center justify-center gap-2">
                                                <Loader2 className="size-3.5 animate-spin" /> Menunggu {fallbackCounter}s untuk chat manual
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ) : step === "selection" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[...(product.packages || [])]
                                .sort((a, b) => {
                                    const aAvail = a.is_available !== false;
                                    const bAvail = b.is_available !== false;
                                    if (aAvail && !bAvail) return -1;
                                    if (!aAvail && bAvail) return 1;
                                    
                                    const aPrice = isResellerContext && a.reseller_price ? a.reseller_price : parseInt(a.price.replace(/\D/g, "")) || 0;
                                    const bPrice = isResellerContext && b.reseller_price ? b.reseller_price : parseInt(b.price.replace(/\D/g, "")) || 0;
                                    return aPrice - bPrice;
                                })
                                .map((pkg, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "bg-white border rounded-xl p-4 shadow-2xs transition-all flex flex-col justify-between",
                                        (pkg.is_available === false) 
                                            ? "opacity-60 grayscale border-slate-200 cursor-not-allowed" 
                                            : "border-slate-200/90 hover:border-blue-500 hover:shadow-xs"
                                    )}
                                >
                                    <div>
                                        <div className="flex justify-between items-start gap-2 mb-2">
                                            <h4 className="font-bold text-sm text-slate-900 leading-snug">{pkg.name}</h4>
                                            <button
                                                onClick={() => pkg.is_available !== false && handleSelectPackage(pkg)}
                                                disabled={pkg.is_available === false}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0",
                                                    pkg.is_available === false 
                                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                                                        : "bg-slate-900 hover:bg-slate-800 text-white"
                                                )}
                                            >
                                                {pkg.is_available === false ? "Habis" : "Pilih"}
                                            </button>
                                        </div>

                                        <div className="flex items-baseline gap-2 mb-3">
                                            <div className="text-base font-extrabold text-blue-600">
                                                {(() => {
                                                    const fs = !isResellerContext && activePromos?.find(f => f.package_id === pkg.id);
                                                    const rawPrice = parseInt(pkg.price.replace(/\D/g, "")) || 0;
                                                    
                                                    if (isResellerContext && pkg.reseller_price) {
                                                        return (
                                                            <div className="flex items-center gap-2">
                                                                <span>Rp {pkg.reseller_price.toLocaleString("id-ID")}</span>
                                                                <span className="text-xs font-medium text-slate-400 line-through">{pkg.price}</span>
                                                            </div>
                                                        );
                                                    }
                                                    
                                                    if (fs) {
                                                        const discounted = Math.round(rawPrice * (1 - fs.discount_percent / 100));
                                                        return (
                                                            <div className="flex items-center gap-2">
                                                                <span>Rp {discounted.toLocaleString("id-ID")}</span>
                                                                <span className="text-xs font-medium text-slate-400 line-through">{pkg.price}</span>
                                                                <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-bold">-{fs.discount_percent}%</span>
                                                            </div>
                                                        );
                                                    }
                                                    return <span>{pkg.price}</span>;
                                                })()}
                                            </div>
                                        </div>

                                        {/* Features */}
                                        <div className="space-y-1.5 pt-2.5 border-t border-slate-100 text-xs text-slate-600">
                                            {pkg.features && pkg.features.length > 0 ? (
                                                pkg.features.map((feature, i) => (
                                                    <div key={i} className="flex items-center gap-2 font-medium">
                                                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                                        <span className="truncate">{feature}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-2 font-medium">
                                                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                                        <span>Garansi {pkg.duration}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 font-medium">
                                                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                                        <span>Tipe: {pkg.type}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!product.packages || product.packages.length === 0) && (
                                <div className="col-span-full text-center py-12 border border-dashed border-slate-200 rounded-xl bg-white">
                                    <p className="text-slate-400 text-sm font-medium">Belum ada paket tersedia saat ini.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in duration-200">

                            {/* Selected Package Summary */}
                            <div className="border border-slate-200/90 rounded-xl p-4 bg-white shadow-2xs">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Paket yang dipilih</span>
                                <div className="flex items-baseline justify-between gap-4">
                                    <h4 className="font-bold text-base text-slate-900">{selectedPackage?.name}</h4>
                                    <div className="text-lg font-extrabold text-blue-600">
                                        {(() => {
                                            const fs = !isResellerContext && selectedPackage && activePromos?.find(f => f.package_id === selectedPackage.id);
                                            const rawPrice = parseInt(selectedPackage?.price?.replace(/\D/g, "") || "0");
                                            
                                            if (isResellerContext && selectedPackage?.reseller_price) {
                                                return <span>Rp {selectedPackage.reseller_price.toLocaleString("id-ID")}</span>;
                                            }

                                            if (fs) {
                                                const discounted = Math.round(rawPrice * (1 - fs.discount_percent / 100));
                                                return <span>Rp {discounted.toLocaleString("id-ID")}</span>;
                                            }
                                            return <span>{selectedPackage?.price}</span>;
                                        })()}
                                    </div>
                                </div>
                            </div>

                            {/* Customer Form */}
                            <div className="space-y-3">
                                {user ? (
                                    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Akun Terdaftar</p>
                                                <p className="text-sm font-bold text-slate-900">{customerName}</p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                            <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                <ShieldCheck className="size-4" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor WhatsApp Aktif</label>
                                            <input 
                                                type="text" 
                                                required 
                                                placeholder="Contoh: 08123456789" 
                                                value={waNumber}
                                                onChange={(e) => setWaNumber(e.target.value.replace(/\D/g, ''))}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Detail Pemesan</label>
                                            <Link href="/register" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                                                Daftar akun
                                            </Link>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Nama Lengkap</label>
                                                <input 
                                                    type="text" 
                                                    required 
                                                    placeholder="Nama Anda" 
                                                    value={customerName}
                                                    onChange={(e) => setCustomerName(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Nomor WhatsApp</label>
                                                <input 
                                                    type="text" 
                                                    required 
                                                    placeholder="08123456789" 
                                                    value={waNumber}
                                                    onChange={(e) => setWaNumber(e.target.value.replace(/\D/g, ''))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Terms & Conditions Section */}
                            <div className="space-y-2.5">
                                <TermsAndConditions 
                                    termsText={selectedPackage?.terms_and_conditions || product.terms_conditions} 
                                    productTitle={selectedPackage?.name ? `${product.title} - ${selectedPackage.name}` : product.title}
                                    maxHeight="max-h-40"
                                />

                                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors shadow-xs">
                                    <input
                                        type="checkbox"
                                        className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer shrink-0"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                    />
                                    <span className="text-xs font-semibold text-slate-800 select-none">
                                        Saya telah membaca dan menyetujui Syarat & Ketentuan di atas
                                    </span>
                                </label>
                            </div>

                            {/* Order Button */}
                            <button
                                onClick={handleOrder}
                                disabled={!agreed || !customerName || !waNumber || isSubmitting || cooldownSeconds > 0}
                                className={cn(
                                    "w-full py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                                    (agreed && customerName && waNumber && !isSubmitting && cooldownSeconds === 0)
                                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer"
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                )}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : cooldownSeconds > 0 ? (
                                    <>
                                        <span>Tunggu ({cooldownSeconds}s)</span>
                                        <Loader2 className="size-4 animate-spin opacity-50" />
                                    </>
                                ) : (
                                    <>
                                        <span>Konfirmasi via WhatsApp</span>
                                        <ArrowRight className="size-4" />
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
