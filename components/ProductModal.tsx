import { X, CheckCircle2, ChevronLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Package {
    name: string;
    price: string;
    duration: string;
    type: string;
    features?: string[];
}

interface Product {
    title: string;
    price: string;
    category: string;
    tag?: string;
    tagColor?: "yellow" | "red" | "blue" | "purple";
    image_url?: string;
    packages?: Package[];
}

interface ProductModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
    const [step, setStep] = useState<"selection" | "payment">("selection");
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [agreed, setAgreed] = useState(false);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setStep("selection");
            setSelectedPackage(null);
            setAgreed(false);
        }
    }, [isOpen]);

    if (!isOpen || !product) return null;

    const handleSelectPackage = (pkg: Package) => {
        setSelectedPackage(pkg);
        setStep("payment");
    };

    const handleOrder = () => {
        if (!selectedPackage || !agreed) return;

        const message = `Halo Admin, saya mau order paket ini:%0A%0A*${product.title}*%0A📦 ${selectedPackage.name}%0A💰 ${selectedPackage.price}%0A⏳ ${selectedPackage.duration}%0A%0A_Mohon diproses ya kak!_`;
        window.open(`https://wa.me/6285720892082?text=${message}`, "_blank");
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
                            {product.packages?.map((pkg, idx) => (
                                <div
                                    key={idx}
                                    className="group border border-slate-100 rounded-[2rem] p-5 bg-white shadow-sm hover:shadow-lg hover:border-blue-200 transition-all"
                                >
                                    <div className="flex flex-col gap-4">

                                        {/* Header */}
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-base text-slate-900 w-2/3">{product.title} {pkg.name}</h4>
                                            {/* Order Button in Reference Style */}
                                            <button
                                                onClick={() => handleSelectPackage(pkg)}
                                                className="bg-[#0f172a] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-[#1e293b] active:scale-95 transition-all"
                                            >
                                                ORDER
                                            </button>
                                        </div>

                                        {/* Price */}
                                        <div className="text-2xl font-black text-blue-600">
                                            {pkg.price}
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
                                <p className="text-3xl font-black text-blue-600 mb-4">{selectedPackage?.price}</p>

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
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                        Pesanan akan diproses melalui WhatsApp. Pastikan nomor WhatsApp Anda aktif.
                                    </p>
                                </div>
                            </label>

                            {/* Order Button */}
                            <button
                                onClick={handleOrder}
                                disabled={!agreed}
                                className={cn(
                                    "w-full py-4 rounded-2xl text-sm font-bold shadow-xl transition-all flex items-center justify-center gap-3",
                                    agreed
                                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-300 hover:-translate-y-1 active:scale-95 cursor-pointer"
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                                )}
                            >
                                <span>KONFIRMASI VIA WHATSAPP</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
