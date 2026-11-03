'use client'

import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle2, Wallet, HelpCircle, Loader2 } from 'lucide-react';
import { useCreateTicketMutation } from '@/store/api/ticketApi';
import { useGetWalletQuery } from '@/store/api/walletApi';
import Link from 'next/link';

const SupportTicket = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('technical');
  const [priority, setPriority] = useState('normal');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);

  // Fetch wallet data
  const { data: walletResponse, isLoading: walletLoading } = useGetWalletQuery();
  const [createTicket, { isLoading: isSubmitting }] = useCreateTicketMutation();

  const wallet = walletResponse?.data?.attributes;
  const balance = wallet?.balance || 0;

  const TICKET_COST = 1.00;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setCreatedTicketId(null);

    try {
      const result = await createTicket({
        subject,
        category: category as 'investment' | 'deposit' | 'other' | 'account' | 'technical' | 'withdrawal',
        priority: priority as 'low' | 'normal' | 'high' | 'urgent',
        message,
      }).unwrap();

      const ticket = result.data.attributes;
      setCreatedTicketId(ticket.id);
      setSuccessMsg(`Ticket #${ticket.id} created successfully! $${TICKET_COST.toFixed(2)} has been deducted from your balance.`);

      // Reset form
      setSubject('');
      setMessage('');
      setPriority('normal');
      setCategory('technical');
    } catch (err: any) {
      setErrorMsg(err?.data?.message || 'Failed to create ticket. Please try again.');
    }
  };

  if (walletLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="animate-spin text-cyan-400 mx-auto mb-4" size={48} />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Support Center</h2>
          <p className="text-slate-400 text-xs sm:text-sm">Get expert assistance from our dedicated team.</p>
        </div>

        {/* Balance Display for Context */}
        <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg">
          <div className="bg-cyan-500/10 p-2 rounded-full text-cyan-400">
            <Wallet size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold">Your Balance</p>
            <p className="text-white font-mono font-bold">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Left Column: Ticket Form */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-8 relative overflow-hidden">
             {/* Fee Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl z-10 shadow-md shadow-cyan-500/20">
              Fee: ${TICKET_COST.toFixed(2)} / Ticket
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-0">
              {successMsg && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-lg">
                  <div className="flex items-start mb-3">
                    <CheckCircle2 size={20} className="mr-3 mt-0.5 shrink-0" />
                    <p className="text-sm">{successMsg}</p>
                  </div>
                  {createdTicketId && (
                    <Link
                      href={`/dashboard/support/tickets/${createdTicketId}`}
                      className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      View Ticket
                    </Link>
                  )}
                </div>
              )}

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg flex items-start">
                  <AlertCircle size={20} className="mr-3 mt-0.5 shrink-0" />
                  <p className="text-sm">{errorMsg}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                >
                  <option value="deposit">Deposit Issues</option>
                  <option value="withdrawal">Withdrawal Issues</option>
                  <option value="investment">Investment Related</option>
                  <option value="account">Account Issues</option>
                  <option value="technical">Technical Support</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Priority Level</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {[
                    { label: 'Low', value: 'low' },
                    { label: 'Normal', value: 'normal' },
                    { label: 'High', value: 'high' },
                    { label: 'Urgent', value: 'urgent' },
                  ].map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setPriority(level.value)}
                      className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                        priority === level.value
                          ? 'bg-cyan-500 text-white border-cyan-500 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-950 text-slate-400 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="Brief summary of your issue"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Message Description</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                  placeholder="Please describe your issue in detail..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors placeholder-slate-600 resize-none"
                ></textarea>
              </div>

              <div className="pt-2">
                <p className="text-xs text-slate-500 mb-4 flex items-center">
                  <AlertCircle size={14} className="mr-1.5" />
                  By submitting this ticket, you agree to the deduction of ${TICKET_COST.toFixed(2)} from your main wallet balance.
                </p>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transform hover:-translate-y-1 transition-all flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Processing...' : `Open Ticket ($${TICKET_COST.toFixed(2)})`}
                  {!isSubmitting && <Send size={18} className="ml-2" />}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Info & FAQs */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6">
            <div className="flex items-center space-x-2 text-white font-bold mb-4">
               <HelpCircle size={20} className="text-cyan-400" />
               <h3>Quick Help</h3>
            </div>
            <div className="space-y-4">
               <div className="text-sm">
                 <p className="text-slate-300 font-medium mb-1">What is the response time?</p>
                 <p className="text-slate-500">Premium members receive responses within 2 hours. Standard response time is 24 hours.</p>
               </div>
               <div className="border-t border-slate-800"></div>
               <div className="text-sm">
                 <p className="text-slate-300 font-medium mb-1">Why is there a fee?</p>
                 <p className="text-slate-500">The small fee ensures our support team can focus on high-priority requests and provide quality service.</p>
               </div>
               <div className="border-t border-slate-800"></div>
               <div className="text-sm">
                 <p className="text-slate-300 font-medium mb-1">Are refunds available?</p>
                 <p className="text-slate-500">If the issue is found to be a platform error, the ticket fee will be refunded to your wallet.</p>
               </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900 border border-indigo-500/20 rounded-xl p-4 sm:p-6 relative overflow-hidden">
             <div className="relative z-10">
               <h4 className="text-white font-bold mb-2">Live Chat</h4>
               <p className="text-sm text-indigo-200 mb-4">Need urgent help? Connect with an agent instantly.</p>
               <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
                 Start Chat
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportTicket;