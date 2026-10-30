import { MousePointerClick, MessageSquareText, ShieldCheck } from "lucide-react";

export default function HowItWorks() {
    const steps = [
        {
            number: "01",
            icon: MousePointerClick,
            title: "Pilih Aplikasi",
            desc: "Pilih produk dan durasi paket langganan premium yang Anda butuhkan dari katalog.",
        },
        {
            number: "02",
            icon: MessageSquareText,
            title: "Konfirmasi & Order",
            desc: "Isi nama dan nomor WhatsApp aktif, sistem akan langsung mengirim rincian transaksi Anda.",
        },
        {
            number: "03",
            icon: ShieldCheck,
            title: "Siap Digunakan",
            desc: "Akun langsung aktif dan siap digunakan dengan perlindungan garansi penuh dari kami.",
        }
    ];

    return (
        <section className="py-16 relative">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="text-center mb-12">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2 block">
                        Alur Pemesanan
                    </span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                        Mudah & Cepat dalam 3 Langkah
                    </h2>
                    <p className="text-slate-500 font-normal text-sm max-w-md mx-auto">
                        Tanpa ribet, proses instan dan terhubung langsung dengan sistem konfirmasi WhatsApp.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {steps.map((step) => (
                        <div 
                            key={step.number} 
                            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                                        <step.icon className="size-5" />
                                    </div>
                                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                                        Langkah {step.number}
                                    </span>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-1.5">{step.title}</h3>
                                <p className="text-xs text-slate-500 leading-relaxed font-normal">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
