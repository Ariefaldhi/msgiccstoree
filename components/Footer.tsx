"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface FooterProps {
    storeName?: string;
    logoUrl?: string;
}

export default function Footer({ storeName = "MSGICC STORE", logoUrl }: FooterProps) {
    const [hasRef, setHasRef] = useState(false);

    useEffect(() => {
        const checkRef = () => {
            setHasRef(!!localStorage.getItem("msgicc_affiliate_ref"));
        };
        checkRef();
        window.addEventListener('storage', checkRef);
        return () => window.removeEventListener('storage', checkRef);
    }, []);

    return (
        <footer className="border-t border-slate-200/80 bg-white mt-20">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2.5 mb-3">
                            {logoUrl ? (
                                <div className="size-9 rounded-xl overflow-hidden shrink-0 border border-slate-200/80 shadow-2xs">
                                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="size-9 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-lg shadow-2xs">
                                    {storeName.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="text-lg font-bold tracking-tight text-slate-900">
                                {storeName}
                            </span>
                        </Link>
                        <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-sm">
                            Platform penyedia akun aplikasi dan hiburan premium terpercaya dengan garansi resmi dan proses transaksi instan.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-3 text-slate-900 text-xs uppercase tracking-wider">Navigasi</h4>
                        <ul className="space-y-2 text-xs md:text-sm text-slate-500 font-medium">
                            <li><Link href="/" className="hover:text-blue-600 transition-colors">Home</Link></li>
                            <li><Link href="/reseller" className="hover:text-blue-600 transition-colors">Program Reseller</Link></li>
                            <li><Link href="/afiliator" className="hover:text-blue-600 transition-colors">Program Afiliasi</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-3 text-slate-900 text-xs uppercase tracking-wider">Bantuan & Legal</h4>
                        <ul className="space-y-2 text-xs md:text-sm text-slate-500 font-medium">
                            <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">Kebijakan Privasi</Link></li>
                            <li><Link href="/terms" className="hover:text-blue-600 transition-colors">Syarat & Ketentuan</Link></li>
                            <li><Link href="/contact" className="hover:text-blue-600 transition-colors">Hubungi Layanan</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
                    <div>&copy; 2026 {storeName}. Hak cipta dilindungi undang-undang.</div>
                    
                    {hasRef && (
                        <button 
                            onClick={() => {
                                if (window.confirm("Hapus data referral (ref) dari browser Anda?")) {
                                    localStorage.removeItem("msgicc_affiliate_ref");
                                    setHasRef(false);
                                    const url = new URL(window.location.href);
                                    url.searchParams.delete("ref");
                                    window.location.href = url.toString();
                                }
                            }}
                            className="py-1 px-2.5 rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors font-semibold text-[10px] uppercase tracking-wider"
                        >
                            Reset Referral
                        </button>
                    )}
                </div>
            </div>
        </footer>
    );
}
