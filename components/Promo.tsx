"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Zap, Clock, Share2, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";

interface PromoItem {
    id: string;
    discount_percent: number;
    label: string;
    end_time: string;
    max_orders: number;
    displayStock?: number;
    package: {
        id: string;
        name: string;
        price: string;
        product: {
            id: string;
            category_id: string;
            title: string;
            image_url?: string;
            packages?: any[];
        };
    };
}

interface PromoProps {
    onOpenProduct: (product: any) => void;
}

function useCountdown(endTime: string) {
    const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0, expired: false });

    useEffect(() => {
        const calc = () => {
            const diff = new Date(endTime).getTime() - Date.now();
            if (diff <= 0) return setTimeLeft({ h: 0, m: 0, s: 0, expired: true });
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 10000);
            setTimeLeft({ h, m, s, expired: false });
        };
        calc();
        const interval = setInterval(calc, 1000);
        return () => clearInterval(interval);
    }, [endTime]);

    return timeLeft;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="bg-blue-500 text-white font-black text-xs w-6 h-6 rounded-md flex items-center justify-center shadow-lg">
                {String(value).padStart(2, "0")}
            </div>
            <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider mt-1">{label}</span>
        </div>
    );
}

function PromoCard({ item, onOpen }: { item: PromoItem; onOpen: () => void }) {
    const { h, m, s, expired } = useCountdown(item.end_time);

    // Calculate discounted price from raw number in price string
    const rawPrice = parseInt(item.package.price.replace(/\D/g, ""), 10) || 0;
    const discounted = Math.round(rawPrice * (1 - item.discount_percent / 100));
    const discountedFormatted = `Rp ${discounted.toLocaleString("id-ID")}`;

    if (expired) return null;

    return (
        <div
            onClick={onOpen}
            className="group relative bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
        >
            {/* Discount Badge */}
            <div className="absolute top-3 right-3 bg-blue-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow">
                -{item.discount_percent}%
            </div>

            {/* Product Image */}
            <div className="w-full h-28 rounded-xl overflow-hidden bg-slate-100 mb-3 flex items-center justify-center">
                {item.package.product.image_url ? (
                    <img src={item.package.product.image_url} alt={item.package.product.title} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-4xl font-black text-slate-300">{item.package.product.title.charAt(0)}</span>
                )}
            </div>

            {/* Title */}
            <h3 className="font-black text-sm text-slate-900 truncate mb-1">{item.package.product.title}</h3>
            <p className="text-xs text-slate-500 font-bold mb-1 truncate">{item.package.name}</p>

            {/* Price */}
            <div className="mb-3">
                <p className="text-[10px] text-slate-400 line-through">{item.package.price}</p>
                <p className="text-base font-black text-[#ff2d55]">{discountedFormatted}</p>
            </div>

            {/* Scarcity Indicator */}
            {item.displayStock !== undefined && (
                <div className="mb-3">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-500 mb-1">
                        <span>Sisa kuota promo:</span>
                        <span className="text-[#ff2d55]">{item.displayStock}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-[#ff2d55] h-full rounded-full" style={{ width: `${Math.max(5, (item.displayStock / 10) * 100)}%` }}></div>
                    </div>
                </div>
            )}

            {/* Countdown */}
            <div className="flex items-center gap-1.5">
                <CountdownUnit value={h} label="Jam" />
                <span className="text-slate-400 font-black text-xs pb-3">:</span>
                <CountdownUnit value={m} label="Menit" />
                <span className="text-slate-400 font-black text-xs pb-3">:</span>
                <CountdownUnit value={s} label="Detik" />
            </div>
        </div>
    );
}

export default function Promo({ onOpenProduct }: PromoProps) {
    const [items, setItems] = useState<PromoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSharing, setIsSharing] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        async function fetch() {
            setLoading(true);
            const now = new Date().toISOString();
            const { data: sales } = await supabase
                .from("flash_sales")
                .select("*, package:packages(id, name, price, product:products(id, category_id, title, image_url, packages(*)))")
                .eq("is_active", true)
                .gte("end_time", now)
                .order("created_at", { ascending: false });

            if (sales) {
                // Fetch completed orders count for these packages to check max_orders
                const packageIds = sales.map(s => s.package_id);
                const { data: orders } = await supabase
                    .from("orders")
                    .select("package_name, product_name")
                    .eq("status", "Pesanan Selesai");

                const validSales = sales.filter(sale => {
                    if (sale.max_orders === 0) return true;
                    
                    // Count orders that match this package and product
                    const count = orders?.filter(o => 
                        o.package_name === sale.package.name && 
                        o.product_name === sale.package.product.title
                    ).length || 0;

                    return count < sale.max_orders;
                });
                const mappedSales = validSales.map(sale => {
                    let displayStock = 0;
                    if (sale.max_orders > 0) {
                        const count = orders?.filter(o => o.package_name === sale.package.name && o.product_name === sale.package.product.title).length || 0;
                        displayStock = Math.max(1, sale.max_orders - count);
                    } else {
                        // Generate deterministic random 1-5 for FOMO if no max_orders set
                        let seed = 0;
                        for(let i = 0; i < sale.id.length; i++) seed += sale.id.charCodeAt(i);
                        displayStock = (seed % 5) + 1;
                    }
                    return { ...sale, displayStock };
                });

                setItems(mappedSales as any);
            }
            setLoading(false);
        }
        fetch();
    }, []);

    if (loading || items.length === 0) return null;

    const handleShareAll = async () => {
        setIsSharing(true);
        try {
            const container = document.getElementById('twibbon-container-all');
            if (container) {
                container.style.display = 'flex';
                await new Promise(r => setTimeout(r, 500));

                const canvas = await html2canvas(container, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: null,
                    allowTaint: true,
                });
                
                container.style.display = 'none';

                const link = document.createElement("a");
                link.download = `Semua-Promo.png`;
                link.href = canvas.toDataURL("image/png");
                link.click();
            }
        } catch (error) {
            console.error("Error generating share image", error);
            alert("Gagal membuat gambar share.");
        }
        setIsSharing(false);
    };

    return (
        <section className="py-12 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200 animate-pulse">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Promo Spesial</h2>
                            <p className="text-slate-500 font-medium">Jangan lewatkan penawaran terbatas ini.</p>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-end md:items-center gap-3">
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            Berakhir Segera
                        </div>
                        <button 
                            onClick={handleShareAll}
                            disabled={isSharing}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 border border-blue-100"
                        >
                            {isSharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
                            Share Semua
                        </button>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 relative z-10">
                    {items.map((item) => (
                        <PromoCard
                            key={item.id}
                            item={item}
                            onOpen={() => onOpenProduct(item.package.product)}
                        />
                    ))}
                </div>
            </div>

            {/* Hidden Twibbon Container (1080x1920 layout) for ALL promos */}
            <div 
                id="twibbon-container-all"
                className="fixed top-[9999px] left-[9999px] w-[1080px] h-[1920px] flex flex-col items-center overflow-hidden"
                style={{ display: 'none' }}
            >
                {/* Twibbon Background */}
                <img src="/twibbon-promo.png" alt="Twibbon" className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none" crossOrigin="anonymous" />
                
                {/* Promos Grid over Twibbon */}
                <div className="absolute top-[520px] left-[90px] w-[900px] h-[850px] z-20 flex flex-col justify-center">
                    <div className="flex flex-col gap-6 w-full">
                        {items.slice(0, 2).map(item => {
                            const rawPrice = parseInt(item.package.price.replace(/\D/g, ""), 10) || 0;
                            const discounted = Math.round(rawPrice * (1 - item.discount_percent / 100));
                            const discountedFormatted = `Rp ${discounted.toLocaleString("id-ID")}`;
                            return (
                                <div key={item.id} className="bg-white rounded-[3rem] p-8 shadow-2xl flex items-center gap-8 relative border-4 border-slate-50">
                                    <div className="absolute top-6 right-6 bg-blue-500 text-white text-3xl font-black px-6 pt-1 pb-4 rounded-2xl shadow-lg flex items-center justify-center">
                                        <span className="relative -top-2">-{item.discount_percent}%</span>
                                    </div>
                                    <div className="w-[260px] h-[260px] shrink-0 rounded-[2.5rem] overflow-hidden bg-slate-100 shadow-inner border border-slate-200">
                                        {item.package.product.image_url ? (
                                            <img src={item.package.product.image_url} alt={item.package.product.title} className="w-full h-full object-cover" crossOrigin="anonymous" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-8xl font-black text-slate-300">
                                                {item.package.product.title.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col text-left justify-start flex-1 min-w-0 pr-4 h-[260px] py-1">
                                        <h3 className="font-black text-[42px] text-slate-900 w-full mb-1 leading-tight">{item.package.product.title}</h3>
                                        <p className="text-2xl text-slate-500 font-bold mb-3 w-full leading-tight">{item.package.name}</p>
                                        <div className="flex flex-col mt-auto bg-red-50 pt-4 pb-8 px-6 rounded-[2rem] border border-red-100 justify-start">
                                            <div className="relative inline-block w-fit mb-1">
                                                <p className="text-2xl text-slate-400 leading-none">{item.package.price}</p>
                                                <div className="absolute top-[80%] left-0 w-full h-[2px] bg-slate-400 -translate-y-1/2"></div>
                                            </div>
                                            <p className="text-5xl font-black text-[#ff2d55] relative -top-1">{discountedFormatted}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {items.length > 2 && (
                        <div className="text-center mt-8">
                            <span className="bg-slate-900 text-white text-3xl font-black px-10 py-4 rounded-full shadow-xl inline-block border-4 border-white">
                                + {items.length - 2} Promo Lainnya di Website!
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
