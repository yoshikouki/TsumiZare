export const ROWS = 20;
export const COLS = 10;
export const DROP_INTERVAL = 333;
// A grounded block locks this long after it touched down or last moved.
export const LOCK_DELAY = 500;
export const SWIPE_THRESHOLD = 30;
export const TAP_MOVE_THRESHOLD = 5;
export const TAP_DURATION_THRESHOLD = 300;
export const DEFAULT_QUEUED_BLOCK_SIZE = 3;
export const WALL_KICKS = [
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: -1, y: -1 },
  { x: 1, y: -1 },
  { x: -3, y: 0 }, // For I block on the right wall
];
