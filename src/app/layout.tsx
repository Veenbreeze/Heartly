import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Inter,
  Lora,
  Playfair_Display,
} from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Heartly Digital Gifts",
    template: "%s · Heartly",
  },
  description:
    "Create beautiful digital gifts with music, photos, animations, and a personal message. Send a little joy in a link — no wrapping paper required.",
  applicationName: "Heartly",
  keywords: [
    "digital gifts",
    "online gift cards",
    "birthday gift",
    "love letter",
    "Tanzania gifts",
    "Heartly",
  ],
  authors: [{ name: "Heartly" }],
  openGraph: {
    type: "website",
    siteName: "Heartly",
    title: "Heartly Digital Gifts",
    description:
      "Thoughtful digital gifts with music, photos, and a message that feels like you.",
    url: "/",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Heartly" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Heartly Digital Gifts",
    description: "Create and send a digital gift in minutes.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#FFF9F7",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${cormorant.variable} ${lora.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-plum focus:px-5 focus:py-2.5 focus:text-sm focus:text-white"
        >
          Skip to content
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
