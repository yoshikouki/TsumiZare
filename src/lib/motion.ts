export const allowsMotion = () =>
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
