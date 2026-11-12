import React from 'react';
import { ShieldCheck, Globe } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-12 sm:py-24 bg-[#050505] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 items-center">
          {/* Left Column: Content */}
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#0D0D0D] border border-amber-500/30 rounded-full px-4 py-1.5 mb-6">
              <span className="text-amber-400 text-sm font-bold uppercase tracking-wider">Our Mission</span>
            </div>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4 sm:mb-6 leading-tight">
              Redefining Wealth Management for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">Digital Age</span>
            </h2>

            <p className="text-neutral-400 text-sm sm:text-lg mb-4 sm:mb-6 leading-relaxed">
              To make forex investment simple, secure, and accessible for everyone. We aim to empower individuals to transform their financial position through disciplined trading and structured growth opportunities.
            </p>

            <p className="text-neutral-400 text-sm sm:text-lg mb-6 sm:mb-8 leading-relaxed">
              Beyond investing, we create pathways for career advancement, performance-based rewards, and global exposure. At Bynex Markets, we are building a trusted platform where ambition meets opportunity and growth becomes a long-term journey.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="bg-[#0D0D0D] p-3 rounded-xl border border-amber-500/25 text-amber-400">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">Bank-Grade Security</h4>
                  <p className="text-sm text-neutral-500">256-bit encryption and segregated accounts.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-[#0D0D0D] p-3 rounded-xl border border-amber-500/25 text-amber-400">
                  <Globe size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">Global Access</h4>
                  <p className="text-sm text-neutral-500">Invest from anywhere, anytime, instantly.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visuals & Stats */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent rounded-3xl transform rotate-3"></div>
            <img
              src="https://res.cloudinary.com/dshkbza19/image/upload/v1775410956/WhatsApp_Image_2026-04-05_at_6.04.47_PM_uz3rva.jpg"
              alt="Bynex Markets — Trade Forex, Crypto and Commodities"
              className="relative rounded-2xl sm:rounded-3xl shadow-2xl border border-amber-500/20 z-10 w-full h-[300px] sm:h-[450px] lg:h-[600px] object-cover object-top"
            />

            {/* Floating Stats Card */}
            <div className="relative sm:absolute sm:-bottom-10 sm:-left-10 md:left-10 z-20 bg-[#0D0D0D]/95 backdrop-blur-md border border-amber-500/30 p-4 sm:p-8 rounded-xl sm:rounded-2xl shadow-xl max-w-xs mt-4 sm:mt-0">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <p className="text-neutral-400 text-xs sm:text-sm">Total Assets Managed</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">$150M+</p>
                </div>
                <div className="bg-emerald-500/10 p-2 rounded-lg">
                  <TrendingUpIcon />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-400">Active Investors</span>
                  <span className="text-white font-bold">12,500+</span>
                </div>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full">
                  <div className="bg-gradient-to-r from-amber-400 to-yellow-500 h-1.5 rounded-full w-[85%]"></div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-400">Avg. Annual Return</span>
                  <span className="text-emerald-400 font-bold">18.4%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Helper icon
const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);

export default About;
