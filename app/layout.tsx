import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google"; // Import standard next fonts
import "./globals.css";
import Navbar from "@/components/Navbar";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${poppins.variable} ${inter.variable} font-sans antialiased bg-white text-[#1e1e1e] selection:bg-jawir-red/30 selection:text-jawir-red`}
      >
        <Navbar />
        <main className="pt-24 pb-10 min-h-screen bg-white">
          {children}
        </main>
      </body>
    </html>
  );
}
