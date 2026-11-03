'use client'

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useLogoutMutation } from '../store/api/authApi';
import { clearAuth } from '../store/slices/authSlice';
import { Toast, ToastType } from './Toast';
import {
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  History,
  Users,
  Ticket,
  Settings,
  LogOut,
  Bell,
  Menu,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  BookOpen,
  Radio
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MenuItem } from '@/types';
import NotificationsDropdown from './NotificationsDropdown';
import { useGetMyNotificationsQuery, useGetUnreadCountQuery, useMarkAllAsReadMutation, type Notification } from '@/store/api/notificationApi';
import { useGetWalletQuery } from '@/store/api/walletApi';
import { useGetMyRankQuery } from '@/store/api/rankApi';
import { ProfileAvatar } from './ProfileAvatar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [logout] = useLogoutMutation();
  const user = useSelector((state: RootState) => state.auth.user);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Fetch notifications from API
  const { data: notificationsData } = useGetMyNotificationsQuery();
  const { data: unreadCountData } = useGetUnreadCountQuery();
  const { data: walletData } = useGetWalletQuery();
  const { data: rankData } = useGetMyRankQuery();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const notifications: Notification[] = notificationsData?.data?.attributes || [];
  const unreadCount = unreadCountData?.data?.attributes?.count || 0;
  const wallet = walletData?.data?.attributes;
  const balance = wallet?.balance || 0;
  const rankInfo = rankData?.data?.attributes;
  const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '';

  const pathname = usePathname();

  // Initialize expanded state based on current path to keep menus open
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    'Wallet': pathname.includes('/deposit') || pathname.includes('/wallet'),
    'Withdraw': pathname.includes('/withdraw'),
    'Plans': pathname.includes('/plans'),
    'Referral': pathname.includes('/referrals'),
    'Support': pathname.includes('/support')
  });

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(false);

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await logout({ refreshToken }).unwrap();
      }
      dispatch(clearAuth());

      setToast({
        message: 'Logged out successfully. See you soon!',
        type: 'success'
      });

      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error) {
      // Even if logout fails, clear local auth
      dispatch(clearAuth());
      setToast({
        message: 'Logged out successfully.',
        type: 'success'
      });
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead().unwrap();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Live Trading', icon: Radio, path: '/dashboard/live-trading' },
    { label: 'Investing Info', icon: BookOpen, path: '/investing-info' },
    {
      label: 'Wallet',
      icon: ArrowDownLeft,
      subItems: [
        { label: 'Deposit', path: '/dashboard/deposit' },
        { label: 'Wallet Stats', path: '/dashboard/wallet/stats' }
      ]
    },
    {
      label: 'Withdraw',
      icon: ArrowUpRight,
      subItems: [
        { label: 'Request', path: '/dashboard/withdraw' },
        { label: 'History', path: '/dashboard/withdraw/history' }
      ]
    },
    {
      label: 'Plans',
      icon: PieChart,
      subItems: [
        { label: 'Invest', path: '/dashboard/plans/invest' },
        { label: 'My Plans', path: '/dashboard/plans/my-plans' }
      ]
    },
    { label: 'Transactions', icon: History, path: '/dashboard/transactions' },
    { label: 'Profit History', icon: TrendingUp, path: '/dashboard/profits/history' },
    {
      label: 'Referral',
      icon: Users,
      subItems: [
        { label: 'Overview', path: '/dashboard/referrals' },
        { label: '7-Level Network', path: '/dashboard/referrals/network' }
      ]
    },
    {
      label: 'Support',
      icon: Ticket,
      subItems: [
        { label: 'Create Ticket', path: '/dashboard/support' },
        { label: 'My Tickets', path: '/dashboard/support/tickets' }
      ]
    },
    { label: 'Notifications', icon: Bell, path: '/dashboard/notifications' },
    { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    if (path === '/investing-info') return false;
    if (path !== '/dashboard' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden font-sans relative">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Notifications Dropdown - rendered outside header to avoid stacking context issues */}
      {showNotifications && (
        <>
          <div
            className="fixed inset-0 z-[55]"
            onClick={() => setShowNotifications(false)}
            aria-hidden="true"
          ></div>
          <NotificationsDropdown
            notifications={notifications}
            onClose={() => setShowNotifications(false)}
            onMarkAllRead={handleMarkAllRead}
          />
        </>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl transform scale-100 transition-all">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-500/10 p-2 rounded-full text-red-500">
                <LogOut size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Sign Out</h3>
            </div>
            <p className="text-slate-400 mb-6">Are you sure you want to log out of your account?</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors"
              >
                No, Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors shadow-lg shadow-red-600/20"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo Area */}
          <div className="h-20 flex items-center px-6 border-b border-slate-800">
            <span className="text-xl font-serif font-bold tracking-wide leading-none text-white">
              Bynex <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400">Markets</span>
            </span>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            {menuItems.map((item) => (
              <div key={item.label}>
                {item.subItems ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        item.subItems.some(sub => isActive(sub.path)) ? 'text-white bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {expandedMenus[item.label] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    {expandedMenus[item.label] && (
                      <div className="ml-10 mt-1 space-y-1 border-l border-slate-700 pl-2">
                        {item.subItems.map((sub) => (
                          <Link
                            key={sub.label}
                            href={sub.path || '#'}
                            onClick={() => setSidebarOpen(false)}
                            className={`block px-4 py-2 text-sm transition-colors ${
                              isActive(sub.path) ? 'text-cyan-400 font-medium' : 'text-slate-500 hover:text-cyan-300'
                            }`}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.path || '#'}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.label}</span>
                    {item.label === 'Live Trading' && (
                      <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600/90 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        LIVE
                      </span>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* User Profile Snippet in Sidebar Bottom */}
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 sm:h-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-3 sm:px-6 lg:px-8 sticky top-0 z-10">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden mr-2 sm:mr-4 text-slate-400 hover:text-white"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-base sm:text-xl font-semibold text-white hidden sm:block">Dashboard</h1>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-6">
            {/* Balance Display - visible on all screens */}
            <div className="flex flex-col items-end mr-1 sm:mr-2">
              <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold">Balance</span>
              <span className="text-xs sm:text-xl font-bold text-green-400">${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 sm:p-2 text-slate-400 hover:text-white transition-colors outline-none"
                aria-label="Notifications"
                aria-expanded={showNotifications}
              >
                <Bell size={18} className="sm:hidden" />
                <Bell size={20} className="hidden sm:block" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] bg-red-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Profile Avatar with Rank Frame */}
            <div className="flex items-center space-x-2 sm:space-x-3 pl-2 sm:pl-4 border-l border-slate-800">
              {/* sm size on mobile, md on desktop */}
              <ProfileAvatar
                src={user?.image ? `${IMAGE_BASE}${user.image}` : null}
                frameSrc={
                  rankInfo?.currentRankInfo?.frameImage
                    ? `${IMAGE_BASE}${rankInfo.currentRankInfo.frameImage}`
                    : null
                }
                initials={`${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`}
                size="xs"
                className="sm:!w-10 sm:!h-10"
              />

              <div className="hidden md:block">
                <p className="text-sm font-medium text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-cyan-400 font-medium">
                  {rankInfo?.currentRankInfo?.name || 'Starter'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
