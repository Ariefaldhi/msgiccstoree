"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import { createClient } from "@/lib/supabase/client";
import { 
    Loader2, 
    Store, 
    ArrowRight, 
    CheckCircle2, 
    ShieldCheck, 
    Zap, 
    TrendingUp, 
    Smartphone,
    Rocket
} from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  category_id: string;
  title: string;
  price: string;
  image_url?: string;
  packages?: any[];
}

export default function ResellerPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminPhone, setAdminPhone] = useState("6281234567890");
  const [salesCounts, setSalesCounts] = useState<Record<string, number>>({});

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const { data: salesStats } = await supabase.from("orders").select("product_name").eq("status", "Pesanan Selesai");
      if (salesStats) {
        const counts: Record<string, number> = {};
        salesStats.forEach(s => {
          counts[s.product_name] = (counts[s.product_name] || 0) + 1;
        });
        setSalesCounts(counts);
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setProfile(prof);
      }

      const { data: prods } = await supabase
        .from("products")
        .select("*, packages(*)")
        .order("created_at", { ascending: false });
      
      if (prods) setProducts(prods);

      const { data: settings } = await supabase.from("store_settings").select("whatsapp_number").eq("id", 1).single();
      if (settings?.whatsapp_number) setAdminPhone(settings.whatsapp_number);

      setLoading(false);
    }
    fetchData();
  }, []);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  if (loading) {
      return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
      );
  }

  const isAdmin = profile?.role === 'admin';
  const isReseller = (profile?.is_reseller === true) || isAdmin;

  if (!isReseller) {
    const waText = user 
      ? `Halo Admin, saya ingin mendaftar menjadi Mitra. Akun email saya: ${user.email}`
      : `Halo Admin, saya ingin mendaftar menjadi Mitra.`;
    const waLink = `https://wa.me/${adminPhone}?text=${encodeURIComponent(waText)}`;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col pt-32 pb-20 overflow-hidden relative">
        <main className="flex-1 container mx-auto px-4 flex flex-col items-center justify-center relative z-10">
          
          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            
            {/* Left: Content */}
            <div className="text-left">
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                    Program Kemitraan Khusus
                </h1>
                <p className="text-slate-600 font-medium text-sm md:text-base mb-10 max-w-sm leading-relaxed">
                    Dapatkan akses eksklusif ke harga dasar layanan untuk mempermudah penjualan ulang Anda.
                </p>

                <div className="space-y-4 mb-10">
                    {[
                        "Akses Harga Supplier Secara Langsung",
                        "Prioritas Layanan Bantuan Admin",
                        "Tanpa Syarat Minimal Transaksi"
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                            <span className="font-bold text-slate-700 text-sm">{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Registration Card */}
            <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 relative flex flex-col items-center text-center">
                
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-slate-200">
                    <Store className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-xl font-black text-slate-900 mb-1">Akses Kemitraan</h2>
                <p className="text-slate-500 font-medium text-xs mb-8">Pembayaran satu kali, akses selamanya.</p>

                <div className="mb-10 flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-400 line-through mb-1">Rp 25.000</span>
                    <div className="flex items-start gap-1">
                        <span className="text-sm font-bold text-slate-900 mt-1.5">Rp</span>
                        <span className="text-5xl font-black text-slate-900 tracking-tighter">15.000</span>
                    </div>
                </div>

                {user ? (
                    <a href={waLink} target="_blank" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95">
                        Hubungi Admin Sekarang <ArrowRight className="w-4 h-4" />
                    </a>
                ) : (
                    <Link href="/login" className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95">
                        Masuk untuk Melanjutkan <ArrowRight className="w-4 h-4" />
                    </Link>
                )}

            </div>
          </div>
        </main>
      </div>
    );
  }

  // Calculate cheapest reseller price for each product
  const getProductResellerPrice = (product: Product) => {
    if (!product.packages || product.packages.length === 0) return "Cek Detail";
    
    const minPrice = Math.min(...product.packages.map(p => p.reseller_price || 0));
    if (minPrice === 0) return "Cek Detail";
    
    return `Mulai Rp ${minPrice.toLocaleString('id-ID')}`;
  };

  // Reseller Connected View
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-32 pb-20">
      <main className="flex-1 container mx-auto px-4 max-w-6xl">
        
        <div className="flex items-center justify-between mb-12 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
           <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Katalog Khusus Mitra</h1>
              <p className="text-slate-500 mt-1 font-medium text-sm">Harga modal otomatis aktif untuk akun Anda.</p>
           </div>
           <div className="flex flex-col items-end">
              <div className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-bold text-xs flex items-center gap-1.5 border border-blue-100">
                 <ShieldCheck className="w-4 h-4" /> AKTIF
              </div>
           </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {[...products].sort((a, b) => {
            const sa = salesCounts[a.title] || 0;
            const sb = salesCounts[b.title] || 0;
            return sb - sa;
          }).map((product) => (
            <div key={product.id} onClick={() => handleProductClick(product)} className="cursor-pointer">
              <ProductCard
                title={product.title}
                salesCount={salesCounts[product.title] || 0}
                price={getProductResellerPrice(product)}
                image={product.image_url}
                tag="MITRA"
                tagColor="blue"
              />
            </div>
          ))}
        </div>

      </main>

      <ProductModal
        product={selectedProduct ? { ...selectedProduct, category: 'Mitra', packages: selectedProduct.packages } : null}
        activePromos={[]} 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isResellerContext={true}
      />
    </div>
  );
}
