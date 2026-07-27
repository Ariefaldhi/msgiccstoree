import { Search, LayoutGrid, Tv, Music, Palette, Shield, Gamepad2, Crown, Wrench, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
    name: string;
    slug: string;
    icon?: string; // Expecting emoji or icon name from DB
}

interface CategoryFilterProps {
    categories: Category[]; // Now receiving full category objects
    activeCategory: string;
    onSelectCategory: (category: string) => void;
}

const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('stream') || lower.includes('tv') || lower.includes('film')) return <Tv className="w-3.5 h-3.5" />;
    if (lower.includes('musik') || lower.includes('audio') || lower.includes('spotify')) return <Music className="w-3.5 h-3.5" />;
    if (lower.includes('desain') || lower.includes('edit') || lower.includes('canva')) return <Palette className="w-3.5 h-3.5" />;
    if (lower.includes('vpn') || lower.includes('security')) return <Shield className="w-3.5 h-3.5" />;
    if (lower.includes('game') || lower.includes('topup')) return <Gamepad2 className="w-3.5 h-3.5" />;
    if (lower.includes('premium') || lower.includes('pro')) return <Crown className="w-3.5 h-3.5" />;
    if (lower.includes('tool') || lower.includes('bot') || lower.includes('ai')) return <Wrench className="w-3.5 h-3.5" />;
    return <Package className="w-3.5 h-3.5" />;
};

export default function CategoryFilter({ categories, activeCategory, onSelectCategory }: CategoryFilterProps) {
    return (
        <div className="container mx-auto px-4 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Categories */}
                <div className="flex items-center gap-3 overflow-x-auto pb-4 md:pb-0 scrollbar-hide mask-fade-right">

                    {/* "Semua" Button */}
                    <button
                        onClick={() => onSelectCategory("Semua")}
                        className={cn(
                            "px-5 py-2.5 rounded-[1.25rem] text-xs font-bold whitespace-nowrap transition-all duration-300 border flex items-center gap-2 backdrop-blur-xl",
                            activeCategory === "Semua"
                                ? "bg-white/60 text-blue-700 border-white/60 shadow-[0_4px_20px_rgba(37,99,235,0.15)]"
                                : "bg-white/20 text-slate-600 border-white/30 shadow-sm hover:translate-y-[-2px] hover:bg-white/40"
                        )}
                    >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        Semua
                    </button>

                    {/* Category Buttons from DB */}
                    {categories.map((cat, idx) => {
                        const isActive = activeCategory === cat.name;
                        return (
                            <button
                                key={idx}
                                onClick={() => onSelectCategory(cat.name)}
                                className={cn(
                                    "px-5 py-2.5 rounded-[1.25rem] text-xs font-bold whitespace-nowrap transition-all duration-300 border flex items-center gap-2 backdrop-blur-xl",
                                    isActive
                                        ? "bg-white/60 text-blue-700 border-white/60 shadow-[0_4px_20px_rgba(37,99,235,0.15)]"
                                        : "bg-white/20 text-slate-600 border-white/30 shadow-sm hover:translate-y-[-2px] hover:bg-white/40"
                                )}
                            >
                                {getCategoryIcon(cat.name)}
                                {cat.name}
                            </button>
                        );
                    })}
                </div>

                {/* Search removed from here and moved to parent for better layout control */}
            </div>
        </div>
    );
}
