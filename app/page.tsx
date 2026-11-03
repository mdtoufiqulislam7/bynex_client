import Navbar from '@/components/Navbar'
import LiveTradingBanner from '@/components/LiveTradingBanner'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Plans from '@/components/Plans'
import Calculator from '@/components/Calculator'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

async function getActivePlans() {
  const backendUrl = process.env.INTERNAL_BACKEND_URL || 'http://localhost:8000';
  try {
    const res = await fetch(`${backendUrl}/api/v1/plans/active`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data?.attributes || [];
  } catch (error) {
    return [];
  }
}

export default async function Home() {
  const plans = await getActivePlans();

  return (
    <>
      <Navbar />
      <LiveTradingBanner />
      <Hero />
      <About />
      <Plans initialPlans={plans} />
      <Calculator />
      <Contact />
      <Footer />
    </>
  );
}
