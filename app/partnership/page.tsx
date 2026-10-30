"use client";

import { ArrowRight, CheckCircle2, Zap, Globe, ShieldCheck } from "lucide-react";
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

    const waText = "Halo Admin MsgiccStore, saya tertarik dengan program Partnership. Saya ingin bekerja sama untuk organisasi/danusan kami.";
    const waLink = `https://wa.me/${adminPhone}?text=${encodeURIComponent(waText)}`;

    const features = [
        {
            title: "Fleksibilitas Margin Harga",
            desc: "Partner bebas menentukan harga jual sendiri untuk memaksimalkan perolehan profit dana usaha.",
            icon: <Zap className="size-5 text-blue-600" />
        },
        {
            title: "Model Bagi Hasil Tinggi",
            desc: "Persentase komisi kemitraan khusus yang lebih menguntungkan untuk pendanaan organisasi.",
            icon: <Globe className="size-5 text-indigo-600" />
        },
        {
            title: "Jalur Prioritas Pemrosesan",
            desc: "Setiap pesanan dari mitra akan diproses dengan prioritas cepat oleh tim support khusus.",
            icon: <ShieldCheck className="size-5 text-emerald-600" />
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-20">
            <main className="container mx-auto px-4 max-w-4xl">
                
                <div className="text-center mb-12">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2 block">
                        Program Kemitraan
                    </span>
                    <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
                        Kemitraan Organisasi & Komunitas
                    </h1>
                    <p className="text-slate-500 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
                        Program kerja sama khusus untuk organisasi kampus, komunitas, atau kepanitiaan acara yang membutuhkan dana usaha (danus) terpercaya.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    {features.map((f, i) => (
                        <div key={i} className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs hover:border-slate-300 transition-colors">
                            <div className="size-10 bg-slate-50 rounded-xl flex items-center justify-center mb-4 border border-slate-100">
                                {f.icon}
                            </div>
                            <h3 className="font-bold text-slate-900 text-sm mb-1.5">{f.title}</h3>
                            <p className="text-xs text-slate-500 leading-relaxed font-normal">{f.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-slate-900 rounded-2xl p-6 md:p-10 text-white shadow-xs">
                    <div className="max-w-2xl">
                        <h2 className="text-xl md:text-2xl font-bold mb-3">Tertarik Bergabung Sebagai Partner?</h2>
                        <p className="text-slate-400 text-xs md:text-sm mb-6 leading-relaxed">
                            Organisasi Anda bebas memasarkan katalog akun premium kami dengan margin keuntungan yang Anda atur sendiri. Seluruh teknis dan garansi kami tangani sepenuhnya.
                        </p>
                        <div className="space-y-2 mb-8 text-xs text-slate-300">
                            <div className="flex items-center gap-2.5">
                                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                                <span>Tanpa batas minimal transaksi</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                                <span>Pencairan dana fleksibel ke rekening organisasi</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                                <span>Materi promosi dan pricelist disiapkan oleh admin</span>
                            </div>
                        </div>
                        <a 
                            href={waLink} 
                            target="_blank"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs md:text-sm transition-colors shadow-xs"
                        >
                            Konsultasi via WhatsApp <ArrowRight className="size-4" />
                        </a>
                    </div>
                </div>

            </main>
        </div>
    );
}
