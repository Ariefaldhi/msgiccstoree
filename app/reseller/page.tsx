"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import ProductModal from "@/components/ProductModal";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Store, ArrowRight, CheckCircle2 } from "lucide-react";
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

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setProfile(prof);
      }

      // Fetch products anyway
      const { data: prods } = await supabase
        .from("products")
        .select("*, packages(*)")
        .order("created_at", { ascending: false });
      
      if (prods) setProducts(prods);

      // Try to get admin phone from settings if exists
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
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center pt-32 pb-20">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  const isReseller = profile?.is_reseller === true;

  if (!isReseller) {
    const waText = user 
      ? `Halo Admin, saya ingin mendaftar menjadi Reseller. Akun email saya: ${user.email}`
      : `Halo Admin, saya ingin mendaftar menjadi Reseller.`;
    const waLink = `https://wa.me/${adminPhone}?text=${encodeURIComponent(waText)}`;

    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 pt-32 pb-20 flex items-center justify-center">
          <div className="max-w-2xl w-full bg-white border border-slate-100 rounded-[2rem] p-8 md:p-12 shadow-2xl text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
             
             <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-blue-100">
               <Store className="w-10 h-10 text-blue-600" />
             </div>
             
             <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Gabung Reseller VIP</h1>
             <p className="text-slate-500 font-medium mb-8 text-lg max-w-lg mx-auto">
               Dapatkan akses ke harga dasar yang jauh lebih murah dan mulai bisnis top up Anda sendiri. Profit maksimal, proses otomatis.
             </p>

             <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left space-y-4 border border-slate-100 inline-block">
               <div className="flex items-center gap-3">
                 <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                 <span className="font-bold text-slate-700">Harga Paket Khusus Reseller</span>
               </div>
               <div className="flex items-center gap-3">
                 <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                 <span className="font-bold text-slate-700">Prioritas Proses Transaksi</span>
               </div>
               <div className="flex items-center gap-3">
                 <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                 <span className="font-bold text-slate-700">Akses Eksklusif Dashboard Reseller</span>
               </div>
             </div>

             <div className="flex flex-col items-center">
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Biaya Pendaftaran</p>
               <p className="text-4xl font-black text-blue-600 mb-8">Rp 25.000</p>
               
               {user ? (
                 <a href={waLink} target="_blank" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-[0_6px_0_theme(colors.blue.700)] hover:shadow-[0_3px_0_theme(colors.blue.700)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px]">
                   Daftar Reseller Sekarang <ArrowRight className="w-5 h-5" />
                 </a>
               ) : (
                 <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-[0_6px_0_theme(colors.slate.700)] hover:shadow-[0_3px_0_theme(colors.slate.700)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px]">
                   Login Untuk Mendaftar <ArrowRight className="w-5 h-5" />
                 </Link>
               )}
             </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Reseller Connected View
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 pt-32 pb-20">
        
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
           <div>
             <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
               <Store className="w-8 h-8 text-blue-600" />
               Dashboard Reseller
             </h1>
             <p className="text-slate-500 mt-2 font-medium">Selamat datang, {user?.user_metadata?.full_name || 'Reseller'}. Nikmati harga spesial.</p>
           </div>
           <div className="hidden md:block px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-bold text-sm">
             Status: Aktif
           </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => (
            <div key={product.id} onClick={() => handleProductClick(product)} className="cursor-pointer">
              <ProductCard
                title={product.title}
                price="Harga Cabang" // Replace text for reseller
                image={product.image_url}
                tag="VIP"
                tagColor="purple"
                href="#"
              />
            </div>
          ))}
        </div>

      </main>
      <Footer />

      <ProductModal
        product={selectedProduct ? { ...selectedProduct, category: 'Reseller', packages: selectedProduct.packages } : null}
        flashSales={[]} // Resellers don't get flash sales
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isResellerContext={true} // pass prop to ProductModal
      />
    </div>
  );
}
