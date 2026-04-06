"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function AffiliateTracker() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const refCode = searchParams.get("ref");
        if (refCode) {
            // Save to localStorage, expires/overwritten naturally
            localStorage.setItem("msgicc_affiliate_ref", refCode);
        }
    }, [searchParams]);

    return null;
}
