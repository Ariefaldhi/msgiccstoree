import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ThemeRegistry from "@/components/ThemeRegistry";
import AffiliateTracker from "@/components/AffiliateTracker";
import FloatingSupport from "@/components/FloatingSupport";
import { Suspense } from "react";

// Clean, premium modern font (Not quirky, highly professional)
const pjs = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-pjs",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "MsgiccStore - Digital Revolution",
  description: "Platform top-up aplikasi premium #1 di Indonesia",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("store_settings").select("store_name, logo_url").eq("id", 1).single();

  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${pjs.variable} font-sans antialiased bg-slate-50 text-[#1e1e1e] selection:bg-blue-600/30 selection:text-blue-600 relative overflow-x-hidden`}
      >
        {/* Single Color Background */}

        <ThemeRegistry />
        <Suspense fallback={null}>
          <AffiliateTracker />
        </Suspense>
        <Navbar storeName={settings?.store_name} logoUrl={settings?.logo_url} />
        <main className="pt-24 pb-24 md:pb-10 min-h-screen">
          {children}
        </main>
        <Footer storeName={settings?.store_name} logoUrl={settings?.logo_url} />
        <FloatingSupport />
      </body>
    </html>
  );
}
