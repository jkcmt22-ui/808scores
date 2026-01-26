import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Live Scores :: Hawaii High School Sports :: Real-Time Updates',
  description: 'Watch Hawaii high school sports live! Real-time scores and updates for ILH, OIA, BIIF, KIF, MIL games. Football, basketball, volleyball, soccer, and more. HHSAA Division I & II live coverage.',
  keywords: [
    'Hawaii live scores',
    'Hawaii high school sports live',
    'HHSAA live',
    'OIA live scores',
    'ILH live scores',
    'BIIF live scores',
    'MIL live scores',
    'KIF live scores',
    'Hawaii football live',
    'Hawaii basketball live',
    'real-time scores Hawaii',
    'prep sports live',
  ],
  openGraph: {
    title: 'Live Scores - Hawaii High School Sports',
    description: 'Real-time scores and updates for Hawaii high school sports. ILH, OIA, BIIF, KIF, MIL coverage.',
    type: 'website',
    url: 'https://www.hawaiisportscenter.com/live',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Scores - Hawaii High School Sports',
    description: 'Real-time scores for Hawaii high school sports.',
  },
  alternates: {
    canonical: 'https://www.hawaiisportscenter.com/live',
  },
}

export default function LiveLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
