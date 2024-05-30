export const ROWS = 20;
export const COLS = 10;
export const DROP_INTERVAL = 333;
export const SWIPE_THRESHOLD = 30;
export const TAP_MOVE_THRESHOLD = 5;
export const TAP_DURATION_THRESHOLD = 300;
export const DEFAULT_TETROMINO_QUEUE_SIZE = 3;
export const WALL_KICKS = [
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: -1, y: -1 },
  { x: 1, y: -1 },
  { x: -3, y: 0 }, // For I tetromino on the right wall
];
