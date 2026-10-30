"use client";

import React, { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TermsAndConditionsProps {
    termsText?: string | null;
    productTitle?: string;
    maxHeight?: string;
    className?: string;
}

interface ParsedTerms {
    notice?: string;
    items: string[];
    footerNote?: string;
}

// Regex to match emoji characters (covers most common ranges)
const EMOJI_RE = /[\u{1F300}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}\u{200D}\u{20E3}]+/gu;

function stripLeadingEmoji(str: string): string {
    return str.replace(/^[\s\u{1F300}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}\u{200D}\u{20E3}]+/gu, "").trim();
}

function isOnlyEmoji(str: string): boolean {
    return str.replace(EMOJI_RE, "").trim() === "";
}

function parseTermsText(text: string): ParsedTerms {
    if (!text || !text.trim()) {
        return {
            items: [
                "Pesanan diproses otomatis melalui WhatsApp resmi kami.",
                "Pastikan nomor WhatsApp yang dimasukkan aktif dan valid.",
                "Ikuti instruksi yang dikirimkan admin setelah pemesanan dikonfirmasi.",
            ],
        };
    }

    // Normalize line endings
    let cleaned = text.replace(/\r\n/g, "\n").trim();

    // Separate inline numbered lists: "blah 1. foo 2. bar" → each on its own line
    cleaned = cleaned.replace(/([^\n])\s+(\d+[\.\)])\s+/g, "$1\n$2 ");

    // Separate emoji prefix markers onto their own lines
    cleaned = cleaned.replace(/([^\n])\s*([\u{1F300}-\u{1FFFF}\u{2600}-\u{27BF}])/gu, "$1\n$2");

    const lines = cleaned
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => Boolean(l) && !isOnlyEmoji(l)); // drop lines that are purely emoji

    let notice: string | undefined;
    const items: string[] = [];
    const footerNotes: string[] = [];
    let hasFoundItems = false;

    lines.forEach((line) => {
        // Strip any leading emoji from every line before matching
        const bare = stripLeadingEmoji(line);
        if (!bare) return;

        // Skip generic S&K title lines — already shown in section header
        if (/^(SYARAT\s*[&dan]+\s*KETENTUAN|S&K|TERMS\s*AND|TERMS\s*&)/i.test(bare)) {
            return;
        }

        // Detect "ATURAN PEMAKAIAN" / "PENTING" notice lines
        if (/^(PENTING|PERHATIAN|ATURAN\s+PEMAKAIAN)/i.test(bare) && !/^\d+[\.\)]/.test(bare)) {
            notice = bare.trim();
            return;
        }

        // Numbered items: "1. Foo", "1) Foo"
        if (/^\d+[\.\)]\s*/.test(bare)) {
            hasFoundItems = true;
            items.push(bare.replace(/^\d+[\.\)]\s*/, "").trim());
            return;
        }

        // Bullet points: "- Foo", "• Foo", "* Foo"
        if (/^[-•*]\s*/.test(bare)) {
            hasFoundItems = true;
            items.push(bare.replace(/^[-•*]\s*/, "").trim());
            return;
        }

        // Trailing plain text after numbered items → footer note
        if (hasFoundItems) {
            footerNotes.push(bare);
        } else {
            items.push(bare);
        }
    });

    return {
        notice,
        items,
        footerNote: footerNotes.join(" "),
    };
}

// Words that trigger a warning style on a rule item
const WARNING_PATTERN = /dilarang|tidak ada garansi|limit|banned|disable|hack|kena limit|resiko|kesalahan sendiri/i;

export default function TermsAndConditions({
    termsText,
    maxHeight = "max-h-44",
    className,
}: TermsAndConditionsProps) {
    const parsed = useMemo(() => parseTermsText(termsText || ""), [termsText]);

    return (
        <div className={cn("rounded-xl border border-slate-200 bg-slate-50 text-xs", className)}>
            {/* Section label */}
            <div className="px-3.5 pt-3 pb-2.5 border-b border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-slate-700 tracking-tight">Syarat & Ketentuan</span>
                {parsed.notice && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/70 rounded-md px-2 py-0.5">
                        <AlertTriangle className="size-3 shrink-0" />
                        {parsed.notice}
                    </span>
                )}
            </div>

            {/* Scrollable list */}
            <div className={cn("overflow-y-auto px-3.5 py-3", maxHeight)}>
                <ol className="flex flex-col gap-2">
                    {parsed.items.map((item, idx) => {
                        const isWarning = WARNING_PATTERN.test(item);
                        return (
                            <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                                <span className={cn(
                                    "shrink-0 mt-0.5 size-[18px] rounded-md flex items-center justify-center text-[10px] font-bold",
                                    isWarning
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-slate-200 text-slate-600"
                                )}>
                                    {idx + 1}
                                </span>
                                <span className={cn(
                                    "font-medium",
                                    isWarning ? "text-amber-900" : "text-slate-700"
                                )}>
                                    {item}
                                </span>
                            </li>
                        );
                    })}
                </ol>

                {parsed.footerNote && (
                    <p className="mt-3 text-[11px] text-slate-500 italic border-t border-slate-200 pt-2.5">
                        {parsed.footerNote}
                    </p>
                )}
            </div>
        </div>
    );
}
