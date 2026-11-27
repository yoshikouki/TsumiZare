import { cellVariant, type Game } from "blocky-game";
import { type CSSProperties, type ReactNode, useRef } from "react";
import { cn } from "@/lib/utils";
import { useGameSession } from "../game-session";
import { useLineClear } from "./use-line-clear";

export const Board = ({
  boardRef,
  game,
}: {
  boardRef: React.Ref<HTMLElement>;
  game: Game;
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const { flashes, removeFlash } = useLineClear(useGameSession(), gridRef);

  const dimensions: CSSProperties & {
    "--board-cols": number;
    "--board-rows": number;
  } = {
    "--board-cols": game.rules.cols,
    "--board-rows": game.rules.rows,
  };

  // An afterimage starts as the filled row it replaces, gaps included.
  const flashCells = Array.from({ length: game.rules.cols }, (_, x) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: The cells are identical and fixed in number.
    <div key={x} />
  ));

  return (
    <section
      aria-label="ゲーム盤"
      className={cn(
        "flex h-full w-full flex-col items-center px-4 motion-safe:transition-[filter] motion-safe:duration-200",
        game.status === "paused" && "blur-xs"
      )}
      ref={boardRef}
    >
      <div
        className="@container relative mb-4 w-full max-w-xs"
        ref={gridRef}
        style={dimensions}
      >
        <div aria-hidden="true" className="board-grid board-overlay">
          {flashes.map(({ id, rowIndex }) => (
            <div
              className="board-row board-clear-flash"
              key={id}
              onAnimationEnd={() => removeFlash(id)}
              style={{ gridRowStart: rowIndex + 1 }}
            >
              {flashCells}
            </div>
          ))}
        </div>
        <div className="board-grid relative">
          {game.rows.map((row) => (
            <div className="board-row" data-row-id={row.id} key={row.id}>
              {row.cells.map((cell) => (
                <div
                  className="board-cell"
                  data-state={cell.blockId === null ? "empty" : "filled"}
                  key={cell.id}
                />
              ))}
            </div>
          ))}
        </div>
        {game.piece ? <PieceLayer game={game} key={game.piece.id} /> : null}
      </div>
    </section>
  );
};

function PieceLayer({ game }: { game: Game }) {
  const active: ReactNode[] = [];
  const guide: ReactNode[] = [];

  for (const [y, row] of game.rows.entries()) {
    for (const [x, cell] of row.cells.entries()) {
      const variant = cellVariant(game, x, y);
      const position = { gridColumnStart: x + 1, gridRowStart: y + 1 };

      if (variant === "active") {
        active.push(
          <div data-state={variant} key={active.length} style={position} />
        );
      } else if (variant === "belowActiveBlock") {
        guide.push(<div data-state={variant} key={cell.id} style={position} />);
      }
    }
  }

  return (
    <div
      aria-hidden="true"
      className="board-grid board-overlay"
      data-piece-layer=""
    >
      {guide}
      {active}
    </div>
  );
}
