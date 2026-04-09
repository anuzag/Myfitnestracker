import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/components/providers/auth-provider";
import { Sidebar } from "@/components/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MuFitnessTracker",
  description: "Track your fitness progress with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="h-full flex bg-black text-white selection:bg-green-500/30 selection:text-green-500">
        <AuthProvider>
          <Sidebar />
          <main className="flex-1 min-h-screen relative">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
