'use client';

import * as React from 'react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';

type ToastVariant = 'success' | 'error' | 'info';

type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

const toastIcons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const showToast = React.useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    setToasts((current) => [...current, { id, message, variant }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3600);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 top-20 z-[70] flex flex-col gap-3 sm:left-auto sm:right-6 sm:w-[22rem]">
        {toasts.map((toast) => {
          const Icon = toastIcons[toast.variant];

          return (
            <div
              key={toast.id}
              className={cn(
                'toast-enter pointer-events-auto flex items-start gap-3 rounded-[1.35rem] border px-4 py-3 shadow-[0_18px_45px_rgba(0,0,0,0.16)] backdrop-blur',
                toast.variant === 'success' && 'border-success/20 bg-background/96 text-foreground',
                toast.variant === 'error' && 'border-error/20 bg-background/96 text-foreground',
                toast.variant === 'info' && 'border-secondary/12 bg-background/96 text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'mt-0.5 h-5 w-5 shrink-0',
                  toast.variant === 'success' && 'text-success',
                  toast.variant === 'error' && 'text-error',
                  toast.variant === 'info' && 'text-primary'
                )}
              />
              <p className="flex-1 text-sm leading-6">{toast.message}</p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="rounded-full p-1 text-secondary/55 transition hover:bg-secondary/8 hover:text-secondary dark:text-white/55 dark:hover:text-white"
                aria-label="Dismiss toast"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}
