"use client";

import { useState } from "react";
import { Copy, Check, Share2, MessageCircle } from "lucide-react";

interface ShareButtonsProps {
    url: string;
    affiliateUrl?: string;
    title: string;
    isAffiliator?: boolean;
}

export default function ShareButtons({ url, affiliateUrl, title, isAffiliator }: ShareButtonsProps) {
    const [copiedReg, setCopiedReg] = useState(false);
    const [copiedAff, setCopiedAff] = useState(false);

    const handleCopy = (link: string, type: 'reg' | 'aff') => {
        navigator.clipboard.writeText(link);
        if (type === 'reg') {
            setCopiedReg(true);
            setTimeout(() => setCopiedReg(false), 2000);
        } else {
            setCopiedAff(true);
            setTimeout(() => setCopiedAff(false), 2000);
        }
    };

    const shareToWA = (link: string) => {
        window.open(`https://wa.me/?text=${encodeURIComponent(`${title}\n\nCek di sini: ${link}`)}`, '_blank');
    };

    return (
        <div className="space-y-4">
            <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-blue-600" /> Share Link Produk
                </h4>
                
                <div className="flex flex-col gap-3">
                    {/* Regular Share */}
                    <div className="space-y-1.5">
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Link Reguler</p>
                        <div className="flex items-center bg-white rounded-xl p-1.5 border border-slate-200 shadow-xs focus-within:border-slate-300">
                            <input 
                                type="text" 
                                readOnly 
                                value={url} 
                                className="bg-transparent border-none outline-none text-xs w-full px-2.5 text-slate-700 font-medium" 
                            />
                            <div className="flex gap-1.5 shrink-0">
                                <button 
                                    onClick={() => handleCopy(url, 'reg')} 
                                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors active:scale-95"
                                    title="Salin Link"
                                >
                                    {copiedReg ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                </button>
                                <button 
                                    onClick={() => shareToWA(url)} 
                                    className="p-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg transition-colors active:scale-95"
                                    title="Bagikan ke WhatsApp"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Affiliate Share */}
                    {isAffiliator && affiliateUrl && (
                        <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Link Afiliasi (Komisi Aktif)</p>
                                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">Affiliator Only</span>
                            </div>
                            <div className="flex items-center bg-purple-50/50 rounded-xl p-1.5 border border-purple-200 shadow-xs focus-within:border-purple-300">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={affiliateUrl} 
                                    className="bg-transparent border-none outline-none text-xs w-full px-2.5 text-purple-900 font-semibold" 
                                />
                                <div className="flex gap-1.5 shrink-0">
                                    <button 
                                        onClick={() => handleCopy(affiliateUrl, 'aff')} 
                                        className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors active:scale-95 shadow-xs"
                                        title="Salin Link Afiliasi"
                                    >
                                        {copiedAff ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                    <button 
                                        onClick={() => shareToWA(affiliateUrl)} 
                                        className="p-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg transition-colors active:scale-95 shadow-xs"
                                        title="Bagikan ke WhatsApp"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-[10px] text-purple-600 font-medium">*Gunakan link ini untuk mendapatkan komisi dari setiap transaksi pembeli.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
