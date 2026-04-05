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
        logo_url: ""
    });

    const supabase = createClient();

    useEffect(() => {
        const fetchSettings = async () => {
            const { data, error } = await supabase.from("store_settings").select("*").eq("id", 1).single();
            if (data) {
                setSettings({
                    store_name: data.store_name,
                    primary_color: data.primary_color,
                    logo_url: data.logo_url || ""
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
            logo_url: settings.logo_url
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
                                placeholder="e.g. JawirStore" 
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
