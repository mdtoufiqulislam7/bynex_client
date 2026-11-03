'use client'

import { useState } from 'react'
import { Users, TrendingUp, DollarSign, X, ChevronRight, Award, Calendar, Activity, Loader2, AlertCircle } from 'lucide-react'
import { useGetReferralStatsQuery, useGetCommissionBreakdownQuery, useGetTeamNetworkQuery } from '@/store/api/referralApi'

interface ReferralUser {
  id: string
  name: string
  email: string
  avatar?: string
  image?: string
  joinDate: string
  joinedDate?: string
  status: 'active' | 'inactive' | 'pending'
  totalInvested: number
  totalEarned: number
  commissionEarned: number
  directReferrals: number
  children?: ReferralUser[]
}

interface LevelData {
  level: number
  commission: number
  count: number
  totalCommission: number
  activeCount: number
  users: ReferralUser[]
}

export default function ReferralNetwork() {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

  // API hooks
  const { data: statsData, isLoading: isLoadingStats } = useGetReferralStatsQuery()
  const { data: breakdownData, isLoading: isLoadingBreakdown } = useGetCommissionBreakdownQuery()
  const { data: networkData, isLoading: isLoadingNetwork } = useGetTeamNetworkQuery()

  const stats = statsData?.data?.attributes as any
  const breakdownRaw = breakdownData?.data?.attributes as any
  const networkRaw = networkData?.data?.attributes as any

  const isLoading = isLoadingStats || isLoadingBreakdown

  // Build level data from commission breakdown API
  const buildLevelData = (): LevelData[] => {
    const breakdown = Array.isArray(breakdownRaw) ? breakdownRaw : []
    const networkTree = networkRaw?.networkTree ?? []
    const teamStats = networkRaw?.teamStats ?? {}

    // Flatten the network tree to get users per level
    const usersByLevel: Record<number, ReferralUser[]> = {}
    for (let i = 1; i <= 7; i++) {
      usersByLevel[i] = []
    }

    // Collect users from the network tree recursively
    const collectUsers = (nodes: any[], currentLevel: number) => {
      for (const node of nodes) {
        if (usersByLevel[currentLevel]) {
          usersByLevel[currentLevel].push({
            id: node.id || node._id || '',
            name: node.name || node.fullName || 'Unknown',
            email: node.email || '',
            image: node.image,
            joinDate: node.joinedDate || node.joinDate || node.createdAt || '',
            status: node.status || 'pending',
            totalInvested: node.totalInvested || 0,
            totalEarned: node.totalEarned || 0,
            commissionEarned: node.earnings || node.commissionEarned || 0,
            directReferrals: node.children?.length || 0,
          })
        }
        if (node.children && node.children.length > 0) {
          collectUsers(node.children, currentLevel + 1)
        }
      }
    }

    if (networkTree.length > 0) {
      collectUsers(networkTree, 1)
    }

    // Build the final level data
    if (breakdown.length > 0) {
      return breakdown.map((item: any) => ({
        level: item.level,
        commission: item.commissionRate ?? 0,
        count: item.totalMembers ?? 0,
        totalCommission: item.totalEarnings ?? 0,
        activeCount: item.activeMembers ?? 0,
        users: usersByLevel[item.level] || [],
      }))
    }

    // Fallback: use stats levelBreakdown if breakdown API didn't return data
    if (stats?.levelBreakdown) {
      return Array.from({ length: 7 }, (_, i) => {
        const level = i + 1
        const lb = stats.levelBreakdown[`level${level}`] || {}
        return {
          level,
          commission: lb.commissionRate ?? 0,
          count: lb.count ?? 0,
          totalCommission: lb.earnings ?? 0,
          activeCount: lb.active ?? 0,
          users: usersByLevel[level] || [],
        }
      })
    }

    // Default empty
    return Array.from({ length: 7 }, (_, i) => ({
      level: i + 1,
      commission: [10, 5, 4, 3, 2, 1, 1][i],
      count: 0,
      totalCommission: 0,
      activeCount: 0,
      users: [],
    }))
  }

  const levelData = buildLevelData()

  // Stats from API
  const totalStats = {
    totalReferrals: stats?.totalReferrals ?? levelData.reduce((sum, l) => sum + l.count, 0),
    totalCommission: stats?.totalEarnings ?? levelData.reduce((sum, l) => sum + l.totalCommission, 0),
    activeReferrals: stats?.activeReferrals ?? levelData.reduce((sum, l) => sum + l.activeCount, 0),
    thisMonthCommission: stats?.monthlyCommission ?? 0,
  }

  const getLevelColor = (level: number) => {
    const colors = [
      'from-cyan-500 to-blue-600',
      'from-emerald-500 to-teal-600',
      'from-blue-500 to-cyan-600',
      'from-purple-500 to-pink-600',
      'from-rose-500 to-red-600',
      'from-indigo-500 to-violet-600',
      'from-slate-500 to-slate-600',
    ]
    return colors[level - 1]
  }

  const getLevelBorderColor = (level: number) => {
    const colors = [
      'border-cyan-500/30',
      'border-emerald-500/30',
      'border-blue-500/30',
      'border-purple-500/30',
      'border-rose-500/30',
      'border-indigo-500/30',
      'border-slate-500/30',
    ]
    return colors[level - 1]
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getFilteredUsers = (users: ReferralUser[]) => {
    return users.filter(user => {
      const matchesSearch = searchQuery === '' ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }

  const selectedLevelData = selectedLevel !== null ? levelData.find(l => l.level === selectedLevel) : null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-cyan-400" size={36} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">7-Level Referral Network</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">View your complete referral structure and commission earnings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Total Referrals</p>
            <Users className="text-cyan-400" size={20} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">{totalStats.totalReferrals.toLocaleString()}</p>
          <p className="text-xs text-emerald-400 mt-2">Across all 7 levels</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Total Commission</p>
            <DollarSign className="text-emerald-500" size={20} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">${totalStats.totalCommission.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-2">All-time earnings</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Active Referrals</p>
            <Activity className="text-blue-500" size={20} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">{totalStats.activeReferrals.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-2">
            {totalStats.totalReferrals > 0
              ? `${((totalStats.activeReferrals / totalStats.totalReferrals) * 100).toFixed(1)}% active rate`
              : 'No referrals yet'}
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">This Month</p>
            <TrendingUp className="text-rose-500" size={20} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">${totalStats.thisMonthCommission.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-2">Monthly commission</p>
        </div>
      </div>

      {/* Commission Structure Info */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-xl p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <Award className="text-cyan-400 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="text-white font-semibold mb-2">7-Level Commission Structure</h3>
            <p className="text-slate-300 text-sm mb-3">
              Earn commissions from 7 levels deep in your network. The more people you refer, the more you earn!
            </p>
            <div className="flex flex-wrap gap-2">
              {levelData.map((level) => (
                <span key={level.level} className="text-xs bg-slate-900/50 border border-slate-700 px-3 py-1 rounded-full text-slate-300">
                  Level {level.level}: <span className="text-cyan-400 font-bold">{level.commission}%</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Level Cards Grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Network Breakdown by Level</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {levelData.map((level) => (
            <button
              key={level.level}
              onClick={() => setSelectedLevel(level.level)}
              className={`bg-slate-900/50 border ${getLevelBorderColor(level.level)} rounded-xl p-4 sm:p-6 text-left hover:bg-slate-800/50 transition-all group relative overflow-hidden`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getLevelColor(level.level)} opacity-5 group-hover:opacity-10 transition-opacity`} />

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getLevelColor(level.level)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    L{level.level}
                  </div>
                  <ChevronRight className="text-slate-600 group-hover:text-cyan-400 transition-colors" size={20} />
                </div>

                <h3 className="text-white font-semibold mb-1">Level {level.level}</h3>
                <p className="text-slate-400 text-sm mb-4">{level.commission}% Commission</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Referrals</span>
                    <span className="text-sm font-bold text-white">{level.count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Total Earned</span>
                    <span className="text-sm font-bold text-emerald-400">${level.totalCommission.toFixed(2)}</span>
                  </div>
                </div>

                {level.count > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <span className="text-xs text-cyan-400 font-medium flex items-center gap-1">
                      Click to view {level.count} users
                      <ChevronRight size={14} />
                    </span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Level Detail Modal */}
      {selectedLevel !== null && selectedLevelData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${getLevelColor(selectedLevel)} flex items-center justify-center text-white font-bold text-base sm:text-xl shadow-lg flex-shrink-0`}>
                    L{selectedLevel}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-xl font-bold text-white">Level {selectedLevel} Referrals</h2>
                    <p className="text-slate-400 text-sm mt-1">
                      {selectedLevelData.count} users • {selectedLevelData.commission}% commission rate
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedLevel(null); setSearchQuery(''); setFilterStatus('all'); }}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="text-slate-400" size={24} />
                </button>
              </div>

              {/* Level Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6">
                <div className="bg-slate-800/50 rounded-lg p-3 sm:p-4">
                  <p className="text-slate-400 text-[10px] sm:text-xs mb-1">Total Users</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{selectedLevelData.count}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 sm:p-4">
                  <p className="text-slate-400 text-[10px] sm:text-xs mb-1">Commission</p>
                  <p className="text-lg sm:text-2xl font-bold text-cyan-400">{selectedLevelData.commission}%</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 sm:p-4">
                  <p className="text-slate-400 text-[10px] sm:text-xs mb-1">Earned</p>
                  <p className="text-lg sm:text-2xl font-bold text-emerald-400">${selectedLevelData.totalCommission.toFixed(2)}</p>
                </div>
              </div>

              {/* Search and Filter */}
              {selectedLevelData.users.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-6">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>
              )}
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {isLoadingNetwork ? (
                <div className="text-center py-12">
                  <Loader2 className="mx-auto text-cyan-400 mb-4 animate-spin" size={36} />
                  <p className="text-slate-400">Loading network data...</p>
                </div>
              ) : selectedLevelData.users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto text-slate-600 mb-4" size={48} />
                  <p className="text-slate-400">No user data available for this level yet</p>
                  <p className="text-slate-500 text-sm mt-1">Users will appear here as they join</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getFilteredUsers(selectedLevelData.users).map((user) => (
                    <div
                      key={user.id}
                      className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{user.name}</h4>
                            <p className="text-slate-400 text-sm">{user.email}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                        }`}>
                          {user.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Joined</p>
                          <p className="text-sm text-slate-300">{formatDate(user.joinDate || user.joinedDate || '')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Your Commission</p>
                          <p className="text-sm text-cyan-400 font-bold">${user.commissionEarned.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Their Referrals</p>
                          <p className="text-sm text-slate-300">{user.directReferrals} users</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Status</p>
                          <p className={`text-sm font-medium ${user.status === 'active' ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {getFilteredUsers(selectedLevelData.users).length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-slate-400">No users match your filters</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <p className="text-slate-400 text-sm">
                  Showing {getFilteredUsers(selectedLevelData.users).length} of {selectedLevelData.users.length} users
                </p>
                <button
                  onClick={() => { setSelectedLevel(null); setSearchQuery(''); setFilterStatus('all'); }}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
