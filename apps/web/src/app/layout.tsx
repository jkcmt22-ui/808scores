import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"
import { BottomNavigation } from "@/components/layout"
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
    default: "Hawaii Sports Center :: Hawaii High School Sports :: Live Scores, Stats, Standings :: ILH, OIA, BIIF, KIF, MIL",
    template: "%s | Hawaii Sports Center",
  },
  description:
    "Your source for Hawaii high school sports. Live scores, standings, stats, schedules, and rosters for HHSAA Division I & II. Covering ILH, OIA, BIIF, KIF, MIL football, basketball, volleyball, soccer, baseball, softball, and more.",
  keywords: [
    // Primary terms
    "Hawaii high school sports",
    "Hawaii Sports Center",
    "HHSAA",
    // Leagues
    "OIA",
    "OIA sports",
    "Oahu Interscholastic Association",
    "ILH",
    "ILH sports",
    "Interscholastic League of Honolulu",
    "BIIF",
    "BIIF sports",
    "Big Island Interscholastic Federation",
    "MIL",
    "MIL sports",
    "Maui Interscholastic League",
    "KIF",
    "KIF sports",
    "Kauai Interscholastic Federation",
    // Divisions
    "Division I",
    "Division II",
    "varsity",
    "JV",
    // Sports
    "Hawaii football",
    "Hawaii football scores",
    "Hawaii basketball",
    "Hawaii basketball scores",
    "boys basketball Hawaii",
    "girls basketball Hawaii",
    "Hawaii volleyball",
    "Hawaii soccer",
    "boys soccer Hawaii",
    "girls soccer Hawaii",
    "Hawaii baseball",
    "Hawaii softball",
    "Hawaii water polo",
    // Features
    "live scores",
    "high school scores",
    "prep sports Hawaii",
    "standings",
    "stats",
    "schedules",
    "rosters",
    "game results",
    "playoffs",
    "state championships",
    // Schools (top programs)
    "Punahou",
    "Kahuku",
    "Saint Louis",
    "Kamehameha",
    "Mililani",
    "Iolani",
    "Campbell",
  ],
  authors: [{ name: "Hawaii Sports Center" }],
  creator: "Hawaii Sports Center",
  publisher: "Hawaii Sports Center",
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
    locale: "en_US",
    siteName: "Hawaii Sports Center",
    title: "Hawaii Sports Center :: Hawaii High School Sports :: Live Scores & Stats",
    description:
      "Your source for Hawaii high school sports. Live scores, standings, stats, and schedules for ILH, OIA, BIIF, KIF, MIL. HHSAA Division I & II coverage.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hawaii Sports Center - Hawaii High School Sports Live",
    description:
      "Live scores, standings & stats for Hawaii high school sports. ILH, OIA, BIIF, KIF, MIL coverage.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes when you have them
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
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

// JSON-LD structured data for Organization and WebSite
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.hawaiisportscenter.com/#organization',
      name: 'Hawaii Sports Center',
      url: 'https://www.hawaiisportscenter.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.hawaiisportscenter.com/icons/icon-512.png',
        width: 512,
        height: 512,
      },
      sameAs: [],
      description: 'Your source for Hawaii high school sports coverage including live scores, standings, stats, and schedules for ILH, OIA, BIIF, KIF, and MIL.',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.hawaiisportscenter.com/#website',
      url: 'https://www.hawaiisportscenter.com',
      name: 'Hawaii Sports Center',
      description: 'Live scores and coverage for Hawaii high school sports',
      publisher: {
        '@id': 'https://www.hawaiisportscenter.com/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://www.hawaiisportscenter.com/schools?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'SportsOrganization',
      '@id': 'https://www.hawaiisportscenter.com/#sportsorg',
      name: 'Hawaii High School Athletic Association',
      alternateName: 'HHSAA',
      sport: ['Football', 'Basketball', 'Volleyball', 'Soccer', 'Baseball', 'Softball', 'Water Polo'],
      memberOf: [
        { '@type': 'SportsOrganization', name: 'OIA', alternateName: 'Oahu Interscholastic Association' },
        { '@type': 'SportsOrganization', name: 'ILH', alternateName: 'Interscholastic League of Honolulu' },
        { '@type': 'SportsOrganization', name: 'BIIF', alternateName: 'Big Island Interscholastic Federation' },
        { '@type': 'SportsOrganization', name: 'MIL', alternateName: 'Maui Interscholastic League' },
        { '@type': 'SportsOrganization', name: 'KIF', alternateName: 'Kauai Interscholastic Federation' },
      ],
    },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
          <BottomNavigation />
        </AuthProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
