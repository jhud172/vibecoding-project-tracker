import { cloneElement, useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

export const fieldClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20";
export const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm font-medium transition hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none";
export const primaryClass = `${buttonClass} !border-brand-primary !bg-brand-primary !text-white hover:!bg-[#193A2B]`;

export function Modal({ title, subtitle, children, onClose, wide = false }) {
  const id = useId();
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog.showModal();
    const focusTarget =
      dialog.querySelector("[data-autofocus]") ||
      dialog.querySelector("button");
    focusTarget?.focus();
    return () => {
      dialog.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={`${id}-title`}
      aria-describedby={subtitle ? `${id}-subtitle` : undefined}
      onCancel={(event) => {
        event.preventDefault();
        closeRef.current();
      }}
      className={`m-auto max-h-[90dvh] w-[calc(100%-2rem)] rounded-2xl bg-surface-page p-0 text-text-primary shadow-2xl backdrop:bg-[#17251D]/50 ${wide ? "max-w-3xl" : "max-w-xl"}`}
    >
      <div className="flex items-start justify-between gap-6 border-b border-stone-200 px-6 py-5">
        <div>
          <h2 id={`${id}-title`} className="font-editorial text-2xl">
            {title}
          </h2>
          {subtitle && (
            <p id={`${id}-subtitle`} className="mt-1 text-sm text-text-muted">
              {subtitle}
            </p>
          )}
        </div>
        <button
          type="button"
          className={`${buttonClass} !p-2`}
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

export function Field({ label, children, hint }) {
  const id = useId();
  return (
    <div className="space-y-1.5 text-sm font-medium">
      <label htmlFor={id} className="block">
        {label}
      </label>
      {cloneElement(children, {
        id,
        "aria-describedby": hint ? `${id}-hint` : undefined,
      })}
      {hint && (
        <span
          id={`${id}-hint`}
          className="block text-xs font-normal leading-relaxed text-text-muted"
        >
          {hint}
        </span>
      )}
    </div>
  );
}
