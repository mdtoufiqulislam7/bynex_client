import type { Metadata } from 'next'
import './globals.css'
import { ReduxProvider } from '../components/ReduxProvider'
import { FAVICON_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Bynex Markets | Next-Gen Investment & Wealth Management',
  description: 'Bynex Markets is a smart forex and algorithmic trading platform built for confident growth, disciplined trading, and institutional capital protection.',
  icons: {
    icon: [
      { url: '/icon.svg?v=4', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png?v=4', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png?v=4', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.ico?v=4', sizes: 'any' },
    ],
    shortcut: '/favicon.ico?v=4',
    apple: '/apple-touch-icon.png?v=4',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#050505] text-white antialiased">
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  )
}
