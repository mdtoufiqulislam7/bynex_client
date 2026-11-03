import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  BookOpen,
  Globe2,
  Users,
  Radio,
  Wallet,
  Gift,
  Share2,
  Trophy,
  TrendingUp,
  ArrowRight,
  Sparkles,
  User,
} from 'lucide-react';

const IMG_HERO =
  'https://res.cloudinary.com/dshkbza19/image/upload/v1775451078/trading_tcnxuf.png';
const IMG_CERT_GOOD_STANDING =
  '/images/cert_good_standing_bynex.png';
const IMG_CERT_INCORPORATION =
  '/images/cert_incorporation_bynex.png';

const hubs = [
  {
    city: 'London',
    title: 'Largest forex hub',
    detail: 'Handles over $2.5 trillion in transactions daily (about 35–40% of global volume).',
  },
  {
    city: 'New York',
    title: 'Bridges sessions',
    detail: 'Second-largest trading market — about $1.3 trillion daily (~18–20% of global trades). Connects Asian and US sessions.',
  },
  {
    city: 'Tokyo',
    title: 'Biggest hub in Asia',
    detail: 'Roughly $500–600 billion daily (6–8% of global activity). Sets early momentum for JPY pairs.',
  },
];

const partnershipBenefits = [
  { icon: Users, title: 'Personal management', text: 'Dedicated support for your trading needs. Access to expert trading signals and strategies.' },
  { icon: Radio, title: 'Signal management', text: 'Structured delivery and management of trading signals aligned with your plan.' },
  { icon: Wallet, title: 'Fund management', text: 'Professional handling of client funds according to platform policies.' },
  { icon: Gift, title: 'Rewards', text: 'Exclusive partner incentives and bonuses.' },
  { icon: Share2, title: 'Referral commission', text: 'Earn commissions as an Introducing Broker.' },
  { icon: Trophy, title: 'Club income', text: 'Extra earnings through community and club programmes.' },
];

/** Labels matching brochure-style “Types of Income” screen */
const incomeTypesBrochure = [
  'Direct sponsor commission',
  'Monthly salary',
  'Team generation income',
  'Global royalty',
  'Rank incentive',
];

const rankRows = [
  { rank: 'Starter', target: '(8–12)%', salary: '—', condition: 'Entry level', bonus: '—' },
  { rank: 'Executive', target: '$12,000', salary: '$250', condition: '5 users · 1 leg 50% / other 50% · personal invest $500', bonus: 'Smartphone' },
  { rank: 'Sr. Executive', target: '$36,000', salary: '$500', condition: '10 users · 1 leg 50% / other 50% · personal invest $1,000', bonus: 'Laptop' },
  { rank: 'Director', target: '$100,000', salary: '$1,000', condition: '15 users · 1 leg 50% / other 50% · personal invest $2,000', bonus: 'International tour' },
  { rank: 'National Leader', target: '$250,000', salary: '$2,000', condition: '20 users · 1 leg 50% / other 50% · personal invest $3,000', bonus: '150 CC bike' },
  { rank: 'Global Leader', target: '$500,000', salary: '$3,000', condition: '25 users · 1 leg 50% / other 50% · personal invest $5,000', bonus: '250 CC bike' },
  { rank: 'Ambassador', target: '$1M', salary: '$5,000', condition: '30 users · 1 leg 50% / other 50% · personal invest $10,000', bonus: 'Car' },
];

const rankDetailCards = [
  {
    title: 'Executive',
    conditions: ['Create 5 accounts', 'Total team deposit $12,000', '1 leg 50% / other leg 50%', 'Personal investment $500'],
    benefits: ['Fixed salary $250', 'Generation commission on team client profit', 'Global royalty 1% on total company client profit', 'Smartphone'],
  },
  {
    title: 'Sr. Executive',
    conditions: ['Create 10 accounts', 'Total team deposit $36,000', '1 leg 50% / other leg 50%', 'Personal investment $1,000'],
    benefits: ['Fixed salary $500', 'Generation commission on team client profit', 'Global royalty 1% on total company client profit', 'Laptop'],
  },
  {
    title: 'Director',
    conditions: ['Create 15 accounts', 'Total team deposit $100,000', '1 leg 50% / other leg 50%', 'Personal investment $2,000'],
    benefits: ['Fixed salary $1,000', 'Generation commission on team client profit', 'Global royalty 1% on total company client profit', 'International tour'],
  },
  {
    title: 'National Leader',
    conditions: ['Create 20 accounts', 'Total team deposit $250,000', '1 leg 50% / other 50%', 'Personal investment $3,000'],
    benefits: ['Fixed salary $2,000', 'Generation commission on team client profit', 'Global royalty 1% on total company client profit', '150 CC bike'],
  },
  {
    title: 'Global Leader',
    conditions: ['Create 25 accounts', 'Total team deposit $500,000', '1 leg 50% / other leg 50%', 'Personal investment $5,000'],
    benefits: ['Fixed salary $3,000', 'Generation commission on team client profit', 'Global royalty 1% on total company client profit', '250 CC bike'],
  },
  {
    title: 'Ambassador',
    conditions: ['Create 30 accounts', 'Total team deposit $1,000,000', '1 leg 50% / other 50%', 'Personal investment $10,000'],
    benefits: ['Fixed salary $5,000', 'Generation commission on team client profit', 'Global royalty 1% on total company client profit', 'Car'],
  },
];

const compensationOverview = [
  { label: 'Direct sponsor', value: '5% of client deposit' },
  { label: 'Monthly salary', value: 'Fixed per rank (see table)' },
  { label: 'Generation', value: "26% on clients' profit" },
  { label: 'Global royalty', value: '5% on total company client profit (overview)' },
  { label: 'Rank incentive', value: 'Fixed on rank achievement' },
];

function PipWordmark({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-1.5 rounded-md shadow-md shadow-cyan-500/20">
        <TrendingUp className="h-5 w-5 text-white" />
      </div>
      <span className="text-xl font-serif font-bold tracking-wide text-white">
        Bynex <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400">Markets</span>
      </span>
    </div>
  );
}

const InvestingInfoContent = () => {
  return (
    <div className="relative overflow-hidden bg-[#12151c]">
      {/* —— Hero: trading visual —— */}
      <section className="relative w-full min-h-[320px] sm:min-h-[420px] md:min-h-[480px]">
        <Image
          src={IMG_HERO}
          alt="Trading charts and market data visualization"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/30" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[320px] sm:min-h-[420px] md:min-h-[480px] flex flex-col justify-center items-center text-center py-16 sm:py-20">
          <div className="inline-flex items-center justify-center gap-2 bg-black/30 border border-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="text-emerald-400 w-4 h-4" />
            <span className="text-emerald-400/90 text-xs sm:text-sm font-bold uppercase tracking-wider">
              Data-driven trading
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4 leading-tight max-w-3xl mx-auto drop-shadow-lg">
            Your trading platform for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400">
              every day
            </span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed drop-shadow">
            Forex education, official certificates, partnership benefits, income types, and rank structure — the same investor guide for everyone.
          </p>
        </div>
      </section>

      {/* —— Certificates —— */}
      <section className="relative z-10 border-t border-slate-800/80 bg-[#1b202c] py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
          <div className="text-center mb-4">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">Official registration</h2>
            <p className="text-slate-500 text-sm mt-2">Saint Lucia — Bynex Markets</p>
          </div>

          <div className="flex flex-col items-center gap-8 text-center max-w-3xl mx-auto">
            <PipWordmark className="justify-center" />
            <div className="relative w-full max-w-md shadow-2xl shadow-black/50 rounded-lg overflow-hidden ring-1 ring-white/10 mx-auto">
              <Image
                src={IMG_CERT_GOOD_STANDING}
                alt="Saint Lucia Certificate of Good Standing — Bynex Markets No. 2024-00230"
                width={800}
                height={1100}
                className="w-full h-auto object-contain bg-[#0f1218] mx-auto"
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-8 text-center max-w-4xl mx-auto">
            <PipWordmark className="justify-center" />
            <div className="relative w-full max-w-2xl shadow-2xl shadow-black/50 rounded-lg overflow-hidden ring-1 ring-white/10 mx-auto">
              <Image
                src={IMG_CERT_INCORPORATION}
                alt="Saint Lucia Certificate of Incorporation — Bynex Markets No. 2024-00230"
                width={1100}
                height={800}
                className="w-full h-auto object-contain bg-[#0f1218] mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Forex intro */}
      <section className="relative z-10 py-12 sm:py-16 border-t border-slate-800/90 bg-[#12151c]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-6">
            <BookOpen className="text-cyan-400 shrink-0" size={22} />
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">Introduction to forex trading</h2>
          </div>
          <div className="prose prose-invert prose-sm sm:prose-base max-w-none text-slate-400 space-y-4 text-center mx-auto">
            <p>
              Forex (foreign exchange) is the global market for buying and selling currencies. It is the largest financial market in the world,
              with a daily trading volume of over <strong className="text-slate-200">$6 trillion</strong>. Traders aim to profit by exchanging one currency for another as prices move.
            </p>
            <p>
              Participants include banks, governments, companies, and individual traders. The market operates <strong className="text-slate-200">24 hours a day, 5 days a week</strong>,
              across major financial centres worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Top hubs */}
      <section className="relative z-10 py-12 sm:py-16 border-t border-slate-800/90 bg-[#12151c]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-2">
            <Globe2 className="text-cyan-400 shrink-0" size={22} />
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">Top global trading centres</h2>
          </div>
          <p className="text-slate-500 text-sm mb-8 max-w-2xl mx-auto">Three of the most active regions by volume and session overlap.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
            {hubs.map((h) => (
              <div
                key={h.city}
                className="bg-[#1b202c] border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/20 transition-colors w-full max-w-md text-center"
              >
                <p className="text-emerald-400 font-bold text-lg mb-1">{h.city}</p>
                <p className="text-white font-semibold mb-2">{h.title}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{h.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Copy trading */}
      <section className="relative z-10 py-10 border-t border-slate-800/90 bg-gradient-to-r from-emerald-500/10 via-[#1b202c] to-[#12151c]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center gap-3">
          <p className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">Copy trading</p>
          <p className="text-white text-xl font-serif font-bold">Follow strategies that fit your risk profile</p>
          <p className="text-slate-400 text-sm">Offered in line with Bynex Markets platform rules and availability.</p>
          <span className="text-slate-500 text-sm font-mono">bynexmarkets.com</span>
        </div>
      </section>

      {/* Partnership */}
      <section className="relative z-10 py-12 sm:py-16 border-t border-slate-800/90 bg-[#12151c]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">Partnership benefits</h2>
          <p className="text-slate-500 text-sm mb-10 max-w-2xl mx-auto">Six pillars of support and opportunity for partners.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {partnershipBenefits.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="flex flex-col items-center text-center gap-3 bg-[#1b202c] border border-slate-800 rounded-xl p-5 w-full max-w-sm"
              >
                <div className="w-11 h-11 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Types of Income — brochure style */}
      <section className="relative z-10 py-14 sm:py-20 border-t border-slate-800/90 bg-[#1a1d26]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-10">
            <PipWordmark />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-10 sm:mb-12">
            <span className="text-white">Types of </span>
            <span className="text-red-500">Income</span>
          </h2>
          <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3 sm:gap-4 max-w-3xl mx-auto">
            {incomeTypesBrochure.map((label) => (
              <div
                key={label}
                className="flex-1 min-w-[200px] sm:min-w-[220px] bg-white text-slate-900 font-semibold text-sm sm:text-base py-3.5 px-4 rounded-md shadow-lg shadow-black/20 border border-white/90"
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Executive rank — diagram + panels (brochure style) */}
      <section className="relative z-10 py-14 sm:py-16 border-t border-slate-800/90 bg-[#1a1d26]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-10">
            <PipWordmark className="justify-center" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-10">
            Rank, salary, incentive &amp; others
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start justify-items-center">
            <div className="flex flex-col items-center w-full max-w-md">
              <p className="text-white font-semibold mb-6 w-full">Executive structure</p>
              <div className="flex flex-col items-center gap-4 mx-auto">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full border-2 border-white/90 bg-slate-800/80 flex items-center justify-center text-white shadow-lg">
                    <User size={28} strokeWidth={1.5} />
                  </div>
                  <span className="text-white font-medium text-sm">Executive</span>
                </div>
                <div className="h-8 w-px bg-white/40 shrink-0" />
                <div className="flex gap-6 sm:gap-10 justify-center">
                  {['A', 'B', 'C'].map((l) => (
                    <div key={l} className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full border-2 border-white/80 bg-slate-800/60 flex items-center justify-center text-white text-sm font-bold">
                        <User size={18} strokeWidth={1.5} />
                      </div>
                      <span className="text-white text-sm font-medium">{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6 max-w-xl w-full">
              <div className="rounded-xl border-2 border-white/80 bg-transparent px-5 py-5 sm:px-6 sm:py-6 text-center">
                <h3 className="text-white font-bold text-lg mb-4">Executive conditions</h3>
                <ul className="text-slate-200 text-sm space-y-2.5 list-none">
                  <li>Create: 5 accounts</li>
                  <li>Total team deposit $12,000</li>
                  <li>1 leg 50% and other leg 50%</li>
                  <li>Personal investment $500</li>
                </ul>
              </div>
              <div className="rounded-xl border-2 border-white/80 bg-transparent px-5 py-5 sm:px-6 sm:py-6 text-center">
                <h3 className="text-white font-bold text-lg mb-4">Executive benefits</h3>
                <ul className="text-slate-200 text-sm space-y-2.5 list-none">
                  <li>Fixed salary $250</li>
                  <li>Generation commission — team clients profit</li>
                  <li>Global royalty 1% on total company clients profit</li>
                  <li>Smartphone</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All ranks — cards */}
      <section className="relative z-10 py-12 sm:py-16 border-t border-slate-800/90 bg-[#12151c]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">All ranks — conditions &amp; benefits</h2>
          <p className="text-slate-500 text-sm mb-10 max-w-3xl mx-auto">
            Progress from Starter toward Ambassador. Confirm current rules in your dashboard or with support.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 justify-items-center">
            {rankDetailCards.map((card) => (
              <div key={card.title} className="bg-[#1b202c] border border-slate-800 rounded-2xl p-6 sm:p-7 w-full max-w-lg text-center">
                <h3 className="text-xl font-bold text-cyan-400 mb-4">{card.title}</h3>
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Conditions</p>
                <ul className="text-slate-300 text-sm space-y-2 mb-5 list-none text-center">
                  {card.conditions.map((c) => (
                    <li key={c}>
                      <span className="text-cyan-400/80 mr-1">·</span>
                      {c}
                    </li>
                  ))}
                </ul>
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Benefits</p>
                <ul className="text-slate-400 text-sm space-y-2 list-none text-center">
                  {card.benefits.map((b) => (
                    <li key={b}>
                      <span className="text-emerald-500/90 mr-1">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Summary table */}
      <section className="relative z-10 py-12 sm:py-16 border-t border-slate-800/90 overflow-hidden bg-[#12151c]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-2">
            <TrendingUp className="text-cyan-400 shrink-0" size={22} />
            <h2 className="text-2xl font-serif font-bold text-white">Rank overview table</h2>
          </div>
          <p className="text-slate-500 text-sm mb-6 max-w-2xl mx-auto">See targets and conditions to upgrade your rank.</p>
          <div className="rounded-xl border border-slate-800 overflow-x-auto bg-[#1b202c]/60 max-w-5xl mx-auto text-left">
            <table className="w-full text-left text-sm min-w-[720px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 font-semibold">Rank</th>
                  <th className="px-4 py-3 font-semibold">Team deposit target</th>
                  <th className="px-4 py-3 font-semibold">Monthly salary</th>
                  <th className="px-4 py-3 font-semibold">Summary condition & reward</th>
                </tr>
              </thead>
              <tbody className="text-slate-300 divide-y divide-slate-800/90">
                {rankRows.map((row) => (
                  <tr key={row.rank} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">{row.rank}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{row.target}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-cyan-400/90">{row.salary}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs sm:text-sm">
                      {row.condition} · <span className="text-slate-300">{row.bonus}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Compensation bullets */}
      <section className="relative z-10 py-12 sm:py-16 border-t border-slate-800/90 bg-[#1a1d26]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-serif font-bold text-white mb-6">Income at a glance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto justify-items-center">
            {compensationOverview.map((row) => (
              <div key={row.label} className="border border-slate-700 rounded-xl px-4 py-3 bg-[#1b202c]/80 w-full max-w-sm text-center">
                <p className="text-cyan-400 text-xs font-semibold uppercase tracking-wider">{row.label}</p>
                <p className="text-white text-sm mt-1">{row.value}</p>
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-xs mt-6 max-w-2xl mx-auto">
            Note: Rank detail cards reference global royalty at 1% on company client profit; the overview may list 5% — rely on your latest agreement and dashboard.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-14 sm:py-20 border-t border-slate-800/90 bg-[#12151c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-4">
            From Starter to Global Leader — the position is open for you
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8 text-sm sm:text-base leading-relaxed">
            Join Bynex Markets and prove your potential. Your journey from beginner toward global success starts with a single step.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all hover:-translate-y-0.5"
            >
              Take the first step
              <ArrowRight size={18} className="ml-2" />
            </Link>
            <Link
              href="/#plans"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-slate-600 text-white font-semibold text-sm hover:bg-slate-800/80 transition-colors"
            >
              View investment plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InvestingInfoContent;
