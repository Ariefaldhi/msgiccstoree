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
    }, 4500);
    return () => clearInterval(interval);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto mb-16 px-4">
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {banners.map((banner) => (
          <div 
            key={banner.id} 
            className="min-w-[85%] md:min-w-[48%] lg:min-w-[40%] snap-center shrink-0 relative rounded-2xl p-5 md:p-6 bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[160px] md:min-h-[175px] group"
            onClick={() => {
              const el = document.getElementById("products");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                 <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 text-[10px] font-bold uppercase tracking-wider">
                   {banner.tag}
                 </span>
              </div>
              <h3 className="text-base md:text-lg font-bold text-slate-900 leading-snug mb-1 group-hover:text-blue-600 transition-colors">
                {banner.title}
              </h3>
              <p className="text-slate-500 font-normal text-xs md:text-sm leading-relaxed line-clamp-2">
                {banner.subtitle}
              </p>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
              <span className="text-xs font-bold bg-slate-900 text-white px-3 py-1.5 rounded-lg shadow-2xs">
                {banner.discount_text}
              </span>
              <div className="size-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ChevronRight className="size-4 stroke-[2.5]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
