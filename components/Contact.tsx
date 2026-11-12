import React from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { FaTelegramPlane } from "react-icons/fa";

const Contact = () => {
  return (
    <section id="contact" className="py-12 sm:py-24 bg-[#050505] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white mb-3 sm:mb-4">Get in Touch</h2>
          <p className="text-neutral-400 max-w-2xl mx-auto text-sm sm:text-base">
            Have questions about our investment plans or need technical assistance? Our dedicated support team is available 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 lg:gap-12 bg-[#0D0D0D] rounded-2xl sm:rounded-3xl overflow-hidden border border-amber-500/20 shadow-2xl">
          {/* Contact Info Sidebar */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#141414] to-[#0A0A0A] p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-amber-500/15">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-amber-500/15 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-yellow-500/10 rounded-full blur-2xl"></div>

            <div className="relative z-10">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-5 sm:mb-8">Contact Information</h3>
              <div className="space-y-5 sm:space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-amber-500/10 border border-amber-500/25 p-3 rounded-lg text-amber-400">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400 font-medium uppercase tracking-wider mb-1">Call Us</p>
                    <p className="text-white font-medium">+33 (7) 62-19-06-06</p>
                    <p className="text-neutral-500 text-sm">Mon-Fri from 8am to 5pm</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-amber-500/10 border border-amber-500/25 p-3 rounded-lg text-amber-400 shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-neutral-400 font-medium uppercase tracking-wider mb-3">Our Offices</p>
                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">Dakar, Senegal</p>
                        <p className="text-white">Unit 8B, Floor 8</p>
                        <p className="text-white">Boulevard du Général de Gaulle</p>
                        <p className="text-neutral-400">Dakar, Senegal, 11500</p>
                      </div>
                      <div className="border-t border-neutral-800 pt-4">
                        <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">Moscow, Russia</p>
                        <p className="text-white">Suite 45, Floor 12, Freedom Tower East</p>
                        <p className="text-white">12 Presnenskaya Naberezhnaya</p>
                        <p className="text-neutral-400">Moscow, Russia, 123112</p>
                      </div>
                      <div className="border-t border-neutral-800 pt-4">
                        <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">Kuala Lumpur, Malaysia</p>
                        <p className="text-white">Unit 15-03, Level 15</p>
                        <p className="text-white">2A, Jalan Sentral 2</p>
                        <p className="text-neutral-400">Kuala Lumpur, Malaysia, 50470</p>
                      </div>
                      <div className="border-t border-neutral-800 pt-4">
                        <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">Lisbon, Portugal</p>
                        <p className="text-white">Unit 5.3, Level 5, Edifício Liberdade 225</p>
                        <p className="text-neutral-400">Lisbon, Portugal, 1250-142</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-12">
              <p className="text-neutral-400 text-sm mb-4">Connect with us</p>
              <div className="flex space-x-4">
                <a href="https://t.me/bynexmarkets" className="w-10 h-10 rounded-full bg-neutral-800/80 border border-amber-500/20 flex items-center justify-center text-amber-400 hover:bg-amber-400 hover:text-black transition-colors">
                  <FaTelegramPlane size={18} />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3 p-6 sm:p-10">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">First Name</label>
                  <input type="text" className="w-full bg-[#050505] border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Last Name</label>
                  <input type="text" className="w-full bg-[#050505] border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors" placeholder="Doe" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Email Address</label>
                <input type="email" className="w-full bg-[#050505] border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors" placeholder="john@example.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Subject</label>
                <select className="w-full bg-[#050505] border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors">
                  <option>General Inquiry</option>
                  <option>Investment Support</option>
                  <option>Technical Issue</option>
                  <option>Partnership</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Message</label>
                <textarea rows={4} className="w-full bg-[#050505] border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors resize-none" placeholder="How can we help you today?"></textarea>
              </div>

              <button type="button" className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black rounded-lg font-bold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transform hover:-translate-y-1 transition-all flex items-center justify-center">
                Send Message
                <Send size={18} className="ml-2" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
