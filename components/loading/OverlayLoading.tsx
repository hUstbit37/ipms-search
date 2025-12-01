import { ReactNode } from "react";
import { ClipLoader } from "react-spinners";

export interface OverlayLoadingProps {
  show: boolean;
  message?: string | ReactNode;
  fullscreen?: boolean;
  blur?: boolean;
  onClose?: () => void;
  className?: string;
  ariaLabel?: string;
  hideContent?: boolean;
}

export function OverlayLoading({
  show,
  message = undefined,
  fullscreen = true,
  blur = false,
  onClose,
  className = "",
  ariaLabel = "Loading",
  hideContent = false,
}: OverlayLoadingProps) {
  if (!show) return null;

  const containerBase = fullscreen ? "fixed inset-0" : "absolute inset-0";
  const overlayClasses = `${containerBase} z-50 flex items-center justify-center ${blur ? "backdrop-blur-sm" : ""}`;

  return (
    <div className={overlayClasses} role="status" aria-live="polite" aria-label={ariaLabel}>
      <button
        type="button"
        onClick={onClose}
        className={`absolute inset-0 ${!hideContent ? "bg-black/40" : "bg-gray-300"}`}
        aria-hidden={onClose ? "false" : "true"}
        tabIndex={-1}
      />

      <div
        className={`relative z-10 flex flex-col items-center gap-3 p-4 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <ClipLoader size={50} />
        {message && <div className="text-sm font-medium text-white select-none">{message}</div>}
      </div>
    </div>
  );
}
