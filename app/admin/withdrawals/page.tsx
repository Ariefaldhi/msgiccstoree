"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Wallet, CheckCircle2, Clock, History as HistoryIcon } from "lucide-react";
import { useAdminCurrency } from "@/components/admin/AdminCurrencyProvider";

export default function AdminWithdrawals() {
    const { formatCurrency } = useAdminCurrency();
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
            ? `Setujui penarikan ${formatCurrency(amount)}? Saldo user akan otomatis berkurang.` 
            : `Tolak penarikan ${formatCurrency(amount)}?`;
            
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
            <div className="flex flex-col items-center justify-center p-20 bg-white border border-slate-200/90 rounded-2xl">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Memuat Data Penarikan...</p>
            </div>
        );
    }

    const pendingWds = withdrawals.filter(w => w.status === 'PENDING');
    const historyWds = withdrawals.filter(w => w.status !== 'PENDING');

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-200 gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                        <Wallet className="w-6 h-6 text-blue-600" />
                        Manajemen Penarikan
                    </h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-0.5">Kelola permintaan payout komisi dan saldo afiliator.</p>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100 text-amber-600">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Menunggu Persetujuan</p>
                            <p className="text-lg font-bold text-slate-900">{pendingWds.length} Permintaan</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 text-emerald-600">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Telah Disetujui</p>
                            <p className="text-lg font-bold text-slate-900">
                                {withdrawals.filter(w => w.status === 'APPROVED').length} Penarikan
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Requests */}
            <div>
                <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" /> Permintaan Pending
                </h2>
                
                {pendingWds.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pendingWds.map((wd) => (
                            <div key={wd.id} className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/90 shadow-xs space-y-4 hover:border-slate-300 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-xs uppercase">
                                            {wd.profiles?.full_name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 text-sm">{wd.profiles?.full_name || 'User'}</h3>
                                            <p className="text-xs text-slate-500">{wd.profiles?.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Jumlah Tarik</p>
                                        <p className="text-base font-bold text-blue-600">{formatCurrency(wd.amount)}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5 text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 font-medium">Metode:</span>
                                        <span className="font-semibold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded text-xs">{wd.payment_method}</span>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 font-medium mb-0.5">Rincian Rekening / E-Wallet:</p>
                                        <p className="font-semibold text-slate-800 whitespace-pre-wrap bg-white p-2.5 rounded-lg border border-slate-200 text-xs">{wd.account_details}</p>
                                    </div>
                                    <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                                        <span className="text-slate-500 font-medium">Saldo User Saat Ini:</span>
                                        <span className="font-bold text-slate-900">{formatCurrency(wd.profiles?.balance)}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2.5 pt-1">
                                    <button 
                                        disabled={processingId === wd.id}
                                        onClick={() => handleAction(wd.id, 'APPROVED', wd.user_id, wd.amount)}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                                    >
                                        {processingId === wd.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                        Setujui & Cairkan
                                    </button>
                                    <button 
                                        disabled={processingId === wd.id}
                                        onClick={() => handleAction(wd.id, 'REJECTED', wd.user_id, wd.amount)}
                                        className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-semibold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                                    >
                                        Tolak Permintaan
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 shadow-xs">
                        <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-medium text-slate-500">Tidak ada permintaan penarikan tertunda saat ini.</p>
                    </div>
                )}
            </div>

            {/* History */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <HistoryIcon className="w-4 h-4 text-slate-500" /> Riwayat Penarikan
                    </h2>
                </div>

                {/* Desktop History View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                <th className="px-4 py-3">Affiliator</th>
                                <th className="px-4 py-3">Jumlah</th>
                                <th className="px-4 py-3">Metode</th>
                                <th className="px-4 py-3">Tanggal</th>
                                <th className="px-4 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {historyWds.map((wd) => (
                                <tr key={wd.id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-4 py-3.5">
                                        <div className="font-semibold text-slate-900">{wd.profiles?.full_name}</div>
                                        <div className="text-[11px] text-slate-400">{wd.profiles?.email}</div>
                                    </td>
                                    <td className="px-4 py-3.5 font-bold text-slate-900">{formatCurrency(wd.amount)}</td>
                                    <td className="px-4 py-3.5 text-slate-600 font-medium">{wd.payment_method}</td>
                                    <td className="px-4 py-3.5 text-slate-500 text-[11px]">{new Date(wd.created_at).toLocaleDateString('id-ID')}</td>
                                    <td className="px-4 py-3.5 text-center">
                                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
                                            wd.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                                        }`}>
                                            {wd.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {historyWds.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">Belum ada riwayat penarikan.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile History View */}
                <div className="md:hidden space-y-3 p-4">
                    {historyWds.length > 0 ? historyWds.map((wd) => (
                        <div key={wd.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-slate-900 text-xs">{wd.profiles?.full_name}</h3>
                                    <p className="text-[11px] text-slate-500">{wd.profiles?.email}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                    wd.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                                }`}>
                                    {wd.status}
                                </span>
                            </div>
                            <div className="flex justify-between items-end pt-1">
                                <div>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Jumlah Cair</p>
                                    <p className="font-bold text-blue-600 text-xs">{formatCurrency(wd.amount)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Metode</p>
                                    <p className="font-semibold text-slate-700 text-xs">{wd.payment_method}</p>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
                                <span>{new Date(wd.created_at).toLocaleDateString('id-ID')}</span>
                                <span className="font-mono text-[10px]">{wd.id.split('-')[0]}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="py-8 text-center text-xs text-slate-400">
                            Belum ada riwayat penarikan.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
