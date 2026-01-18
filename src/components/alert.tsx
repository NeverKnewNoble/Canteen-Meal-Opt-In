"use client";

import * as React from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";

type ToastVariant = "success" | "error";

type ToastItem = {
  id: string;
  message: string;
  title?: string;
  variant: ToastVariant;
  durationMs: number;
};

type ToastOptions = {
  title?: string;
  durationMs?: number;
};

let currentToasts: ToastItem[] = [];
const listeners = new Set<(toasts: ToastItem[]) => void>();
const timeouts = new Map<string, number>();

function emit() {
  for (const listener of listeners) listener(currentToasts);
}

function getId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function dismiss(id: string) {
  const t = timeouts.get(id);
  if (t) window.clearTimeout(t);
  timeouts.delete(id);

  currentToasts = currentToasts.filter((toast) => toast.id !== id);
  emit();
}

function addToast(variant: ToastVariant, message: string, options?: ToastOptions) {
  const id = getId();
  const durationMs = options?.durationMs ?? 3500;

  const toast: ToastItem = {
    id,
    message,
    title: options?.title,
    variant,
    durationMs,
  };

  currentToasts = [toast, ...currentToasts].slice(0, 5);
  emit();

  if (durationMs > 0) {
    const timeoutId = window.setTimeout(() => dismiss(id), durationMs);
    timeouts.set(id, timeoutId);
  }

  return id;
}

export const toast = {
  success: (message: string, options?: ToastOptions) =>
    addToast("success", message, options),
  error: (message: string, options?: ToastOptions) =>
    addToast("error", message, options),
  dismiss,
};

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastItem[]>(currentToasts);

  React.useEffect(() => {
    listeners.add(setToasts);
    setToasts(currentToasts);

    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed right-4 top-20 z-50 flex w-90 max-w-[calc(100vw-2rem)] flex-col gap-3"
      aria-live="polite"
      aria-relevant="additions removals"
    >
      {toasts.map((t) => {
        const isSuccess = t.variant === "success";
        const Icon = isSuccess ? CheckCircle2 : XCircle;

        return (
          <div
            key={t.id}
            className={
              "pointer-events-auto overflow-hidden rounded-2xl border bg-black/80 px-4 py-3 shadow-[0_16px_50px_rgba(0,0,0,0.45)] backdrop-blur-sm " +
              (isSuccess ? "border-emerald-500/40" : "border-rose-500/40")
            }
            role="status"
          >
            <div className="flex items-start gap-3">
              <Icon
                className={
                  "mt-0.5 h-5 w-5 flex-none " +
                  (isSuccess ? "text-emerald-400" : "text-rose-400")
                }
              />

              <div className="min-w-0 flex-1">
                {t.title ? (
                  <div className="truncate text-sm font-semibold text-white">
                    {t.title}
                  </div>
                ) : null}

                <div className="text-sm text-white/85">{t.message}</div>
              </div>

              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="-mr-1 -mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}



// ?? USAGE
// How to use it
// toast.success("Your message", { durationMs: 5000 });
// toast.error("Your message", { durationMs: 5000 });
// toast.dismiss();