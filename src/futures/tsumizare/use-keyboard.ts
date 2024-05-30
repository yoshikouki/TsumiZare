import { useEffect } from "react";

type KeyDownKey = KeyboardEvent["key"];

export const useKeyboard = ({
  onKeyDown,
}: {
  onKeyDown?: Record<KeyDownKey, () => void>;
}) => {
  useEffect(() => {
    if (!onKeyDown) return;
    const handleKeyDown = (e: KeyboardEvent) => onKeyDown[e.key]?.();
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onKeyDown]);
};
