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
            <div className="min-h-screen bg-slate-50 pt-32 pb-20 flex items-center justify-center">
                <Loader2 className="size-8 text-blue-600 animate-spin" />
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
            <div className="min-h-screen bg-slate-50 flex flex-col pt-32 pb-20">
                <main className="flex-1 container mx-auto px-4 flex flex-col items-center justify-center">
                    
                    <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        
                        {/* Left: Content */}
                        <div className="text-left">
                            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-2 block">
                                Kemitraan Afiliasi
                            </span>
                            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
                                Program Afiliasi Khusus
                            </h1>
                            <p className="text-slate-600 text-sm md:text-base mb-8 max-w-sm leading-relaxed font-normal">
                                Bagikan tautan referral Anda dan dapatkan komisi otomatis untuk setiap transaksi yang berhasil.
                            </p>

                            <div className="space-y-3 mb-8">
                                {[
                                    "Pendaftaran 100% Gratis",
                                    "Komisi Cair Langsung ke Rekening / E-Wallet",
                                    "Pelaporan Transaksi Transparan & Realtime"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="size-4 text-purple-600 shrink-0" />
                                        <span className="font-semibold text-slate-700 text-sm">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Registration Card */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xs border border-slate-200/90 flex flex-col items-center text-center">
                            
                            <div className="size-14 bg-purple-50 text-purple-600 border border-purple-100 rounded-xl flex items-center justify-center mb-4">
                                <Megaphone className="size-7" />
                            </div>

                            <h2 className="text-xl font-bold text-slate-900 mb-1">Daftar Afiliator</h2>
                            <p className="text-slate-500 text-xs mb-6">Gabung sekarang dan mulai hasilkan komisi tambahan.</p>

                            <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6 text-left">
                                <h3 className="font-semibold text-slate-900 text-xs mb-2 flex items-center gap-2">
                                    <Wallet className="size-4 text-purple-500"/> Estimasi Komisi
                                </h3>
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">10 Transaksi / Hari</span>
                                        <span className="font-bold text-purple-600">~ Rp 10.000</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">50 Transaksi / Hari</span>
                                        <span className="font-bold text-purple-600">~ Rp 50.000</span>
                                    </div>
                                </div>
                            </div>

                            {user ? (
                                <a href={waLink} target="_blank" className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs">
                                    Hubungi Admin WhatsApp <ArrowRight className="size-4" />
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
            const { data } = await supabase.from("withdrawals").select("*").eq("user_id", user.id).order('created_at', { ascending: false });
            if (data) setWithdrawals(data);
        }
        setIsSubmitting(false);
    };

    const affiliateUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${profile.affiliate_code}`;
    
    const handleCopy = () => {
        navigator.clipboard.writeText(affiliateUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pt-32 pb-20">
            <main className="flex-1 container mx-auto px-4 max-w-5xl">
                
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b border-slate-200">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            <div className="size-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                                <Megaphone className="size-5" />
                            </div>
                            Dashboard Afiliator
                        </h1>
                        <p className="text-slate-500 mt-1 font-normal text-sm">Pantau performa referral dan saldo komisi Anda.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Balance Card */}
                    <div className="md:col-span-2 bg-white rounded-2xl p-6 md:p-8 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                <Wallet className="size-4 text-blue-600"/> 
                                Saldo Komisi Tersedia
                            </div>
                            <div className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                                Rp {profile?.balance?.toLocaleString('id-ID') || '0'}
                            </div>
                        </div>

                        <div className="mt-6">
                            <button 
                                onClick={() => setIsWithdrawModalOpen(true)}
                                className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors gap-2 shadow-xs"
                            >
                                <Wallet className="size-4" /> Tarik Saldo Ke Rekening
                            </button>
                        </div>
                    </div>

                    {/* Code Card */}
                    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Users className="size-4 text-slate-400"/> Kode Referral Anda
                            </div>
                            <div className="text-2xl font-extrabold font-mono text-white">
                                {profile?.affiliate_code}
                            </div>
                        </div>
                        <div className="mt-6">
                            <p className="text-xs text-slate-400 mb-2">Bagikan tautan ini ke pembeli:</p>
                            <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700 items-center">
                                <input type="text" readOnly value={affiliateUrl} className="bg-transparent border-none outline-none text-xs w-full px-2 text-slate-200 font-mono" />
                                <button onClick={handleCopy} className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors shrink-0">
                                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History Tabs & Content */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                    <div className="border-b border-slate-200 flex gap-2 p-2 bg-slate-50/50">
                        <button 
                            onClick={() => setActiveTab('sales')}
                            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 ${
                                activeTab === 'sales' ? 'bg-white text-slate-900 shadow-2xs border border-slate-200' : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <History className="size-4" /> Riwayat Komisi
                        </button>
                        <button 
                            onClick={() => setActiveTab('withdrawals')}
                            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 ${
                                activeTab === 'withdrawals' ? 'bg-white text-slate-900 shadow-2xs border border-slate-200' : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <Wallet className="size-4" /> Riwayat Penarikan
                        </button>
                    </div>
                    
                    <div className="p-4 md:p-6">
                        {activeTab === 'sales' ? (
                            <>
                            {orders.length > 0 ? (
                                <div className="space-y-2.5">
                                    {orders.map((order, i) => (
                                        <div key={i} className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between hover:border-slate-300 transition-colors">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 text-sm">{order.product_name}</span>
                                                <span className="text-xs text-slate-500">{order.package_name}</span>
                                                <span className="text-[10px] font-mono text-slate-400 mt-0.5">{new Date(order.created_at).toLocaleDateString('id-ID')}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-blue-600 text-base">+ Rp {order.commission?.toLocaleString('id-ID') || '0'}</div>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                    order.status === 'Pesanan Selesai' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                                    order.status === 'Dibatalkan' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                                    'bg-amber-50 text-amber-700 border border-amber-200'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-slate-400 text-sm">
                                    Belum ada transaksi dari link referral Anda.
                                </div>
                            )}
                            </>
                        ) : (
                            <>
                            {withdrawals.length > 0 ? (
                                <div className="space-y-2.5">
                                    {withdrawals.map((wd, i) => (
                                        <div key={i} className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between hover:border-slate-300 transition-colors">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 text-sm">{wd.payment_method}</span>
                                                <span className="text-xs text-slate-500">{wd.account_details}</span>
                                                <span className="text-[10px] font-mono text-slate-400 mt-0.5">ID: {wd.id.substring(0,8).toUpperCase()}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-slate-900 text-base">Rp {wd.amount.toLocaleString('id-ID')}</div>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                    wd.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                                    wd.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                                    'bg-blue-50 text-blue-700 border border-blue-200'
                                                }`}>
                                                    {wd.status === 'PENDING' ? 'Menunggu' : wd.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-slate-400 text-sm">
                                    Anda belum pernah mengajukan penarikan saldo.
                                </div>
                            )}
                            </>
                        )}
                    </div>
                </div>

                {/* Success Modal */}
                {isSuccessModalOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center border border-slate-200">
                            <div className="size-14 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
                                <CheckCircle2 className="size-7" />
                            </div>
                            
                            <h2 className="text-xl font-bold text-slate-900 mb-1">Pengajuan Berhasil</h2>
                            <p className="text-xs text-slate-500 mb-6">
                                Permintaan penarikan saldo telah dicatat. Hubungi admin WhatsApp untuk proses verifikasi.
                            </p>

                            <div className="flex flex-col gap-2">
                                <a 
                                    href={`https://wa.me/${adminPhone}?text=${encodeURIComponent(`Halo Admin, saya baru saja mengajukan penarikan saldo sebesar Rp ${wdForm.amount.toLocaleString()} di Dashboard Afiliator. Mohon segera diproses ya!`)}`}
                                    target="_blank"
                                    onClick={() => {
                                        setIsSuccessModalOpen(false);
                                        setWdForm({ amount: 0, method: "", details: "" });
                                    }}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs"
                                >
                                    <MessageCircle className="size-4" /> Konfirmasi ke WA Admin
                                </a>
                                <button 
                                    onClick={() => {
                                        setIsSuccessModalOpen(false);
                                        setWdForm({ amount: 0, method: "", details: "" });
                                    }}
                                    className="w-full text-slate-500 hover:text-slate-800 py-2 text-xs font-semibold"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Withdraw Modal */}
                {isWithdrawModalOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200">
                            <h2 className="text-lg font-bold text-slate-900 mb-1">Tarik Saldo Komisi</h2>
                            <p className="text-xs text-slate-500 mb-4">Masukkan nominal dan rincian rekening tujuan Anda.</p>

                            <div className="space-y-3 mb-6">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah Penarikan (Rp)</label>
                                    <input 
                                        type="number" 
                                        placeholder="Contoh: 50000"
                                        value={wdForm.amount || ''}
                                        onChange={(e) => setWdForm({ ...wdForm, amount: parseInt(e.target.value) })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">Saldo tersedia: Rp {profile?.balance?.toLocaleString('id-ID')}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Metode Pembayaran</label>
                                    <input 
                                        type="text" 
                                        placeholder="BCA / Mandiri / DANA / GoPay / OVO"
                                        value={wdForm.method}
                                        onChange={(e) => setWdForm({ ...wdForm, method: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Rekening & Atas Nama</label>
                                    <textarea 
                                        placeholder="Nomor Rekening/E-Wallet - Atas Nama Pemilik"
                                        value={wdForm.details}
                                        onChange={(e) => setWdForm({ ...wdForm, details: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 h-20 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <button 
                                    onClick={handleWithdrawRequest}
                                    disabled={isSubmitting}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50 text-xs"
                                >
                                    {isSubmitting ? <Loader2 className="size-4 animate-spin mx-auto" /> : "Kirim Pengajuan"}
                                </button>
                                <button 
                                    onClick={() => setIsWithdrawModalOpen(false)}
                                    className="w-full text-slate-500 hover:text-slate-800 py-2 text-xs font-semibold"
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
