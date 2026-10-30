"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
    {
        q: "Apakah akun aplikasi di sini aman digunakan?",
        a: "Ya, tentu saja. Kami menggunakan metode berlangganan resmi dan aman, sehingga akun Anda terlindungi dari pemblokiran dan dilindungi garansi penuh selama masa aktif berlangganan."
    },
    {
        q: "Bagaimana cara klaim garansi jika terjadi kendala?",
        a: "Cukup hubungi WhatsApp admin dengan menyertakan bukti pemesanan atau membalas chat konfirmasi pesanan Anda sebelumnya. Admin kami akan langsung memproses kendala atau penggantian akun secepatnya."
    },
    {
        q: "Berapa lama proses aktivasi pesanannya?",
        a: "Rata-rata aktivasi hanya memakan waktu 5–15 menit pada jam operasional kerja. Di luar jam kerja atau saat antrean tinggi, proses diselesaikan maksimal 1x24 jam."
    },
    {
        q: "Apakah akun bisa diperpanjang di bulan berikutnya?",
        a: "Sebagian besar paket aplikasi (seperti Spotify, Netflix, YouTube) mendukung perpanjangan pada akun yang sama. Tim admin akan memandu Anda saat waktu perpanjangan tiba."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-16 relative">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="flex flex-col items-center text-center mb-10">
                    <div className="size-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-3">
                        <HelpCircle className="size-5" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                        Pertanyaan Umum
                    </h2>
                    <p className="text-slate-500 font-normal text-sm max-w-md">
                        Semua jawaban penting seputar garansi, keamanan akun, dan alur pemesanan.
                    </p>
                </div>

                <div className="space-y-2.5">
                    {faqs.map((faq, idx) => {
                        const isOpen = openIndex === idx;
                        return (
                            <div 
                                key={idx} 
                                className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs hover:border-slate-300 transition-colors"
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 outline-none group cursor-pointer"
                                >
                                    <span className={cn(
                                        "text-sm md:text-base font-semibold transition-colors",
                                        isOpen ? "text-blue-600" : "text-slate-800 group-hover:text-slate-900"
                                    )}>
                                        {faq.q}
                                    </span>
                                    <div className={cn(
                                        "size-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200",
                                        isOpen ? "rotate-180 text-blue-600 bg-blue-50" : "text-slate-400 bg-slate-50"
                                    )}>
                                        <ChevronDown className="size-4" />
                                    </div>
                                </button>
                                
                                {isOpen && (
                                    <div className="px-5 pb-4 pt-1 border-t border-slate-100">
                                        <p className="text-sm text-slate-600 font-normal leading-relaxed">
                                            {faq.a}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
