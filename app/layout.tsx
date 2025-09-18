import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/dashboard/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Invoice Tracker",
  description: "Tracks Invoices",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex max-h-screen"> 
            <Sidebar />
            <div className="flex-1 overflow-y-auto">{children}</div>            
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
