'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download, Clock, CheckCircle, XCircle, AlertCircle, DollarSign, CreditCard, Hash, Calendar, FileText, User, Eye, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useGetTransactionByIdQuery } from '@/store/api/transactionApi'

export default function TransactionDetail() {
  const params = useParams()
  const router = useRouter()
  const transactionId = params.id as string

  const [showProofImage, setShowProofImage] = useState(false)

  // Fetch transaction from API
  const { data: transactionResponse, isLoading, error } = useGetTransactionByIdQuery(transactionId)

  const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ''
  const transaction = transactionResponse?.data?.attributes

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="animate-spin text-cyan-400 mx-auto mb-4" size={32} />
          <p className="text-slate-400">Loading transaction details...</p>
        </div>
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-rose-500 font-medium">Failed to load transaction</p>
          <p className="text-slate-500 text-sm mt-2">Please try again later</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
      pending: <Clock className="text-cyan-400" size={24} />,
      processing: <Clock className="text-blue-500" size={24} />,
      completed: <CheckCircle className="text-emerald-500" size={24} />,
      rejected: <XCircle className="text-rose-500" size={24} />,
      cancelled: <AlertCircle className="text-slate-500" size={24} />,
    }
    return icons[status] || <Clock className="text-slate-500" size={24} />
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      processing: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
      completed: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
      rejected: 'text-rose-500 bg-rose-500/10 border-rose-500/30',
      cancelled: 'text-slate-500 bg-slate-500/10 border-slate-500/30',
    }
    return colors[status] || 'text-slate-500 bg-slate-500/10 border-slate-500/30'
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      deposit: 'text-emerald-500 bg-emerald-500/10',
      withdraw: 'text-rose-500 bg-rose-500/10',
      investment: 'text-blue-500 bg-blue-500/10',
      profit: 'text-cyan-400 bg-cyan-500/10',
      referral: 'text-cyan-400 bg-cyan-500/10',
      bonus: 'text-purple-500 bg-purple-500/10',
    }
    return colors[type] || 'text-slate-500 bg-slate-500/10'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="text-slate-400" size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 flex-wrap">
            <h1 className="text-lg sm:text-2xl font-bold text-white">Transaction Details</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
              {transaction.status}
            </span>
          </div>
          <p className="text-slate-400 text-sm">ID: {transaction.transactionId}</p>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`rounded-xl p-4 sm:p-6 border ${
        transaction.status === 'completed'
          ? 'bg-emerald-500/5 border-emerald-500/30'
          : transaction.status === 'rejected'
          ? 'bg-rose-500/5 border-rose-500/30'
          : 'bg-cyan-500/5 border-cyan-500/30'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${
            transaction.status === 'completed'
              ? 'bg-emerald-500/10'
              : transaction.status === 'rejected'
              ? 'bg-rose-500/10'
              : 'bg-cyan-500/10'
          }`}>
            {getStatusIcon(transaction.status)}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg mb-1 capitalize">
              Transaction {transaction.status}
            </h3>
            <p className="text-slate-300 text-sm">
              {transaction.status === 'completed' && (transaction.adminNotes || 'Your transaction has been completed successfully.')}
              {transaction.status === 'rejected' && (transaction.adminNotes || 'Your transaction was rejected. Please contact support for more information.')}
              {transaction.status === 'pending' && 'Your transaction is being reviewed by our team. This usually takes 15-30 minutes.'}
              {transaction.status === 'processing' && 'Your transaction is being processed.'}
              {transaction.status === 'cancelled' && 'This transaction was cancelled.'}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Amount</p>
            <DollarSign className="text-cyan-400" size={20} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">${transaction.amount.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-2 capitalize">{transaction.type} amount</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Fee</p>
            <CreditCard className="text-blue-500" size={20} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">${transaction.fee.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-2">Transaction fee</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Net Amount</p>
            <CheckCircle className="text-emerald-500" size={20} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-400">${transaction.netAmount.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-2">After fees</p>
        </div>
      </div>

      {/* Transaction Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Transaction Information</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
              <Hash className="text-slate-400 flex-shrink-0 mt-0.5" size={18} />
              <div className="flex-1 min-w-0">
                <p className="text-slate-400 text-xs mb-1">Transaction ID</p>
                <p className="text-white font-mono text-sm break-all">{transaction.transactionId}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
              <FileText className="text-slate-400 flex-shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="text-slate-400 text-xs mb-1">Type</p>
                <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getTypeColor(transaction.type)}`}>
                  {transaction.type.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
              <CreditCard className="text-slate-400 flex-shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="text-slate-400 text-xs mb-1">Payment Method</p>
                <p className="text-white text-sm capitalize">{transaction.paymentMethod || '-'}</p>
              </div>
            </div>

            {transaction.paymentGateway && (
              <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                <User className="text-slate-400 flex-shrink-0 mt-0.5" size={18} />
                <div className="flex-1">
                  <p className="text-slate-400 text-xs mb-1">Payment Gateway</p>
                  <p className="text-white text-sm">{transaction.paymentGateway.name}</p>
                </div>
              </div>
            )}

            {transaction.walletAddress && (
              <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                <Hash className="text-slate-400 flex-shrink-0 mt-0.5" size={18} />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-400 text-xs mb-1">Wallet Address</p>
                  <p className="text-white font-mono text-sm break-all">{transaction.walletAddress}</p>
                </div>
              </div>
            )}

            {transaction.txHash && (
              <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                <Hash className="text-slate-400 flex-shrink-0 mt-0.5" size={18} />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-400 text-xs mb-1">Transaction Hash</p>
                  <p className="text-white font-mono text-xs break-all">{transaction.txHash}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Timeline</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
              <Calendar className="text-slate-400 flex-shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="text-slate-400 text-xs mb-1">Created At</p>
                <p className="text-white text-sm">{formatDate(transaction.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
              <Calendar className="text-slate-400 flex-shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="text-slate-400 text-xs mb-1">Last Updated</p>
                <p className="text-white text-sm">{formatDate(transaction.updatedAt)}</p>
              </div>
            </div>

            {transaction.processedAt && (
              <div className="flex items-start gap-3 p-3 bg-emerald-500/5 border border-emerald-500/30 rounded-lg">
                <CheckCircle className="text-emerald-500 flex-shrink-0 mt-0.5" size={18} />
                <div className="flex-1">
                  <p className="text-emerald-400 text-xs mb-1">Processed At</p>
                  <p className="text-white text-sm">{formatDate(transaction.processedAt)}</p>
                </div>
              </div>
            )}

            {transaction.notes && (
              <div className="flex items-start gap-3 p-3 bg-blue-500/5 border border-blue-500/30 rounded-lg">
                <FileText className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
                <div className="flex-1">
                  <p className="text-blue-400 text-xs mb-1">Notes</p>
                  <p className="text-white text-sm">{transaction.notes}</p>
                </div>
              </div>
            )}

            {transaction.proofImage && (
              <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                <Eye className="text-slate-400 flex-shrink-0 mt-0.5" size={18} />
                <div className="flex-1">
                  <p className="text-slate-400 text-xs mb-1">Payment Proof</p>
                  <button
                    onClick={() => setShowProofImage(true)}
                    className="text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center gap-1"
                  >
                    View Screenshot
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Notes */}
      {transaction.adminNotes && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Admin Notes</h3>
          <div className="p-4 bg-blue-500/5 border border-blue-500/30 rounded-lg">
            <p className="text-slate-300 text-sm">{transaction.adminNotes}</p>
          </div>
        </div>
      )}

      {/* Proof Image Modal */}
      {showProofImage && transaction.proofImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4" onClick={() => setShowProofImage(false)}>
          <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-white font-semibold">Payment Proof</h3>
              <button onClick={() => setShowProofImage(false)} className="text-slate-400 hover:text-white">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6">
              <img
                src={`${IMAGE_BASE_URL}${transaction.proofImage}`}
                alt="Payment Proof"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
