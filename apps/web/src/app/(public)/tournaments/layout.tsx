import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tournaments :: HHSAA State Championships :: Hawaii High School Sports',
  description: 'Hawaii high school tournament brackets and state championships. HHSAA Division I & II playoffs, quarterfinals, semifinals, and championship games. ILH, OIA, BIIF, KIF, MIL tournament coverage.',
  keywords: [
    'HHSAA tournaments',
    'HHSAA state championships',
    'Hawaii state tournament',
    'Hawaii playoffs',
    'Division I championships',
    'Division II championships',
    'Hawaii football playoffs',
    'Hawaii basketball tournament',
    'Hawaii volleyball championship',
    'state semifinals',
    'state quarterfinals',
    'tournament brackets',
    'playoff brackets Hawaii',
  ],
  openGraph: {
    title: 'Tournaments & Championships - Hawaii High School Sports',
    description: 'HHSAA tournament brackets and state championships. Division I & II playoff coverage.',
    type: 'website',
    url: 'https://www.hawaiisportscenter.com/tournaments',
  },
  twitter: {
    card: 'summary',
    title: 'Tournaments - Hawaii High School Sports',
    description: 'HHSAA state championships and tournament brackets.',
  },
  alternates: {
    canonical: 'https://www.hawaiisportscenter.com/tournaments',
  },
}

export default function TournamentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
