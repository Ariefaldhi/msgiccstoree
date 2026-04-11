"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, User, Search, Store, Megaphone, Save } from "lucide-react";

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
            // Revert local state to the current value from the users array
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
            // Revert local state to the current value from the users array
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
        <div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen Pengguna</h1>
                    <p className="text-sm font-medium text-slate-500">Persetujuan Reseller & Afiliator</p>
                </div>
            </div>

            <div className="mb-6 relative w-full md:max-w-md">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Cari user (email, nama, kode)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-sm shadow-sm"
                />
                      <div className="bg-white md:bg-white rounded-3xl md:border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <>
                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-xs">User Info</th>
                                        <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-center">Status</th>
                                        <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Data Afiliasi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-slate-900">{user.full_name || 'Tidak ada nama'}</div>
                                                <div className="text-xs text-slate-500">{user.email}</div>
                                                <div className="text-[10px] text-slate-400 mt-1 uppercase bg-slate-100 px-2 py-0.5 rounded-md inline-block">ROLE: {user.role}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-2 items-center">
                                                    <button 
                                                        onClick={() => handleToggleReseller(user.id, user.is_reseller)}
                                                        disabled={savingId === user.id}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold w-full transition-all flex items-center justify-center gap-2 border ${
                                                            user.is_reseller ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-slate-400 border-slate-200 hover:border-blue-300'
                                                        }`}
                                                    >
                                                        <Store className="w-3 h-3" /> Reseller: {user.is_reseller ? 'AKTIF' : 'NONAKTIF'}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleToggleAffiliator(user.id, user.is_affiliator)}
                                                        disabled={savingId === user.id}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold w-full transition-all flex items-center justify-center gap-2 border ${
                                                            user.is_affiliator ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-white text-slate-400 border-slate-200 hover:border-purple-300'
                                                        }`}
                                                    >
                                                        <Megaphone className="w-3 h-3" /> Afiliator: {user.is_affiliator ? 'AKTIF' : 'NONAKTIF'}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-slate-500 w-12">Kode:</span>
                                                        <input 
                                                            type="text" 
                                                            className="border border-slate-200 rounded px-2 py-1 text-xs w-32"
                                                            placeholder="Kode (opsional)"
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
                                                        <span className="text-xs font-bold text-slate-500 w-12">Saldo:</span>
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-1 text-xs text-slate-400">Rp</span>
                                                            <input 
                                                                type="number" 
                                                                className="border border-slate-200 rounded px-2 py-1 text-xs pl-7 w-32"
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
                        <div className="md:hidden space-y-4 p-4 bg-slate-50/50">
                            {filteredUsers.map((user) => (
                                <div key={user.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex flex-col">
                                            <h3 className="font-bold text-slate-900 leading-tight">{user.full_name || 'Tanpa Nama'}</h3>
                                            <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-500">
                                            {user.role}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <button 
                                            onClick={() => handleToggleReseller(user.id, user.is_reseller)}
                                            disabled={savingId === user.id}
                                            className={`px-3 py-2 rounded-xl text-[10px] font-black w-full flex flex-col items-center justify-center gap-1 border ${
                                                user.is_reseller ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                            }`}
                                        >
                                            <Store className="w-3 h-3" /> RESELLER: {user.is_reseller ? 'ON' : 'OFF'}
                                        </button>
                                        <button 
                                            onClick={() => handleToggleAffiliator(user.id, user.is_affiliator)}
                                            disabled={savingId === user.id}
                                            className={`px-3 py-2 rounded-xl text-[10px] font-black w-full flex flex-col items-center justify-center gap-1 border ${
                                                user.is_affiliator ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                            }`}
                                        >
                                            <Megaphone className="w-3 h-3" /> AFILIATOR: {user.is_affiliator ? 'ON' : 'OFF'}
                                        </button>
                                    </div>

                                    <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Kode Afiliasi</span>
                                            <input 
                                                type="text" 
                                                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs w-28 font-bold text-right outline-none focus:ring-1 focus:ring-blue-500"
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
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Saldo User</span>
                                            <div className="relative">
                                                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">Rp</span>
                                                <input 
                                                    type="number" 
                                                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 pl-6 text-xs w-28 font-bold text-right outline-none focus:ring-1 focus:ring-blue-500"
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
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                                            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>    </div>
        </div>
    );
}
