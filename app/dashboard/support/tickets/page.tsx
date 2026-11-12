'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageSquare, Clock, CheckCircle, XCircle, AlertCircle, Plus, Search, Loader2 } from 'lucide-react'
import { useGetMyTicketsQuery } from '@/store/api/ticketApi'
import { Toast, ToastType } from '@/components/Toast'

interface Ticket {
  id: string
  userId: string
  subject: string
  category: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  rating?: number
  feedback?: string
  createdAt: string
  updatedAt: string
}

interface TicketsData {
  results?: Ticket[]
  totalPages?: number
  totalResults?: number
}

export default function MyTickets() {
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const { data, isLoading, error } = useGetMyTicketsQuery()

  // Handle both array and paginated response
  const ticketsData = data?.data?.attributes as Ticket[] | TicketsData | undefined
  const tickets: Ticket[] = Array.isArray(ticketsData)
    ? ticketsData
    : ((ticketsData as TicketsData)?.results || [])

  const getStatusIcon = (status: Ticket['status']) => {
    switch (status) {
      case 'open':
        return <Clock className="text-amber-500" size={16} />
      case 'in_progress':
        return <AlertCircle className="text-amber-400" size={16} />
      case 'resolved':
        return <CheckCircle className="text-emerald-500" size={16} />
      case 'closed':
        return <XCircle className="text-neutral-500" size={16} />
    }
  }

  const getStatusBadge = (status: Ticket['status']) => {
    const styles = {
      open: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
      in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      resolved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
      closed: 'bg-neutral-500/10 text-neutral-500 border-neutral-500/30',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  const getPriorityBadge = (priority: Ticket['priority']) => {
    const styles = {
      low: 'bg-neutral-500/10 text-neutral-400',
      normal: 'bg-amber-500/10 text-amber-400',
      high: 'bg-amber-500/10 text-amber-400',
      urgent: 'bg-rose-500/10 text-rose-400',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[priority]}`}>
        {priority}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  const filteredTickets = tickets.filter((ticket: Ticket) => {
    const matchesFilter = filter === 'all' || ticket.status === filter
    const matchesSearch = searchQuery === '' ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const stats = {
    total: tickets.length,
    open: tickets.filter((t: Ticket) => t.status === 'open').length,
    inProgress: tickets.filter((t: Ticket) => t.status === 'in_progress').length,
    resolved: tickets.filter((t: Ticket) => t.status === 'resolved').length,
  }

  if (error) {
    const errorMessage = (error as any)?.data?.message || 'Failed to load tickets'
    return (
      <div className="space-y-6">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Support Tickets</h1>
            <p className="text-neutral-400 text-sm mt-1">View and manage your support requests</p>
          </div>
        </div>
        <div className="bg-[#0D0D0D]/50 border border-neutral-800 rounded-xl p-12 text-center">
          <AlertCircle className="mx-auto text-rose-500 mb-4" size={48} />
          <p className="text-rose-400 font-medium mb-2">Failed to Load Tickets</p>
          <p className="text-neutral-400 text-sm">{errorMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Support Tickets</h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1">View and manage your support requests</p>
        </div>
        <Link
          href="/dashboard/support"
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-4 py-2.5 rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20 font-medium"
        >
          <Plus size={18} />
          New Ticket
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#0D0D0D]/50 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Total Tickets</p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1">{isLoading ? '-' : stats.total}</p>
            </div>
            <MessageSquare className="text-amber-400" size={24} />
          </div>
        </div>
        <div className="bg-[#0D0D0D]/50 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Open</p>
              <p className="text-xl sm:text-2xl font-bold text-amber-500 mt-1">{isLoading ? '-' : stats.open}</p>
            </div>
            <Clock className="text-amber-500" size={24} />
          </div>
        </div>
        <div className="bg-[#0D0D0D]/50 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">In Progress</p>
              <p className="text-xl sm:text-2xl font-bold text-amber-400 mt-1">{isLoading ? '-' : stats.inProgress}</p>
            </div>
            <AlertCircle className="text-amber-400" size={24} />
          </div>
        </div>
        <div className="bg-[#0D0D0D]/50 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Resolved</p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-500 mt-1">{isLoading ? '-' : stats.resolved}</p>
            </div>
            <CheckCircle className="text-emerald-500" size={24} />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
          <input
            type="text"
            placeholder="Search tickets by subject or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0D0D0D]/50 border border-neutral-800 rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            disabled={isLoading}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'open', 'in_progress', 'resolved', 'closed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filter === status
                  ? 'bg-amber-400 text-black font-semibold shadow-lg shadow-amber-500/20'
                  : 'bg-[#0D0D0D]/50 border border-neutral-800 text-neutral-400 hover:text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-[#0D0D0D]/50 border border-neutral-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="mx-auto text-amber-400 mb-4 animate-spin" size={48} />
            <p className="text-neutral-400">Loading tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="mx-auto text-neutral-600 mb-4" size={48} />
            <p className="text-neutral-400">No tickets found</p>
            <p className="text-neutral-500 text-sm mt-1">
              {searchQuery ? 'Try a different search term' : 'Create your first support ticket'}
            </p>
            {!searchQuery && (
              <Link
                href="/dashboard/support"
                className="inline-flex items-center gap-2 mt-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-amber-500 text-black px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus size={18} />
                Create Ticket
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {filteredTickets.map((ticket: Ticket) => (
              <Link
                key={ticket.id}
                href={`/dashboard/support/tickets/${ticket.id}`}
                className="block p-4 sm:p-6 hover:bg-neutral-900/30 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-1 flex-shrink-0">{getStatusIcon(ticket.status)}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium group-hover:text-amber-400 transition-colors truncate mb-1">
                        {ticket.subject}
                      </h3>
                      <p className="text-neutral-500 text-xs sm:text-sm">#{ticket.id.substring(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <span className="hidden sm:inline">{getPriorityBadge(ticket.priority)}</span>
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-neutral-500 ml-7">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-neutral-600 rounded-full" />
                    {ticket.category}
                  </span>
                  <span>Created {formatDate(ticket.createdAt)}</span>
                  <span>Updated {formatDate(ticket.updatedAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
