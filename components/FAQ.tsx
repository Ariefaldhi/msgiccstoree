"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
    {
        q: "Apakah akun aplikasi di sini aman digunakan?",
        a: "Ya, tentu saja! Kami menggunakan metode berlangganan yang aman dan terpercaya, sehingga akun Anda terlindungi dari masalah dan di-cover oleh garansi penuh kami."
    },
    {
        q: "Bagaimana cara klaim garansinya jika ada masalah?",
        a: "Anda cukup membalas pesan WhatsApp admin yang memberikan detail akun Anda sebelumnya. Admin kami akan mengecek dan memproses klaim garansi Anda maksimal dalam 3x24 jam kerja."
    },
    {
        q: "Berapa lama proses pengerjaan pesanannya?",
        a: "Biasanya hanya memakan waktu 5-15 menit pada jam kerja. Pada jam sibuk atau luar jam kerja, pesanan akan diproses maksimal dalam 1x24 jam."
    },
    {
        q: "Apakah saya bisa memperpanjang akun yang sama di bulan berikutnya?",
        a: "Sangat bisa! Namun ini bergantung pada kebijakan aplikasinya. Beberapa aplikasi (seperti Spotify) sangat mudah diperpanjang, sementara yang lain mungkin mewajibkan pergantian akun keluarga. Tanyakan pada admin untuk detail spesifik aplikasi Anda."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-16 md:py-24 relative overflow-hidden">
            {/* Background Ornaments */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="container mx-auto px-4 max-w-4xl relative z-10">
                <div className="flex flex-col items-center text-center mb-12">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200/50 mb-4">
                        <HelpCircle className="w-6 h-6 text-slate-700" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Pertanyaan Seputar Layanan</h2>
                    <p className="text-slate-500 font-medium text-sm max-w-lg">Biar makin yakin dan nyaman, temukan jawaban dari hal-hal yang sering ditanyakan pembeli kami.</p>
                </div>

                <div className="space-y-3">
                    {faqs.map((faq, idx) => (
                        <div 
                            key={idx} 
                            className={cn(
                                "border border-white/60 rounded-[1.5rem] overflow-hidden transition-all duration-300 backdrop-blur-xl",
                                openIndex === idx 
                                    ? "bg-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)]" 
                                    : "bg-white/30 hover:bg-white/40 shadow-sm"
                            )}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 outline-none"
                            >
                                <span className={cn(
                                    "font-bold transition-colors",
                                    openIndex === idx ? "text-blue-600" : "text-slate-700"
                                )}>
                                    {faq.q}
                                </span>
                                <div className={cn(
                                    "shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                                    openIndex === idx ? "bg-blue-100 text-blue-600 rotate-180" : "bg-white text-slate-400"
                                )}>
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                            </button>
                            
                            <div 
                                className={cn(
                                    "overflow-hidden transition-all duration-500 ease-in-out px-6",
                                    openIndex === idx ? "max-h-48 pb-6 opacity-100" : "max-h-0 opacity-0"
                                )}
                            >
                                <p className="text-sm text-slate-600 font-medium leading-relaxed border-t border-slate-200/50 pt-4">
                                    {faq.a}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
