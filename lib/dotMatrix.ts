/**
 * Shared helpers for the site's dot-matrix motif (hero glyph, team portraits,
 * UK map, footer). Rendering stays in each component; sampling lives here.
 */

export interface DotSample {
  x: number;
  y: number;
  /** Mean RGB brightness, 0-255. */
  brightness: number;
  /** Pixel alpha, 0-255. */
  alpha: number;
}

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.trim().replace("#", "");
  const full =
    clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const int = parseInt(full, 16) || 0;
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

/** Reads a brand colour token (e.g. "--ink") from :root as an RGB triple. */
export function readTokenRgb(
  token: string,
  fallback = "#0a0a0a"
): [number, number, number] {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  return hexToRgb(value || fallback);
}

/**
 * Downsamples an image to a `cols` × `rows` grid (one sample per dot), fitting
 * it with "contain" (default) or "cover". With `mask: "circle"` only samples
 * inside the inscribed circle are returned.
 */
export function sampleImage(
  image: HTMLImageElement,
  cols: number,
  rows: number = cols,
  { mask = "none", fit = "contain" }: { mask?: "none" | "circle"; fit?: "contain" | "cover" } = {}
): DotSample[] {
  const sample = document.createElement("canvas");
  sample.width = cols;
  sample.height = rows;
  const sctx = sample.getContext("2d", { willReadFrequently: true });
  if (!sctx) return [];

  const scale =
    fit === "cover"
      ? Math.max(cols / image.width, rows / image.height)
      : Math.min(cols / image.width, rows / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  sctx.drawImage(image, (cols - w) / 2, (rows - h) / 2, w, h);
  const { data } = sctx.getImageData(0, 0, cols, rows);

  const rx = cols / 2;
  const ry = rows / 2;
  const samples: DotSample[] = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (mask === "circle") {
        const dx = (x + 0.5 - rx) / rx;
        const dy = (y + 0.5 - ry) / ry;
        if (dx * dx + dy * dy > 1) continue;
      }
      const i = (y * cols + x) * 4;
      samples.push({
        x,
        y,
        brightness: (data[i] + data[i + 1] + data[i + 2]) / 3,
        alpha: data[i + 3],
      });
    }
  }

  return samples;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

/**
 * Renders `text` in the page's own font and samples it to a `cols` × `rows`
 * grid, returning which cells are inked (alpha 0-255 per cell).
 */
export function sampleText(
  text: string,
  cols: number,
  rows: number,
  { weight = 700, supersample = 8 }: { weight?: number; supersample?: number } = {}
): DotSample[] {
  const big = document.createElement("canvas");
  big.width = cols * supersample;
  big.height = rows * supersample;
  const bctx = big.getContext("2d");
  if (!bctx) return [];

  const family = getComputedStyle(document.body).fontFamily;
  let size = big.height * 0.9;
  bctx.font = `${weight} ${size}px ${family}`;
  // Shrink to fit the width if the text is wider than the grid.
  const measured = bctx.measureText(text).width;
  if (measured > big.width * 0.96) size *= (big.width * 0.96) / measured;
  bctx.font = `${weight} ${size}px ${family}`;
  bctx.textAlign = "center";
  bctx.textBaseline = "middle";
  bctx.fillStyle = "#000";
  bctx.fillText(text, big.width / 2, big.height / 2 + size * 0.04);

  const small = document.createElement("canvas");
  small.width = cols;
  small.height = rows;
  const sctx = small.getContext("2d", { willReadFrequently: true });
  if (!sctx) return [];
  sctx.drawImage(big, 0, 0, cols, rows);
  const { data } = sctx.getImageData(0, 0, cols, rows);

  const samples: DotSample[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      samples.push({ x, y, brightness: 0, alpha: data[i + 3] });
    }
  }
  return samples;
}
