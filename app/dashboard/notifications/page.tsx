'use client'

import { useState, useMemo } from 'react'
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  DollarSign,
  AlertTriangle,
  Gift,
  Shield,
  Info,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  X,
} from 'lucide-react'
import {
  useGetMyNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllMutation,
} from '@/store/api/notificationApi'

// Simple toast utility
let toastTimeout: NodeJS.Timeout | null = null

const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  const existingToast = document.getElementById('notification-toast')
  if (existingToast) {
    existingToast.remove()
  }

  const toast = document.createElement('div')
  toast.id = 'notification-toast'
  toast.className = `fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg border flex items-center gap-2 animate-in slide-in-from-bottom-5 ${
    type === 'success'
      ? 'bg-emerald-500/90 border-emerald-400 text-white'
      : type === 'error'
      ? 'bg-rose-500/90 border-rose-400 text-white'
      : 'bg-blue-500/90 border-blue-400 text-white'
  }`

  const icon =
    type === 'success'
      ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
      : type === 'error'
      ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>'
      : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'

  toast.innerHTML = `${icon}<span class="font-medium">${message}</span>`
  document.body.appendChild(toast)

  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => {
    toast.remove()
  }, 3000)
}

// Notification type mapping
type CategoryType = 'all' | 'unread' | 'read' | 'transaction' | 'system' | 'promotion' | 'security'

interface Notification {
  id: string
  userId: string
  type: string
  title: string
  content: string
  status: 'unread' | 'read'
  priority: 'low' | 'medium' | 'high'
  icon?: string
  image?: string
  transactionId?: string
  createdAt: string
  updatedAt: string
}

// Confirmation Modal Component
function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  isLoading = false,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  isLoading?: boolean
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center">
            <AlertTriangle className="text-rose-500" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-sm">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium border border-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="animate-spin" size={16} />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

// Skeleton Loader Component
function NotificationSkeleton() {
  return (
    <div className="p-6 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-5 h-5 bg-slate-800 rounded mt-1" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="h-5 bg-slate-800 rounded w-1/3" />
            <div className="h-4 bg-slate-800 rounded w-20" />
          </div>
          <div className="h-4 bg-slate-800 rounded w-full mb-3" />
          <div className="h-4 bg-slate-800 rounded w-2/3" />
        </div>
      </div>
    </div>
  )
}

export default function NotificationCenter() {
  const [filter, setFilter] = useState<CategoryType>('all')
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // RTK Query hooks
  const {
    data: notificationsData,
    isLoading: isLoadingNotifications,
    isError: isErrorNotifications,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useGetMyNotificationsQuery()

  const {
    data: unreadCountData,
    isLoading: isLoadingCount,
  } = useGetUnreadCountQuery()

  const [markAsRead, { isLoading: isMarkingAsRead }] = useMarkAsReadMutation()
  const [markAllAsRead, { isLoading: isMarkingAllAsRead }] = useMarkAllAsReadMutation()
  const [deleteNotification, { isLoading: isDeletingNotification }] = useDeleteNotificationMutation()
  const [deleteAll, { isLoading: isDeletingAll }] = useDeleteAllMutation()

  // Extract data from API response
  const notifications: Notification[] = useMemo(() => {
    return notificationsData?.data?.attributes || []
  }, [notificationsData])

  const unreadCount = unreadCountData?.data?.attributes?.count || 0

  // Map notification types to categories
  const mapTypeToCategory = (notification: Notification): string => {
    const type = notification.type.toLowerCase();
    if (type.includes('transaction') || type.includes('deposit') || type.includes('withdraw')) return 'transaction';
    if (type.includes('security') || type.includes('password') || type.includes('login')) return 'security';
    if (type.includes('promotion') || type.includes('bonus') || type.includes('referral')) return 'promotion';
    if (type.includes('profit') || type.includes('investment')) return 'transaction';
    return 'system';
  }

  // Get icon based on notification type
  const getIcon = (notification: Notification) => {
    const category = mapTypeToCategory(notification);
    const icons = {
      transaction: <DollarSign className="text-emerald-500" size={20} />,
      security: <Shield className="text-rose-500" size={20} />,
      promotion: <Gift className="text-cyan-400" size={20} />,
      system: <AlertTriangle className="text-blue-500" size={20} />,
    }
    return icons[category as keyof typeof icons] || <Bell className="text-slate-500" size={20} />
  }

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const icons = {
      transaction: <DollarSign className="text-emerald-500" size={20} />,
      system: <AlertTriangle className="text-blue-500" size={20} />,
      promotion: <Gift className="text-cyan-400" size={20} />,
      security: <Shield className="text-rose-500" size={20} />,
    }
    return icons[category as keyof typeof icons] || <Bell className="text-slate-500" size={20} />
  }

  // Format relative date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === 'all') return true
      if (filter === 'unread') return n.status === 'unread'
      if (filter === 'read') return n.status === 'read'
      return mapTypeToCategory(n) === filter
    })
  }, [notifications, filter])

  // Calculate stats
  const stats = useMemo(() => {
    return {
      all: notifications.length,
      unread: notifications.filter((n) => n.status === 'unread').length,
      read: notifications.filter((n) => n.status === 'read').length,
      transaction: notifications.filter((n) => mapTypeToCategory(n) === 'transaction').length,
      system: notifications.filter((n) => mapTypeToCategory(n) === 'system').length,
      promotion: notifications.filter((n) => mapTypeToCategory(n) === 'promotion').length,
      security: notifications.filter((n) => mapTypeToCategory(n) === 'security').length,
    }
  }, [notifications])

  // Handlers
  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap()
      showToast('Notification marked as read', 'success')
    } catch (error: any) {
      showToast(error?.data?.message || 'Failed to mark as read', 'error')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap()
      showToast('All notifications marked as read', 'success')
    } catch (error: any) {
      showToast(error?.data?.message || 'Failed to mark all as read', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteNotification(id).unwrap()
      showToast('Notification deleted', 'success')
    } catch (error: any) {
      showToast(error?.data?.message || 'Failed to delete notification', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteAll = async () => {
    try {
      await deleteAll().unwrap()
      showToast('All notifications deleted', 'success')
      setShowDeleteAllModal(false)
    } catch (error: any) {
      showToast(error?.data?.message || 'Failed to delete all notifications', 'error')
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.status === 'unread') {
      await handleMarkAsRead(notification.id)
    }
    // Navigate to transaction if transactionId exists
    if (notification.transactionId) {
      window.location.href = `/dashboard/transactions?search=${notification.transactionId}`
    }
  }

  // Loading state
  if (isLoadingNotifications) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-start">
          <div>
            <div className="h-8 bg-slate-800 rounded w-48 mb-2" />
            <div className="h-4 bg-slate-800 rounded w-64" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 bg-slate-800 rounded w-32" />
            <div className="h-10 bg-slate-800 rounded w-32" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 animate-pulse">
              <div className="h-3 bg-slate-800 rounded w-16 mb-2" />
              <div className="h-8 bg-slate-800 rounded w-12" />
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="flex gap-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-800 rounded w-24" />
          ))}
        </div>

        {/* Notifications Skeleton */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800">
          {[...Array(5)].map((_, i) => (
            <NotificationSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (isErrorNotifications) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Notifications</h1>
            <p className="text-slate-400 text-sm mt-1">Error loading notifications</p>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="text-rose-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Failed to Load Notifications</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              {(notificationsError as any)?.data?.message || 'An error occurred while loading your notifications. Please try again.'}
            </p>
            <button
              onClick={() => refetchNotifications()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-colors font-medium"
            >
              <RefreshCw size={18} />
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-1 bg-cyan-500 text-white text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {stats.unread > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAllAsRead}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors border border-slate-700 font-medium"
            >
              {isMarkingAllAsRead ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <CheckCheck size={18} />
              )}
              Mark All Read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={() => setShowDeleteAllModal(true)}
              disabled={isDeletingAll}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-rose-400 rounded-lg transition-colors border border-rose-500/30 font-medium"
            >
              {isDeletingAll ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Trash2 size={18} />
              )}
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
          <p className="text-slate-400 text-xs mb-1 font-medium">All</p>
          <p className="text-xl sm:text-2xl font-bold text-white">{stats.all}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
          <p className="text-slate-400 text-xs mb-1 font-medium">Unread</p>
          <p className="text-xl sm:text-2xl font-bold text-cyan-400">{stats.unread}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
          <p className="text-slate-400 text-xs mb-1 font-medium">Read</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-500">{stats.read}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
          <p className="text-slate-400 text-xs mb-1 font-medium">Transactions</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-500">{stats.transaction}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
          <p className="text-slate-400 text-xs mb-1 font-medium">System</p>
          <p className="text-xl sm:text-2xl font-bold text-blue-500">{stats.system}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
          <p className="text-slate-400 text-xs mb-1 font-medium">Promotions</p>
          <p className="text-xl sm:text-2xl font-bold text-cyan-400">{stats.promotion}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
          <p className="text-slate-400 text-xs mb-1 font-medium">Security</p>
          <p className="text-xl sm:text-2xl font-bold text-rose-500">{stats.security}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(
          [
            { key: 'all', label: 'All' },
            { key: 'unread', label: 'Unread' },
            { key: 'read', label: 'Read' },
            { key: 'transaction', label: 'Transactions' },
            { key: 'system', label: 'System' },
            { key: 'promotion', label: 'Promotions' },
            { key: 'security', label: 'Security' },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              filter === key
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="text-slate-600" size={40} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {filter === 'all'
                ? 'No Notifications'
                : filter === 'unread'
                ? 'No Unread Notifications'
                : `No ${filter.charAt(0).toUpperCase() + filter.slice(1)} Notifications`}
            </h3>
            <p className="text-slate-500 text-sm">
              {filter === 'all'
                ? "You're all caught up! No notifications to show."
                : filter === 'unread'
                ? 'You have read all your notifications.'
                : `You don't have any ${filter} notifications.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredNotifications.map((notification) => {
              const category = mapTypeToCategory(notification)
              const isDeleting = deletingId === notification.id

              return (
                <div
                  key={notification.id}
                  className={`p-4 sm:p-5 hover:bg-slate-800/30 transition-all group cursor-pointer ${
                    notification.status === 'unread' ? 'bg-slate-800/20 border-l-2 border-l-cyan-500' : ''
                  } ${isDeleting ? 'opacity-50' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notification)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-1.5">
                        <div className="flex items-center gap-2 flex-1">
                          <h3 className="text-white font-semibold text-sm">{notification.title}</h3>
                          {notification.status === 'unread' && (
                            <div className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0 animate-pulse" />
                          )}
                        </div>
                        <span className="text-xs text-slate-500 whitespace-nowrap flex-shrink-0">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mb-3 leading-relaxed">{notification.content}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                            category === 'transaction'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : category === 'system'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : category === 'promotion'
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {category}
                        </span>
                        {notification.status === 'unread' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsRead(notification.id)
                            }}
                            disabled={isMarkingAsRead}
                            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity font-medium"
                          >
                            <Check size={14} />
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(notification.id)
                          }}
                          disabled={isDeleting}
                          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ml-auto font-medium"
                        >
                          {isDeleting ? (
                            <Loader2 className="animate-spin" size={14} />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteAllModal}
        onClose={() => setShowDeleteAllModal(false)}
        onConfirm={handleDeleteAll}
        title="Delete All Notifications?"
        message="This action cannot be undone. All your notifications will be permanently deleted."
        confirmText="Delete All"
        isLoading={isDeletingAll}
      />
    </div>
  )
}
