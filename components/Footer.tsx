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
        // Listen for storage changes in case it's added in another tab
        window.addEventListener('storage', checkRef);
        return () => window.removeEventListener('storage', checkRef);
    }, []);
    return (
        <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm mt-20">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            {logoUrl ? (
                                <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 shadow-lg shadow-gray-200/20">
                                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#18181b] text-white font-bold shadow-lg shadow-gray-200/20 italic text-xl">
                                    {storeName.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="text-xl font-bold uppercase tracking-tight">
                                {storeName.split(' ')[0]}<span className="text-blue-500">{storeName.split(' ').slice(1).join(' ')}</span>
                            </span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                            Platform top-up game dan aplikasi premium termurah, tercepat, dan terpercaya di Indonesia.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 text-foreground text-sm uppercase tracking-widest">Menu</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground font-medium">
                            <li><Link href="/" className="hover:text-blue-500 transition-colors">Home</Link></li>
                            <li><Link href="/reseller" className="hover:text-blue-500 transition-colors">Reseller</Link></li>
                            <li><Link href="/afiliator" className="hover:text-blue-500 transition-colors">Afiliator</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 text-foreground text-sm uppercase tracking-widest">Bantuan</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground font-medium">
                            <li><Link href="/privacy" className="hover:text-blue-500 transition-colors">Kebijakan Privasi</Link></li>
                            <li><Link href="/terms" className="hover:text-blue-500 transition-colors">Syarat & Ketentuan</Link></li>
                            <li><Link href="/contact" className="hover:text-blue-500 transition-colors">Hubungi Kami</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-medium">
                    <div>&copy; 2026 {storeName}. All rights reserved.</div>
                    
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
                            className="py-1 px-3 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-all font-bold text-[10px] uppercase tracking-wider"
                        >
                            Hapus Ref
                        </button>
                    )}
                </div>
            </div>
        </footer>
    );
}
