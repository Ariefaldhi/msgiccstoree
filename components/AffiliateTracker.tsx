"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function AffiliateTracker() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const refCode = searchParams.get("ref");
        if (refCode) {
            localStorage.setItem("msgicc_affiliate_ref", refCode);
        } else {
            localStorage.removeItem("msgicc_affiliate_ref");
        }
    }, [searchParams]);

    return null;
}
