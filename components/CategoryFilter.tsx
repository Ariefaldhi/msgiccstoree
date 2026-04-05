import { Search, LayoutGrid } from "lucide-react";
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
    // Removed onSearch from here as it's better handled in parent or separate component for layout reasons, 
    // but keeping prop signature if parent uses it. 
    // Actually, looking at page.tsx, it passes `categories`, `activeCategory`, `onSelectCategory`.
    // The search input is inside this component in the design.
}

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
                            "px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 border flex items-center gap-2",
                            activeCategory === "Semua"
                                ? "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20"
                                : "bg-white text-gray-500 border-gray-100 shadow-sm hover:translate-y-[-2px] hover:shadow-md"
                        )}
                    >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        Semua
                    </button>

                    {/* Dynamic Categories from DB */}
                    {categories.map((cat) => (
                        <button
                            key={cat.slug}
                            onClick={() => onSelectCategory(cat.name)}
                            className={cn(
                                "px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 border flex items-center gap-2",
                                activeCategory === cat.name
                                    ? "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20"
                                    : "bg-white text-gray-500 border-gray-100 shadow-sm hover:translate-y-[-2px] hover:shadow-md"
                            )}
                        >
                            <span>{cat.icon || "📦"}</span>
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Search removed from here and moved to parent for better layout control */}
            </div>
        </div>
    );
}
