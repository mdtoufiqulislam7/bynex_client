'use client'

import React, { useState } from 'react';
import { ArrowUpRight, Search, Loader2 } from 'lucide-react';
import { useGetMyTransactionsQuery } from '@/store/api/transactionApi';
import type { Transaction } from '@/store/api/transactionApi';
import Link from 'next/link';

interface TransactionsData {
  results?: Transaction[]
  totalPages?: number
  totalResults?: number
}

const WithdrawHistory = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const limit = 10;

  // Fetch withdrawals from API
  const { data: transactionsResponse, isLoading, error } = useGetMyTransactionsQuery({
    page,
    limit,
    type: 'withdraw',
    status: statusFilter || undefined,
    search: search || undefined,
  });

  const transactionsData = (transactionsResponse?.data?.attributes || {}) as TransactionsData;
  const withdrawals: Transaction[] = transactionsData.results || [];
  const totalPages = transactionsData.totalPages || 1;
  const totalResults = transactionsData.totalResults || 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const truncateAddress = (address: string) => {
    if (!address) return '-';
    if (address.length > 12) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return address;
  };

  const getStatusColor = (status: string) => {
    if (status === 'completed') return 'bg-green-500/10 text-green-500';
    if (status === 'pending' || status === 'processing') return 'bg-amber-500/10 text-amber-400';
    return 'bg-red-500/10 text-red-500';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Withdrawal History</h2>
          <p className="text-neutral-400 text-xs sm:text-sm">View your payout records and status</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-auto bg-[#0D0D0D] border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {[
              { value: '', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'processing', label: 'Processing' },
              { value: 'completed', label: 'Completed' },
              { value: 'rejected', label: 'Rejected' },
            ].map((status) => (
              <button
                key={status.value}
                onClick={() => {
                  setStatusFilter(status.value);
                  setPage(1);
                }}
                className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-medium transition-colors border ${
                  statusFilter === status.value
                    ? 'bg-amber-400 text-black font-semibold border-amber-500 shadow-sm shadow-amber-500/20'
                    : 'bg-[#0D0D0D] text-neutral-400 border-neutral-800 hover:border-neutral-800'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#0D0D0D] border border-neutral-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-amber-400" size={32} />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-rose-500 font-medium">Failed to load withdrawal history</p>
            <p className="text-neutral-500 text-sm mt-2">Please try again later</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#050505] text-neutral-400 text-sm uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-medium">Transaction ID</th>
                    <th className="px-6 py-4 font-medium">Method</th>
                    <th className="px-6 py-4 font-medium">Account/Address</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-sm text-neutral-300">
                  {withdrawals.map((tx) => (
                    <tr key={tx.id} className="hover:bg-neutral-900/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-neutral-500">
                        <Link href={`/dashboard/transactions/${tx.id}`} className="flex items-center hover:text-amber-400 transition-colors">
                          <div className="bg-red-500/10 p-1.5 rounded-full mr-3 text-red-500">
                            <ArrowUpRight size={14} />
                          </div>
                          {tx.transactionId || tx.id}
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-medium text-white">
                        {tx.paymentGateway?.name || tx.paymentMethod || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-neutral-400 font-mono text-xs">
                        {tx.walletAddress ? truncateAddress(tx.walletAddress) : '-'}
                      </td>
                      <td className="px-6 py-4 text-neutral-400">{formatDate(tx.createdAt)}</td>
                      <td className="px-6 py-4 font-bold text-red-400">
                        -${tx.netAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(tx.status)}`}>
                          {formatStatus(tx.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {withdrawals.length === 0 && (
                <div className="p-8 text-center text-neutral-500">
                  No withdrawal records found.
                </div>
              )}
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden divide-y divide-neutral-800">
              {withdrawals.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 text-sm">
                  No withdrawal records found.
                </div>
              ) : (
                withdrawals.map((tx) => (
                  <Link key={tx.id} href={`/dashboard/transactions/${tx.id}`} className="block p-3 hover:bg-neutral-900/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="bg-red-500/10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-red-500">
                          <ArrowUpRight size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white">
                            {tx.paymentGateway?.name || tx.paymentMethod || 'Withdrawal'}
                          </p>
                          <p className="text-[10px] text-neutral-500">{formatDate(tx.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-sm font-bold text-red-400">
                          -${tx.netAmount.toLocaleString()}
                        </p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(tx.status)}`}>
                          {formatStatus(tx.status)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="p-3 sm:p-4 border-t border-neutral-800 flex justify-between items-center text-xs sm:text-sm text-neutral-500">
              <span>
                {withdrawals.length} of {totalResults}
                {totalPages > 1 && <span className="hidden sm:inline"> (Page {page} of {totalPages})</span>}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-white text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-white text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WithdrawHistory;
