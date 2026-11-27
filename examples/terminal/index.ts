import { emitKeypressEvents, type Key } from "node:readline";
import {
  type CellVariant,
  cellVariant,
  createGame,
  createGameRunner,
  type Game,
} from "blocky-game";

const { stdin, stdout } = process;
if (!(stdin.isTTY && stdout.isTTY)) {
  console.error("Run the game in an interactive terminal.");
  process.exit(1);
}

const runner = createGameRunner(createGame());
const glyph: Record<CellVariant, string> = {
  empty: "  ",
  belowActiveBlock: "  ",
  active: "[]",
  filled: "##",
};
const clearHighlightMs = 180;
let highlightedRows = new Set<number>();
let highlightTimer: ReturnType<typeof setTimeout> | undefined;

function draw(game: Game) {
  const border = `+${"-".repeat(game.rules.cols * 2)}+`;
  const rows = game.rows.map((row, y) => {
    const cells = row.cells
      .map((_, x) => glyph[cellVariant(game, x, y)])
      .join("");
    return highlightedRows.has(y) ? `|\x1b[7m${cells}\x1b[0m|` : `|${cells}|`;
  });
  const status = {
    ready: "Ready",
    playing: "Playing",
    paused: "Paused",
    finished: "Game over",
  }[game.status];
  stdout.write(
    `\x1b[H\x1b[2J${[
      `TsumiZare  ${status}  Score ${game.result.score}`,
      border,
      ...rows,
      border,
      "Arrows move/rotate · Space place · P pause · R restart · Q quit",
    ].join("\r\n")}`
  );
}

function clearHighlight() {
  clearTimeout(highlightTimer);
  highlightedRows.clear();
}

runner.subscribe((game, events) => {
  const cleared = events.flatMap((event) =>
    event.type === "cleared" ? event.rows : []
  );
  if (cleared.length > 0) {
    clearHighlight();
    highlightedRows = new Set(cleared);
    highlightTimer = setTimeout(() => {
      highlightedRows.clear();
      draw(runner.getGame());
    }, clearHighlightMs);
  }
  draw(game);
});

function onKey(_text: string, key: Key) {
  if (key.ctrl && key.name === "c") {
    process.exit(0);
  }
  switch (key.name) {
    case "left":
    case "right":
    case "down":
      runner.send({ type: "move", direction: key.name });
      break;
    case "up":
      runner.send({ type: "rotate" });
      break;
    case "space":
      runner.send({ type: "place" });
      break;
    case "p":
      runner.send({
        type: runner.getGame().status === "paused" ? "resume" : "pause",
      });
      break;
    case "r":
      clearHighlight();
      runner.send({ type: "start" });
      break;
    case "q":
      process.exit(0);
      break;
    default:
      break;
  }
}

const wasRaw = stdin.isRaw;
process.once("exit", () => {
  clearHighlight();
  runner.dispose();
  stdin.setRawMode(wasRaw);
  stdout.write("\x1b[?25h\x1b[?1049l");
});
process.once("SIGINT", () => process.exit(130));
process.once("SIGTERM", () => process.exit(143));

emitKeypressEvents(stdin);
stdin.setRawMode(true);
stdin.on("keypress", onKey);
stdout.write("\x1b[?1049h\x1b[?25l");
runner.send({ type: "start" });
