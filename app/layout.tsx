import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BPHTB Online - Bapenda Kabupaten Tapanuli Selatan",
  description: "Sistem Informasi Pajak Bea Perolehan Hak atas Tanah dan Bangunan (BPHTB) Terintegrasi SISMIOP PBB Kabupaten Tapanuli Selatan",
  icons: {
    icon: "/Logo-Tapsel.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen bg-slate-50 text-slate-800 selection:bg-rose-700 selection:text-slate-900 font-sans">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
