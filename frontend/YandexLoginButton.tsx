/**
 * Yandex Auth Extension - Yandex Login Button
 *
 * Ready-to-use Yandex login button component.
 */
import React from "react";
import { Button } from "@/components/ui/button";

// =============================================================================
// TYPES
// =============================================================================

interface YandexLoginButtonProps {
  /** Click handler - call auth.login() from useYandexAuth */
  onClick: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Button text */
  buttonText?: string;
  /** CSS class */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

// =============================================================================
// SPINNER
// =============================================================================

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// =============================================================================
// YANDEX ICON
// =============================================================================

function YandexIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity: 0.95 }}
    >
      <path
        fill="#fff"
        d="M12.04.04C5.43.04.08,5.39.08,12s5.35,11.96,11.96,11.96,11.96-5.35,11.96-11.96S18.64.04,12.04.04ZM16.04,19.09h-2.47V6.82h-1.11c-2.03,0-3.09,1.03-3.09,2.54,0,1.71.74,2.51,2.25,3.54l1.25.84-3.59,5.37h-2.68l3.22-4.8c-1.85-1.33-2.89-2.62-2.89-4.8,0-2.74,1.91-4.6,5.53-4.6h3.59v14.19Z"
      />
    </svg>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

export function YandexLoginButton({
  onClick,
  isLoading = false,
  buttonText = "Войти через Яндекс",
  className = "",
  disabled = false,
}: YandexLoginButtonProps): React.ReactElement {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`bg-[#FC3F1D] hover:bg-[#E53517] text-white ${className}`}
    >
      {isLoading ? (
        <Spinner className="!w-5 !h-5 mr-2 flex-shrink-0" />
      ) : (
        <YandexIcon className="!w-5 !h-5 mr-2 flex-shrink-0" />
      )}
      {isLoading ? "Загрузка..." : buttonText}
    </Button>
  );
}

export default YandexLoginButton;
