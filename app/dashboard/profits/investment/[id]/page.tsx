'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, DollarSign, TrendingUp, Calendar, CheckCircle, Clock } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ProfitRecord {
  id: string
  amount: number
  date: string
  status: 'paid' | 'pending'
  type: 'daily' | 'completion'
}

export default function InvestmentProfitHistory() {
  const params = useParams()
  const router = useRouter()
  const investmentId = params.id as string

  // TODO: Replace with actual API call - GET /api/v1/profits/investment/:investmentId/history
  const [profitData] = useState({
    investmentId: investmentId,
    planName: 'Premier Plan',
    totalProfit: 9000,
    paidProfit: 3857.15,
    pendingProfit: 5142.85,
    profitRecords: [
      { id: '1', amount: 642.86, date: '2024-02-05', status: 'paid' as const, type: 'daily' as const },
      { id: '2', amount: 642.86, date: '2024-02-04', status: 'paid' as const, type: 'daily' as const },
      { id: '3', amount: 642.86, date: '2024-02-03', status: 'paid' as const, type: 'daily' as const },
      { id: '4', amount: 642.86, date: '2024-02-02', status: 'paid' as const, type: 'daily' as const },
      { id: '5', amount: 642.85, date: '2024-02-01', status: 'paid' as const, type: 'daily' as const },
      { id: '6', amount: 642.86, date: '2024-01-31', status: 'paid' as const, type: 'daily' as const },
      { id: '7', amount: 642.86, date: '2024-02-06', status: 'pending' as const, type: 'daily' as const },
      { id: '8', amount: 642.86, date: '2024-02-07', status: 'pending' as const, type: 'daily' as const },
    ],
    chartData: [
      { date: 'Feb 1', cumulative: 642.85 },
      { date: 'Feb 2', cumulative: 1285.71 },
      { date: 'Feb 3', cumulative: 1928.57 },
      { date: 'Feb 4', cumulative: 2571.43 },
      { date: 'Feb 5', cumulative: 3214.29 },
      { date: 'Feb 6', cumulative: 3857.15 },
    ],
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3 sm:gap-4 flex-wrap">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="text-slate-400" size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-white">Profit Distribution History</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">{profitData.planName} • ID: {investmentId}</p>
        </div>
        <Link
          href={`/dashboard/investments/${investmentId}`}
          className="px-3 sm:px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg transition-colors text-sm"
        >
          View Investment
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Total Expected Profit</p>
            <TrendingUp className="text-blue-500" size={20} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">${profitData.totalProfit.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-2">Complete investment profit</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Profit Received</p>
            <CheckCircle className="text-emerald-500" size={20} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-400">${profitData.paidProfit.toFixed(2)}</p>
          <p className="text-xs text-emerald-400 mt-2">{((profitData.paidProfit / profitData.totalProfit) * 100).toFixed(1)}% distributed</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Pending Profit</p>
            <Clock className="text-cyan-400" size={20} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">${profitData.pendingProfit.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-2">To be distributed</p>
        </div>
      </div>

      {/* Profit Chart */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6">
        <h3 className="text-white font-semibold text-lg mb-4">Cumulative Profit Over Time</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={profitData.chartData}>
              <defs>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#64748B" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748B" style={{ fontSize: '12px' }} tickFormatter={(val) => `$${val}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#10B981"
                strokeWidth={3}
                fill="url(#profitGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribution Records */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-800">
          <h3 className="text-white font-semibold text-base sm:text-lg">Distribution Records</h3>
          <p className="text-slate-400 text-sm mt-1">{profitData.profitRecords.length} total distributions</p>
        </div>
        <div className="divide-y divide-slate-800">
          {profitData.profitRecords.map((record) => (
            <div key={record.id} className="p-4 sm:p-6 hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    record.status === 'paid'
                      ? 'bg-emerald-500/10'
                      : 'bg-cyan-500/10'
                  }`}>
                    {record.status === 'paid' ? (
                      <CheckCircle className="text-emerald-500" size={20} />
                    ) : (
                      <Clock className="text-cyan-400" size={20} />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">${record.amount.toFixed(2)}</p>
                    <p className="text-slate-400 text-sm">{formatDate(record.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                    record.type === 'daily'
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'bg-cyan-500/10 text-cyan-400'
                  }`}>
                    {record.type}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    record.status === 'paid'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  }`}>
                    {record.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
