'use client'

import { useState } from 'react'
import { Wallet, TrendingUp, TrendingDown, DollarSign, Calendar, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useGetWalletStatsQuery } from '@/store/api/walletApi'

export default function WalletStats() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  // Fetch wallet stats from API
  const { data: statsResponse, isLoading, error } = useGetWalletStatsQuery({ timeRange })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading wallet statistics...</p>
        </div>
      </div>
    )
  }

  if (error || !statsResponse) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-rose-500 font-medium">Failed to load wallet statistics</p>
          <p className="text-slate-500 text-sm mt-2">Please try again later</p>
        </div>
      </div>
    )
  }

  const stats = statsResponse.data.attributes

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Wallet Statistics</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Complete financial analytics and insights</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="bg-slate-900 border border-slate-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="1y">Last Year</option>
        </select>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Current Balance</p>
            <Wallet className="text-cyan-400" size={20} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">${stats.balance.toLocaleString()}</p>
          <p className="text-xs text-emerald-400 mt-2">Available funds</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Total Deposits</p>
            <ArrowDownLeft className="text-emerald-500" size={20} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">${stats.totalDeposit.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-2">All-time deposits</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Total Withdrawals</p>
            <ArrowUpRight className="text-rose-500" size={20} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">${stats.totalWithdraw.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-2">All-time withdrawals</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Total Profit</p>
            <TrendingUp className="text-blue-500" size={20} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">${stats.totalProfit.toLocaleString()}</p>
          <p className="text-xs text-emerald-400 mt-2">Lifetime earnings</p>
        </div>
      </div>

      {/* Balance Trend Chart */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6">
        <h3 className="text-white font-semibold text-lg mb-4">Balance Trend</h3>
        {stats.balanceTrend && stats.balanceTrend.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.balanceTrend}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
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
                dataKey="balance"
                stroke="#F59E0B"
                strokeWidth={3}
                fill="url(#balanceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-slate-500 text-sm">No balance trend data available</p>
          </div>
        )}
      </div>

      {/* Income vs Expense */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Income vs Expense</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.incomeExpense}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#64748B" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748B" style={{ fontSize: '12px' }} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Bar dataKey="income" fill="#10B981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expense" fill="#EF4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Transaction Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.transactionDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.transactionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Income Breakdown */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6">
        <h3 className="text-white font-semibold text-lg mb-4">Income Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.incomeBreakdown.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm">{item.category}</span>
                <span className="text-white font-semibold">${item.amount.toLocaleString()}</span>
              </div>
              <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">{item.percentage}% of total income</p>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-xl p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <DollarSign className="text-cyan-400 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="text-white font-semibold mb-2">Wallet Summary</h3>
            <p className="text-slate-300 text-sm mb-4">
              {stats.totalProfit > 0
                ? "Your wallet is performing well! You're earning profits and growing your balance."
                : "Start investing to earn profits and grow your balance."}
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-slate-900/50 rounded-lg px-4 py-2">
                <p className="text-xs text-slate-400">Total Invested</p>
                <p className="text-blue-400 font-bold">${stats.totalInvested.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg px-4 py-2">
                <p className="text-xs text-slate-400">Referral Earnings</p>
                <p className="text-emerald-400 font-bold">${stats.referralEarnings.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg px-4 py-2">
                <p className="text-xs text-slate-400">Net Profit</p>
                <p className="text-cyan-400 font-bold">${(stats.totalProfit + stats.referralEarnings).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
