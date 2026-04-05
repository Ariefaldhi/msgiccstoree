import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google"; // Import standard next fonts
import { createClient } from "@/lib/supabase/server";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ThemeRegistry from "@/components/ThemeRegistry";

// Using Poppins for headings/UI to match the modern aesthetic
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: 'swap',
});

// Using Inter for body text readability
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "JawirStore - Digital Revolution",
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
        className={`${poppins.variable} ${inter.variable} font-sans antialiased bg-white text-[#1e1e1e] selection:bg-blue-600/30 selection:text-blue-600`}
      >
        <ThemeRegistry />
        <Navbar storeName={settings?.store_name} logoUrl={settings?.logo_url} />
        <main className="pt-24 pb-10 min-h-screen bg-white">
          {children}
        </main>
      </body>
    </html>
  );
}
