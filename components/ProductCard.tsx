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
        <div className="group relative bg-white rounded-2xl border border-slate-200/80 p-3.5 md:p-4 transition-all duration-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-full overflow-hidden">

            {/* Clean Tag Badge (Straight, Professional) */}
            {tag && (
                <div className={cn(
                    "absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider z-10 border",
                    tagColor === "yellow" && "bg-amber-50 text-amber-700 border-amber-200/80",
                    tagColor === "red" && "bg-rose-50 text-rose-700 border-rose-200/80",
                    tagColor === "blue" && "bg-blue-50 text-blue-700 border-blue-200/80",
                    tagColor === "purple" && "bg-purple-50 text-purple-700 border-purple-200/80",
                    tagColor === "indigo" && "bg-indigo-50 text-indigo-700 border-indigo-200/80"
                )}>
                    {tag}
                </div>
            )}

            {/* Image / Icon Container */}
            <div className="w-full flex justify-center pt-2 pb-3">
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center relative shadow-xs">
                    {image ? (
                        <img 
                            src={image} 
                            alt={title} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                            <span className="text-2xl md:text-3xl font-extrabold text-white">{title.charAt(0)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Info */}
            <div className="w-full mt-auto flex flex-col">
                <h3 className="text-sm md:text-base font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {title}
                </h3>

                <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">
                    Mulai dari
                </p>

                <div className="w-full flex items-center justify-between mt-1">
                    <span className="text-blue-600 font-extrabold text-base md:text-lg tracking-tight">
                        {price}
                    </span>

                    <div className="size-7 md:size-8 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                        <ArrowUpRight className="size-4 stroke-[2.5]" />
                    </div>
                </div>
            </div>
        </div>
    );
}
