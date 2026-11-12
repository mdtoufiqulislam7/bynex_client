'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DollarSign, TrendingUp, Calendar, Download, Eye, Loader2, AlertCircle } from 'lucide-react'
import { useGetMyTransactionsQuery } from '@/store/api/transactionApi'

interface TransactionsData {
  results?: any[]
  totalPages?: number
  totalResults?: number
}

export default function ProfitHistory() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all')
  const [page, setPage] = useState(1)
  const limit = 10

  // Fetch profit transactions from API
  const { data: transactionsResponse, isLoading, error } = useGetMyTransactionsQuery({
    page,
    limit,
    type: 'profit',
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  const transactionsData = (transactionsResponse?.data?.attributes || {}) as TransactionsData
  const profitHistory = transactionsData.results || []
  const totalPages = transactionsData.totalPages || 1
  const totalResults = transactionsData.totalResults || 0

  // Calculate stats
  const stats = {
    totalProfit: profitHistory
      .filter((p: any) => p.status === 'completed')
      .reduce((sum: number, p: any) => sum + p.netAmount, 0),
    pendingProfit: profitHistory
      .filter((p: any) => p.status === 'pending')
      .reduce((sum: number, p: any) => sum + p.netAmount, 0),
    distributionCount: profitHistory.filter((p: any) => p.status === 'completed').length,
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="animate-spin text-amber-400 mx-auto mb-4" size={48} />
          <p className="text-neutral-400">Loading profit history...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="text-rose-500 mx-auto mb-4" size={48} />
          <p className="text-rose-400 font-medium">Failed to load profit history</p>
          <p className="text-neutral-500 text-sm mt-2">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Profit History</h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1">View all your profit distributions</p>
        </div>
        <button className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white px-4 py-2 rounded-lg transition-colors">
          <Download size={18} />
          Export
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-[#0D0D0D]/50 border border-neutral-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-neutral-400 text-sm">Total Profit Earned</p>
            <DollarSign className="text-emerald-500" size={20} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">${stats.totalProfit.toFixed(2)}</p>
          <p className="text-xs text-emerald-400 mt-2">All-time earnings</p>
        </div>

        <div className="bg-[#0D0D0D]/50 border border-neutral-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-neutral-400 text-sm">Pending Profit</p>
            <TrendingUp className="text-amber-400" size={20} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">${stats.pendingProfit.toFixed(2)}</p>
          <p className="text-xs text-neutral-400 mt-2">To be distributed</p>
        </div>

        <div className="bg-[#0D0D0D]/50 border border-neutral-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-neutral-400 text-sm">Distributions</p>
            <TrendingUp className="text-amber-400" size={20} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">{stats.distributionCount}</p>
          <p className="text-xs text-neutral-400 mt-2">Total payments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setStatusFilter('all')
              setPage(1)
            }}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              statusFilter === 'all'
                ? 'bg-amber-400 text-black font-semibold shadow-lg shadow-amber-500/20'
                : 'bg-[#0D0D0D]/50 border border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => {
              setStatusFilter('completed')
              setPage(1)
            }}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              statusFilter === 'completed'
                ? 'bg-amber-400 text-black font-semibold shadow-lg shadow-amber-500/20'
                : 'bg-[#0D0D0D]/50 border border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => {
              setStatusFilter('pending')
              setPage(1)
            }}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              statusFilter === 'pending'
                ? 'bg-amber-400 text-black font-semibold shadow-lg shadow-amber-500/20'
                : 'bg-[#0D0D0D]/50 border border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {/* Profit History Table */}
      <div className="bg-[#0D0D0D]/50 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-900/50 border-b border-neutral-800">
              <tr>
                <th className="text-left p-4 text-neutral-400 text-sm font-medium">Transaction ID</th>
                <th className="text-left p-4 text-neutral-400 text-sm font-medium">Date & Time</th>
                <th className="text-left p-4 text-neutral-400 text-sm font-medium">Description</th>
                <th className="text-right p-4 text-neutral-400 text-sm font-medium">Amount</th>
                <th className="text-center p-4 text-neutral-400 text-sm font-medium">Status</th>
                <th className="text-center p-4 text-neutral-400 text-sm font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {profitHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <DollarSign className="mx-auto text-neutral-600 mb-4" size={48} />
                    <p className="text-neutral-400">No profit distributions found</p>
                    <p className="text-neutral-500 text-sm mt-1">Start investing to earn profits</p>
                  </td>
                </tr>
              ) : (
                profitHistory.map((profit: any) => (
                  <tr key={profit.id} className="hover:bg-neutral-900/30 transition-colors">
                    <td className="p-4">
                      <p className="text-white text-sm font-mono">{profit.transactionId}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-white text-sm">{formatDateTime(profit.createdAt)}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-neutral-300 text-sm">{profit.description || 'Daily profit distribution'}</p>
                      {profit.notes && (
                        <p className="text-neutral-500 text-xs mt-0.5">{profit.notes}</p>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <p className="text-emerald-400 font-semibold">+${profit.netAmount.toFixed(2)}</p>
                      {profit.fee > 0 && (
                        <p className="text-neutral-500 text-xs mt-0.5">Fee: ${profit.fee.toFixed(2)}</p>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        profit.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : profit.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-neutral-500/10 text-neutral-400 border border-neutral-500/30'
                      }`}>
                        {profit.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <Link
                        href={`/dashboard/transactions/${profit.id}`}
                        className="text-amber-400 hover:text-amber-300 text-sm inline-flex items-center gap-1"
                      >
                        <Eye size={14} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {profitHistory.length > 0 && (
          <div className="p-4 border-t border-neutral-800 flex items-center justify-between">
            <p className="text-neutral-400 text-sm">
              Showing {profitHistory.length} of {totalResults} distributions
              {totalPages > 1 && ` (Page ${page} of ${totalPages})`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
