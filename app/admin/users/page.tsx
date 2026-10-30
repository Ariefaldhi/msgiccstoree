"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, User, Search, Store, Megaphone } from "lucide-react";

interface Profile {
    id: string;
    email: string;
    full_name: string;
    role: string;
    is_reseller: boolean;
    is_affiliator: boolean;
    affiliate_code: string | null;
    balance: number;
    created_at: string;
}

export default function AdminUsers() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [savingId, setSavingId] = useState<string | null>(null);
    const [localBalances, setLocalBalances] = useState<Record<string, number>>({});
    const [localCodes, setLocalCodes] = useState<Record<string, string>>({});

    const supabase = createClient();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
        if (data) {
            setUsers(data);
            const balances: Record<string, number> = {};
            const codes: Record<string, string> = {};
            data.forEach(u => {
                balances[u.id] = u.balance || 0;
                codes[u.id] = u.affiliate_code || "";
            });
            setLocalBalances(balances);
            setLocalCodes(codes);
        }
        if (error) {
            console.error("❌ Fetch Users Error:", error);
            alert("Gagal mengambil data user: " + error.message);
        }
        setLoading(false);
    };

    const handleToggleReseller = async (id: string, current: boolean) => {
        setSavingId(id);
        const { error } = await supabase.from("profiles").update({ is_reseller: !current }).eq("id", id);
        if (!error) {
            setUsers(users.map(u => u.id === id ? { ...u, is_reseller: !current } : u));
        } else {
            console.error("❌ Update Reseller Error:", error);
            alert("Gagal update status reseller: " + error.message);
        }
        setSavingId(null);
    };

    const handleToggleAffiliator = async (id: string, current: boolean) => {
        setSavingId(id);
        const { error } = await supabase.from("profiles").update({ is_affiliator: !current }).eq("id", id);
        if (!error) {
            setUsers(users.map(u => u.id === id ? { ...u, is_affiliator: !current } : u));
        } else {
            console.error("❌ Update Affiliator Error:", error);
            alert("Gagal update status afiliator: " + error.message);
        }
        setSavingId(null);
    };

    const handleUpdateCode = async (id: string, newCode: string) => {
        setSavingId(id);
        const { error } = await supabase.from("profiles").update({ affiliate_code: newCode }).eq("id", id);
        if (!error) {
            setUsers(users.map(u => u.id === id ? { ...u, affiliate_code: newCode } : u));
        } else {
            console.error("❌ Update Code Error:", error);
            const currentUser = users.find(u => u.id === id);
            if (currentUser) {
                setLocalCodes({ ...localCodes, [id]: currentUser.affiliate_code || "" });
            }
            alert("Kode afiliasi sudah ada atau gagal update: " + error.message);
        }
        setSavingId(null);
    };

    const handleUpdateBalance = async (id: string, newBalance: number) => {
        setSavingId(id);
        const { error } = await supabase.from("profiles").update({ balance: newBalance }).eq("id", id);
        if (!error) {
            setUsers(users.map(u => u.id === id ? { ...u, balance: newBalance } : u));
        } else {
            console.error("❌ Update Balance Error:", error);
            const currentUser = users.find(u => u.id === id);
            if (currentUser) {
                setLocalBalances({ ...localBalances, [id]: currentUser.balance || 0 });
            }
            alert("Gagal update saldo: " + error.message);
        }
        setSavingId(null);
    };

    const filteredUsers = users.filter(u => 
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.affiliate_code?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-200">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                        <User className="w-6 h-6 text-blue-600" />
                        Manajemen Pengguna
                    </h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-0.5">Persetujuan status reseller, afiliator, dan saldo akun.</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Cari user (email, nama, kode)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-3.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors font-medium text-xs placeholder:text-slate-400"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Memuat Data Pengguna...</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-xs whitespace-nowrap">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                        <th className="px-4 py-3">User Info</th>
                                        <th className="px-4 py-3 text-center">Status Keanggotaan</th>
                                        <th className="px-4 py-3">Data Afiliasi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-4 py-3.5">
                                                <div className="font-semibold text-slate-900">{user.full_name || 'Tidak ada nama'}</div>
                                                <div className="text-[11px] text-slate-500 mt-0.5">{user.email}</div>
                                                <div className="text-[10px] text-slate-500 mt-1 uppercase font-semibold bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 rounded inline-block">ROLE: {user.role}</div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex flex-col gap-1.5 items-center max-w-[200px] mx-auto">
                                                    <button 
                                                        onClick={() => handleToggleReseller(user.id, user.is_reseller)}
                                                        disabled={savingId === user.id}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold w-full transition-colors flex items-center justify-center gap-1.5 border ${
                                                            user.is_reseller ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                                        }`}
                                                    >
                                                        <Store className="w-3.5 h-3.5" /> Reseller: {user.is_reseller ? 'AKTIF' : 'NONAKTIF'}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleToggleAffiliator(user.id, user.is_affiliator)}
                                                        disabled={savingId === user.id}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold w-full transition-colors flex items-center justify-center gap-1.5 border ${
                                                            user.is_affiliator ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                                        }`}
                                                    >
                                                        <Megaphone className="w-3.5 h-3.5" /> Afiliator: {user.is_affiliator ? 'AKTIF' : 'NONAKTIF'}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-medium text-slate-500 w-12">Kode:</span>
                                                        <input 
                                                            type="text" 
                                                            className="bg-white border border-slate-200 rounded px-2.5 py-1 text-xs w-32 font-mono font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
                                                            placeholder="Kode..."
                                                            value={localCodes[user.id] || ""}
                                                            onChange={(e) => setLocalCodes({ ...localCodes, [user.id]: e.target.value })}
                                                            onBlur={(e) => {
                                                                if (e.target.value !== (user.affiliate_code || '')) {
                                                                    handleUpdateCode(user.id, e.target.value);
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-medium text-slate-500 w-12">Saldo:</span>
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">Rp</span>
                                                            <input 
                                                                type="number" 
                                                                className="bg-white border border-slate-200 rounded px-2.5 py-1 pl-7 text-xs w-32 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
                                                                value={localBalances[user.id] || 0}
                                                                onChange={(e) => setLocalBalances({ ...localBalances, [user.id]: parseInt(e.target.value) || 0 })}
                                                                onBlur={(e) => {
                                                                    if (parseInt(e.target.value) !== (user.balance || 0)) {
                                                                        handleUpdateBalance(user.id, parseInt(e.target.value));
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden space-y-3 p-4">
                            {filteredUsers.map((user) => (
                                <div key={user.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3 relative">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold text-slate-900 leading-tight">{user.full_name || 'Tanpa Nama'}</h3>
                                            <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                                        </div>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 border border-slate-200/60 text-slate-600">
                                            {user.role}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button 
                                            onClick={() => handleToggleReseller(user.id, user.is_reseller)}
                                            disabled={savingId === user.id}
                                            className={`px-3 py-2 rounded-lg text-xs font-semibold w-full flex flex-col items-center justify-center gap-1 border ${
                                                user.is_reseller ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}
                                        >
                                            <Store className="w-3.5 h-3.5" /> Reseller: {user.is_reseller ? 'ON' : 'OFF'}
                                        </button>
                                        <button 
                                            onClick={() => handleToggleAffiliator(user.id, user.is_affiliator)}
                                            disabled={savingId === user.id}
                                            className={`px-3 py-2 rounded-lg text-xs font-semibold w-full flex flex-col items-center justify-center gap-1 border ${
                                                user.is_affiliator ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}
                                        >
                                            <Megaphone className="w-3.5 h-3.5" /> Afiliator: {user.is_affiliator ? 'ON' : 'OFF'}
                                        </button>
                                    </div>

                                    <div className="bg-slate-50 rounded-lg p-3 space-y-2 border border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Kode Afiliasi</span>
                                            <input 
                                                type="text" 
                                                className="bg-white border border-slate-200 rounded px-2.5 py-1 text-xs w-28 font-semibold text-right focus:outline-none focus:ring-1 focus:ring-blue-600"
                                                value={localCodes[user.id] || ""}
                                                onChange={(e) => setLocalCodes({ ...localCodes, [user.id]: e.target.value })}
                                                onBlur={(e) => {
                                                    if (e.target.value !== (user.affiliate_code || '')) {
                                                        handleUpdateCode(user.id, e.target.value);
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="h-px bg-slate-200" />
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Saldo User</span>
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Rp</span>
                                                <input 
                                                    type="number" 
                                                    className="bg-white border border-slate-200 rounded px-2 py-1 pl-7 text-xs w-28 font-semibold text-right focus:outline-none focus:ring-1 focus:ring-blue-600"
                                                    value={localBalances[user.id] || 0}
                                                    onChange={(e) => setLocalBalances({ ...localBalances, [user.id]: parseInt(e.target.value) || 0 })}
                                                    onBlur={(e) => {
                                                        if (parseInt(e.target.value) !== (user.balance || 0)) {
                                                            handleUpdateBalance(user.id, parseInt(e.target.value));
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {savingId === user.id && (
                                        <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center">
                                            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {filteredUsers.length === 0 && (
                            <div className="py-16 text-center text-slate-400 text-sm">Data pengguna tidak ditemukan.</div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
