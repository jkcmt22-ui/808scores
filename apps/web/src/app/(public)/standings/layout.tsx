import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Standings :: Hawaii High School Sports :: League Rankings :: ILH, OIA, BIIF, KIF, MIL',
  description: 'Hawaii high school sports standings and league rankings. Current records for ILH, OIA, BIIF, KIF, MIL. HHSAA Division I & II standings for football, basketball, volleyball, soccer, baseball, softball.',
  keywords: [
    'Hawaii sports standings',
    'Hawaii high school standings',
    'OIA standings',
    'ILH standings',
    'BIIF standings',
    'MIL standings',
    'KIF standings',
    'Hawaii football standings',
    'Hawaii basketball standings',
    'Hawaii volleyball standings',
    'Hawaii soccer standings',
    'league rankings Hawaii',
    'HHSAA standings',
    'Division I standings',
    'Division II standings',
    'prep sports rankings',
  ],
  openGraph: {
    title: 'Standings - Hawaii High School Sports Rankings',
    description: 'Current standings and league rankings for Hawaii high school sports. ILH, OIA, BIIF, KIF, MIL.',
    type: 'website',
    url: 'https://www.hawaiisportscenter.com/standings',
  },
  twitter: {
    card: 'summary',
    title: 'Standings - Hawaii High School Sports',
    description: 'League standings for Hawaii high school sports.',
  },
  alternates: {
    canonical: 'https://www.hawaiisportscenter.com/standings',
  },
}

export default function StandingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
