'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Star, Clock, CheckCircle, User, Shield, Paperclip, Loader2, AlertCircle, X, XCircle } from 'lucide-react'
import { useGetTicketByIdQuery, useAddReplyMutation, useRateTicketMutation } from '@/store/api/ticketApi'
import { Toast, ToastType } from '@/components/Toast'

interface TicketMessage {
  _id: string
  sender?: {
    _id?: string
    id?: string
    fullName?: string
    firstName?: string
    lastName?: string
    email?: string
    image?: string
  }
  senderRole: 'user' | 'admin' | 'superAdmin'
  message: string
  attachments?: string[]
  isRead?: boolean
  createdAt: string
}

interface Ticket {
  id: string
  _id?: string
  ticketId?: string
  user?: {
    _id?: string
    id?: string
    fullName?: string
    firstName?: string
    lastName?: string
    email?: string
    image?: string
  }
  subject: string
  category: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'waiting_reply' | 'resolved' | 'closed'
  rating?: number
  feedback?: string
  messages?: TicketMessage[]
  assignedTo?: {
    fullName?: string
    email?: string
  }
  createdAt: string
  updatedAt: string
}

export default function TicketDetail() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.id as string
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [replyMessage, setReplyMessage] = useState('')
  const [showRatingForm, setShowRatingForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [ratingFeedback, setRatingFeedback] = useState('')
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const { data, isLoading, error, refetch } = useGetTicketByIdQuery(ticketId)
  const [addReply, { isLoading: isReplying }] = useAddReplyMutation()
  const [rateTicket, { isLoading: isRating }] = useRateTicketMutation()

  const ticket = data?.data?.attributes as Ticket | undefined

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ticket?.messages])

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyMessage.trim()) {
      setToast({
        message: 'Please enter a message',
        type: 'warning'
      })
      return
    }

    try {
      await addReply({
        id: ticketId,
        body: { message: replyMessage }
      }).unwrap()

      setReplyMessage('')
      setToast({
        message: 'Reply sent successfully',
        type: 'success'
      })

      // Refetch to get updated ticket with new reply
      refetch()
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to send reply'
      setToast({
        message: errorMessage,
        type: 'error'
      })
    }
  }

  const handleRateTicket = async () => {
    if (rating === 0) {
      setToast({
        message: 'Please select a rating',
        type: 'warning'
      })
      return
    }

    try {
      await rateTicket({
        id: ticketId,
        body: {
          rating,
          feedback: ratingFeedback || undefined
        }
      }).unwrap()

      setShowRatingForm(false)
      setToast({
        message: 'Thank you for your feedback!',
        type: 'success'
      })

      // Refetch to get updated ticket with rating
      refetch()
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to submit rating'
      setToast({
        message: errorMessage,
        type: 'error'
      })
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
      in_progress: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      waiting_reply: 'text-purple-500 bg-purple-500/10 border-purple-500/30',
      resolved: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
      closed: 'text-slate-500 bg-slate-500/10 border-slate-500/30',
    }
    return colors[status] || 'text-slate-500 bg-slate-500/10 border-slate-500/30'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'text-slate-400 bg-slate-500/10',
      normal: 'text-blue-400 bg-blue-500/10',
      high: 'text-rose-400 bg-rose-500/10',
      urgent: 'text-rose-400 bg-rose-500/10',
    }
    return colors[priority] || 'text-slate-400 bg-slate-500/10'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/support/tickets"
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="text-slate-400" size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Loading...</h1>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center">
          <Loader2 className="mx-auto text-cyan-400 mb-4 animate-spin" size={48} />
          <p className="text-slate-400">Loading ticket details...</p>
        </div>
      </div>
    )
  }

  if (!ticket && (error || !isLoading)) {
    const errorMessage = (error as any)?.data?.message || 'Ticket not found'
    return (
      <div className="space-y-6">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/support/tickets"
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="text-slate-400" size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Error</h1>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center">
          <AlertCircle className="mx-auto text-rose-500 mb-4" size={48} />
          <p className="text-rose-400 font-medium mb-2">Failed to Load Ticket</p>
          <p className="text-slate-400 text-sm">{errorMessage}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return null
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/support/tickets"
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="text-slate-400" size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 flex-wrap">
            <h1 className="text-base sm:text-xl font-bold text-white">{ticket.subject}</h1>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
              {ticket.status.replace('_', ' ')}
            </span>
            <span className={`hidden sm:inline px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority} priority
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">
            #{ticket.ticketId || (ticket.id || ticket._id || '').substring(0, 8).toUpperCase()} • {ticket.category} • Created {formatTime(ticket.createdAt)}
          </p>
        </div>
      </div>

      {/* Ticket Info Card */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <p className="text-slate-400 text-sm mb-1">Status</p>
            <div className="flex items-center gap-2">
              {ticket.status === 'resolved' || ticket.status === 'closed' ? (
                <CheckCircle className="text-emerald-500" size={16} />
              ) : (
                <Clock className="text-cyan-400" size={16} />
              )}
              <p className="text-white font-medium capitalize">{ticket.status.replace('_', ' ')}</p>
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Priority</p>
            <p className="text-white font-medium capitalize">{ticket.priority}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Category</p>
            <p className="text-white font-medium">{ticket.category}</p>
          </div>
        </div>

        {(ticket.status === 'resolved' || ticket.status === 'closed') && !ticket.rating && (
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-white font-medium mb-1">Rate your support experience</h3>
                <p className="text-slate-400 text-sm">Help us improve our service by rating this ticket</p>
              </div>
              <button
                onClick={() => setShowRatingForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg font-medium transition-colors"
              >
                Rate Ticket
              </button>
            </div>
          </div>
        )}

        {ticket.rating && (
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-slate-400 text-sm mb-2">Your Rating</p>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  className={star <= ticket.rating! ? 'text-cyan-400 fill-cyan-400' : 'text-slate-600'}
                />
              ))}
            </div>
            {ticket.feedback && (
              <p className="text-slate-300 text-sm mt-2">{ticket.feedback}</p>
            )}
          </div>
        )}
      </div>

      {/* Conversation Thread */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-800">
          <h2 className="text-white font-semibold">Conversation</h2>
          <p className="text-slate-500 text-sm mt-0.5">{(ticket.messages || []).length} message{(ticket.messages || []).length !== 1 ? 's' : ''}</p>
        </div>
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[600px] overflow-y-auto">
          {(!ticket.messages || ticket.messages.length === 0) ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No messages yet. Send a reply to start the conversation.</p>
            </div>
          ) : (
            <>
              {ticket.messages.map((msg: TicketMessage, idx: number) => {
                const isAdmin = msg.senderRole === 'admin' || msg.senderRole === 'superAdmin'
                const isUser = msg.senderRole === 'user'
                const senderName = isAdmin
                  ? (msg.sender?.fullName || msg.sender?.email || 'Support Team')
                  : 'You'

                return (
                  <div
                    key={msg._id || idx}
                    className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      isUser
                        ? 'bg-cyan-500/10 text-cyan-400'
                        : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {isUser ? <User size={20} /> : <Shield size={20} />}
                    </div>
                    <div className={`flex-1 max-w-2xl ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`flex items-center gap-2 mb-1 ${isUser ? 'flex-row-reverse' : ''}`}>
                        <span className={`text-sm font-medium ${isUser ? 'text-cyan-400' : 'text-blue-500'}`}>
                          {senderName}
                        </span>
                        {isAdmin && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold uppercase">Admin</span>
                        )}
                        <span className="text-xs text-slate-500">{formatTime(msg.createdAt)}</span>
                      </div>
                      <div className={`p-4 rounded-lg ${
                        isUser
                          ? 'bg-cyan-500/10 border border-cyan-500/30 rounded-tr-sm'
                          : 'bg-slate-800/50 border border-slate-700 rounded-tl-sm'
                      }`}>
                        <p className="text-slate-200 text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Reply Form */}
      {ticket.status !== 'closed' ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6">
          <form onSubmit={handleSendReply}>
            <label className="block text-white font-medium mb-3">Reply to Ticket</label>
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={4}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 resize-none"
              placeholder="Type your message here..."
              disabled={isReplying}
            />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4">
              <p className="text-slate-500 text-sm">
                Average response time: 2-4 hours
              </p>
              <button
                type="submit"
                disabled={isReplying || !replyMessage.trim()}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2.5 rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isReplying ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send Reply
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 text-slate-400">
            <XCircle size={20} />
            <p>This ticket is closed and cannot receive new replies.</p>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Rate Your Experience</h3>
              <button
                onClick={() => setShowRatingForm(false)}
                className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="text-slate-400" size={20} />
              </button>
            </div>
            <p className="text-slate-400 text-sm mb-6">How satisfied were you with the support provided?</p>

            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={star <= rating ? 'text-cyan-400 fill-cyan-400' : 'text-slate-600 hover:text-slate-500'}
                  />
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Additional Feedback (Optional)
              </label>
              <textarea
                value={ratingFeedback}
                onChange={(e) => setRatingFeedback(e.target.value)}
                rows={3}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                placeholder="Tell us more about your experience..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRatingForm(false)}
                disabled={isRating}
                className="flex-1 py-2.5 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800/50 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRateTicket}
                disabled={isRating || rating === 0}
                className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isRating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Rating'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
