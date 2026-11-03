import React from 'react';
import { Mail, ShieldAlert, FileText, Lock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-10 sm:pt-16 pb-6 sm:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-12 mb-8 sm:mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-3 sm:mb-4 leading-none">Bynex <span className="text-cyan-400">Markets</span></h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Leading the industry in automated wealth and algorithmic portfolio management. Intelligent execution engineered for global market leaders.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm sm:text-base mb-4 sm:mb-6">Company</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Press</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold text-sm sm:text-base mb-4 sm:mb-6">Legal</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex items-center"><Lock className="w-3 h-3 mr-2" /><a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
              <li className="flex items-center"><FileText className="w-3 h-3 mr-2" /><a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-sm sm:text-base mb-4 sm:mb-6">Contact</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              {/* <li className="flex items-center"><Mail className="w-4 h-4 mr-2" /> support@bynexmarkets.com</li> */}
              <li>12 Rue de Rivoli, 75004 Paris, France</li>
              <li>Moscow, Russia — Suite 45, Floor 12, Freedom Tower East, 12 Presnenskaya Naberezhnaya, 123112</li>
            </ul>
          </div>
        </div>

        {/* Risk Disclaimer */}
        <div className="border-t border-slate-900 pt-8 mt-8">
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 flex items-start space-x-4">
            <ShieldAlert className="text-red-500 w-6 h-6 flex-shrink-0 mt-1" />
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong className="text-slate-300">Risk Disclaimer:</strong> Investing in financial markets involves a high degree of risk and may not be suitable for all investors. You could lose some or all of your initial investment. Past performance is not indicative of future results. Please ensure you fully understand the risks involved before trading.
            </p>
          </div>
          <div className="text-center text-slate-600 text-sm mt-8">
            © 2026 Bynex Markets. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
