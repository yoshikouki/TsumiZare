import { useEffect } from "react";

type KeyDownKey = KeyboardEvent["key"];

export const useKeyboard = ({
  onKeyDown,
  isPreventTouchDefault = false,
}: {
  onKeyDown?: Record<KeyDownKey, () => void>;
  isPreventTouchDefault?: boolean;
}) => {
  useEffect(() => {
    if (!onKeyDown) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const handler = onKeyDown[e.key];
      if (!handler) return;
      if (isPreventTouchDefault) e.preventDefault();
      handler();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onKeyDown, isPreventTouchDefault]);
};
