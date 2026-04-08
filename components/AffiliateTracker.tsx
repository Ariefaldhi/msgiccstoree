"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function AffiliateTracker() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const refCode = searchParams.get("ref");
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        const now = new Date().getTime();

        if (refCode) {
            const data = {
                code: refCode,
                expiry: now + thirtyDays
            };
            localStorage.setItem("msgicc_affiliate_ref", JSON.stringify(data));
        } else {
            const saved = localStorage.getItem("msgicc_affiliate_ref");
            if (saved) {
                try {
                    const { code, expiry } = JSON.parse(saved);
                    if (now < expiry) {
                        // Re-append to URL if missing but valid
                        const url = new URL(window.location.href);
                        url.searchParams.set("ref", code);
                        window.history.replaceState({}, "", url.toString());
                    } else {
                        localStorage.removeItem("msgicc_affiliate_ref");
                    }
                } catch (e) {
                    localStorage.removeItem("msgicc_affiliate_ref");
                }
            }
        }
    }, [searchParams]);

    return null;
}
