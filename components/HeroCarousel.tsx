"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";

interface Banner {
  id: string;
  product_id: string;
  title: string;
  subtitle: string;
  discount_text: string;
  tag: string;
  is_active: boolean;
  products?: {
    id: string;
    title: string;
    image_url: string;
  };
}

interface HeroCarouselProps {
  banners: Banner[];
}

export default function HeroCarousel({ banners }: HeroCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll logic (simple loop)
  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto mb-16 px-4">
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-4 mask-fade-right"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {banners.map((banner) => (
          <div 
            key={banner.id} 
            className={`min-w-[85%] md:min-w-[50%] lg:min-w-[40%] snap-center shrink-0 relative rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 overflow-hidden flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.06)] bg-white/60 backdrop-blur-3xl border border-white min-h-[160px] md:min-h-[180px] group transition-all duration-300 hover:shadow-[0_12px_35px_rgb(0,0,0,0.1)] cursor-pointer hover:-translate-y-1`}
            onClick={() => {
              // Scroll to product logic could go here if needed
              const el = document.getElementById("products");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            {/* Premium Blurred Background */}
            {banner.products?.image_url && (
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-10 blur-2xl group-hover:opacity-20 group-hover:scale-110 transition-all duration-700 z-0 pointer-events-none"
                    style={{ backgroundImage: `url(${banner.products.image_url})` }}
                />
            )}
            
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 mb-3 opacity-90">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.8)]"></div>
                 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                   {banner.tag}
                 </span>
              </div>
              <h3 className="text-xl md:text-2xl font-black leading-tight mb-1 md:mb-1.5 text-slate-900 drop-shadow-sm">
                {banner.title}
              </h3>
              <p className="text-slate-500 font-medium text-xs md:text-sm leading-relaxed max-w-[90%]">
                {banner.subtitle}
              </p>
            </div>
            
            <div className="relative z-10 flex items-center justify-between mt-5 md:mt-6">
              <span className="text-xs md:text-sm font-black bg-slate-900 text-white px-4 py-2 rounded-[0.8rem] shadow-lg shadow-slate-900/20">
                {banner.discount_text}
              </span>
              <button className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white text-slate-900 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-md">
                <ChevronRight className="w-4 h-4 md:w-4 md:h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
