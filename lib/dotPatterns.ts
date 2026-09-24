/**
 * Small dot-matrix pictograms, each a function of a cell in an n × n grid
 * returning whether it's lit. Used by the stack slabs and the request icons.
 */
export type Pattern = (x: number, y: number, n: number) => boolean;

/** Rounded rectangle outline, inset by `m` cells. */
const frame = (x: number, y: number, n: number, m: number) =>
  (x === m || x === n - 1 - m || y === m || y === n - 1 - m) &&
  x >= m && x <= n - 1 - m && y >= m && y <= n - 1 - m &&
  // knock the corners off
  !((x === m || x === n - 1 - m) && (y === m || y === n - 1 - m));

export const patterns = {
  /** Three sine waves — power. */
  energy: (x, y, n) => {
    for (let k = 1; k <= 3; k++) {
      const cy = (n * k) / 4 + Math.sin((x / n) * Math.PI * 2 + k) * (n / 12);
      if (Math.abs(y - cy) < 0.6) return true;
    }
    return false;
  },
  /** Server racks: columns of stacked units. */
  datacentre: (x, y, n) => {
    const m = Math.round(n / 10);
    if (x < m || x >= n - m || y < m || y >= n - m) return false;
    const colW = Math.max(3, Math.round(n / 5));
    return (x - m) % colW !== colW - 1 && (y - m) % 3 !== 2;
  },
  /** A chip: die outline, inner core grid and pins. */
  silicon: (x, y, n) => {
    const m = Math.round(n / 5);
    const pin = (x % 2 === 0 && (y < m - 1 || y > n - m)) || (y % 2 === 0 && (x < m - 1 || x > n - m));
    const inDie = x >= m && x <= n - 1 - m && y >= m && y <= n - 1 - m;
    const core = inDie && (x - m) % 3 !== 2 && (y - m) % 3 !== 2 && x > m && y > m && x < n - 1 - m && y < n - 1 - m;
    return (pin && x > 1 && y > 1 && x < n - 2 && y < n - 2) || frame(x, y, n, m) || core;
  },
  /** A small network: nodes on three layers with links between them. */
  models: (x, y, n) => {
    const layers = [0.2, 0.5, 0.8].map((f) => Math.round(f * (n - 1)));
    const nodesAt = (lx: number) => (lx === layers[1] ? [0.2, 0.4, 0.6, 0.8] : [0.3, 0.5, 0.7]).map((f) => f * (n - 1));
    for (const lx of layers) {
      if (Math.abs(x - lx) <= 1) for (const ny of nodesAt(lx)) if (Math.hypot(x - lx, y - ny) < 1.3) return true;
    }
    // links: straight lines between adjacent layers, sampled
    for (let i = 0; i < 2; i++) {
      const [ax, bx] = [layers[i], layers[i + 1]];
      if (x <= ax || x >= bx) continue;
      const t = (x - ax) / (bx - ax);
      for (const ay of nodesAt(ax)) for (const by of nodesAt(bx)) {
        if (x % 2 === 0 && Math.abs(y - (ay + (by - ay) * t)) < 0.5) return true;
      }
    }
    return false;
  },
  /** A document: header bar and lines of text. */
  policy: (x, y, n) => {
    const m = Math.round(n / 6);
    if (x < m || x > n - 1 - m || y < m || y > n - 1 - m) return false;
    if (y === m || y === m + 1) return x < n * 0.62;
    if ((y - m) % 3 !== 0 || y < m + 3) return false;
    const len = [0.9, 0.75, 0.85, 0.6, 0.8][((y - m) / 3) % 5] ?? 0.8;
    return x < m + (n - 2 * m) * len;
  },
  /** A speech bubble — the prompt. */
  prompt: (x, y, n) => {
    const b = Math.round(n * 0.7);
    if (frame(x, y, n, 1) && y < b) return true;
    const tail = y >= b - 1 && y < b + 2 && x >= 3 && x <= 3 + (b + 2 - y);
    return tail || (y > 3 && y < b - 2 && y % 2 === 0 && x > 3 && x < n - 4);
  },
  /** Linked nodes — the network. */
  network: (x, y, n) => {
    const pts = [
      [0.2, 0.25], [0.75, 0.2], [0.5, 0.55], [0.2, 0.8], [0.8, 0.78],
    ].map(([a, b]) => [a * (n - 1), b * (n - 1)]);
    if (pts.some(([px, py]) => Math.hypot(x - px, y - py) < 1.2)) return true;
    const links = [[0, 2], [1, 2], [2, 3], [2, 4], [0, 1]];
    return links.some(([i, j]) => {
      const [ax, ay] = pts[i];
      const [bx, by] = pts[j];
      const len = Math.hypot(bx - ax, by - ay);
      const t = ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / (len * len);
      if (t < 0 || t > 1) return false;
      const d = Math.abs((by - ay) * x - (bx - ax) * y + bx * ay - by * ax) / len;
      return d < 0.45 && (x + y) % 2 === 0;
    });
  },
  /** A tick in a circle — the answer. */
  answer: (x, y, n) => {
    const c = (n - 1) / 2;
    const r = Math.hypot(x - c, y - c);
    if (Math.abs(r - (n / 2 - 1)) < 0.6) return true;
    const t1 = y - (x - c * 0.55) - c * 0.95;
    const t2 = y + (x - c * 1.45) * 0.9 - c * 0.35;
    const onShort = Math.abs(t1) < 0.7 && x >= c * 0.55 && x <= c * 0.95;
    const onLong = Math.abs(t2 - c * 0.7) < 0.7 && x >= c * 0.9 && x <= c * 1.5;
    return onShort || onLong;
  },
} satisfies Record<string, Pattern>;

export type PatternName = keyof typeof patterns;

/**
 * Renders a pattern as dots on an n × n grid: lit cells full, the rest faint
 * so the tile still reads as a square slab.
 */
export function patternDots(name: PatternName, n: number, tone = 0, ghost = 0.08) {
  const fn: Pattern = patterns[name];
  const dots: { x: number; y: number; tone: number; alpha?: number; level?: number }[] = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      dots.push(fn(x, y, n) ? { x, y, tone } : { x, y, tone, alpha: ghost, level: 0.7 });
    }
  }
  return dots;
}
