import { MousePointerClick, CheckCircle, Sparkles } from "lucide-react";

export default function HowItWorks() {
    const steps = [
        {
            icon: MousePointerClick,
            title: "Pilih Aplikasi",
            desc: "Temukan aplikasi premium favorit yang ingin Anda gunakan.",
            color: "text-blue-500",
            bg: "bg-blue-50",
            border: "group-hover:border-blue-200"
        },
        {
            icon: CheckCircle,
            title: "Konfirmasi & Bayar",
            desc: "Selesaikan pesanan secara otomatis dan aman via WhatsApp.",
            color: "text-purple-500",
            bg: "bg-purple-50",
            border: "group-hover:border-purple-200"
        },
        {
            icon: Sparkles,
            title: "Langsung Nikmati",
            desc: "Akun siap digunakan! Bebas hambatan & 100% bergaransi penuh.",
            color: "text-amber-500",
            bg: "bg-amber-50",
            border: "group-hover:border-amber-200"
        }
    ];

    return (
        <section className="py-16 md:py-24 relative overflow-hidden">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Sangat Mudah & Cepat</h2>
                    <p className="text-slate-500 font-medium text-sm max-w-lg mx-auto">Hanya butuh 3 langkah sederhana untuk mulai menikmati jutaan konten dan fitur dari aplikasi premium Anda.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                    {/* Connecting Line for Desktop */}
                    <div className="hidden md:block absolute top-1/2 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-blue-100 via-purple-100 to-amber-100 -translate-y-10 z-0"></div>

                    {steps.map((step, idx) => (
                        <div key={idx} className={`relative z-10 flex flex-col items-center text-center p-6 rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2 transition-all duration-500 group cursor-default ${step.border}`}>
                            <div className="absolute top-0 right-6 -translate-y-1/2 text-[80px] font-black text-slate-50 opacity-50 select-none z-0 group-hover:scale-110 transition-transform duration-500">
                                {idx + 1}
                            </div>
                            
                            <div className={`w-16 h-16 rounded-2xl ${step.bg} ${step.color} flex items-center justify-center mb-6 shadow-inner relative z-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                                <step.icon className="w-8 h-8" />
                            </div>
                            
                            <h3 className="text-lg font-black text-slate-900 mb-2 relative z-10">{step.title}</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed relative z-10">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
