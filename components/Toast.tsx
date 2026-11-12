'use client'

import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-emerald-500" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-rose-500" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-amber-500" />;
      case 'info':
        return <Info className="w-6 h-6 text-amber-500" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400';
      case 'error':
        return 'bg-rose-500/10 border-rose-500/50 text-rose-400';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/50 text-amber-400';
      case 'info':
        return 'bg-amber-500/10 border-amber-500/50 text-amber-400';
    }
  };

  return (
    <div
      className={`
        fixed top-3 right-3 sm:top-5 sm:right-5 left-3 sm:left-auto z-50 flex items-center gap-3 p-3 sm:p-4 rounded-lg border backdrop-blur-xl shadow-2xl
        animate-in slide-in-from-right fade-in duration-300
        min-w-0 sm:min-w-[320px] max-w-md
        ${getStyles()}
      `}
    >
      <div className="flex-shrink-0">{getIcon()}</div>
      <div className="flex-1 text-sm font-medium text-white">{message}</div>
      <button
        type="button"
        className="flex-shrink-0 rounded-lg p-1.5 hover:bg-white/10 transition-colors text-neutral-400 hover:text-white"
        onClick={onClose}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
