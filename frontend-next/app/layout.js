import "./globals.css";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import { Toaster } from "sonner";
import { Fraunces, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

export const metadata = {
  title: {
    default: "China Express · 中国速运 — Importation Chine → Afrique",
    template: "%s · China Express",
  },
  description: "Agent d'importation Chine → Afrique. Catalogue produits prix d'usine, calculateur de profit, suivi de colis. De Shenzhen à Ouaga, sans stress.",
  keywords: ["importation chine afrique", "chinois produits", "shenzhen ouaga", "grossiste chine"],
  authors: [{ name: "China Express" }],
  creator: "China Express",
  publisher: "China Express",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "China Express",
    title: "China Express · 中国速运 — Importation Chine → Afrique",
    description: "Agent d'importation Chine → Afrique. Catalogue produits prix d'usine, calculateur de profit, suivi de colis.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "China Express — De Shenzhen à Ouaga, sans stress",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "China Express · 中国速运 — Importation Chine → Afrique",
    description: "Agent d'importation Chine → Afrique. Catalogue produits prix d'usine, calculateur de profit, suivi de colis.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#B8941E",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${jakarta.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#1A1515] font-sans">
        <Header />
        <main className="flex-1 pb-24 md:pb-0">{children}</main>
        <Footer />
        <BottomNav />
        <Toaster
          theme="light"
          position="top-right"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              border: "1px solid rgba(184, 148, 30, 0.3)",
              color: "#1A1515",
            },
          }}
        />
      </body>
    </html>
  );
}
