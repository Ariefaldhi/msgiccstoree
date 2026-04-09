"use client";

import { Handshake, ArrowRight, CheckCircle2, Megaphone, Zap, Globe, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PartnershipPage() {
    const [adminPhone, setAdminPhone] = useState("6285720892082");
    const supabase = createClient();

    useEffect(() => {
        const fetchSettings = async () => {
            const { data: settings } = await supabase.from("store_settings").select("whatsapp_number").eq("id", 1).single();
            if (settings?.whatsapp_number) setAdminPhone(settings.whatsapp_number);
        };
        fetchSettings();
    }, []);

    const waText = "Halo Admin MsgiccStore, saya tertarik dengan program Partnership Elite. Saya ingin bekerja sama khususnya untuk organisasi/danusan saya.";
    const waLink = `https://wa.me/${adminPhone}?text=${encodeURIComponent(waText)}`;

    const features = [
        {
            title: "Custom Pricing Control",
            desc: "Partner bebas menentukan harga jual sendiri untuk menaikkan margin profit.",
            icon: <Zap className="w-5 h-5 text-amber-500" />
        },
        {
            title: "Elite Affiliate Model",
            desc: "Sistem bagi hasil yang lebih tinggi dibanding afiliator standar.",
            icon: <Globe className="w-5 h-5 text-blue-500" />
        },
        {
            title: "Priority Handling",
            desc: "Setiap pesanan dari partner akan diproses dengan jalur prioritas tinggi.",
            icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />
        }
    ];

    return (
        <div className="min-h-screen bg-white pt-32 pb-20 overflow-hidden relative">
            {/* Background Decors */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <main className="container mx-auto px-4 max-w-4xl relative z-10">
                
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full font-black text-xs uppercase tracking-widest mb-6 border border-indigo-100 shadow-sm animate-bounce">
                        <Handshake className="w-4 h-4" /> Elite Program
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                        Power Up Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Organization & Business</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg md:text-xl max-w-2xl mx-auto">
                        Program kerjasama khusus organisasi, komunitas, atau danusan acara. Tingkatkan pendanaan Anda dengan model bisnis digital yang sudah teruji.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {features.map((f, i) => (
                        <div key={i} className="bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem] hover:bg-white hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 group">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                {f.icon}
                            </div>
                            <h3 className="font-black text-slate-900 mb-2">{f.title}</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="flex-1">
                            <h2 className="text-3xl font-black mb-4">Ingin Bergabung Sebagai Partner?</h2>
                            <p className="text-slate-400 font-medium mb-8">
                                Partner bebas menetapkan markup harga di luar sistem website kami. Pesanan Anda tetap dikelola oleh kami, namun keuntungan sepenuhnya milik organisasi Anda.
                            </p>
                            <div className="space-y-3 mb-10">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                                    <span className="font-bold text-sm">Tanpa Batas Minimum Transaksi</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                                    <span className="font-bold text-sm">Pencairan Komisi Instan</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                                    <span className="font-bold text-sm">Media Promosi Disediakan Admin</span>
                                </div>
                            </div>
                            <a 
                                href={waLink} 
                                target="_blank"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-900/40 active:scale-95"
                            >
                                Konsultasi Kerja Sama <ArrowRight className="w-5 h-5" />
                            </a>
                        </div>
                        <div className="w-full md:w-72 aspect-square bg-indigo-800/20 rounded-[2.5rem] border border-white/10 flex items-center justify-center relative group">
                            <Handshake className="w-32 h-32 text-indigo-500 group-hover:scale-110 transition-transform duration-500 opacity-50" />
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-5xl font-black text-white">VIP</span>
                                <span className="text-xs font-black tracking-[0.3em] uppercase text-indigo-400 mt-2">Partnership</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-4">
                        <span className="h-[1px] w-12 bg-slate-100"></span>
                        Bekerjasama Dengan MsgiccStore
                        <span className="h-[1px] w-12 bg-slate-100"></span>
                    </p>
                </div>

            </main>
        </div>
    );
}
