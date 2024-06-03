import {
  SWIPE_THRESHOLD,
  TAP_DURATION_THRESHOLD,
  TAP_MOVE_THRESHOLD,
} from "../core/constants";

import { useRef } from "react";

export const useTouch = ({
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  isPreventTouchDefault,
  swipeMoveThreshold = SWIPE_THRESHOLD,
  tapMoveThreshold = TAP_MOVE_THRESHOLD,
  tapDurationThreshold = TAP_DURATION_THRESHOLD,
}: {
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onTap: () => void;
  isPreventTouchDefault?: () => boolean;
  swipeMoveThreshold?: number;
  tapMoveThreshold?: number;
  tapDurationThreshold?: number;
}) => {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const moveStartX = useRef(0);
  const moveStartY = useRef(0);

  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length !== 1) {
      return;
    }
    if (isPreventTouchDefault?.()) {
      e.preventDefault();
    }
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    moveStartX.current = touch.clientX;
    moveStartY.current = touch.clientY;
    touchStartTime.current = Date.now();
    touchStartTime.current = Date.now();
  };

  const onTouchMove = (e: TouchEvent) => {
    if (isPreventTouchDefault?.()) {
      e.preventDefault();
    }
    if (e.touches.length !== 1) {
      return;
    }
    const touch = e.touches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;
    const dx = touchEndX - moveStartX.current;
    const dy = touchEndY - moveStartY.current;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    // TODO: Stepwise acceleration
    if (Math.max(absDx, absDy) < swipeMoveThreshold) {
      return;
    }
    if (absDx > absDy) {
      // Horizontal swipe
      if (dx > 0) {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
    } else if (absDy < swipeMoveThreshold * 3) {
      // Vertical swipe
      if (dy > 0) {
        onSwipeDown();
      } else {
        onSwipeUp();
      }
    } else {
      return;
    }
    // Re-init new touch start position after each move to allow continuous movement.
    moveStartX.current = touchEndX;
    moveStartY.current = touchEndY;
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (e.changedTouches.length !== 1) {
      return;
    }
    const touch = e.changedTouches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;
    const dx = touchEndX - touchStartX.current;
    const dy = touchEndY - touchStartY.current;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const touchDuration = Date.now() - touchStartTime.current;
    if (
      !(
        Math.max(absDx, absDy) < tapMoveThreshold &&
        touchDuration < tapDurationThreshold
      )
    ) {
      return;
    }
    onTap();
  };

  const refCallback = (ref: HTMLDivElement) => {
    ref.addEventListener("touchstart", onTouchStart);
    ref.addEventListener("touchmove", onTouchMove);
    ref.addEventListener("touchend", onTouchEnd);
    return () => {
      ref.removeEventListener("touchstart", onTouchStart);
      ref.removeEventListener("touchmove", onTouchMove);
      ref.removeEventListener("touchend", onTouchEnd);
    };
  };

  return refCallback;
};
