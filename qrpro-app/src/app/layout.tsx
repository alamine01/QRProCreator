import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { AuthRedirect } from "@/components/AuthRedirect";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Create a free personal QR code – QR Pro Creator",
  description: "QR Pro Creator allows anyone to generate their personal QR code in just a few clicks.",
  keywords: "QR code, personal QR code, digital business card, contact sharing, NFC cards",
  authors: [{ name: "QR Pro Creator" }],
  openGraph: {
    title: "Create a free personal QR code – QR Pro Creator",
    description: "QR Pro Creator allows anyone to generate their personal QR code in just a few clicks.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create a free personal QR code – QR Pro Creator",
    description: "QR Pro Creator allows anyone to generate their personal QR code in just a few clicks.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <AuthRedirect />
          {children}
          <WhatsAppFloat />
        </AuthProvider>
      </body>
    </html>
  );
}
