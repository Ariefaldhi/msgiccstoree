import Link from "next/link";
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
        <div className="group relative block bg-white rounded-[2.5rem] p-6 transition-all duration-300 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.1)] hover:-translate-y-1 flex flex-col items-center text-center h-full border border-slate-50 overflow-hidden">

            {/* Blurred Background Glow */}
            {image && (
                <div
                    className="absolute top-0 inset-x-0 h-40 opacity-20 blur-3xl pointer-events-none transition-opacity duration-500 group-hover:opacity-30"
                    style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
            )}

            {/* Floating Badge (Top Right) - Front of Icon */}
            {tag && (
                <div className={cn(
                    "absolute top-0 right-0 mt-8 mr-6 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase z-20 shadow-lg transform rotate-6 transition-transform group-hover:rotate-12",
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
            <div className="relative mb-6 mt-4 z-10 w-full flex justify-center">
                <div className="w-32 h-32 rounded-[2rem] bg-white p-1.5 shadow-xl shadow-slate-100/50 relative">
                    <div className="w-full h-full rounded-[1.6rem] overflow-hidden bg-slate-900 flex items-center justify-center relative">
                        {image ? (
                            <img src={image} alt={title} className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                <span className="text-4xl font-black text-white">{title.charAt(0)}</span>
                            </div>
                        )}
                    </div>
                </div>
                {/* Decorative Blur behind icon */}
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            {/* Content Info */}
            <div className="w-full mt-auto flex flex-col items-start text-left pl-2">
                <h3 className="text-lg font-black text-slate-800 line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">{title}</h3>

                <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mb-1">MULAI DARI</p>

                <div className="w-full flex items-center justify-between">
                    <span className="text-blue-600 font-black text-xl tracking-tight">{price}</span>

                    <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 group-hover:bg-blue-500 transition-all duration-300">
                            <ArrowUpRight className="h-4 w-4 stroke-[3]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
