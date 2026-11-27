import { cellVariant, type Game } from "blocky-game";
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { allowsMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useGameSession } from "../game-session";
import { useLineClear } from "./use-line-clear";
import { usePieceFeedback } from "./use-piece-feedback";

const BURST_EDGES = ["bottom", "side", "top"].flatMap((edge) => [
  [edge, "left"],
  [edge, "right"],
]);

export const Board = ({
  boardRef,
  game,
}: {
  boardRef: React.Ref<HTMLElement>;
  game: Game;
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const runner = useGameSession();
  const { bursts, flashes, removeBurst, removeFlash, waveStep } = useLineClear(
    runner,
    gridRef
  );
  usePieceFeedback(runner, gridRef);

  const dimensions: CSSProperties & {
    "--board-cols": number;
    "--board-rows": number;
  } = {
    "--board-cols": game.rules.cols,
    "--board-rows": game.rules.rows,
  };

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
          {/* An afterimage starts as the filled row it replaces, gaps included. */}
          {flashes.map(({ id, rowIndex, steps }) => (
            <div
              className="board-row board-clear-flash"
              key={id}
              onAnimationEnd={(event) => {
                const cells = event.currentTarget.getAnimations({
                  subtree: true,
                });
                if (cells.every(({ playState }) => playState === "finished")) {
                  removeFlash(id);
                }
              }}
              style={{ gridRowStart: rowIndex + 1 }}
            >
              {steps.map((step, x) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: A cell is identified by its column.
                  key={x}
                  style={{ animationDelay: `${step * waveStep}ms` }}
                />
              ))}
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
        {bursts.map((id) => (
          <div
            aria-hidden="true"
            className="board-burst"
            key={id}
            onAnimationEnd={(event) => {
              if (event.target === event.currentTarget) {
                removeBurst(id);
              }
            }}
          >
            {BURST_EDGES.map(([edge, side]) => (
              <div data-edge={edge} data-side={side} key={edge + side} />
            ))}
          </div>
        ))}
        {game.piece ? <PieceLayer game={game} key={game.piece.id} /> : null}
      </div>
    </section>
  );
};

function PieceLayer({ game }: { game: Game }) {
  const layerRef = useRef<HTMLDivElement>(null);
  const piece = game.piece as NonNullable<Game["piece"]>;

  // The grounded piece swells toward full size for as long as the lock wait.
  const grounded =
    game.status === "playing" && game.lockIn !== null ? piece : null;
  const lockIn = useRef(game.lockIn);
  useEffect(() => {
    lockIn.current = game.lockIn;
  });
  useEffect(() => {
    const layer = layerRef.current;
    if (!(grounded && layer && lockIn.current && allowsMotion())) {
      return;
    }
    const duration = lockIn.current;
    const swells = Array.from(
      layer.querySelectorAll('[data-state="active"]'),
      (cell) =>
        cell.animate(
          { scale: ["0.9", "0.98"] },
          { duration, easing: "ease-out", fill: "forwards" }
        )
    );
    return () => {
      for (const swell of swells) {
        swell.cancel();
      }
    };
  }, [grounded]);

  // A rotation switches the shape at once, then overshoots as one piece.
  const { shape } = piece;
  const lastShape = useRef(shape);
  useLayoutEffect(() => {
    const turned = lastShape.current !== shape;
    lastShape.current = shape;
    const layer = layerRef.current;
    if (!(turned && layer && allowsMotion())) {
      return;
    }
    const cells = layer.querySelectorAll<HTMLElement>('[data-state="active"]');
    const columns = Array.from(cells, (cell) =>
      Number(cell.style.gridColumnStart)
    );
    const lines = Array.from(cells, (cell) => Number(cell.style.gridRowStart));
    const centerX = (Math.min(...columns) + Math.max(...columns)) / 2;
    const centerY = (Math.min(...lines) + Math.max(...lines)) / 2;
    // Each cell is drawn at 90%, which also scales how far it travels, so the
    // offsets to the piece's centre are enlarged to match.
    const reach = 1 / 0.9;
    for (const [index, cell] of cells.entries()) {
      const x = `calc(var(--row-pitch) * ${(centerX - columns[index]) * reach})`;
      const y = `calc(var(--row-pitch) * ${(centerY - lines[index]) * reach})`;
      const turn = (degrees: number) =>
        `translate(${x}, ${y}) rotate(${degrees}deg) translate(calc(${x} * -1), calc(${y} * -1))`;
      cell.animate(
        { transform: [turn(0), turn(5), turn(-1), turn(0)] },
        { duration: 240, easing: "ease-out" }
      );
    }
  }, [shape]);

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
      ref={layerRef}
    >
      {guide}
      {active}
    </div>
  );
}
