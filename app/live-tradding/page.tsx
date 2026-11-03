import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LiveTradingRoom from '@/components/LiveTradingRoom';

export const metadata: Metadata = {
  title: 'Live Trading Floor | Bynex Markets',
  description: 'Watch real-time live trading sessions, market analysis, and professional trader signals on Bynex Markets.',
};

export default function LiveTraddingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#070B14]">
        <LiveTradingRoom />
      </main>
      <Footer />
    </>
  );
}
