"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AdminCurrencyContextType {
    isUSD: boolean;
    toggleCurrency: () => void;
    formatCurrency: (amount: number | string | undefined | null) => string;
    exchangeRate: number;
}

const AdminCurrencyContext = createContext<AdminCurrencyContextType | undefined>(undefined);

export function AdminCurrencyProvider({ children }: { children: ReactNode }) {
    const [isUSD, setIsUSD] = useState(false);
    const [exchangeRate, setExchangeRate] = useState(15000); // Default fallback

    useEffect(() => {
        // Fetch live exchange rate on mount
        const fetchRate = async () => {
            try {
                const res = await fetch("https://open.er-api.com/v6/latest/USD");
                const data = await res.json();
                if (data && data.rates && data.rates.IDR) {
                    setExchangeRate(data.rates.IDR);
                }
            } catch (error) {
                console.error("Failed to fetch exchange rate:", error);
            }
        };
        fetchRate();
    }, []);

    const toggleCurrency = () => {
        setIsUSD((prev) => !prev);
    };

    const formatCurrency = (amount: number | string | undefined | null) => {
        if (amount === undefined || amount === null) return isUSD ? "$0.00" : "Rp 0";
        
        let numericAmount = 0;
        if (typeof amount === "string") {
            // Clean string (e.g. "Rp 15.000" -> 15000)
            numericAmount = parseInt(amount.replace(/\D/g, ""), 10) || 0;
        } else {
            numericAmount = amount;
        }

        if (isUSD) {
            const usdAmount = numericAmount / exchangeRate;
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(usdAmount);
        } else {
            return `Rp ${numericAmount.toLocaleString("id-ID")}`;
        }
    };

    return (
        <AdminCurrencyContext.Provider value={{ isUSD, toggleCurrency, formatCurrency, exchangeRate }}>
            {children}
        </AdminCurrencyContext.Provider>
    );
}

export function useAdminCurrency() {
    const context = useContext(AdminCurrencyContext);
    if (context === undefined) {
        throw new Error("useAdminCurrency must be used within an AdminCurrencyProvider");
    }
    return context;
}
