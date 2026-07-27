import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
    title: string;
    price: string;
    image?: string;
    tag?: string;
    tagColor?: "yellow" | "red" | "blue" | "purple" | "indigo";
    salesCount?: number;
}

export default function ProductCard({ 
    title, 
    price, 
    image, 
    tag, 
    tagColor = "yellow", 
    salesCount,
}: ProductCardProps) {

    return (
        <div className="group relative block bg-white/30 backdrop-blur-lg rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:bg-white/50 flex flex-col items-center text-center h-full border border-white/40 overflow-hidden">

            {/* Static CSS Glow instead of heavy image blur */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-400/10 to-transparent pointer-events-none" />

            {/* Floating Badge (Top Right) - Front of Icon */}
            {tag && (
                <div className={cn(
                    "absolute top-0 right-0 mt-4 md:mt-8 mr-4 md:mr-6 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-black tracking-widest uppercase z-20 shadow-lg transform rotate-6 transition-transform group-hover:rotate-12",
                    tagColor === "yellow" && "bg-yellow-400 text-black shadow-yellow-200",
                    tagColor === "red" && "bg-red-500 text-white shadow-red-200",
                    tagColor === "blue" && "bg-blue-500 text-white shadow-blue-200",
                    tagColor === "purple" && "bg-purple-500 text-white shadow-purple-200",
                    tagColor === "indigo" && "bg-indigo-600 text-white shadow-indigo-200"
                )}>
                    {tag}
                </div>
            )}

            {/* Icon Container with Glow */}
            <div className="relative mb-4 md:mb-6 mt-2 md:mt-4 z-10 w-full flex justify-center">
                <div className="w-20 h-20 md:w-32 md:h-32 rounded-[1.2rem] md:rounded-[2rem] bg-white p-1 md:p-1.5 shadow-xl shadow-slate-100/50 relative">
                    <div className="w-full h-full rounded-[1rem] md:rounded-[1.6rem] overflow-hidden bg-slate-900 flex items-center justify-center relative">
                        {image ? (
                            <Image src={image} alt={title} fill sizes="(max-width: 768px) 150px, 200px" className="object-cover transform transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                <span className="text-2xl md:text-4xl font-black text-white">{title.charAt(0)}</span>
                            </div>
                        )}
                    </div>
                </div>
                {/* Decorative Blur behind icon */}
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            {/* Content Info */}
            <div className="w-full mt-auto flex flex-col items-start text-left pl-1 md:pl-2">
                <h3 className="text-sm md:text-lg font-black text-slate-800 line-clamp-1 mb-0.5 md:mb-1 group-hover:text-blue-600 transition-colors">{title}</h3>

                <p className="text-[8px] md:text-[10px] text-slate-400 font-bold tracking-wider uppercase mb-0.5 md:mb-1">MULAI DARI</p>

                <div className="w-full flex items-center justify-between">
                    <span className="text-blue-600 font-black text-base md:text-xl tracking-tight">{price}</span>

                    <div className="flex items-center gap-2">
                         <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 group-hover:bg-blue-500 transition-all duration-300">
                            <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4 stroke-[3]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
