"use client";

import { useState, useEffect } from "react";
import Promo from "@/components/Promo";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import LiveSalesNotification from "@/components/LiveSalesNotification";
import HeroCarousel from "@/components/HeroCarousel";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Flame, Search, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

interface Product {
  id: string;
  category_id: string;
  title: string;
  price: string;
  tag?: string;
  tagColor?: "yellow" | "red" | "blue" | "purple";
  image_url?: string;
  packages?: any[];
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activePromos, setActivePromos] = useState<any[]>([]);
  const [heroBanners, setHeroBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [salesCounts, setSalesCounts] = useState<Record<string, number>>({});
  const [isAffiliator, setIsAffiliator] = useState(false);
  const [commissionPercent, setCommissionPercent] = useState(25);

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const now = new Date().toISOString();

      const [
        { data: allCompletedOrders },
        { data: cats, error: catError },
        { data: prods, error: prodError },
        { data: sales },
        { data: banners, error: bannerError },
        { data: { user } },
        { data: settings }
      ] = await Promise.all([
        fetch('/api/stats').then(r => r.json()).then(d => ({ data: d.orders })).catch(() => ({ data: null })),
        supabase.from("categories").select("*").order("created_at", { ascending: true }),
        supabase.from("products").select("*, packages(*)").order("created_at", { ascending: false }),
        supabase.from("flash_sales").select("package_id, discount_percent, max_orders, package:packages(name, product:products(title))").eq("is_active", true).gte("end_time", now),
        supabase.from("hero_banners").select("*, products(id, title, image_url)").eq("is_active", true).order("created_at", { ascending: false }),
        supabase.auth.getUser(),
        supabase.from("store_settings").select("affiliate_commission_percent").eq("id", 1).single()
      ]);

      if (allCompletedOrders) {
        const counts: Record<string, number> = {};
        allCompletedOrders.forEach((o: any) => {
          counts[o.product_name] = (counts[o.product_name] || 0) + 1;
        });
        setSalesCounts(counts);
      }

      if (catError) console.error("❌ Categories fetch error:", catError.message);
      if (cats) setCategories(cats);

      if (prodError) console.error("❌ Products fetch error:", prodError.message);
      if (prods) setProducts(prods);

      if (sales) {
        const validSales = sales.filter(sale => {
          if (sale.max_orders === 0) return true;
          const count = allCompletedOrders?.filter((o: any) => 
            o.package_name === (sale.package as any).name && 
            o.product_name === (sale.package as any).product.title
          ).length || 0;
          return count < sale.max_orders;
        });
        setActivePromos(validSales);
      }

      if (bannerError) console.error("❌ Banners fetch error:", bannerError.message);
      if (banners) setHeroBanners(banners);

      if (user) {
        const { data: profile } = await supabase.from("profiles").select("is_affiliator, role").eq("id", user.id).single();
        if (profile?.is_affiliator || profile?.role === 'admin') {
          setIsAffiliator(true);
        }
      }

      if (settings?.affiliate_commission_percent) {
        setCommissionPercent(settings.affiliate_commission_percent);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  // Prepare categories for Filter Component
  // REMOVED: Manually prepended "Semua" to avoid duplication with CategoryFilter's internal button
  const filterCategories = categories.map(c => ({
    name: c.name,
    slug: c.slug,
    icon: c.icon
  }));

  // Filter Products
  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "Semua" ||
      categories.find(c => c.id === product.category_id)?.name === activeCategory;

    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    // Sort by sales count (popularity)
    const salesA = salesCounts[a.title] || 0;
    const salesB = salesCounts[b.title] || 0;
    
    if (salesB !== salesA) {
      return salesB - salesA;
    }
    
    // Deterministic fallback (prevent shuffling)
    return b.id.localeCompare(a.id);
  });

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const searchParam = new URLSearchParams(window.location.search).get("search");
    if (searchParam === "true") {
      const input = document.getElementById("search-input");
      if (input) {
        input.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => (input as HTMLInputElement).focus(), 500);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-transparent">


      <section id="products" className="container mx-auto px-4 pb-8 relative z-20">
        
        {/* Hero & Search */}
        <div className="mb-12 max-w-3xl mx-auto text-center pt-6 md:pt-10">
          <h1 className="text-3xl md:text-[2.75rem] font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-3">
            Akun Premium Resmi,<br className="hidden sm:block" />{" "}
            <span className="text-blue-600">Harga Terbaik</span>
          </h1>
          <p className="text-slate-500 text-sm md:text-base max-w-md mx-auto mb-8 leading-relaxed">
            Netflix, Spotify, Canva, dan ratusan layanan lainnya — proses instan, garansi penuh, tanpa ribet.
          </p>

          <div className="relative max-w-2xl mx-auto">
            <div className="relative flex items-center bg-white rounded-2xl border border-slate-200/90 shadow-sm focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-600/10 transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
              <input
                id="search-input"
                type="text"
                placeholder="Cari Netflix, Spotify, Canva, YouTube Premium..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-3.5 md:py-4 bg-transparent text-slate-900 placeholder:text-slate-400 text-sm md:text-base font-medium focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mr-3 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Trending Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-500" /> Trending:
            </span>
            {(() => {
                const tags = Object.keys(salesCounts).length > 0 
                  ? Array.from(new Set(Object.entries(salesCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([name]) => name.split(" ")[0])))
                      .slice(0, 3)
                  : ["Netflix", "Canva", "Spotify"];
                
                return tags.map((tag) => (
                  <button 
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-xs"
                  >
                    {tag}
                  </button>
                ));
            })()}
          </div>
        </div>

        {/* Promo Section */}
        <div className="mb-12">
          <Promo onOpenProduct={(p) => { setSelectedProduct(p); setIsModalOpen(true); }} />
        </div>

        <CategoryFilter
          categories={filterCategories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-8 pb-20">
            {filteredProducts.map((product) => (
              <div key={product.id} onClick={() => handleProductClick(product)} className="cursor-pointer">
                <ProductCard
                  title={product.title}
                  price={product.price}
                  image={product.image_url}
                  tag={product.tag}
                  tagColor={product.tagColor}
                  salesCount={salesCounts[product.title] || 0}
                />
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-20">
                <p className="text-gray-400 font-bold text-lg">Tidak ada produk ditemukan.</p>
              </div>
            )}
          </div>
        )}
      </section>

      <HeroCarousel banners={heroBanners} />
      <HowItWorks />
      <FAQ />

      <ProductModal
        product={selectedProduct ? {
          ...selectedProduct,
          category: categories.find(c => c.id === selectedProduct.category_id)?.name || "Unknown",
          packages: selectedProduct.packages
        } : null}
        activePromos={activePromos}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isAffiliator={isAffiliator}
        commissionPercent={commissionPercent}
      />
      
      <LiveSalesNotification />
    </div>
  );
}
