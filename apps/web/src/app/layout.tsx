import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"
import { BottomNavigation, SubmitFAB } from "@/components/layout"
import { AuthProvider, ThemeProvider } from "@/components/providers"
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
        <AuthProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-neon-blue focus:text-background focus:font-bold focus:outline-none"
          >
            Skip to main content
          </a>
          <main id="main-content" className="min-h-screen pb-20">
            {children}
          </main>
          <InstallPrompt />
          <SubmitFAB />
          <BottomNavigation />
        </AuthProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
