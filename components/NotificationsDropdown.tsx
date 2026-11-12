'use client'

import React from 'react';
import { X, CheckCircle2, AlertCircle, Info, DollarSign, TrendingUp, Shield, Mail, Bell } from 'lucide-react';
import Link from 'next/link';
import type { Notification } from '@/store/api/notificationApi';

interface NotificationsDropdownProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAllRead: () => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ notifications, onClose, onMarkAllRead }) => {
  
  const getIcon = (type: string) => {
    if (type === 'transaction') return <DollarSign size={18} />;
    if (type === 'security') return <Shield size={18} />;
    if (type === 'promotion' || type === 'profit') return <TrendingUp size={18} />;
    if (type === 'support') return <Mail size={18} />;
    if (type === 'investment') return <TrendingUp size={18} />;
    return <Bell size={18} />;
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'transaction': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'security': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'promotion': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'profit': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'investment': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'support': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;
  const displayNotifications = notifications.slice(0, 5); // Show only 5 most recent

  return (
    <div className="fixed left-3 right-3 top-[64px] sm:left-auto sm:right-4 sm:w-96 z-[60]">
      <div className="bg-[#0D0D0D] border border-neutral-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-[#050505]/80 backdrop-blur-md">
          <div>
             <h3 className="font-bold text-white">Notifications</h3>
             <p className="text-xs text-neutral-400">
               {unreadCount > 0 ? `${unreadCount} unread messages` : 'No new notifications'}
             </p>
          </div>
          <div className="flex items-center space-x-3">
            {unreadCount > 0 && (
              <button 
                onClick={onMarkAllRead}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
              >
                Mark all read
              </button>
            )}
            <button 
              onClick={onClose} 
              className="p-1.5 hover:bg-neutral-900 rounded-full text-neutral-400 hover:text-white transition-colors"
              aria-label="Close notifications"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="overflow-y-auto flex-1 custom-scrollbar max-h-[400px]">
          {displayNotifications.length === 0 ? (
            <div className="p-12 text-center text-neutral-500 flex flex-col items-center">
              <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="opacity-50" />
              </div>
              <p className="font-medium text-neutral-300">All caught up!</p>
              <p className="text-sm">You have no notifications.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800">
              {displayNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-neutral-900/50 transition-colors flex gap-4 cursor-pointer ${notif.status === 'unread' ? 'bg-neutral-900/30' : ''}`}
                  onClick={onClose}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${getColors(notif.type)}`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className={`text-sm font-bold truncate pr-2 ${notif.status === 'unread' ? 'text-white' : 'text-neutral-400'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-neutral-500 whitespace-nowrap ml-1 shrink-0">{formatTime(notif.createdAt)}</span>
                    </div>
                    <p className={`text-xs leading-relaxed line-clamp-2 ${notif.status === 'unread' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {notif.content}
                    </p>
                  </div>
                  {notif.status === 'unread' && (
                    <div className="shrink-0 pt-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-3 bg-[#050505]/80 backdrop-blur-md border-t border-neutral-800 text-center">
           <Link
             href="/dashboard/notifications"
             onClick={onClose}
             className="text-xs text-neutral-400 hover:text-white transition-colors font-medium block"
           >
             View All Notifications
           </Link>
        </div>
      </div>
    </div>
  );
};

export default NotificationsDropdown;