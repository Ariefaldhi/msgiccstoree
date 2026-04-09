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
      <div className="min-h-screen bg-white pt-32 pb-20">
        <div className="flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      </div>
      );
  }

  const isAdmin = profile?.role === 'admin';
  const isReseller = (profile?.is_reseller === true) || isAdmin;

  if (!isReseller) {
    const waText = user 
      ? `Halo Admin, saya ingin mendaftar menjadi Reseller. Akun email saya: ${user.email}`
      : `Halo Admin, saya ingin mendaftar menjadi Reseller.`;
    const waLink = `https://wa.me/${adminPhone}?text=${encodeURIComponent(waText)}`;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col pt-32 pb-20 overflow-hidden relative">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

        <main className="flex-1 container mx-auto px-4 flex flex-col items-center justify-center relative z-10">
          
          <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Content */}
            <div className="text-left">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                    Mulai Bisnis <br /> 
                    <span className="text-blue-600 italic">Top-Up Digital</span> <br />
                    Dari Sekarang!
                </h1>
                <p className="text-slate-500 font-medium text-lg mb-8 leading-relaxed">
                    Dapatkan akses ke harga modal (supplier) yang jauh lebih murah. Jual kembali di platform Anda sendiri dan raup profit maksimal setiap hari.
                </p>

                <div className="space-y-4 mb-10">
                    {[
                        { title: "Harga Supplier (VIP)", icon: <Zap className="w-5 h-5 text-amber-500" /> },
                        { title: "Proses Instan & Otomatis", icon: <TrendingUp className="w-5 h-5 text-emerald-500" /> },
                        { title: "Dukungan Admin 24/7", icon: <ShieldCheck className="w-5 h-5 text-blue-500" /> },
                        { title: "Aplikasi Mobile Friendly", icon: <Smartphone className="w-5 h-5 text-purple-500" /> }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-sm hover:shadow-md transition-all">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                {item.icon}
                            </div>
                            <span className="font-black text-slate-800 text-sm uppercase tracking-tight">{item.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Registration Card */}
            <div className="bg-white rounded-[3.5rem] p-8 md:p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border border-slate-100 relative text-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-200 border-4 border-white rotate-6">
                    <Store className="w-12 h-12 text-white" />
                </div>

                <h2 className="text-2xl font-black text-slate-900 mb-2 italic uppercase">Daftar Reseller</h2>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-8">One-time payment for lifetime access</p>

                <div className="bg-slate-50 rounded-[2rem] py-8 mb-10 relative overflow-hidden group">
                    <div className="relative z-10">
                        <span className="text-sm font-black text-slate-400 line-through block mb-1 opacity-50">Rp 25.000</span>
                        <div className="flex items-center justify-center gap-1">
                            <span className="text-xl font-black text-blue-600 mt-2">Rp</span>
                            <span className="text-6xl font-black text-blue-600 tracking-tighter">15.000</span>
                        </div>
                        <span className="inline-block mt-4 px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest animate-pulse">Promo Terbatas!</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {user ? (
                    <a href={waLink} target="_blank" className="w-full py-5 bg-blue-600 hover:bg-black text-white rounded-3xl font-black text-xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-200 hover:shadow-none translate-y-[-4px] hover:translate-y-0 active:scale-95">
                        Ambil Slot Sekarang <ArrowRight className="w-6 h-6" />
                    </a>
                ) : (
                    <Link href="/login" className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-3xl font-black text-xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 hover:shadow-none translate-y-[-4px] hover:translate-y-0 active:scale-95">
                        Login Untuk Gabung <ArrowRight className="w-6 h-6" />
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
      <main className="flex-1 container mx-auto px-4">
        
        <div className="flex items-center justify-between mb-12 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-black text-[10px] uppercase tracking-widest mb-2">
                <Store className="w-3 h-3" /> Reseller VIP
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Katalog Harga Cabang</h1>
              <p className="text-slate-500 mt-1 font-medium italic">Halo, {user?.user_metadata?.full_name || 'Partner'}. Harga supplier aktif otomatis.</p>
           </div>
           <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Keanggotaan</span>
              <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-bold text-sm border border-emerald-200 flex items-center gap-2 shadow-sm">
                 <ShieldCheck className="w-4 h-4" /> VIP ACTIVE
              </div>
           </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {[...products].sort((a, b) => {
            const sa = salesCounts[a.title] || 0;
            const sb = salesCounts[b.title] || 0;
            return sb - sa;
          }).map((product) => (
            <div key={product.id} onClick={() => handleProductClick(product)} className="cursor-pointer group transform hover:-translate-y-2 transition-all duration-500">
              <ProductCard
                title={product.title}
                salesCount={salesCounts[product.title] || 0}
                price={getProductResellerPrice(product)}
                image={product.image_url}
                tag="CABANG VIP"
                tagColor="indigo"
                href="#"
              />
            </div>
          ))}
        </div>

      </main>

      <ProductModal
        product={selectedProduct ? { ...selectedProduct, category: 'Reseller', packages: selectedProduct.packages } : null}
        activePromos={[]} 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isResellerContext={true}
      />
    </div>
  );
}
