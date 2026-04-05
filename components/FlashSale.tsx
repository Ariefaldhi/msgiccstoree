"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Zap, Clock } from "lucide-react";

interface FlashSaleItem {
    id: string;
    discount_percent: number;
    label: string;
    end_time: string;
    max_orders: number;
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

interface FlashSaleProps {
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
            const s = Math.floor((diff % 60000) / 1000);
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

function FlashCard({ item, onOpen }: { item: FlashSaleItem; onOpen: () => void }) {
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

export default function FlashSale({ onOpenProduct }: FlashSaleProps) {
    const [items, setItems] = useState<FlashSaleItem[]>([]);
    const [loading, setLoading] = useState(true);
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

                setItems(validSales as any);
            }
            setLoading(false);
        }
        fetch();
    }, []);

    if (loading || items.length === 0) return null;

    return (
        <section className="container mx-auto px-4 pb-4">
            <div className="bg-gradient-to-br from-[#0f172a] to-[#020617] rounded-[2rem] p-6 md:p-8 border border-blue-500/20 shadow-2xl relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Zap className="w-5 h-5 text-white fill-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight">FLASH SALE</h2>
                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Penawaran Terbatas!</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        Berakhir Segera
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 relative z-10">
                    {items.map((item) => (
                        <FlashCard
                            key={item.id}
                            item={item}
                            onOpen={() => onOpenProduct(item.package.product)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
