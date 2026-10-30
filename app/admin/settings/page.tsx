"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Save, Store, Image as ImageIcon, Phone, Percent, Key, Users2, Palette } from "lucide-react";
import { useAdminCurrency } from "@/components/admin/AdminCurrencyProvider";

export default function AdminSettings() {
    const { formatCurrency } = useAdminCurrency();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [settings, setSettings] = useState({
        store_name: "MsgiccStore",
        primary_color: "blue",
        logo_url: "",
        whatsapp_number: "",
        affiliate_commission_percent: 25,
        fonnte_token: "",
        fonnte_group_id: ""
    });

    const supabase = createClient();

    useEffect(() => {
        const fetchSettings = async () => {
            const { data, error } = await supabase.from("store_settings").select("*").eq("id", 1).single();
            if (data) {
                setSettings({
                    store_name: data.store_name,
                    primary_color: data.primary_color,
                    logo_url: data.logo_url || "",
                    whatsapp_number: data.whatsapp_number || "",
                    affiliate_commission_percent: data.affiliate_commission_percent ?? 25,
                    fonnte_token: data.fonnte_token || "",
                    fonnte_group_id: data.fonnte_group_id || ""
                });
            }
            setLoading(false);
        };
        fetchSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const { error } = await supabase.from("store_settings").upsert({
            id: 1,
            store_name: settings.store_name,
            primary_color: settings.primary_color,
            logo_url: settings.logo_url,
            whatsapp_number: settings.whatsapp_number,
            affiliate_commission_percent: settings.affiliate_commission_percent,
            fonnte_token: settings.fonnte_token,
            fonnte_group_id: settings.fonnte_group_id
        });

        if (!error) {
            alert("Pengaturan Toko berhasil disimpan! Refresh halaman utama untuk melihat perubahan.");
        } else {
            alert("Error: " + error.message);
        }

        setIsSubmitting(false);
    };

    return (
        <div className="space-y-6 max-w-2xl pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-200">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2.5 tracking-tight">
                        <Store className="w-6 h-6 text-blue-600" />
                        Pengaturan Toko
                    </h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-0.5">
                        Sesuaikan nama toko, logo, dan integrasi WhatsApp.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 bg-white border border-slate-200/90 rounded-2xl">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Memuat Pengaturan...</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 md:p-8">
                    <form onSubmit={handleSave} className="space-y-5">
                        <div>
                            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                                <Store className="w-4 h-4 text-slate-400" />
                                Nama Toko
                            </label>
                            <input 
                                required type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" 
                                placeholder="Contoh: MsgiccStore" 
                                value={settings.store_name} 
                                onChange={e => setSettings({...settings, store_name: e.target.value})} 
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-slate-400" />
                                Logo URL
                            </label>
                            <input 
                                type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" 
                                placeholder="https://..." 
                                value={settings.logo_url} 
                                onChange={e => setSettings({...settings, logo_url: e.target.value})} 
                            />
                            {settings.logo_url && (
                                <div className="mt-3 p-2 bg-slate-50 rounded-xl border border-slate-200 w-fit">
                                    <img src={settings.logo_url} alt="Logo Preview" className="h-12 object-contain" />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-slate-400" />
                                Nomor WhatsApp Admin
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">+</span>
                                <input 
                                    type="text" className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" 
                                    placeholder="Contoh: 6285720892082" 
                                    value={settings.whatsapp_number} 
                                    onChange={e => setSettings({...settings, whatsapp_number: e.target.value.replace(/\D/g, '')})} 
                                />
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">Format: kode negara + nomor (tanpa + dan spasi). Digunakan untuk notifikasi WhatsApp.</p>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                                <Percent className="w-4 h-4 text-slate-400" />
                                Jatah Komisi Afiliator (%)
                            </label>
                            <div className="relative max-w-xs">
                                <input 
                                    type="number" className="w-full bg-white border border-slate-200 rounded-lg pr-8 pl-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" 
                                    placeholder="25" 
                                    min="0"
                                    max="100"
                                    value={settings.affiliate_commission_percent} 
                                    onChange={e => setSettings({...settings, affiliate_commission_percent: parseInt(e.target.value) || 0})} 
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                            </div>
                            <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 relative">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Simulasi Pembagian Profit:</p>
                                    <button 
                                        type="button"
                                        onClick={() => setSettings({...settings, affiliate_commission_percent: 25})}
                                        className="text-[10px] font-semibold text-blue-600 hover:underline"
                                    >
                                        Reset ke 25%
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 mb-2">Jika Profit Bersih {formatCurrency(10000)}:</p>
                                <div className="space-y-1.5 p-3 bg-white rounded-lg border border-slate-200 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-600 font-medium">Jatah Afiliator</span>
                                        <span className="text-purple-600 font-bold">{formatCurrency(10000 * settings.affiliate_commission_percent / 100)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-600 font-medium">Net Owner (Anda)</span>
                                        <span className="text-emerald-600 font-bold">{formatCurrency(10000 * (100 - settings.affiliate_commission_percent) / 100)}</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 italic">*Persentase ini dihitung dari Profit (Harga Jual - Modal).</p>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                                <Key className="w-4 h-4 text-slate-400" />
                                WhatsApp Bot (Fonnte) Token
                            </label>
                            <input 
                                type="password" className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" 
                                placeholder="Masukkan Token Fonnte Anda" 
                                value={settings.fonnte_token} 
                                onChange={e => setSettings({...settings, fonnte_token: e.target.value})} 
                            />
                            <p className="text-[11px] text-slate-500 mt-1">Dapatkan token di dashboard <a href="https://fonnte.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Fonnte</a> untuk notifikasi otomatis pesanan.</p>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                                <Users2 className="w-4 h-4 text-slate-400" />
                                Fonnte Group ID (Untuk Notifikasi Pesanan Baru)
                            </label>
                            <input 
                                type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" 
                                placeholder="Contoh: 120363000000000000@g.us" 
                                value={settings.fonnte_group_id} 
                                onChange={e => setSettings({...settings, fonnte_group_id: e.target.value})} 
                            />
                            <p className="text-[11px] text-slate-500 mt-1">ID grup WhatsApp untuk menerima notifikasi admin setiap kali pesanan baru masuk.</p>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Palette className="w-4 h-4 text-slate-400" />
                                Warna Tema Tampilan
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                {[
                                    { value: 'blue', label: 'Biru', colorClass: 'bg-blue-600' },
                                    { value: 'red', label: 'Merah', colorClass: 'bg-red-600' },
                                    { value: 'emerald', label: 'Hijau', colorClass: 'bg-emerald-600' },
                                    { value: 'purple', label: 'Ungu', colorClass: 'bg-purple-600' },
                                    { value: 'orange', label: 'Orange', colorClass: 'bg-orange-600' },
                                ].map((c) => (
                                    <label key={c.value} className={`relative cursor-pointer flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-colors ${settings.primary_color === c.value ? 'border-blue-600 bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'}`}>
                                        <input 
                                            type="radio" 
                                            name="primary_color" 
                                            value={c.value} 
                                            className="sr-only" 
                                            checked={settings.primary_color === c.value}
                                            onChange={e => setSettings({...settings, primary_color: e.target.value})}
                                        />
                                        <div className={`w-7 h-7 rounded-full shadow-xs ${c.colorClass}`}></div>
                                        <span className="text-xs font-semibold text-slate-700">{c.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <button 
                                type="submit" 
                                disabled={isSubmitting} 
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2.5 text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Simpan Pengaturan
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
