import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import InvestingInfoContent from '@/components/InvestingInfoContent'

export const metadata: Metadata = {
  title: 'Investing Info | Bynex Markets',
  description:
    'Forex introduction, global trading hubs, partnership benefits, income types, and Bynex Markets rank structure — public investor guide.',
}

export default function InvestingInfoPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[50vh] pt-24 sm:pt-28 bg-slate-950">
        <InvestingInfoContent />
      </main>
      <Footer />
    </>
  )
}
