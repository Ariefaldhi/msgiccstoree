import { LayoutGrid, Tv, Music, Palette, Shield, Gamepad2, Crown, Wrench, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
    name: string;
    slug: string;
    icon?: string;
}

interface CategoryFilterProps {
    categories: Category[];
    activeCategory: string;
    onSelectCategory: (category: string) => void;
}

const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('stream') || lower.includes('tv') || lower.includes('film')) return <Tv className="size-3.5" />;
    if (lower.includes('musik') || lower.includes('audio') || lower.includes('spotify')) return <Music className="size-3.5" />;
    if (lower.includes('desain') || lower.includes('edit') || lower.includes('canva')) return <Palette className="size-3.5" />;
    if (lower.includes('vpn') || lower.includes('security')) return <Shield className="size-3.5" />;
    if (lower.includes('game') || lower.includes('topup')) return <Gamepad2 className="size-3.5" />;
    if (lower.includes('premium') || lower.includes('pro')) return <Crown className="size-3.5" />;
    if (lower.includes('tool') || lower.includes('bot') || lower.includes('ai')) return <Wrench className="size-3.5" />;
    return <Package className="size-3.5" />;
};

export default function CategoryFilter({ categories, activeCategory, onSelectCategory }: CategoryFilterProps) {
    return (
        <div className="container mx-auto px-4 mb-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {/* "Semua" Button */}
                <button
                    onClick={() => onSelectCategory("Semua")}
                    className={cn(
                        "px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border flex items-center gap-2 shrink-0 shadow-2xs",
                        activeCategory === "Semua"
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200/80"
                    )}
                >
                    <LayoutGrid className="size-3.5" />
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
                                "px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border flex items-center gap-2 shrink-0 shadow-2xs",
                                isActive
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200/80"
                            )}
                        >
                            {getCategoryIcon(cat.name)}
                            {cat.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
