import type { Metadata } from "next";
import {
  Syne,
  Plus_Jakarta_Sans,
  Silkscreen,
  JetBrains_Mono,
  Bebas_Neue,
  Poppins,
  Inter,
  Righteous,
} from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const righteous = Righteous({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-righteous",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const silkscreen = Silkscreen({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-silkscreen",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas-neue",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FocusForge | Deep Work & Flow State Forge",
  description:
    "Aesthetic deep-work stopwatch, streak engine, and ambient soundscapes companion.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="theme-1"
      className={`${righteous.variable} ${syne.variable} ${plusJakartaSans.variable} ${silkscreen.variable} ${jetbrainsMono.variable} ${bebasNeue.variable} ${poppins.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen antialiased"
        data-theme="theme-1"
        suppressHydrationWarning
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

