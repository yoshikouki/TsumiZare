export interface Cell {
  id: string;
  blockId: string | null;
}

export interface Row {
  id: string;
  cells: Cell[];
}

export const createRow = (cols: number, id: string): Row => ({
  id,
  cells: Array.from({ length: cols }, (_, x) => ({
    id: `${id}-${x}`,
    blockId: null,
  })),
});
