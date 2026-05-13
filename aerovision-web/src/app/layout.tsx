import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ADF-X | Advanced Airspace Intelligence",
  description: "Next-generation aircraft detection engineered for modern defence operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased dark bg-[#050505]`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
