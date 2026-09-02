import { useCallback, useEffect } from "react";
import { useGameStore } from "./store";

export function Toast() {
  const toast = useGameStore((s) => s.toast);
  const clearToast = useCallback(() => {
    useGameStore.setState({ toast: null });
  }, []);

  useEffect(() => {
    if (!toast) return;

    const id = setTimeout(() => {
      clearToast();
    }, 10000);

    return () => clearTimeout(id);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div className="toast__message">
      {toast.message}

      <button
        onClick={clearToast}
        aria-label="Close"
        className="toast__close-button"
      >
        ×
      </button>
    </div>
  );
}
