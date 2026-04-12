"use client";

import { useState } from "react";
import { Copy, Check, Share2, MessageCircle, Twitter } from "lucide-react";

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
        <div className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-blue-600" /> Share Link Produk
                </h4>
                
                <div className="flex flex-col gap-4">
                    {/* Regular Share */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">Link Reguler</p>
                        <div className="flex bg-white rounded-2xl p-1.5 border border-slate-200 shadow-sm overflow-hidden group">
                            <input 
                                type="text" 
                                readOnly 
                                value={url} 
                                className="bg-transparent border-none outline-none text-xs w-full px-3 text-slate-600 font-medium" 
                            />
                            <div className="flex gap-1.5">
                                <button 
                                    onClick={() => handleCopy(url, 'reg')} 
                                    className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-100"
                                >
                                    {copiedReg ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                                <button 
                                    onClick={() => shareToWA(url)} 
                                    className="p-2.5 bg-[#25D366] text-white rounded-xl hover:bg-[#128C7E] transition-all active:scale-95 shadow-lg shadow-green-100"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Affiliate Share */}
                    {isAffiliator && affiliateUrl && (
                        <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-500 mt-2">
                            <div className="flex items-center justify-between ml-1">
                                <p className="text-[10px] font-black text-purple-600 uppercase tracking-tight">Link Afiliasi (Komisi Aktif)</p>
                                <span className="text-[8px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-black uppercase">Affiliator Only</span>
                            </div>
                            <div className="flex bg-purple-50 rounded-2xl p-1.5 border border-purple-100 shadow-sm overflow-hidden group relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent pointer-events-none"></div>
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={affiliateUrl} 
                                    className="bg-transparent border-none outline-none text-xs w-full px-3 text-purple-700 font-bold" 
                                />
                                <div className="flex gap-1.5 relative z-10">
                                    <button 
                                        onClick={() => handleCopy(affiliateUrl, 'aff')} 
                                        className="p-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-all active:scale-95 shadow-lg shadow-purple-100"
                                    >
                                        {copiedAff ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                    <button 
                                        onClick={() => shareToWA(affiliateUrl)} 
                                        className="p-2.5 bg-[#25D366] text-white rounded-xl hover:bg-[#128C7E] transition-all active:scale-95 shadow-lg shadow-green-100"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-[9px] text-purple-400 font-medium italic ml-1">*Gunakan link ini untuk mendapatkan komisi dari setiap pembelian.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
