'use client'

import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setUser } from '../store/slices/authSlice';
import {
  useGetMyProfileQuery,
  useUpdateProfileMutation,
  useUploadProfileImageMutation,
  useDeleteProfileImageMutation
} from '../store/api/userApi';
import { useChangePasswordMutation, useDeleteAccountMutation } from '../store/api/authApi';
import { Toast, ToastType } from './Toast';
import { Save, Lock, User, Upload, Trash2, Loader2, AlertTriangle, Wallet, Plus, Edit3, Star, CreditCard } from 'lucide-react';
import { useGetMyRankQuery, useCheckAndUpgradeRankMutation, useGetRankDefinitionsQuery } from '../store/api/rankApi';
import { RankJourney } from './RankJourney';
import { ProfileAvatar } from './ProfileAvatar';
import { resolveImageUrl } from '@/lib/imageUrl';
import {
  useGetSavedAccountsQuery,
  useCreateSavedAccountMutation,
  useUpdateSavedAccountMutation,
  useDeleteSavedAccountMutation,
  useSetDefaultAccountMutation,
} from '../store/api/savedAccountApi';
import type { SavedAccount } from '../store/api/savedAccountApi';

export default function SettingsNew() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'wallets' | 'account'>('profile');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Rank API hooks
  const { data: rankData, refetch: refetchRank } = useGetMyRankQuery();
  const [checkUpgrade, { isLoading: isCheckingUpgrade }] = useCheckAndUpgradeRankMutation();
  const rankInfo = rankData?.data?.attributes;
  const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '';
  const { data: rankDefsData } = useGetRankDefinitionsQuery();
  const rankDefinitions = rankDefsData?.data?.attributes || [];

  const handleCheckRankUpgrade = async () => {
    try {
      const result = await checkUpgrade().unwrap();
      const attrs = result?.data?.attributes as any;
      if (attrs?.upgraded) {
        setToast({ message: `Congratulations! You upgraded to rank ${attrs.newRank}!`, type: 'success' });
        refetchRank();
      } else {
        setToast({ message: 'You do not qualify for an upgrade yet. Keep growing!', type: 'success' });
      }
    } catch {
      setToast({ message: 'Failed to check rank upgrade', type: 'error' });
    }
  };

  // API hooks
  const { refetch } = useGetMyProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadProfileImageMutation();
  const [deleteImage, { isLoading: isDeleting }] = useDeleteProfileImageMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [deleteAccount, { isLoading: isDeletingAccount }] = useDeleteAccountMutation();

  // Saved account API hooks
  const { data: savedAccountsResponse, isLoading: loadingAccounts } = useGetSavedAccountsQuery();
  const savedAccounts: SavedAccount[] = (savedAccountsResponse?.data?.attributes as any)?.results || [];
  const [createSavedAccount, { isLoading: isCreating }] = useCreateSavedAccountMutation();
  const [updateSavedAccount, { isLoading: isUpdatingAccount }] = useUpdateSavedAccountMutation();
  const [deleteSavedAccount] = useDeleteSavedAccountMutation();
  const [setDefaultAccount] = useSetDefaultAccountMutation();

  // Saved account form state
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SavedAccount | null>(null);
  const [accountForm, setAccountForm] = useState({
    accountType: 'crypto' as 'crypto' | 'bank' | 'other',
    label: '',
    walletAddress: '',
    network: '',
    currency: '',
    bankDetails: {
      bankName: '',
      accountNumber: '',
      accountName: '',
      routingNumber: '',
      swiftCode: '',
      iban: '',
    },
    isDefault: false,
  });

  // Form states
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [deleteForm, setDeleteForm] = useState({
    password: '',
    confirmation: '',
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Profile image URL from backend
  const profileImageUrl = resolveImageUrl(user?.image);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setToast({ message: 'Please select an image file', type: 'error' });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setToast({ message: 'Image size must be less than 5MB', type: 'error' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);

      handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const result: any = await uploadImage(formData).unwrap();

      // Refetch to get fresh data with updated image
      const { data: updatedProfile } = await refetch();

      // Update user in Redux with fresh data from API
      const freshUser = updatedProfile?.data?.attributes?.user || result?.data?.attributes;
      if (freshUser) {
        dispatch(setUser(freshUser));
      }

      setToast({ message: 'Profile image updated successfully!', type: 'success' });
      setPreviewImage(null);
    } catch (error: any) {
      setToast({ message: error.data?.message || 'Failed to upload image', type: 'error' });
      setPreviewImage(null);
    }
  };

  const handleImageDelete = async () => {
    if (!confirm('Delete your profile image?')) return;

    try {
      const result: any = await deleteImage().unwrap();

      // Refetch to get fresh data after deletion
      const { data: updatedProfile } = await refetch();

      // Update user in Redux with fresh data from API
      const freshUser = updatedProfile?.data?.attributes?.user || result?.data?.attributes;
      if (freshUser) {
        dispatch(setUser(freshUser));
      }

      setToast({ message: 'Profile image deleted successfully!', type: 'success' });
    } catch (error: any) {
      setToast({ message: error.data?.message || 'Failed to delete image', type: 'error' });
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('firstName', profileForm.firstName);
      formData.append('lastName', profileForm.lastName);

      const result = await updateProfile(formData).unwrap();

      // Refetch profile to get latest data
      const { data: updatedProfile } = await refetch();

      // Update user in Redux with fresh data from API
      if (updatedProfile?.data?.attributes?.user) {
        dispatch(setUser(updatedProfile.data.attributes.user));
      } else if (result?.data?.attributes?.user) {
        dispatch(setUser(result.data.attributes.user));
      }

      setToast({ message: 'Profile updated successfully!', type: 'success' });
    } catch (error: any) {
      setToast({ message: error.data?.message || 'Failed to update profile', type: 'error' });
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setToast({ message: 'New passwords do not match', type: 'error' });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setToast({ message: 'Password must be at least 8 characters', type: 'error' });
      return;
    }

    try {
      await changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      }).unwrap();

      setToast({ message: 'Password changed successfully!', type: 'success' });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setToast({ message: error.data?.message || 'Failed to change password', type: 'error' });
    }
  };

  const handleAccountDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    if (deleteForm.confirmation !== 'DELETE') {
      setToast({ message: 'Please type DELETE to confirm', type: 'error' });
      return;
    }

    try {
      await deleteAccount({ password: deleteForm.password }).unwrap();
      setToast({ message: 'Account deleted successfully. Goodbye!', type: 'success' });
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error: any) {
      setToast({ message: error.data?.message || 'Failed to delete account', type: 'error' });
    }
  };

  // Saved account handlers
  const resetAccountForm = () => {
    setAccountForm({
      accountType: 'crypto',
      label: '',
      walletAddress: '',
      network: '',
      currency: '',
      bankDetails: { bankName: '', accountNumber: '', accountName: '', routingNumber: '', swiftCode: '', iban: '' },
      isDefault: false,
    });
    setEditingAccount(null);
  };

  const handleOpenAddModal = () => {
    resetAccountForm();
    setShowAddAccountModal(true);
  };

  const handleOpenEditModal = (account: SavedAccount) => {
    setEditingAccount(account);
    setAccountForm({
      accountType: account.accountType,
      label: account.label,
      walletAddress: account.walletAddress || '',
      network: account.network || '',
      currency: account.currency || '',
      bankDetails: {
        bankName: account.bankDetails?.bankName || '',
        accountNumber: account.bankDetails?.accountNumber || '',
        accountName: account.bankDetails?.accountName || '',
        routingNumber: account.bankDetails?.routingNumber || '',
        swiftCode: account.bankDetails?.swiftCode || '',
        iban: account.bankDetails?.iban || '',
      },
      isDefault: account.isDefault,
    });
    setShowAddAccountModal(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        label: accountForm.label,
        isDefault: accountForm.isDefault,
      };

      if (!editingAccount) {
        payload.accountType = accountForm.accountType;
      }

      if (accountForm.accountType === 'crypto') {
        payload.walletAddress = accountForm.walletAddress;
        payload.network = accountForm.network;
        payload.currency = accountForm.currency;
      } else if (accountForm.accountType === 'bank') {
        payload.bankDetails = accountForm.bankDetails;
      }

      if (editingAccount) {
        await updateSavedAccount({ accountId: editingAccount.id, data: payload }).unwrap();
        setToast({ message: 'Account updated successfully!', type: 'success' });
      } else {
        await createSavedAccount(payload).unwrap();
        setToast({ message: 'Account saved successfully!', type: 'success' });
      }

      setShowAddAccountModal(false);
      resetAccountForm();
    } catch (error: any) {
      setToast({ message: error.data?.message || 'Failed to save account', type: 'error' });
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this saved account?')) return;
    try {
      await deleteSavedAccount(accountId).unwrap();
      setToast({ message: 'Account deleted successfully!', type: 'success' });
    } catch (error: any) {
      setToast({ message: error.data?.message || 'Failed to delete account', type: 'error' });
    }
  };

  const handleSetDefault = async (accountId: string) => {
    try {
      await setDefaultAccount(accountId).unwrap();
      setToast({ message: 'Default account updated!', type: 'success' });
    } catch (error: any) {
      setToast({ message: error.data?.message || 'Failed to set default', type: 'error' });
    }
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-800 overflow-x-auto">
          {[
            { key: 'profile', label: 'Profile', icon: User },
            { key: 'security', label: 'Security', icon: Lock },
            { key: 'wallets', label: 'Wallets', icon: Wallet },
            { key: 'account', label: 'Account', icon: AlertTriangle },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 min-w-0 py-3 sm:py-4 text-xs sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-cyan-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <tab.icon size={16} /> <span className="hidden sm:inline">{tab.label}</span><span className="sm:hidden">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                {/* Profile image with rank frame */}
                <div className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24">
                  <ProfileAvatar
                    src={previewImage || profileImageUrl}
                    frameSrc={resolveImageUrl(rankInfo?.currentRankInfo?.frameImage)}
                    initials={getInitials()}
                    size="lg"
                    className="sm:!w-24 sm:!h-24"
                  />
                  {(isUploading || isDeleting) && (
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center z-30">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isDeleting}
                    className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Upload size={16} /> Upload Image
                  </button>

                  {profileImageUrl && (
                    <button
                      type="button"
                      onClick={handleImageDelete}
                      disabled={isUploading || isDeleting}
                      className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 disabled:bg-slate-800 text-rose-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  )}

                  <p className="text-xs text-slate-500">Max 5MB, JPG/PNG</p>
                </div>
              </div>

              {/* ── Rank Badge Card ─────────────────────────────────────── */}
              {rankInfo && (
                <div className="bg-slate-950/60 border border-slate-700 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    {/* Left: badge + rank info */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 flex-shrink-0">
                        <img
                          src={resolveImageUrl(rankInfo.currentRankInfo.badgeImage) || ''}
                          alt={`${rankInfo.currentRankInfo.name} badge`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Current Rank</p>
                        <p className="text-lg font-bold text-white">{rankInfo.currentRankInfo.name}</p>
                        {rankInfo.currentRankInfo.monthlySalary > 0 && (
                          <p className="text-xs text-cyan-400">
                            Monthly Salary: <span className="font-semibold">${rankInfo.currentRankInfo.monthlySalary}</span>
                          </p>
                        )}
                        {rankInfo.currentRankInfo.bonus && (
                          <p className="text-xs text-emerald-400">
                            Bonus Reward: <span className="font-semibold">{rankInfo.currentRankInfo.bonus}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: check upgrade button */}
                    <button
                      type="button"
                      onClick={handleCheckRankUpgrade}
                      disabled={isCheckingUpgrade || rankInfo.currentRank >= 7}
                      className="flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 disabled:opacity-40 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Star size={14} />
                      {rankInfo.currentRank >= 7 ? 'Max Rank' : isCheckingUpgrade ? 'Checking…' : 'Check Upgrade'}
                    </button>
                  </div>

                  {/* Progress toward next rank */}
                  {rankInfo.nextRankInfo && rankInfo.progress && (
                    <div className="space-y-3 pt-3 border-t border-slate-700">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Progress to {rankInfo.nextRankInfo.name}
                      </p>

                      {/* Business Volume */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Business Volume</span>
                          <span className="text-white">
                            ${rankInfo.progress.businessVolume.current.toLocaleString()} / ${rankInfo.progress.businessVolume.required.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 rounded-full transition-all"
                            style={{ width: `${rankInfo.progress.businessVolume.percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Direct Referrals */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Direct Referrals</span>
                          <span className="text-white">
                            {rankInfo.progress.directReferrals.current} / {rankInfo.progress.directReferrals.required}
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${rankInfo.progress.directReferrals.percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Personal Investment */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Personal Investment</span>
                          <span className="text-white">
                            ${rankInfo.progress.personalInvestment.current.toLocaleString()} / ${rankInfo.progress.personalInvestment.required.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${rankInfo.progress.personalInvestment.percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Next rank badge */}
                      <div className="flex items-center gap-3 mt-2 bg-slate-900/50 rounded-lg p-3">
                        <img
                          src={resolveImageUrl(rankInfo.nextRankInfo.badgeImage) || ''}
                          alt={rankInfo.nextRankInfo.name}
                          className="w-8 h-8 object-contain opacity-60"
                        />
                        <div className="text-xs text-slate-400">
                          Next: <span className="text-white font-semibold">{rankInfo.nextRankInfo.name}</span>
                          {rankInfo.nextRankInfo.bonus && (
                            <span className="text-cyan-400"> · {rankInfo.nextRankInfo.bonus}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Salary earned so far */}
                  {rankInfo.totalSalaryEarned > 0 && (
                    <p className="text-xs text-slate-500 pt-1 border-t border-slate-800">
                      Total salary earned: <span className="text-white font-medium">${rankInfo.totalSalaryEarned.toLocaleString()}</span>
                    </p>
                  )}
                </div>
              )}
              {/* ── End Rank Badge Card ──────────────────────────────────── */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 cursor-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 cursor-text"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    disabled
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20 disabled:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </form>

            {/* ── Rank Journey ─────────────────────────────────────────── */}
            {rankDefinitions.length > 0 && rankInfo && (
              <div className="mt-6">
                <RankJourney
                  currentRank={rankInfo.currentRank}
                  definitions={rankDefinitions}
                  imageBase={IMAGE_BASE}
                />
              </div>
            )}
            {/* ── End Rank Journey ─────────────────────────────────────── */}
            </>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20 disabled:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {isChangingPassword ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}

          {/* Wallets & Bank Tab */}
          {activeTab === 'wallets' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">Saved Withdrawal Accounts</h3>
                  <p className="text-xs sm:text-sm text-slate-400">Manage your saved wallets and bank accounts</p>
                </div>
                <button
                  onClick={handleOpenAddModal}
                  className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors w-fit"
                >
                  <Plus size={16} /> Add Account
                </button>
              </div>

              {loadingAccounts ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-cyan-400" size={32} />
                </div>
              ) : savedAccounts.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <CreditCard size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No saved accounts yet</p>
                  <p className="text-sm mt-1">Add a wallet or bank account for faster withdrawals</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {savedAccounts.map((account: SavedAccount) => (
                    <div
                      key={account.id}
                      className="bg-slate-950/50 border border-slate-700 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className={`p-2.5 sm:p-3 rounded-full flex-shrink-0 ${account.accountType === 'crypto' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                          {account.accountType === 'crypto' ? <Wallet size={18} /> : <CreditCard size={18} />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <span className="text-white font-medium text-sm">{account.label}</span>
                            {account.isDefault && (
                              <span className="bg-cyan-500/20 text-cyan-400 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium">Default</span>
                            )}
                            <span className="bg-slate-800 text-slate-400 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full capitalize">{account.accountType}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 truncate">
                            {account.accountType === 'crypto'
                              ? `${account.currency || ''} ${account.network ? `(${account.network})` : ''} — ${account.walletAddress ? account.walletAddress.slice(0, 8) + '...' + account.walletAddress.slice(-6) : ''}`
                              : `${account.bankDetails?.bankName || ''} — ****${account.bankDetails?.accountNumber?.slice(-4) || ''} (${account.bankDetails?.accountName || ''})`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 self-end sm:self-center">
                        {!account.isDefault && (
                          <button
                            onClick={() => handleSetDefault(account.id)}
                            className="text-slate-400 hover:text-cyan-400 p-2 rounded-lg hover:bg-slate-800 transition-colors"
                            title="Set as default"
                          >
                            <Star size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditModal(account)}
                          className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(account.id)}
                          className="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add/Edit Account Modal */}
              {showAddAccountModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-bold text-white mb-4">
                      {editingAccount ? 'Edit Account' : 'Add Withdrawal Account'}
                    </h3>
                    <form onSubmit={handleSaveAccount} className="space-y-4">
                      {/* Account Type (only for new) */}
                      {!editingAccount && (
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Account Type</label>
                          <select
                            value={accountForm.accountType}
                            onChange={(e) => setAccountForm({ ...accountForm, accountType: e.target.value as any })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                          >
                            <option value="crypto">Crypto Wallet</option>
                            <option value="bank">Bank Account</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      )}

                      {/* Label */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Label</label>
                        <input
                          type="text"
                          value={accountForm.label}
                          onChange={(e) => setAccountForm({ ...accountForm, label: e.target.value })}
                          placeholder="e.g. My Bitcoin Wallet"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                          required
                          maxLength={50}
                        />
                      </div>

                      {/* Crypto fields */}
                      {accountForm.accountType === 'crypto' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Currency</label>
                            <input
                              type="text"
                              value={accountForm.currency}
                              onChange={(e) => setAccountForm({ ...accountForm, currency: e.target.value })}
                              placeholder="e.g. BTC, USDT, ETH"
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Network (optional)</label>
                            <input
                              type="text"
                              value={accountForm.network}
                              onChange={(e) => setAccountForm({ ...accountForm, network: e.target.value })}
                              placeholder="e.g. ERC-20, TRC-20, BEP-20"
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Wallet Address</label>
                            <input
                              type="text"
                              value={accountForm.walletAddress}
                              onChange={(e) => setAccountForm({ ...accountForm, walletAddress: e.target.value })}
                              placeholder="Enter wallet address"
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 font-mono text-sm"
                              required
                            />
                          </div>
                        </>
                      )}

                      {/* Bank fields */}
                      {accountForm.accountType === 'bank' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Bank Name</label>
                            <input
                              type="text"
                              value={accountForm.bankDetails.bankName}
                              onChange={(e) => setAccountForm({ ...accountForm, bankDetails: { ...accountForm.bankDetails, bankName: e.target.value } })}
                              placeholder="Enter bank name"
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Account Number</label>
                            <input
                              type="text"
                              value={accountForm.bankDetails.accountNumber}
                              onChange={(e) => setAccountForm({ ...accountForm, bankDetails: { ...accountForm.bankDetails, accountNumber: e.target.value } })}
                              placeholder="Enter account number"
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Account Name</label>
                            <input
                              type="text"
                              value={accountForm.bankDetails.accountName}
                              onChange={(e) => setAccountForm({ ...accountForm, bankDetails: { ...accountForm.bankDetails, accountName: e.target.value } })}
                              placeholder="Enter account holder name"
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">Routing #</label>
                              <input
                                type="text"
                                value={accountForm.bankDetails.routingNumber}
                                onChange={(e) => setAccountForm({ ...accountForm, bankDetails: { ...accountForm.bankDetails, routingNumber: e.target.value } })}
                                placeholder="Optional"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">SWIFT Code</label>
                              <input
                                type="text"
                                value={accountForm.bankDetails.swiftCode}
                                onChange={(e) => setAccountForm({ ...accountForm, bankDetails: { ...accountForm.bankDetails, swiftCode: e.target.value } })}
                                placeholder="Optional"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">IBAN (optional)</label>
                            <input
                              type="text"
                              value={accountForm.bankDetails.iban}
                              onChange={(e) => setAccountForm({ ...accountForm, bankDetails: { ...accountForm.bankDetails, iban: e.target.value } })}
                              placeholder="Enter IBAN"
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                            />
                          </div>
                        </>
                      )}

                      {/* Default checkbox */}
                      <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={accountForm.isDefault}
                          onChange={(e) => setAccountForm({ ...accountForm, isDefault: e.target.checked })}
                          className="rounded border-slate-700"
                        />
                        Set as default withdrawal account
                      </label>

                      {/* Buttons */}
                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => { setShowAddAccountModal(false); resetAccountForm(); }}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isCreating || isUpdatingAccount}
                          className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20 disabled:bg-slate-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          {(isCreating || isUpdatingAccount) && <Loader2 size={18} className="animate-spin" />}
                          {editingAccount ? 'Update' : 'Save Account'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6 max-w-lg">
              <div className="bg-rose-500/10 border border-rose-500/50 rounded-lg p-4">
                <h3 className="text-rose-400 font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle size={20} /> Danger Zone
                </h3>
                <p className="text-slate-300 text-sm">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
              </div>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Delete My Account
              </button>

              {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full">
                    <h3 className="text-xl font-bold text-white mb-4">Delete Account</h3>
                    <form onSubmit={handleAccountDelete} className="space-y-4">
                      <div>
                        <label className="block text-sm text-slate-300 mb-2">Enter your password</label>
                        <input
                          type="password"
                          value={deleteForm.password}
                          onChange={(e) => setDeleteForm({ ...deleteForm, password: e.target.value })}
                          className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-300 mb-2">Type DELETE to confirm</label>
                        <input
                          type="text"
                          value={deleteForm.confirmation}
                          onChange={(e) => setDeleteForm({ ...deleteForm, confirmation: e.target.value })}
                          className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white"
                          required
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setShowDeleteModal(false)}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isDeletingAccount}
                          className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg"
                        >
                          {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
