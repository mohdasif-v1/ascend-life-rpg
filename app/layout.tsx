import { Cinzel, Outfit } from "next/font/google";
import type { Metadata, Viewport } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
  weight: ["600", "700", "900"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#8b5cf6",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://ascendliferpg.mohdasifv1.dev"),
  title: {
    default: "ASCEND — Life RPG",
    template: "%s — ASCEND",
  },
  description:
    "Transform daily habits, real-world productivity, and discipline into a dark-fantasy RPG progression system.",
  applicationName: "ASCEND",
  authors: [{ name: "ASCEND Guild" }],
  keywords: ["Life RPG", "Gamified Productivity", "Habit Tracker", "Next.js", "RPG Progression"],
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "ASCEND — Turn Real Life Into an RPG",
    description:
      "Transform daily habits, real-world productivity, and discipline into a dark-fantasy RPG progression system.",
    url: "https://ascendliferpg.mohdasifv1.dev",
    siteName: "ASCEND",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "ASCEND — Life RPG Progression HUD",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ASCEND — Turn Real Life Into an RPG",
    description:
      "Transform daily habits, real-world productivity, and discipline into a dark-fantasy RPG progression system.",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${outfit.variable} dark`}>
      <body className="min-h-screen bg-[#070709] text-[#ededef] font-sans antialiased selection:bg-[#8b5cf6]/30 selection:text-[#c4b5fd]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
