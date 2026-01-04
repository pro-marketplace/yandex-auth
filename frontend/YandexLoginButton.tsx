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
// YANDEX ICON
// =============================================================================

function YandexIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#FC3F1D"/>
      <path d="M13.5 7h-2.25v6.75L8.5 7H6.25l4.25 10h2l-2-4.75V7h3z" fill="#FC3F1D"/>
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
      <YandexIcon className="!w-6 !h-6 mr-1 flex-shrink-0" />
      {isLoading ? "Загрузка..." : buttonText}
    </Button>
  );
}

export default YandexLoginButton;
