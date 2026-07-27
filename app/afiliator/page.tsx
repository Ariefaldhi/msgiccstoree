"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Megaphone, ArrowRight, Wallet, History, Users, Copy, Check, MessageCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function AfiliatorPage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [adminPhone, setAdminPhone] = useState("6281234567890");
    const [copied, setCopied] = useState(false);
    
    // UI State
    const [activeTab, setActiveTab] = useState<'sales' | 'withdrawals'>('sales');
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [wdForm, setWdForm] = useState({ amount: 0, method: "", details: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

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

        const isAffiliator = (prof?.is_affiliator === true) || (prof?.role === 'admin');
        if (isAffiliator) {
          // Fetch Sales
          const { data: ords } = await supabase.from("orders").select("*").eq("affiliator_id", user.id).order('created_at', { ascending: false });
          if (ords) setOrders(ords);

          // Fetch Withdrawals
          const { data: wds } = await supabase.from("withdrawals").select("*").eq("user_id", user.id).order('created_at', { ascending: false });
          if (wds) setWithdrawals(wds);
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
      <div className="min-h-screen bg-white pt-32 pb-20">
        <div className="flex items-center justify-center">
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
      <div className="min-h-screen bg-slate-50 flex flex-col pt-32 pb-20 overflow-hidden relative">
        <main className="flex-1 container mx-auto px-4 flex flex-col items-center justify-center relative z-10">
          
          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            
            {/* Left: Content */}
            <div className="text-left">
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                    Program Afiliasi Khusus
                </h1>
                <p className="text-slate-600 font-medium text-sm md:text-base mb-10 max-w-sm leading-relaxed">
                    Bagikan tautan referral Anda dan dapatkan komisi otomatis untuk setiap transaksi yang berhasil.
                </p>

                <div className="space-y-4 mb-10">
                    {[
                        "Pendaftaran 100% Gratis",
                        "Komisi Cair Langsung ke Rekening",
                        "Tracking Transaksi Transparan"
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
                            <span className="font-bold text-slate-700 text-sm">{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Registration Card */}
            <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 relative flex flex-col items-center text-center">
                
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-slate-200">
                    <Megaphone className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-xl font-black text-slate-900 mb-1">Daftar Afiliator</h2>
                <p className="text-slate-500 font-medium text-xs mb-8">Gabung sekarang dan mulai hasilkan komisi.</p>

                <div className="w-full bg-slate-50/50 rounded-2xl p-4 border border-slate-100 mb-8 text-left">
                    <h3 className="font-bold text-slate-900 text-xs mb-3 flex items-center gap-2"><Wallet className="w-4 h-4 text-purple-500"/> Estimasi Komisi</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500">10 Trx / Hari</span>
                            <span className="text-xs font-black text-purple-600">~ Rp 10.000</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500">50 Trx / Hari</span>
                            <span className="text-xs font-black text-purple-600">~ Rp 50.000</span>
                        </div>
                    </div>
                </div>

                {user ? (
                    <a href={waLink} target="_blank" className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 active:scale-95">
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

  const handleWithdrawRequest = async () => {
    if (!wdForm.amount || wdForm.amount <= 0 || !wdForm.method || !wdForm.details) {
        alert("Mohon lengkapi semua data penarikan.");
        return;
    }

    if (wdForm.amount > (profile.balance || 0)) {
        alert("Saldo tidak mencukupi.");
        return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from("withdrawals").insert([{
        user_id: user.id,
        amount: wdForm.amount,
        payment_method: wdForm.method,
        account_details: wdForm.details,
        status: 'PENDING'
    }]);

    if (error) {
        alert("Gagal mengajukan penarikan: " + error.message);
    } else {
        setIsWithdrawModalOpen(false);
        setIsSuccessModalOpen(true);
        // Refresh withdrawals
        const { data } = await supabase.from("withdrawals").select("*").eq("user_id", user.id).order('created_at', { ascending: false });
        if (data) setWithdrawals(data);
    }
    setIsSubmitting(false);
  };

  // Afiliator Dashboard View
  const affiliateUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${profile.affiliate_code}`;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(affiliateUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col pt-32 pb-20">
        {/* Background Orbs for Glassmorphism */}
        <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 -translate-x-1/3"></div>
        <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none translate-y-1/3 translate-x-1/3"></div>

      <main className="flex-1 container mx-auto px-4 max-w-lg md:max-w-5xl relative z-10">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-slate-200/50">
           <div>
             <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 drop-shadow-sm">
               <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                   <Megaphone className="w-5 h-5 md:w-6 md:h-6 text-white" />
               </div>
               Dashboard Afiliator
             </h1>
             <p className="text-slate-500 mt-2 font-medium text-sm md:text-base">Pantau performa referral dan saldo komisi Anda.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 md:mb-12">
            {/* Balance Card */}
            <div className="md:col-span-2 bg-white/60 backdrop-blur-3xl rounded-[2.5rem] p-6 md:p-8 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform duration-700"></div>
                
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Wallet className="w-4 h-4"/> 
                    </div>
                    Saldo Komisi
                </h3>
                <div className="text-4xl md:text-5xl font-black text-slate-900 mb-8 tracking-tight">
                    Rp {profile?.balance?.toLocaleString('id-ID') || '0'}
                </div>

                <button 
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className="w-full md:w-auto inline-flex justify-center px-8 py-4 md:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all items-center gap-2 shadow-xl shadow-blue-200 active:scale-95"
                >
                    <Wallet className="w-4 h-4" /> Tarik Saldo Ke Rekening
                </button>
            </div>

            {/* Code Card */}
            <div className="bg-blue-600 text-white rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-blue-200 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
                <div>
                    <h3 className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4"/> Kode Afiliasi
                    </h3>
                    <div className="text-2xl md:text-3xl font-black mb-2 font-mono drop-shadow-md">
                        {profile?.affiliate_code}
                    </div>
                </div>
                <div className="mt-8">
                    <p className="text-[10px] md:text-xs text-blue-100 mb-3 font-medium">Bagikan link ini untuk mendapatkan referal:</p>
                    <div className="flex bg-black/10 rounded-xl p-1.5 overflow-hidden backdrop-blur-sm border border-white/10">
                        <input type="text" readOnly value={affiliateUrl} className="bg-transparent border-none outline-none text-xs w-full px-3 text-white font-medium" />
                        <button onClick={handleCopy} className="p-2 md:p-2.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors shadow-sm">
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* History Tabs & Content */}
        <div className="bg-white/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="p-2 border-b border-white/40 bg-white/40 flex flex-col md:flex-row gap-2">
                <button 
                    onClick={() => setActiveTab('sales')}
                    className={`flex-1 py-3 md:py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'sales' ? 'bg-white text-slate-900 shadow-sm border border-white' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                    }`}
                >
                    <History className="w-4 h-4" /> Histori Penjualan
                </button>
                <button 
                    onClick={() => setActiveTab('withdrawals')}
                    className={`flex-1 py-3 md:py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'withdrawals' ? 'bg-white text-slate-900 shadow-sm border border-white' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                    }`}
                >
                    <Wallet className="w-4 h-4" /> Status Penarikan
                </button>
            </div>
            
            <div className="p-4 md:p-6">
                {activeTab === 'sales' ? (
                    <>
                    {orders.length > 0 ? (
                        <div className="space-y-3">
                            {orders.map((order, i) => (
                                <div key={i} className="bg-white/80 p-4 md:p-5 rounded-2xl border border-white shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900 text-sm md:text-base">{order.product_name}</span>
                                        <span className="text-xs text-slate-500 mb-1">{order.package_name}</span>
                                        <span className="text-[10px] font-mono text-slate-400">{new Date(order.created_at).toLocaleDateString('id-ID')}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-blue-600 text-base md:text-lg mb-1">+ Rp {order.commission?.toLocaleString('id-ID') || '0'}</div>
                                        <span className={`px-2 py-1 rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-widest ${
                                            order.status === 'Pesanan Selesai' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                            order.status === 'Dibatalkan' ? 'bg-red-50 text-red-600 border border-red-100' :
                                            'bg-amber-50 text-amber-600 border border-amber-100'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-16 text-center text-slate-400 font-medium">
                            <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <History className="w-8 h-8 text-slate-200" />
                            </div>
                            Belum ada riwayat transaksi masuk.
                        </div>
                    )}
                    </>
                ) : (
                    <>
                    {withdrawals.length > 0 ? (
                        <div className="space-y-3">
                            {withdrawals.map((wd, i) => (
                                <div key={i} className="bg-white/80 p-4 md:p-5 rounded-2xl border border-white shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900 text-sm md:text-base">{wd.payment_method}</span>
                                        <span className="text-xs text-slate-500 mb-1">{wd.account_details}</span>
                                        <span className="text-[10px] font-mono text-slate-400">ID: {wd.id.substring(0,8).toUpperCase()}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-slate-900 text-base md:text-lg mb-1">Rp {wd.amount.toLocaleString('id-ID')}</div>
                                        <span className={`px-2 py-1 rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-widest ${
                                            wd.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                            wd.status === 'REJECTED' ? 'bg-red-50 text-red-600 border border-red-100' :
                                            'bg-blue-50 text-blue-600 border border-blue-100'
                                        }`}>
                                            {wd.status === 'PENDING' ? '⏳ Menunggu' : wd.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-16 text-center text-slate-400 font-medium">
                            <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <Wallet className="w-8 h-8 text-slate-200" />
                            </div>
                            Anda belum pernah mengajukan penarikan.
                        </div>
                    )}
                    </>
                )}
            </div>
        </div>

        {/* Success Modal */}
        {isSuccessModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-white/80 backdrop-blur-3xl rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300 text-center border border-white">
                    <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-100">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Berhasil!</h2>
                    <p className="text-sm text-slate-500 font-medium mb-8">
                        Permintaan penarikan Anda telah masuk ke sistem. Hubungi admin untuk pencairan lebih cepat.
                    </p>

                    <div className="flex flex-col gap-3">
                        <a 
                            href={`https://wa.me/${adminPhone}?text=${encodeURIComponent(`Halo Admin, saya baru saja mengajukan penarikan saldo sebesar Rp ${wdForm.amount.toLocaleString()} di Dashboard Afiliator. Mohon segera diproses ya!`)}`}
                            target="_blank"
                            onClick={() => {
                                setIsSuccessModalOpen(false);
                                setWdForm({ amount: 0, method: "", details: "" });
                            }}
                            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-black py-4 rounded-2xl shadow-xl shadow-green-200 transition-all flex items-center justify-center gap-2"
                        >
                            <MessageCircle className="w-5 h-5" /> Konfirmasi ke WA
                        </a>
                        <button 
                            onClick={() => {
                                setIsSuccessModalOpen(false);
                                setWdForm({ amount: 0, method: "", details: "" });
                            }}
                            className="w-full text-slate-400 hover:text-slate-600 font-bold py-3 text-sm rounded-2xl hover:bg-slate-50 transition-colors"
                        >
                            Selesai
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Withdraw Modal */}
        {isWithdrawModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-white/80 backdrop-blur-3xl rounded-[2.5rem] p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300 border border-white">
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Tarik Saldo</h2>
                    <p className="text-sm text-slate-500 font-medium mb-8">Masukkan rincian penarikan saldo komisi Anda.</p>

                    <div className="space-y-4 mb-8">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Jumlah (Rp)</label>
                            <input 
                                type="number" 
                                placeholder="Contoh: 50000"
                                value={wdForm.amount || ''}
                                onChange={(e) => setWdForm({ ...wdForm, amount: parseInt(e.target.value) })}
                                className="w-full bg-white border border-white rounded-2xl px-5 py-4 font-bold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                            <p className="text-[10px] text-slate-400 mt-2 ml-1 font-medium">Maksimal ditarik: Rp {profile?.balance?.toLocaleString('id-ID')}</p>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Metode Transfer</label>
                            <input 
                                type="text" 
                                placeholder="BCA / DANA / OVO / GoPay"
                                value={wdForm.method}
                                onChange={(e) => setWdForm({ ...wdForm, method: e.target.value })}
                                className="w-full bg-white border border-white rounded-2xl px-5 py-4 font-bold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Rincian Rekening / E-Wallet</label>
                            <textarea 
                                placeholder="Nomor Rekening - Atas Nama"
                                value={wdForm.details}
                                onChange={(e) => setWdForm({ ...wdForm, details: e.target.value })}
                                className="w-full bg-white border border-white rounded-2xl px-5 py-4 font-bold text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all h-24 resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={handleWithdrawRequest}
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Kirim Pengajuan"}
                        </button>
                        <button 
                            onClick={() => setIsWithdrawModalOpen(false)}
                            className="w-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 font-bold py-3 text-sm rounded-2xl transition-colors"
                        >
                            Batalkan
                        </button>
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}
