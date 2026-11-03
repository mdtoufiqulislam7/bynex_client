'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Wallet, AlertCircle, ArrowUpRight, CheckCircle, Loader2, Star, Bookmark, X, TrendingUp } from 'lucide-react';
import { useGetActiveGatewaysQuery } from '@/store/api/paymentGatewayApi';
import { useGetWalletQuery } from '@/store/api/walletApi';
import { useCreateWithdrawalMutation } from '@/store/api/transactionApi';
import { useGetSavedAccountsQuery } from '@/store/api/savedAccountApi';
import type { SavedAccount } from '@/store/api/savedAccountApi';

const WithdrawRequest = () => {
  const [selectedGateway, setSelectedGateway] = useState('');
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [selectedSavedAccount, setSelectedSavedAccount] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showInvestFirstModal, setShowInvestFirstModal] = useState(false);

  // Fetch wallet data
  const { data: walletResponse, isLoading: walletLoading } = useGetWalletQuery();
  const wallet = walletResponse?.data?.attributes;
  const balance = wallet?.balance || 0;
  const totalDeposit = Number(wallet?.totalDeposit ?? 0);
  /** Withdrawals require at least one deposit / investment on record */
  const canRequestWithdrawal = totalDeposit > 0;

  const openInvestFirstModal = () => setShowInvestFirstModal(true);

  // Fetch active gateways for withdrawal
  const { data: gatewaysResponse, isLoading: gatewaysLoading } = useGetActiveGatewaysQuery({ purpose: 'withdraw' });
  const gateways = gatewaysResponse?.data?.attributes || [];

  // Fetch saved accounts
  const { data: savedAccountsResponse } = useGetSavedAccountsQuery();
  const savedAccounts: SavedAccount[] = (savedAccountsResponse?.data?.attributes as any)?.results || [];

  // Create withdrawal mutation
  const [createWithdrawal, { isLoading: submitting }] = useCreateWithdrawalMutation();

  const selectedGatewayData = gateways.find((g: any) => g.id === selectedGateway);

  // Filter saved accounts matching the selected gateway type
  const filteredSavedAccounts = selectedGatewayData
    ? savedAccounts.filter((a: SavedAccount) =>
        (selectedGatewayData.type === 'crypto' && a.accountType === 'crypto') ||
        (selectedGatewayData.type === 'bank' && a.accountType === 'bank')
      )
    : [];

  const handleSavedAccountSelect = (accountId: string) => {
    setSelectedSavedAccount(accountId);
    if (accountId) {
      const account = savedAccounts.find((a: SavedAccount) => a.id === accountId);
      if (account) {
        if (account.accountType === 'crypto') {
          setWalletAddress(account.walletAddress || '');
          setAccountNumber('');
          setAccountName('');
        } else if (account.accountType === 'bank') {
          setAccountNumber(account.bankDetails?.accountNumber || '');
          setAccountName(account.bankDetails?.accountName || '');
          setWalletAddress('');
        }
      }
    } else {
      setWalletAddress('');
      setAccountNumber('');
      setAccountName('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!canRequestWithdrawal) {
      openInvestFirstModal();
      return;
    }

    if (!selectedGateway) {
      setError('Please select a withdrawal method');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const requiredBalance = parseFloat(amount) * 1.15;
    if (requiredBalance > balance) {
      setError(`Insufficient balance. You need $${requiredBalance.toFixed(2)} (withdrawal amount + 15%) but your balance is $${balance.toFixed(2)}.`);
      return;
    }

    if (selectedGatewayData?.type === 'crypto' && !walletAddress) {
      setError('Please enter your wallet address');
      return;
    }

    if (selectedGatewayData?.type === 'bank' && (!accountNumber || !accountName)) {
      setError('Please enter your bank account details');
      return;
    }

    try {
      const withdrawalData: any = {
        amount: parseFloat(amount),
        paymentGatewayId: selectedGateway,
      };

      if (selectedGatewayData?.type === 'crypto') {
        withdrawalData.walletAddress = walletAddress;
      } else if (selectedGatewayData?.type === 'bank') {
        // If using a saved account, include full bank details
        const savedAccount = selectedSavedAccount
          ? savedAccounts.find((a: SavedAccount) => a.id === selectedSavedAccount)
          : null;
        if (savedAccount?.bankDetails) {
          withdrawalData.bankDetails = {
            bankName: savedAccount.bankDetails.bankName,
            accountNumber: savedAccount.bankDetails.accountNumber,
            accountName: savedAccount.bankDetails.accountName,
            routingNumber: savedAccount.bankDetails.routingNumber,
            swiftCode: savedAccount.bankDetails.swiftCode,
          };
        } else {
          withdrawalData.bankDetails = {
            accountNumber,
            accountName,
          };
        }
      }

      await createWithdrawal(withdrawalData).unwrap();

      setSuccess(true);
      setAmount('');
      setWalletAddress('');
      setAccountNumber('');
      setAccountName('');
      setSelectedGateway('');
      setSelectedSavedAccount('');

      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to submit withdrawal request. Please try again.');
    }
  };

  if (walletLoading || gatewaysLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="animate-spin text-cyan-400 mx-auto mb-4" size={32} />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {showInvestFirstModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowInvestFirstModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-500/15 p-3 rounded-xl text-amber-400">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-lg font-bold text-white pr-8">Invest first</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              You need to make a deposit or investment before you can request a withdrawal. Your total deposit is currently{' '}
              <span className="text-white font-semibold">${totalDeposit.toFixed(2)}</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard/plans/invest"
                onClick={() => setShowInvestFirstModal(false)}
                className="flex-1 text-center py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm hover:opacity-95 shadow-lg shadow-cyan-500/25 transition-opacity"
              >
                View investment plans
              </Link>
              <button
                type="button"
                onClick={() => setShowInvestFirstModal(false)}
                className="flex-1 py-3 rounded-lg border border-slate-600 text-slate-300 font-medium text-sm hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Withdraw Funds</h2>
        <span className="text-slate-400 text-xs sm:text-sm">Request a secure payout to your wallet</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 rounded-xl p-4 sm:p-8 border border-slate-800 shadow-xl">

            {/* Balance Card */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-lg p-4 sm:p-6 mb-5 sm:mb-8 flex items-center justify-between text-white shadow-lg">
              <div>
                <p className="text-indigo-200 text-xs sm:text-sm font-medium mb-1">Available for Withdrawal</p>
                <h3 className="text-xl sm:text-3xl font-bold">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                <p className="text-indigo-200/90 text-xs mt-1">Total deposit: ${totalDeposit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-full">
                <Wallet size={24} className="sm:hidden" />
                <Wallet size={32} className="hidden sm:block" />
              </div>
            </div>

            {!canRequestWithdrawal && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-amber-200 font-medium text-sm">Deposit required</p>
                  <p className="text-amber-200/80 text-xs mt-1">
                    You must invest or deposit before withdrawals are enabled.{' '}
                    <button
                      type="button"
                      onClick={openInvestFirstModal}
                      className="text-cyan-400 font-semibold underline hover:text-cyan-300"
                    >
                      Learn more
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
                <CheckCircle className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-emerald-400 font-medium">Withdrawal Request Submitted!</p>
                  <p className="text-emerald-300/80 text-sm mt-1">Your withdrawal request has been submitted successfully and is pending approval.</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="text-rose-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-rose-400 font-medium">Error</p>
                  <p className="text-rose-300/80 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Withdraw Method */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Withdraw Method</label>
                <select
                  value={selectedGateway}
                  onChange={(e) => {
                    setSelectedGateway(e.target.value);
                    setSelectedSavedAccount('');
                    setWalletAddress('');
                    setAccountNumber('');
                    setAccountName('');
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  required
                >
                  <option value="">Select withdrawal method</option>
                  {gateways.map((gateway: any) => (
                    <option key={gateway.id} value={gateway.id}>
                      {gateway.name} ({gateway.currency})
                      {gateway.withdrawFee > 0 && ` - Fee: ${gateway.withdrawFeeType === 'percentage' ? gateway.withdrawFee + '%' : '$' + gateway.withdrawFee}`}
                    </option>
                  ))}
                </select>
                {selectedGatewayData && (
                  <p className="text-xs text-slate-400 mt-2">
                    Min: ${selectedGatewayData.minWithdraw} | Max: ${selectedGatewayData.maxWithdraw}
                    {selectedGatewayData.processingTime && ` | Processing: ${selectedGatewayData.processingTime}`}
                  </p>
                )}
              </div>

              {/* Step 2: Withdraw Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Withdraw Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-20 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setAmount((Math.floor((balance / 1.15) * 100) / 100).toString())}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-slate-800 text-cyan-400 px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                  >
                    MAX
                  </button>
                </div>
                {parseFloat(amount) > 0 && parseFloat(amount) * 1.15 > balance && (
                  <p className="text-red-500 text-xs mt-2 flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    Insufficient balance. Required: ${(parseFloat(amount) * 1.15).toFixed(2)} (amount + 15% service fee)
                  </p>
                )}
                {parseFloat(amount) > 0 && parseFloat(amount) * 1.15 <= balance && (
                  <div className="text-xs mt-2 space-y-1 bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                    <div className="flex justify-between text-slate-400">
                      <span>Service fee (15%)</span>
                      <span className="text-rose-400">-${(parseFloat(amount) * 0.15).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Total deducted from balance</span>
                      <span className="text-slate-300">${(parseFloat(amount) * 1.15).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t border-slate-700 pt-1 mt-1">
                      <span className="text-slate-300">You will receive</span>
                      <span className="text-emerald-400">${parseFloat(amount).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: Withdrawal Account Details */}
              {selectedGatewayData && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-300">
                    {selectedGatewayData.type === 'crypto' ? 'Wallet Address' : 'Bank Account Details'}
                  </label>

                  {/* Saved Accounts Suggestion */}
                  {filteredSavedAccounts.length > 0 && (
                    <div className="bg-slate-950/50 border border-slate-700 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Bookmark size={14} className="text-cyan-400" />
                        <span className="font-medium">Your Saved Accounts</span>
                      </div>
                      <div className="grid gap-2">
                        {filteredSavedAccounts.map((account: SavedAccount) => (
                          <button
                            key={account.id}
                            type="button"
                            onClick={() => handleSavedAccountSelect(account.id)}
                            className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                              selectedSavedAccount === account.id
                                ? 'border-cyan-500 bg-cyan-500/10 text-white'
                                : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                selectedSavedAccount === account.id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {account.accountType === 'crypto' ? <Wallet size={14} /> : <Bookmark size={14} />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{account.label}</span>
                                  {account.isDefault && (
                                    <Star size={12} className="text-cyan-400 fill-cyan-400" />
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                                  {account.accountType === 'crypto'
                                    ? `${account.walletAddress?.slice(0, 10)}...${account.walletAddress?.slice(-8)}`
                                    : `${account.bankDetails?.bankName} — ****${account.bankDetails?.accountNumber?.slice(-4)}`
                                  }
                                </p>
                              </div>
                            </div>
                            {selectedSavedAccount === account.id && (
                              <CheckCircle size={16} className="text-cyan-400 flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                      {selectedSavedAccount && (
                        <button
                          type="button"
                          onClick={() => handleSavedAccountSelect('')}
                          className="text-xs text-slate-400 hover:text-white transition-colors"
                        >
                          Clear selection and enter manually
                        </button>
                      )}
                    </div>
                  )}

                  {/* Manual Entry — Crypto Wallet Address */}
                  {selectedGatewayData.type === 'crypto' && (
                    <div>
                      {filteredSavedAccounts.length > 0 && !selectedSavedAccount && (
                        <p className="text-xs text-slate-400 mb-2">Or enter a wallet address manually:</p>
                      )}
                      {filteredSavedAccounts.length === 0 && (
                        <p className="text-xs text-slate-400 mb-2">Enter your {selectedGatewayData.currency} wallet address:</p>
                      )}
                      <input
                        type="text"
                        value={walletAddress}
                        onChange={(e) => { setWalletAddress(e.target.value); if (selectedSavedAccount) setSelectedSavedAccount(''); }}
                        placeholder="e.g. 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                        className={`w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors font-mono text-sm ${selectedSavedAccount ? 'opacity-60' : ''}`}
                        readOnly={!!selectedSavedAccount}
                        required
                      />
                      <p className="text-xs text-cyan-400 mt-2 flex items-start gap-1">
                        <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                        Double-check your wallet address. Funds sent to wrong addresses cannot be recovered.
                      </p>
                    </div>
                  )}

                  {/* Manual Entry — Bank Account Details */}
                  {selectedGatewayData.type === 'bank' && (
                    <div className="space-y-4">
                      {filteredSavedAccounts.length > 0 && !selectedSavedAccount && (
                        <p className="text-xs text-slate-400">Or enter bank details manually:</p>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Account Number</label>
                        <input
                          type="text"
                          value={accountNumber}
                          onChange={(e) => { setAccountNumber(e.target.value); if (selectedSavedAccount) setSelectedSavedAccount(''); }}
                          placeholder="Enter your account number"
                          className={`w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors ${selectedSavedAccount ? 'opacity-60' : ''}`}
                          readOnly={!!selectedSavedAccount}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Account Name</label>
                        <input
                          type="text"
                          value={accountName}
                          onChange={(e) => { setAccountName(e.target.value); if (selectedSavedAccount) setSelectedSavedAccount(''); }}
                          placeholder="Enter account holder name"
                          className={`w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors ${selectedSavedAccount ? 'opacity-60' : ''}`}
                          readOnly={!!selectedSavedAccount}
                          required
                        />
                      </div>
                      {selectedGatewayData.bankDetails && (
                        <div className="bg-blue-500/5 border border-blue-500/30 rounded-lg p-4">
                          <p className="text-blue-400 text-xs font-medium mb-2">Bank Details</p>
                          <div className="text-xs text-slate-300 space-y-1">
                            {selectedGatewayData.bankDetails.bankName && <p>Bank: {selectedGatewayData.bankDetails.bankName}</p>}
                            {selectedGatewayData.bankDetails.accountNumber && <p>Account: {selectedGatewayData.bankDetails.accountNumber}</p>}
                            {selectedGatewayData.bankDetails.swiftCode && <p>SWIFT: {selectedGatewayData.bankDetails.swiftCode}</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Instructions */}
              {selectedGatewayData?.instructions && (
                <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
                  <p className="text-slate-300 text-xs whitespace-pre-wrap">{selectedGatewayData.instructions}</p>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !selectedGateway ||
                    !amount ||
                    parseFloat(amount) * 1.15 > balance
                  }
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-4 rounded-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transform hover:-translate-y-1 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      Processing...
                    </>
                  ) : (
                    <>
                      Submit Request
                      <ArrowUpRight size={18} className="ml-2" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6">
            <h4 className="text-white font-bold text-sm sm:text-base mb-3 sm:mb-4">Important Information</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5 mr-2 shrink-0"></span>
                Withdrawals are processed within 24 hours.
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5 mr-2 shrink-0"></span>
                Minimum withdrawal amount is $10.00.
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5 mr-2 shrink-0"></span>
                Ensure your wallet address is correct. We are not responsible for funds sent to wrong addresses.
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5 mr-2 shrink-0"></span>
                A 2% fee applies to bank transfers. Crypto withdrawals are free.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawRequest;
