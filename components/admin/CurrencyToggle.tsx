"use client";

import React from "react";
import { DollarSign, Coins } from "lucide-react";
import { useAdminCurrency } from "./AdminCurrencyProvider";
import { cn } from "@/lib/utils";

export function CurrencyToggle({ mobile = false }: { mobile?: boolean }) {
    const { isUSD, toggleCurrency } = useAdminCurrency();

    if (mobile) {
        return (
            <button
                onClick={toggleCurrency}
                className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl border font-bold text-xs active:scale-95 transition-all col-span-2",
                    isUSD 
                        ? "bg-green-50 border-green-100 text-green-600" 
                        : "bg-blue-50 border-blue-100 text-blue-600"
                )}
            >
                {isUSD ? <DollarSign className="w-4 h-4" /> : <Coins className="w-4 h-4" />}
                Switch to {isUSD ? "IDR (Rp)" : "USD ($)"}
            </button>
        );
    }

    return (
        <button
            onClick={toggleCurrency}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold w-full transition-all mb-2",
                isUSD 
                    ? "text-green-600 bg-green-50 hover:bg-green-100" 
                    : "text-blue-600 bg-blue-50 hover:bg-blue-100"
            )}
        >
            {isUSD ? <DollarSign className="w-5 h-5" /> : <Coins className="w-5 h-5" />}
            {isUSD ? "View in IDR" : "View in USD"}
        </button>
    );
}
