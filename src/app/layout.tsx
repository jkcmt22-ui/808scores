import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { BottomNavigation, SubmitFAB } from "@/components/layout"
import { AuthProvider } from "@/components/providers"
import { InstallPrompt } from "@/components/pwa"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Hawaii Sports Center - High School Sports Live",
    template: "%s | Hawaii Sports Center",
  },
  description:
    "Live scores and updates for Hawaii high school sports. Football, basketball, volleyball, baseball, soccer and more.",
  keywords: [
    "Hawaii high school sports",
    "Hawaii football scores",
    "Hawaii basketball scores",
    "HHSAA",
    "OIA",
    "ILH",
    "BIIF",
    "MIL",
    "KIF",
    "live scores",
    "Hawaii sports",
  ],
  authors: [{ name: "Hawaii Sports Center" }],
  creator: "Hawaii Sports Center",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hawaii Sports Center",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Hawaii Sports Center",
    title: "Hawaii Sports Center - High School Sports Live",
    description:
      "Live scores and updates for Hawaii high school sports. Football, basketball, volleyball, baseball, soccer and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hawaii Sports Center - High School Sports Live",
    description:
      "Live scores and updates for Hawaii high school sports.",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <div className="min-h-screen pb-20">
            {children}
          </div>
          <InstallPrompt />
          <SubmitFAB />
          <BottomNavigation />
        </AuthProvider>
      </body>
    </html>
  )
}
