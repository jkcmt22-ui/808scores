import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Schools Directory :: Hawaii High School Sports :: ILH, OIA, BIIF, KIF, MIL',
  description: 'Browse all Hawaii high school sports programs. Find schools by island and league. Complete directory of ILH, OIA, BIIF, KIF, MIL schools with schedules, rosters, and statistics.',
  keywords: [
    'Hawaii high schools',
    'Hawaii high school directory',
    'OIA schools',
    'ILH schools',
    'BIIF schools',
    'MIL schools',
    'KIF schools',
    'Oahu high schools',
    'Maui high schools',
    'Big Island high schools',
    'Kauai high schools',
    'Hawaii prep schools',
    'Punahou',
    'Kamehameha',
    'Saint Louis',
    'Iolani',
    'Kahuku',
    'Mililani',
    'Campbell',
    'Kapolei',
  ],
  openGraph: {
    title: 'Schools Directory - Hawaii High School Sports',
    description: 'Browse all Hawaii high school sports programs. ILH, OIA, BIIF, KIF, MIL schools directory.',
    type: 'website',
    url: 'https://www.hawaiisportscenter.com/schools',
  },
  twitter: {
    card: 'summary',
    title: 'Schools Directory - Hawaii High School Sports',
    description: 'Find Hawaii high schools by island and league.',
  },
  alternates: {
    canonical: 'https://www.hawaiisportscenter.com/schools',
  },
}

export default function SchoolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
