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
    ShieldCheck
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
          <Loader2 className="size-8 text-blue-600 animate-spin" />
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
      <div className="min-h-screen bg-slate-50 flex flex-col pt-32 pb-20">
        <main className="flex-1 container mx-auto px-4 flex flex-col items-center justify-center">
          
          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Left: Content */}
            <div className="text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2 block">
                    Kemitraan Reseller
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
                    Program Kemitraan Khusus
                </h1>
                <p className="text-slate-600 text-sm md:text-base mb-8 max-w-sm leading-relaxed font-normal">
                    Dapatkan akses eksklusif ke harga dasar layanan untuk mempermudah penjualan ulang Anda.
                </p>

                <div className="space-y-3 mb-8">
                    {[
                        "Akses Harga Supplier Secara Langsung",
                        "Prioritas Layanan Bantuan Admin WhatsApp",
                        "Tanpa Syarat Minimal Transaksi Bulanan"
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <CheckCircle2 className="size-4 text-blue-600 shrink-0" />
                            <span className="font-semibold text-slate-700 text-sm">{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Registration Card */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xs border border-slate-200/90 flex flex-col items-center text-center">
                
                <div className="size-14 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <Store className="size-7" />
                </div>

                <h2 className="text-xl font-bold text-slate-900 mb-1">Akses Kemitraan</h2>
                <p className="text-slate-500 text-xs mb-6">Biaya pendaftaran sekali untuk akses selamanya.</p>

                <div className="mb-8 flex flex-col items-center">
                    <span className="text-xs font-semibold text-slate-400 line-through mb-1">Rp 25.000</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-slate-900">Rp</span>
                        <span className="text-4xl font-extrabold text-slate-900 tracking-tight">15.000</span>
                    </div>
                </div>

                {user ? (
                    <a href={waLink} target="_blank" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs">
                        Hubungi Admin Sekarang <ArrowRight className="size-4" />
                    </a>
                ) : (
                    <Link href="/login" className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs">
                        Masuk untuk Melanjutkan <ArrowRight className="size-4" />
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
        
        <div className="flex items-center justify-between mb-8 bg-white p-5 md:p-6 rounded-2xl border border-slate-200/90 shadow-xs">
           <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Katalog Khusus Mitra Reseller</h1>
              <p className="text-slate-500 mt-0.5 text-xs md:text-sm font-normal">Harga modal reseller otomatis aktif untuk akun Anda.</p>
           </div>
           <div className="flex flex-col items-end">
              <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold text-xs flex items-center gap-1.5 border border-emerald-200">
                 <ShieldCheck className="size-3.5" /> Mitra Aktif
              </div>
           </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 md:gap-4">
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
