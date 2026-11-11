'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Bitcoin, CreditCard, ArrowRight, CheckCircle2, Upload, Copy, AlertCircle, ArrowLeft, Loader2, X } from 'lucide-react';
import { useGetActiveGatewaysQuery } from '@/store/api/paymentGatewayApi';
import { useCreateDepositMutation } from '@/store/api/transactionApi';
import type { PaymentGateway } from '@/store/api/paymentGatewayApi';
import { resolveImageUrl } from '@/lib/imageUrl';

const AddFunds = () => {
  const [step, setStep] = useState(1);
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');

  // Step 2 Verification States
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!screenshot) {
      setScreenshotPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(screenshot);
    setScreenshotPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [screenshot]);

  // API hooks
  const { data: gatewaysResponse, isLoading: loadingGateways } = useGetActiveGatewaysQuery({ purpose: 'deposit' });
  const [createDeposit, { isLoading: isSubmitting }] = useCreateDepositMutation();

  // Extract gateways from response
  const gateways: PaymentGateway[] = gatewaysResponse?.data?.attributes || [];

  const handleGatewaySelect = (id: string) => {
    setSelectedGateway(id);
  };

  const getGateway = (id: string | null) => gateways.find(g => g.id === id);
  const selectedGatewayData = getGateway(selectedGateway);

  const calculateTotal = () => {
    if (!amount || !selectedGatewayData) return 0;
    const val = parseFloat(amount);
    const fee = selectedGatewayData.depositFee || 0;
    const feeType = selectedGatewayData.depositFeeType || 'fixed';

    if (feeType === 'percentage') {
      return val + (val * (fee / 100));
    }
    return val + fee;
  };

  const getFeeAmount = () => {
    if (!amount || !selectedGatewayData) return 0;
    const val = parseFloat(amount);
    const fee = selectedGatewayData.depositFee || 0;
    const feeType = selectedGatewayData.depositFeeType || 'fixed';

    if (feeType === 'percentage') {
      return (val * (fee / 100));
    }
    return fee;
  };

  const getAccountDetails = () => {
    if (!selectedGatewayData) return '';

    if (selectedGatewayData.type === 'bank' && selectedGatewayData.bankDetails) {
      const { bankName, accountNumber, accountName, routingNumber, swiftCode, iban } = selectedGatewayData.bankDetails;
      return `Bank Name: ${bankName || ''}\nAccount Name: ${accountName || ''}\nAccount Number: ${accountNumber || ''}\nRouting Number: ${routingNumber || ''}\nSWIFT Code: ${swiftCode || ''}\nIBAN: ${iban || ''}`;
    }

    return selectedGatewayData.walletAddress || '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setScreenshot(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGateway || !screenshot || !transactionId || !amount) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('amount', amount);
      formData.append('paymentGatewayId', selectedGateway);
      formData.append('txHash', transactionId);
      formData.append('proofImage', screenshot);

      await createDeposit(formData).unwrap();
      setSuccess(true);
    } catch (error: any) {
      console.error('Failed to create deposit:', error);
      alert(error?.data?.message || 'Failed to submit deposit. Please try again.');
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedGateway(null);
    setAmount('');
    setTransactionId('');
    setScreenshot(null);
    setSuccess(false);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-10 sm:py-16 bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-800 text-center px-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-4 sm:mb-6">
          <CheckCircle2 size={32} className="sm:hidden" />
          <CheckCircle2 size={40} className="hidden sm:block" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Deposit Submitted!</h2>
        <p className="text-slate-400 max-w-md mb-6 sm:mb-8 text-sm sm:text-base">
          Your payment proof has been submitted successfully. Our team will verify your transaction shortly.
        </p>
        <button
          onClick={resetForm}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 px-8 py-3 rounded-lg font-bold transition-colors"
        >
          Make Another Deposit
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex justify-between items-start sm:items-center mb-4 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Add Funds</h2>
          <span className="text-slate-400 text-xs sm:text-sm">
            {step === 1 ? 'Select a payment method to proceed' : 'Complete your payment'}
          </span>
        </div>
        {step === 2 && (
          <button
            onClick={() => setStep(1)}
            className="text-slate-400 hover:text-white flex items-center text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" /> Back
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">

          {step === 1 ? (
            /* STEP 1: Gateway & Amount Selection */
            <>
              {loadingGateways ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-cyan-400" size={32} />
                </div>
              ) : gateways.length === 0 ? (
                <div className="text-center py-12 bg-slate-900 rounded-xl border border-slate-800">
                  <p className="text-slate-400">No payment gateways available at the moment</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {gateways.map((gateway) => {
                    const icon = gateway.icon ? (
                      <img src={gateway.icon} alt={gateway.name} className="w-6 h-6 object-contain" />
                    ) : gateway.type === 'crypto' ? (
                      <Bitcoin size={24} />
                    ) : (
                      <CreditCard size={24} />
                    );

                    return (
                      <button
                        key={gateway.id}
                        onClick={() => handleGatewaySelect(gateway.id)}
                        className={`relative p-4 sm:p-6 rounded-xl border flex flex-col items-start transition-all duration-200 ${
                          selectedGateway === gateway.id
                            ? 'bg-slate-800 border-cyan-500 shadow-[0_0_15px_rgba(14,165,233,0.15)]'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {selectedGateway === gateway.id && (
                          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 text-cyan-400">
                            <CheckCircle2 size={18} />
                          </div>
                        )}
                        <div className={`p-2 sm:p-3 rounded-lg mb-3 sm:mb-4 ${selectedGateway === gateway.id ? 'bg-cyan-500 text-slate-900' : 'bg-slate-800 text-slate-400'}`}>
                          {icon}
                        </div>
                        <h3 className="text-white font-bold text-sm sm:text-lg">{gateway.name}</h3>
                        <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
                          Min: ${gateway.minDeposit || 0} • Max: ${(gateway.maxDeposit || 0).toLocaleString()}
                        </p>
                        {gateway.depositFee && gateway.depositFee > 0 && (
                          <p className="text-xs text-amber-400 mt-1">
                            Fee: {gateway.depositFeeType === 'percentage' ? `${gateway.depositFee}%` : `$${gateway.depositFee}`}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="bg-slate-900 rounded-xl p-4 sm:p-6 border border-slate-800">
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Enter Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min={selectedGatewayData?.minDeposit || 0}
                    max={selectedGatewayData?.maxDeposit || 0}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-4 py-4 text-white text-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
                {selectedGateway && selectedGatewayData && (
                   <p className="text-xs text-slate-500 mt-2 text-right">
                     Transaction limit: ${selectedGatewayData.minDeposit || 0} - ${(selectedGatewayData.maxDeposit || 0).toLocaleString()}
                   </p>
                )}
              </div>
            </>
          ) : (
            /* STEP 2: Payment Details & Verification */
            <div className="space-y-6">
              {/* Payment Details Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex items-start mb-4">
                  <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500 mr-3">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">Payment Instructions</h3>
                    <p className="text-sm text-slate-400">
                      Please send exactly <span className="text-cyan-400 font-bold">${calculateTotal().toFixed(2)}</span> to the address below.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 relative group">
                  <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">
                    {selectedGatewayData?.type === 'bank' ? 'Bank Details' : 'Wallet Address'}
                  </p>
                  <pre className="text-white font-mono text-sm whitespace-pre-wrap break-all">
                    {getAccountDetails()}
                  </pre>
                  <button
                    onClick={() => navigator.clipboard.writeText(getAccountDetails())}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors p-1"
                  >
                    <Copy size={18} />
                  </button>
                </div>

                {selectedGatewayData?.qrCode && (
                  <div className="mt-4 flex justify-center">
                    <img
                      src={resolveImageUrl(selectedGatewayData.qrCode) || ''}
                      alt="QR Code"
                      className="w-48 h-48 border-2 border-slate-700 rounded-lg object-contain bg-white"
                    />
                  </div>
                )}

                {selectedGatewayData?.instructions && (
                  <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-slate-300">{selectedGatewayData.instructions}</p>
                  </div>
                )}
              </div>

              {/* Verification Form */}
              <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
                <h3 className="text-lg font-bold text-white">Confirm Payment</h3>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Transaction ID / Hash</label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter the transaction ID from your payment provider"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Upload Screenshot</label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-5 sm:p-8 text-center transition-colors cursor-pointer ${
                      screenshot ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-slate-700 hover:border-slate-600 bg-slate-950'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />

                    {screenshot ? (
                      <div className="flex flex-col items-center justify-center gap-3 text-cyan-400">
                        {screenshotPreview && (
                          <img
                            src={screenshotPreview}
                            alt="Screenshot preview"
                            className="max-h-40 w-auto rounded-lg border border-cyan-500/40 object-contain shadow-md"
                          />
                        )}
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle2 size={20} className="shrink-0" />
                          <span className="font-medium truncate max-w-[200px] sm:max-w-xs text-sm">{screenshot.name}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setScreenshot(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="p-1 hover:bg-slate-800 rounded-full"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="mx-auto w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                          <Upload size={24} />
                        </div>
                        <p className="text-sm text-slate-300 font-medium">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-500">PNG, JPG, WEBP, HEIC or PDF (max. 10MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !transactionId || !screenshot}
                  className={`w-full py-4 rounded-lg font-bold flex items-center justify-center transition-all ${
                    isSubmitting || !transactionId || !screenshot
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 shadow-lg shadow-cyan-500/20 transform hover:-translate-y-1'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Proceed to Payment
                      <ArrowRight size={18} className="ml-2" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700 sticky top-6">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Payment Summary</h3>

            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Payment Method</span>
                <span className="text-white font-medium">{selectedGatewayData?.name || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Amount</span>
                <span className="text-white font-medium">${amount ? parseFloat(amount).toFixed(2) : '0.00'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Fee</span>
                <span className="text-red-400 font-medium">
                  {selectedGateway && amount
                    ? `+$${getFeeAmount().toFixed(2)}`
                    : '$0.00'}
                </span>
              </div>
              <div className="border-t border-slate-700 my-2"></div>
              <div className="flex justify-between text-lg font-bold">
                <span className="text-white">Payable Total</span>
                <span className="text-cyan-400">
                   ${calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>

            {step === 1 && (
              <>
                <button
                  onClick={() => {
                    if (!selectedGatewayData || !amount) return;

                    const numAmount = parseFloat(amount);
                    const min = selectedGatewayData.minDeposit || 0;
                    const max = selectedGatewayData.maxDeposit || 0;

                    if (numAmount < min) {
                      alert(`Minimum deposit amount is $${min}`);
                      return;
                    }

                    if (numAmount > max) {
                      alert(`Maximum deposit amount is $${max}`);
                      return;
                    }

                    setStep(2);
                  }}
                  disabled={!selectedGateway || !amount}
                  className={`w-full py-4 rounded-lg font-bold flex items-center justify-center transition-all ${
                    selectedGateway && amount
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 shadow-lg shadow-cyan-500/20 transform hover:-translate-y-1'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Proceed to Payment
                  <ArrowRight size={18} className="ml-2" />
                </button>
                <p className="text-xs text-center text-slate-500 mt-4">
                  Secure 256-bit encrypted transaction
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFunds;
