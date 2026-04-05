import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Hero() {
    return (
        <section className="pt-32 pb-10 container mx-auto px-4">
            <div className="relative w-full bg-gradient-to-br from-[#1e293b] to-[#020617] rounded-[2.5rem] p-8 md:p-16 overflow-hidden border border-gray-800 shadow-2xl group cursor-default">

                {/* Background Watermark */}
                <div className="absolute top-1/2 right-10 -translate-y-1/2 font-black text-[20rem] text-[#1a1a1a]/20 select-none -z-10 hidden lg:block leading-none transition-transform duration-700 group-hover:scale-110">
                    2026
                </div>

                {/* Glow Effect */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointing-events-none"></div>

                <div className="relative z-10 max-w-2xl text-left">
                    {/* Badge */}
                    <div className="inline-block px-4 py-1.5 rounded-full bg-[#1e293b] border border-gray-700 mb-6 shadow-sm">
                        <span className="text-[#4ade80] text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse"></span>
                            New Era 2026
                        </span>
                    </div>

                    {/* Title - Restored Content */}
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 leading-[0.9]">
                        PREMIUM <br />
                        <span className="text-[#3b82f6] inline-block hover:scale-105 transition-transform duration-300">APPS</span>
                    </h1>

                    {/* Description - Restored Content */}
                    <p className="text-gray-400 text-lg mb-10 max-w-lg leading-relaxed">
                        Dapatkan akses ke layanan premium Netflix, CapCut Pro, Canva Pro dan berbagai produk digital lainnya dengan harga terjangkau.
                    </p>

                    {/* Button */}
                    <button className="bg-white text-black px-8 py-4 rounded-xl font-bold tracking-wide shadow-[0_4px_0_rgb(209,213,219)] hover:shadow-[0_2px_0_rgb(209,213,219)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all">
                        EXPLORE NOW
                    </button>
                </div>
            </div>
        </section>
    );
}
