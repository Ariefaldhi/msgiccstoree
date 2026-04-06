"use client";

import { useState, useEffect } from "react";
import Promo from "@/components/Promo";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

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
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Fetch Categories
      const { data: cats, error: catError } = await supabase.from("categories").select("*").order("created_at", { ascending: true });
      if (catError) console.error("❌ Categories fetch error:", catError.message);
      if (cats) setCategories(cats);

      // Fetch Products (with packages)
      const { data: prods, error: prodError } = await supabase
        .from("products")
        .select("*, packages(*)")
        .order("created_at", { ascending: false });

      if (prodError) console.error("❌ Products fetch error:", prodError.message);
      if (prods) setProducts(prods);

      // Fetch Active Flash Sales mapping
      const now = new Date().toISOString();
      const { data: sales, error: saleError } = await supabase
        .from("flash_sales")
        .select("package_id, discount_percent, max_orders, package:packages(name, product:products(title))")
        .eq("is_active", true)
        .gte("end_time", now);
      
      if (sales) {
        // Fetch completed orders to check limits for global application
        const { data: orders } = await supabase
          .from("orders")
          .select("package_name, product_name")
          .eq("status", "Pesanan Selesai");

        const validSales = sales.filter(sale => {
          if (sale.max_orders === 0) return true;
          const count = orders?.filter(o => 
            o.package_name === (sale.package as any).name && 
            o.product_name === (sale.package as any).product.title
          ).length || 0;
          return count < sale.max_orders;
        });

        setActivePromos(validSales);
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
  });

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Promo Section - replaces Hero, auto-hides if no active promos */}
      <div className="pt-28">
        <Promo onOpenProduct={(p) => { setSelectedProduct(p); setIsModalOpen(true); }} />
      </div>

      <section id="products" className="container mx-auto px-4 py-8 relative z-20">
        <CategoryFilter
          categories={filterCategories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        {/* Search Input - Mobile/Desktop */}
        <div className="mb-10 max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-bold text-sm text-slate-800 placeholder:text-gray-400 shadow-sm"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>

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
                  href="#" // Prevent navigation, handle with onClick
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

      <ProductModal
        product={selectedProduct ? {
          ...selectedProduct,
          category: categories.find(c => c.id === selectedProduct.category_id)?.name || "Unknown",
          packages: selectedProduct.packages
        } : null}
        flashSales={activePromos}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
