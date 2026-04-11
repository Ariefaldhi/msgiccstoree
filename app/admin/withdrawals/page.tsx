"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Wallet, CheckCircle2, XCircle, Clock, User, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminWithdrawals() {
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const supabase = createClient();

    const fetchWithdrawals = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("withdrawals")
            .select(`
                *,
                profiles (
                    id,
                    full_name,
                    email,
                    balance
                )
            `)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setWithdrawals(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED', userId: string, amount: number) => {
        const confirmMsg = status === 'APPROVED' 
            ? `Setujui penarikan Rp ${amount.toLocaleString()}? Saldo user akan otomatis berkurang.` 
            : `Tolak penarikan ini?`;
            
        if (!window.confirm(confirmMsg)) return;

        setProcessingId(id);

        try {
            if (status === 'APPROVED') {
                // 1. Fetch current balance to be safe
                const { data: prof } = await supabase.from("profiles").select("balance").eq("id", userId).single();
                if (!prof || (prof.balance || 0) < amount) {
                    alert("Gagal: Saldo user tidak mencukupi untuk penarikan ini.");
                    setProcessingId(null);
                    return;
                }

                // 2. Deduct balance
                const { error: updErr } = await supabase.from("profiles").update({ 
                    balance: (prof.balance || 0) - amount 
                }).eq("id", userId);

                if (updErr) throw updErr;
            }

            // 3. Update withdrawal status
            const { error: wdErr } = await supabase.from("withdrawals").update({ status }).eq("id", id);
            if (wdErr) throw wdErr;

            alert(`Berhasil di-${status.toLowerCase()}`);
            fetchWithdrawals();
        } catch (err: any) {
            alert("Terjadi kesalahan: " + err.message);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    const pendingWds = withdrawals.filter(w => w.status === 'PENDING');
    const historyWds = withdrawals.filter(w => w.status !== 'PENDING');

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                            <ArrowLeft className="w-5 h-5 text-slate-500" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">Manajemen Penarikan</h1>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Affiliate Payouts</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8">
                
                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Menunggu</p>
                                <p className="text-2xl font-black text-slate-900">{pendingWds.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Disetujui</p>
                                <p className="text-2xl font-black text-slate-900">
                                    {withdrawals.filter(w => w.status === 'APPROVED').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Requests */}
                <div className="mb-10">
                    <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                        <Clock className="w-5 h-5 text-amber-500" /> Permintaan Pending
                    </h2>
                    
                    {pendingWds.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {pendingWds.map((wd) => (
                                <div key={wd.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-md relative overflow-hidden group hover:shadow-xl transition-all">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl uppercase shadow-lg">
                                                {wd.profiles?.full_name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900">{wd.profiles?.full_name || 'User'}</h3>
                                                <p className="text-xs font-medium text-slate-500">{wd.profiles?.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jumlah Tarik</p>
                                            <p className="text-2xl font-black text-blue-600">Rp {wd.amount.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-3xl p-5 mb-8 border border-slate-100">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metode:</span>
                                            <span className="text-xs font-bold text-slate-900 bg-white px-3 py-1 rounded-full shadow-sm">{wd.payment_method}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rincian Rekening:</p>
                                            <p className="text-sm font-bold text-slate-700 whitespace-pre-wrap">{wd.account_details}</p>
                                        </div>
                                        <div className="h-px bg-slate-200 my-4" />
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Saat Ini:</span>
                                            <span className="text-xs font-black text-slate-900">Rp {wd.profiles?.balance?.toLocaleString() || '0'}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button 
                                            disabled={processingId === wd.id}
                                            onClick={() => handleAction(wd.id, 'APPROVED', wd.user_id, wd.amount)}
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            {processingId === wd.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                            Setujui
                                        </button>
                                        <button 
                                            disabled={processingId === wd.id}
                                            onClick={() => handleAction(wd.id, 'REJECTED', wd.user_id, wd.amount)}
                                            className="flex-1 bg-white border border-slate-200 text-red-500 hover:bg-red-50 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                                        >
                                            Tolak
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2rem] p-16 text-center border border-slate-100">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-8 h-8 text-slate-200" />
                            </div>
                            <p className="font-bold text-slate-400">Tidak ada permintaan penarikan tertunda.</p>
                        </div>
                    )}
                </div>

                {/* History */}
                <div className="bg-white md:bg-white rounded-[2rem] md:border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-bold text-slate-900 flex items-center gap-3">
                            <HistoryIcon className="w-5 h-5 text-slate-400" /> Riwayat Penarikan
                        </h2>
                    </div>

                    {/* Desktop History View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Affiliator</th>
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Jumlah</th>
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Metode</th>
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {historyWds.map((wd) => (
                                    <tr key={wd.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-900">{wd.profiles?.full_name}</div>
                                            <div className="text-[10px] font-medium text-slate-400">{wd.profiles?.email}</div>
                                        </td>
                                        <td className="p-4 font-black text-slate-900">Rp {wd.amount.toLocaleString()}</td>
                                        <td className="p-4 font-medium text-slate-600">{wd.payment_method}</td>
                                        <td className="p-4 text-slate-400 font-mono text-xs">{new Date(wd.created_at).toLocaleDateString('id-ID')}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                wd.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {wd.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {historyWds.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-slate-400 font-medium italic">Belum ada riwayat.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile History View */}
                    <div className="md:hidden space-y-4 p-4 bg-slate-50/50">
                        {historyWds.length > 0 ? historyWds.map((wd) => (
                            <div key={wd.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-col">
                                        <h3 className="font-bold text-slate-900">{wd.profiles?.full_name}</h3>
                                        <p className="text-[10px] text-slate-500 font-medium">{wd.profiles?.email}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                        wd.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {wd.status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jumlah Cair</p>
                                        <p className="font-black text-blue-600">Rp {wd.amount.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metode</p>
                                        <p className="font-bold text-slate-900 text-xs">{wd.payment_method}</p>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    <span>TDR: {new Date(wd.created_at).toLocaleDateString('id-ID')}</span>
                                    <span className="font-mono">{wd.id.split('-')[0]}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-xs text-slate-400 font-bold uppercase tracking-widest italic">
                                Belum ada riwayat
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

// Minimal History component local mock for table icon
function HistoryIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
    );
}
