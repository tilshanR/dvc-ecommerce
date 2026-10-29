
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, message) => {
    setToast({ type, message, id: Date.now() + Math.random() });
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timeout = setTimeout(() => setToast(null), 4500);

    return () => clearTimeout(timeout);
  }, [toast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="pointer-events-none fixed right-3 top-4 z-[100] w-[calc(100%-1.5rem)] max-w-md sm:right-6 sm:top-6">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              role={toast.type === "error" ? "alert" : "status"}
              aria-live={toast.type === "error" ? "assertive" : "polite"}
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-xl ${
                toast.type === "success"
                  ? "border-emerald-200"
                  : "border-red-200"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle
                  className="shrink-0 text-emerald-700"
                  size={22}
                />
              ) : (
                <X className="shrink-0 text-red-600" size={22} />
              )}

              <p className="flex-1 text-sm leading-6 text-slate-700">
                {toast.message}
              </p>

              <button
                type="button"
                onClick={() => setToast(null)}
                aria-label="Dismiss notification"
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              >
                <X size={17} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
