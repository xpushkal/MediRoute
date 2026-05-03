import type { Metadata } from "next";
import { Figtree, Noto_Sans } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MediRoute AI — Healthcare Navigator & Cost Estimator",
    template: "%s | MediRoute AI",
  },
  description:
    "India's AI-powered healthcare decision-support platform. Find the right hospitals, understand treatment costs, and get realistic estimates — all in one place.",
  keywords: [
    "healthcare", "hospital finder", "cost estimator", "India",
    "medical costs", "hospital ranking", "treatment cost",
    "healthcare AI", "MediRoute",
  ],
  openGraph: {
    title: "MediRoute AI — Your Compass for Healthcare",
    description: "Describe your symptoms. Discover the right clinical pathway, trusted providers, and realistic cost estimates — instantly.",
    type: "website",
    locale: "en_IN",
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
      className={`${figtree.variable} ${notoSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
