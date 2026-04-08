"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Save, Store, Image as ImageIcon } from "lucide-react";

export default function AdminSettings() {
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [settings, setSettings] = useState({
        store_name: "MsgiccStore",
        primary_color: "blue",
        logo_url: "",
        whatsapp_number: "",
        affiliate_commission_percent: 25
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
                    affiliate_commission_percent: data.affiliate_commission_percent ?? 25
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
            affiliate_commission_percent: settings.affiliate_commission_percent
        });

        if (!error) {
            alert("Pengaturan Toko berhasil disimpan! Refresh halaman utama untuk melihat perubahan.");
        } else {
            alert("Error: " + error.message);
        }

        setIsSubmitting(false);
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                    <Store className="w-6 h-6 text-blue-600" />
                    Pengaturan Toko
                </h1>
                <p className="text-sm text-slate-500 font-medium mt-1">
                    Sesuaikan nama toko, logo, dan warna tema website utama.
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12 bg-white rounded-3xl border border-slate-100">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                    <form onSubmit={handleSave} className="space-y-6">
                        
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Store className="w-4 h-4 text-slate-400" />
                                Nama Toko
                            </label>
                            <input 
                                required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                placeholder="e.g. MsgiccStore" 
                                value={settings.store_name} 
                                onChange={e => setSettings({...settings, store_name: e.target.value})} 
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-slate-400" />
                                Logo URL
                            </label>
                            <input 
                                type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                placeholder="https://..." 
                                value={settings.logo_url} 
                                onChange={e => setSettings({...settings, logo_url: e.target.value})} 
                            />
                            {settings.logo_url && (
                                <img src={settings.logo_url} alt="Logo Preview" className="mt-4 h-16 object-contain rounded-xl border border-slate-200 p-2" />
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                {/* Phone icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.58 3.41 2 2 0 0 1 3.55 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.69a16 16 0 0 0 6.28 6.28l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                Nomor WhatsApp Admin
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">+</span>
                                <input 
                                    type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-8 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    placeholder="e.g. 6285720892082" 
                                    value={settings.whatsapp_number} 
                                    onChange={e => setSettings({...settings, whatsapp_number: e.target.value.replace(/\D/g, '')})} 
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Format: kode negara + nomor (tanpa + dan spasi). Digunakan untuk semua notifikasi order dan pendaftaran reseller/afiliator.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                {/* Percent Icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg>
                                Komisi Afiliator (%)
                            </label>
                            <div className="relative max-w-xs">
                                <input 
                                    type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none" 
                                    placeholder="5" 
                                    min="0"
                                    max="100"
                                    value={settings.affiliate_commission_percent} 
                                    onChange={e => setSettings({...settings, affiliate_commission_percent: parseInt(e.target.value) || 0})} 
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Persentase dari profit (harga jual - harga modal) yang diberikan kepada afiliator.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                {/* Next 13 lucide icon paintclip replaced by stroke */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                Warna Utama Tampilan
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { value: 'blue', label: 'Biru (Default)', colorClass: 'bg-blue-600' },
                                    { value: 'red', label: 'Merah Jawir', colorClass: 'bg-red-600' },
                                    { value: 'emerald', label: 'Hijau', colorClass: 'bg-emerald-600' },
                                    { value: 'purple', label: 'Ungu', colorClass: 'bg-purple-600' },
                                    { value: 'orange', label: 'Orange', colorClass: 'bg-orange-600' },
                                ].map((c) => (
                                    <label key={c.value} className={`relative cursor-pointer flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${settings.primary_color === c.value ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-300'}`}>
                                        <input 
                                            type="radio" 
                                            name="primary_color" 
                                            value={c.value} 
                                            className="sr-only" 
                                            checked={settings.primary_color === c.value}
                                            onChange={e => setSettings({...settings, primary_color: e.target.value})}
                                        />
                                        <div className={`w-8 h-8 rounded-full shadow-sm ${c.colorClass}`}></div>
                                        <span className="text-xs font-bold text-slate-700">{c.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all">
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Simpan Pengaturan
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
