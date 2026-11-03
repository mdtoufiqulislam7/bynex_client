import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CommunityContent from '@/components/CommunityContent';

export const metadata: Metadata = {
  title: 'Community | Bynex Markets',
  description:
    'Connect with global investors, discuss live trading sessions, view profit achievements, and share strategies across the Bynex Markets community.',
};

export default function CommunityPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 sm:pt-24 bg-[#12151c]">
        <CommunityContent />
      </main>
      <Footer />
    </>
  );
}

