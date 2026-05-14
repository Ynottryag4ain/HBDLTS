import type { Metadata } from 'next'
import { Playfair_Display, Nunito } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})
const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '🎂 Happy Birthday!',
  description: 'A special birthday surprise just for you',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${playfair.variable} ${nunito.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  )
}
