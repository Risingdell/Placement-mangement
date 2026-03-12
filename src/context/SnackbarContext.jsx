import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const SnackbarContext = createContext({ showSnackbar: () => {} });

const AUTO_HIDE_MS = 3200;

const getVariantFromMessage = (message) => {
  const normalized = String(message || '').toLowerCase();

  if (
    normalized.includes('failed') ||
    normalized.includes('error') ||
    normalized.includes('required') ||
    normalized.includes('cannot') ||
    normalized.includes('please select') ||
    normalized.includes('please complete')
  ) {
    return 'error';
  }

  if (
    normalized.includes('success') ||
    normalized.includes('updated') ||
    normalized.includes('submitted') ||
    normalized.includes('added') ||
    normalized.includes('deleted') ||
    normalized.includes('sent') ||
    normalized.includes('uploaded') ||
    normalized.includes('withdrawn')
  ) {
    return 'success';
  }

  return 'info';
};

const getActiveTheme = (pathname) => {
  if (pathname.startsWith('/admin/dashboard')) {
    return localStorage.getItem('admin-theme') === 'light' ? 'light' : 'dark';
  }

  if (pathname.startsWith('/dashboard')) {
    return localStorage.getItem('student-theme') === 'light' ? 'light' : 'dark';
  }

  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

const getThemeClasses = (theme, variant) => {
  const byTheme = {
    light: {
      success: 'border-[#86efac] bg-white text-[#14532d] shadow-[0_16px_40px_rgba(15,23,42,0.14)]',
      error: 'border-[#fca5a5] bg-white text-[#7f1d1d] shadow-[0_16px_40px_rgba(15,23,42,0.14)]',
      info: 'border-[#bfdbfe] bg-white text-[#1e3a8a] shadow-[0_16px_40px_rgba(15,23,42,0.14)]',
      icon: {
        success: 'bg-[#dcfce7] text-[#15803d]',
        error: 'bg-[#fee2e2] text-[#dc2626]',
        info: 'bg-[#dbeafe] text-[#2563eb]',
      },
      meta: 'text-[#6b7280]',
      close: 'text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#111827]',
    },
    dark: {
      success: 'border-[#22543d] bg-[#181f1b] text-[#bbf7d0] shadow-[0_18px_48px_rgba(0,0,0,0.4)]',
      error: 'border-[#5f1d1d] bg-[#221617] text-[#fecaca] shadow-[0_18px_48px_rgba(0,0,0,0.4)]',
      info: 'border-[#1e3a8a] bg-[#151c2b] text-[#bfdbfe] shadow-[0_18px_48px_rgba(0,0,0,0.4)]',
      icon: {
        success: 'bg-[#16341f] text-[#4ade80]',
        error: 'bg-[#3a1717] text-[#f87171]',
        info: 'bg-[#172554] text-[#60a5fa]',
      },
      meta: 'text-[#a1a1aa]',
      close: 'text-[#a1a1aa] hover:bg-white/5 hover:text-white',
    },
  };

  return byTheme[theme] || byTheme.dark;
};

function SnackbarItem({ snackbar, onClose }) {
  const { id, message, visible, theme, variant } = snackbar;
  const themeClasses = getThemeClasses(theme, variant);
  const icons = {
    success: '✓',
    error: '!',
    info: 'i',
  };

  return (
    <div
      className={`pointer-events-auto w-[min(92vw,420px)] rounded-2xl border backdrop-blur transition-all duration-300 ${
        themeClasses[variant]
      } ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${themeClasses.icon[variant]}`}>
          {icons[variant]}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-5">{message}</p>
          <p className={`mt-1 text-[11px] uppercase tracking-[0.18em] ${themeClasses.meta}`}>
            Notice
          </p>
        </div>
        <button
          type="button"
          onClick={() => onClose(id)}
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors ${themeClasses.close}`}
          aria-label="Dismiss notification"
        >
          x
        </button>
      </div>
    </div>
  );
}

export function SnackbarProvider({ children }) {
  const location = useLocation();
  const [snackbars, setSnackbars] = useState([]);
  const timersRef = useRef(new Map());
  const originalAlertRef = useRef(window.alert);

  const removeSnackbar = (id) => {
    setSnackbars((current) =>
      current.map((item) => (item.id === id ? { ...item, visible: false } : item))
    );

    window.setTimeout(() => {
      setSnackbars((current) => current.filter((item) => item.id !== id));
    }, 280);

    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
  };

  const showSnackbar = useMemo(
    () => (message) => {
      if (!message) return;

      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const theme = getActiveTheme(location.pathname);
      const variant = getVariantFromMessage(message);

      setSnackbars((current) => [...current, { id, message, theme, variant, visible: false }]);

      window.setTimeout(() => {
        setSnackbars((current) =>
          current.map((item) => (item.id === id ? { ...item, visible: true } : item))
        );
      }, 20);

      const timer = window.setTimeout(() => removeSnackbar(id), AUTO_HIDE_MS);
      timersRef.current.set(id, timer);
    },
    [location.pathname]
  );

  useEffect(() => {
    const previousAlert = window.alert;
    originalAlertRef.current = previousAlert;
    window.alert = (message) => showSnackbar(String(message));

    return () => {
      window.alert = originalAlertRef.current;
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current.clear();
    };
  }, [showSnackbar]);

  const contextValue = useMemo(() => ({ showSnackbar }), [showSnackbar]);

  return (
    <SnackbarContext.Provider value={contextValue}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[120] flex flex-col items-center gap-3 px-4">
        {snackbars.map((snackbar) => (
          <SnackbarItem key={snackbar.id} snackbar={snackbar} onClose={removeSnackbar} />
        ))}
      </div>
    </SnackbarContext.Provider>
  );
}

export const useSnackbar = () => useContext(SnackbarContext);
