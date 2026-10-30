"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function FloatingSupport() {
    const [isVisible, setIsVisible] = useState(false);
    const [waNumber, setWaNumber] = useState("6285720892082"); // Default
    const [hasInteracted, setHasInteracted] = useState(false);

    useEffect(() => {
        const fetchWa = async () => {
            const supabase = createClient();
            const { data } = await supabase.from("store_settings").select("whatsapp_number").eq("id", 1).single();
            if (data?.whatsapp_number) {
                setWaNumber(data.whatsapp_number);
            }
        };
        fetchWa();

        // Show popup after 5 seconds if not interacted
        const timer = setTimeout(() => {
            if (!hasInteracted) setIsVisible(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, [hasInteracted]);

    const handleOpen = () => {
        setHasInteracted(true);
        window.open(`https://wa.me/${waNumber}?text=Halo%20Admin,%20saya%20butuh%20bantuan%20mengenai%20produk%20di%20website%20ini.`, "_blank");
    };

    return (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[9999] flex flex-col items-end gap-2.5">
            
            {/* Tooltip */}
            <div className={`
                bg-white border border-slate-200 shadow-md rounded-xl p-3 pr-8 
                transform transition-all duration-300 origin-bottom-right max-w-[210px]
                ${isVisible ? "scale-100 opacity-100 translate-y-0" : "scale-75 opacity-0 translate-y-2 pointer-events-none"}
            `}>
                <button 
                    onClick={() => setIsVisible(false)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
                >
                    <X className="size-3" />
                </button>
                <p className="text-xs font-medium text-slate-700 leading-snug">
                    Butuh bantuan atau tanya produk? Admin siap membantu.
                </p>
            </div>

            {/* Floating Button */}
            <button
                onClick={handleOpen}
                onMouseEnter={() => setIsVisible(true)}
                className="size-12 md:size-13 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                aria-label="Hubungi Admin via WhatsApp"
            >
                <svg viewBox="0 0 24 24" className="size-6 text-white" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
            </button>

        </div>
    );
}
