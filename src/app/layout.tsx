import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit, Mulish } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "ASLP Powerlifting Live Controller",
  description: "Panel de control para transmisión en vivo de Powerlifting",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-theme="night"
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${mulish.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col font-mulish w-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
