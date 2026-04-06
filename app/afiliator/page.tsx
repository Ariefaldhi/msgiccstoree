"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Megaphone, ArrowRight, Wallet, History, Users, Copy, Check, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function AfiliatorPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminPhone, setAdminPhone] = useState("6281234567890");
  const [copied, setCopied] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        
        // Auto generate affiliate code if approved but missing code
        if (prof?.is_affiliator && !prof?.affiliate_code) {
             const newCode = `REF-${user.id.substring(0,6).toUpperCase()}`;
             await supabase.from("profiles").update({ affiliate_code: newCode }).eq("id", user.id);
             prof.affiliate_code = newCode;
        }
        
        setProfile(prof);

        if (prof?.is_affiliator) {
          const { data: ords } = await supabase.from("orders").select("*").eq("affiliator_id", user.id).order('created_at', { ascending: false });
          if (ords) setOrders(ords);
        }
      }

      const { data: settings } = await supabase.from("store_settings").select("whatsapp_number").eq("id", 1).single();
      if (settings?.whatsapp_number) setAdminPhone(settings.whatsapp_number);

      setLoading(false);
    }
    fetchData();
  }, []);

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

  const isAffiliator = (profile?.is_affiliator === true) || (profile?.role === 'admin');

  if (!isAffiliator) {
    const waText = user 
      ? `Halo Admin, saya tertarik menjadi Afiliator. Akun email saya: ${user.email}`
      : `Halo Admin, saya tertarik menjadi Afiliator.`;
    const waLink = `https://wa.me/${adminPhone}?text=${encodeURIComponent(waText)}`;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 pt-32 pb-20 flex items-center justify-center">
          <div className="max-w-3xl w-full bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden border border-slate-100">
             {/* Decorative Background */}
             <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
             
             <div className="flex flex-col md:flex-row items-center gap-10">
                 <div className="flex-1 text-center md:text-left">
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-bold text-xs mb-6">
                         <Megaphone className="w-3 h-3" /> PROGRAM KEMITRAAN
                     </div>
                     <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">Gabung Afiliator<br/> <span className="text-purple-600">Gratis!</span></h1>
                     <p className="text-slate-500 font-medium mb-8 text-lg">
                       Cukup sebar link, dapatkan komisi untuk setiap transaksi yang berhasil dari referral Anda. Tanpa modal, potensi penghasilan tak terbatas.
                     </p>
                     
                     {user ? (
                         <a href={waLink} target="_blank" className="w-full sm:w-auto px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-lg transition-all inline-flex items-center justify-center gap-3 shadow-[0_6px_0_theme(colors.purple.800)] hover:shadow-[0_3px_0_theme(colors.purple.800)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px]">
                           Daftar Sekarang <ArrowRight className="w-5 h-5" />
                         </a>
                     ) : (
                         <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg transition-all inline-flex items-center justify-center gap-3 shadow-[0_6px_0_theme(colors.slate.700)] hover:shadow-[0_3px_0_theme(colors.slate.700)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px]">
                           Login Untuk Bergabung <ArrowRight className="w-5 h-5" />
                         </Link>
                     )}
                 </div>
                 
                 <div className="flex-1 w-full bg-slate-50 rounded-3xl p-6 border border-slate-100">
                     <h3 className="font-bold text-slate-900 mb-4 items-center flex gap-2"><Wallet className="w-5 h-5 text-purple-500"/> Simulasi Pendapatan</h3>
                     <div className="space-y-4">
                         <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                             <div className="text-sm font-bold text-slate-500">10 Trx / Hari</div>
                             <div className="font-black text-purple-600">Rp 50.000+</div>
                         </div>
                         <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                             <div className="text-sm font-bold text-slate-500">50 Trx / Hari</div>
                             <div className="font-black text-purple-600">Rp 250.000+</div>
                         </div>
                         <p className="text-xs text-center text-slate-400 mt-4">*Syarat dan ketentuan berlaku. Estimasi berdasarkan rata-rata komisi.</p>
                     </div>
                 </div>
             </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Afiliator Dashboard View
  const affiliateUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${profile.affiliate_code}`;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(affiliateUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wdText = `Halo Admin, saya ingin menarik saldo komisi afiliasi saya.
Email: ${user.email}
Kode: ${profile.affiliate_code}
Jumlah: Rp ${profile.balance?.toLocaleString('id-ID')}
Tujuan (BCA/DANA/dll): `;
  const wdLink = `https://wa.me/${adminPhone}?text=${encodeURIComponent(wdText)}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 pt-32 pb-20 max-w-5xl">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-slate-200">
           <div>
             <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
               <Megaphone className="w-8 h-8 text-purple-600" />
               Dashboard Afiliator
             </h1>
             <p className="text-slate-500 mt-2 font-medium">Pantau performa referral dan saldo komisi Anda.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Balance Card */}
            <div className="md:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
                
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Wallet className="w-4 h-4"/> Saldo Komisi
                </h3>
                <div className="text-5xl font-black text-slate-900 mb-8 tracking-tight">
                    Rp {profile?.balance?.toLocaleString('id-ID') || '0'}
                </div>
                
                <a href={wdLink} target="_blank" className="inline-flex px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all items-center gap-2 shadow-[0_4px_0_theme(colors.slate.700)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none">
                    <MessageCircle className="w-4 h-4" /> Tarik Saldo Ke WA
                </a>
            </div>

            {/* Code Card */}
            <div className="bg-purple-600 text-white rounded-[2rem] p-8 shadow-xl flex flex-col justify-between">
                <div>
                    <h3 className="text-sm font-bold text-purple-200 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4"/> Kode Afiliasi
                    </h3>
                    <div className="text-3xl font-black mb-2 font-mono">
                        {profile?.affiliate_code}
                    </div>
                </div>
                <div className="mt-8">
                    <p className="text-xs text-purple-200 mb-3 font-medium">Bagikan link ini untuk mendapatkan referal:</p>
                    <div className="flex bg-purple-700/50 rounded-xl p-1 overflow-hidden">
                        <input type="text" readOnly value={affiliateUrl} className="bg-transparent border-none outline-none text-xs w-full px-3 text-purple-100" />
                        <button onClick={handleCopy} className="p-2 bg-white text-purple-700 rounded-lg hover:bg-purple-50 transition-colors">
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Orders Log */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                 <History className="w-5 h-5 text-slate-400" />
                 <h2 className="font-bold text-slate-900">Histori Penjualan Referral</h2>
            </div>
            
            {orders.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Tanggal</th>
                                <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Produk</th>
                                <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                                <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-right">Komisi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders.map((order, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 font-medium text-slate-600">{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-900">{order.product_name}</div>
                                        <div className="text-xs text-slate-500">{order.package_name}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                                            order.status === 'Pesanan Selesai' ? 'bg-green-100 text-green-700' :
                                            order.status === 'Dibatalkan' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-black text-purple-600">
                                        + Rp {order.commission?.toLocaleString('id-ID') || '0'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="p-12 text-center text-slate-500 font-medium">
                    Belum ada riwayat transaksi dari link referral Anda.
                </div>
            )}
        </div>

      </main>
      <Footer />
    </div>
  );
}
