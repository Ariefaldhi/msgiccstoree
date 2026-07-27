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
import { Loader2, Flame } from "lucide-react";

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
        
        {/* Massive Hero Typography & Glass Search Input */}
        <div className="mb-14 max-w-3xl mx-auto text-center mt-2">
          <h1 className="text-4xl md:text-[3.5rem] leading-tight font-heading font-black text-slate-900 tracking-tighter mb-8 drop-shadow-sm">
            Aplikasi Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Favoritmu</span>
          </h1>
          <div className="relative group max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <input
              id="search-input"
              type="text"
              placeholder="Cari aplikasi premium favoritmu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative w-full pl-14 pr-6 py-4 md:py-5 rounded-full bg-white/30 backdrop-blur-3xl border border-white/40 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:bg-white/60 transition-all font-bold text-base md:text-lg text-slate-800 placeholder:text-slate-500 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
            />
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>

          {/* Trending Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" /> Trending:
            </span>
            {(() => {
                const tags = Object.keys(salesCounts).length > 0 
                  ? Array.from(new Set(Object.entries(salesCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([name]) => name.split(" ")[0])))
                      .slice(0, 3)
                  : ["Netflix", "Canva", "Spotify"]; // Fallback if no sales yet
                
                return tags.map((tag) => (
                  <button 
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-4 py-1.5 rounded-full bg-white/40 backdrop-blur-md border border-white/50 text-xs font-bold text-slate-600 hover:bg-white/70 hover:scale-105 transition-all shadow-sm"
                  >
                    {tag}
                  </button>
                ));
            })()}
          </div>

          {/* Trust Badges Removed */}
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
