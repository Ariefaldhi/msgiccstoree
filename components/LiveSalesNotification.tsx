"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, X } from "lucide-react";

interface RecentOrder {
    customer_name: string;
    product_name: string;
    package_name: string;
}

export default function LiveSalesNotification() {
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const fetchOrders = async () => {
            const { data } = await supabase
                .from("orders")
                .select("customer_name, product_name, package_name")
                .eq("status", "Pesanan Selesai")
                .order("created_at", { ascending: false })
                .limit(10);
            
            if (data && data.length > 0) {
                // Obscure names slightly for privacy (e.g. Budi -> Bud***)
                const masked = data.map(o => {
                    const name = o.customer_name || "Seseorang";
                    const maskedName = name.length > 3 ? name.substring(0, 3) + "***" : name + "***";
                    return { ...o, customer_name: maskedName };
                });
                setRecentOrders(masked);
            }
        };

        fetchOrders();
    }, [supabase]);

    useEffect(() => {
        if (recentOrders.length === 0) return;

        const showNextNotification = () => {
            setIsVisible(true);
            
            // Hide after 5 seconds
            setTimeout(() => {
                setIsVisible(false);
            }, 5000);
            
            // Next item logic
            setTimeout(() => {
                setCurrentIndex(prev => (prev + 1) % recentOrders.length);
            }, 5500); // Wait until fade out finishes before switching data
        };

        // Show the first one after a short delay
        const initialDelay = setTimeout(showNextNotification, 2000);
        
        // Then show one every 15 seconds
        const interval = setInterval(showNextNotification, 15000);
        
        return () => {
            clearTimeout(initialDelay);
            clearInterval(interval);
        };
    }, [recentOrders]);

    if (recentOrders.length === 0) return null;

    const currentOrder = recentOrders[currentIndex];

    return (
        <div 
            className={`fixed bottom-24 left-4 md:bottom-6 md:left-6 z-[100] max-w-[280px] md:max-w-[300px] w-full transition-all duration-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}
        >
            <div className="bg-white/90 backdrop-blur-md border border-slate-100 shadow-2xl rounded-2xl p-3 flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>
                <div className="flex-1 min-w-0 pr-4">
                    <p className="text-xs text-slate-500 font-medium">Seseorang baru saja membeli</p>
                    <p className="text-sm font-black text-slate-900 leading-tight mt-0.5">
                        <span className="text-blue-600">{currentOrder.customer_name}</span> membeli {currentOrder.package_name} {currentOrder.product_name}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold">Beberapa saat yang lalu</p>
                </div>
                <button 
                    onClick={() => setIsVisible(false)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
