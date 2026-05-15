"use client";

import * as React from "react";
import { AlertTriangle, X } from "lucide-react";

type ConfirmVariant = "danger" | "default";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
};

type PendingConfirm = {
  id: string;
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
};

let pending: PendingConfirm | null = null;
const listeners = new Set<(p: PendingConfirm | null) => void>();

function emit() {
  for (const listener of listeners) listener(pending);
}

function getId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    if (pending) {
      pending.resolve(false);
    }
    pending = { id: getId(), options, resolve };
    emit();
  });
}

function resolvePending(value: boolean) {
  if (!pending) return;
  const { resolve } = pending;
  pending = null;
  emit();
  resolve(value);
}

export function ConfirmDialogHost() {
  const [current, setCurrent] = React.useState<PendingConfirm | null>(pending);

  React.useEffect(() => {
    listeners.add(setCurrent);
    setCurrent(pending);
    return () => {
      listeners.delete(setCurrent);
    };
  }, []);

  React.useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") resolvePending(false);
      if (e.key === "Enter") resolvePending(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current]);

  if (!current) return null;

  const {
    title,
    description,
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
    variant = "danger",
  } = current.options;

  const isDanger = variant === "danger";
  const confirmClasses = isDanger
    ? "bg-primary hover:bg-primary-hover text-white"
    : "bg-gray-900 hover:bg-gray-800 text-white";
  const iconWrapClasses = isDanger
    ? "bg-red-100 text-primary"
    : "bg-gray-100 text-gray-700";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4"
      onClick={() => resolvePending(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className="w-full max-w-md rounded-xl border-2 border-gray-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${iconWrapClasses}`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h2
              id="confirm-dialog-title"
              className="text-xl font-bold text-main-text"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => resolvePending(false)}
            className="text-muted-text transition-colors hover:text-main-text"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {description && (
          <div className="px-6 py-5">
            <p className="text-sm text-muted-text leading-relaxed">{description}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-6">
          <button
            type="button"
            onClick={() => resolvePending(false)}
            className="rounded-lg bg-gray-100 px-5 py-2.5 font-medium text-main-text transition-colors hover:bg-gray-200"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => resolvePending(true)}
            autoFocus
            className={`rounded-lg px-5 py-2.5 font-medium transition-colors ${confirmClasses}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
