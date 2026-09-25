"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Charts for research pieces, written straight into MDX:
 *
 *   <Chart type="line" title="…" x={{ label: "…", suffix: "%" }} y={{ label: "…", prefix: "£" }}
 *     series={[{ name: "…", points: [[0, 12], [10, 11]] }]} source="…" />
 *   <Chart type="bar" title="…" y={{ label: "…", suffix: " Wh" }}
 *     data={[{ label: "Small", value: 0.3 }]} />
 *
 * SVG drawn to the measured width (so text stays legible on phones), hover
 * and keyboard readouts, a legend for 2+ series, and a data-table view.
 * Series colours come in a fixed order, validated for colour-blind contrast.
 */

const COLORS = ["var(--sovereign)", "var(--signal)", "var(--chart-3)"];

interface Axis {
  label: string;
  prefix?: string;
  suffix?: string;
  /** Decimal places shown. Default 0. */
  decimals?: number;
}

interface Series {
  name: string;
  points: [number, number][];
}

interface ChartProps {
  type: "line" | "bar";
  title: string;
  subtitle?: string;
  source?: string;
  x?: Axis;
  y: Axis;
  /** Line charts: up to three series. */
  series?: Series[];
  /** Bar charts: one value per category. */
  data?: { label: string; value: number }[];
}

const fmt = (v: number, a: Axis | undefined) =>
  `${a?.prefix ?? ""}${v.toLocaleString("en-GB", {
    minimumFractionDigits: a?.decimals ?? 0,
    maximumFractionDigits: a?.decimals ?? 0,
  })}${a?.suffix ?? ""}`;

/** Rough width of one character of 12px axis text, for wrapping labels. */
const CHAR_PX = 6.5;

/** Splits a label into lines that fit `maxPx`, breaking between words. */
function wrap(text: string, maxPx: number) {
  const lines: string[] = [];
  for (const word of text.split(" ")) {
    const last = lines[lines.length - 1];
    if (last && (last.length + 1 + word.length) * CHAR_PX <= maxPx) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines;
}

/** Round tick values from 0 up past `max`: steps of 1, 2 or 5 × 10ⁿ. */
function ticks(min: number, max: number, count = 5) {
  const raw = (max - min) / count;
  const mag = 10 ** Math.floor(Math.log10(raw || 1));
  const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw)!;
  const out: number[] = [];
  for (
    let v = Math.floor(min / step) * step;
    v <= max + step * 0.001;
    v += step
  )
    out.push(+v.toFixed(10));
  if (out[out.length - 1] < max) out.push(out[out.length - 1] + step);
  return out;
}

function Chart({
  type,
  title,
  subtitle,
  source,
  x,
  y,
  series = [],
  data = [],
}: ChartProps) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setWidth(Math.round(e.contentRect.width)),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const line = type === "line";
  const multi = line && series.length > 1;
  const height = Math.round(Math.min(360, Math.max(240, width * 0.5)));
  // Bar labels wrap onto extra lines when columns are narrow (e.g. phones).
  const barBand = (width - 56 - 24) / Math.max(1, data.length);
  const labelLines = line ? [] : data.map((d) => wrap(d.label, barBand - 8));
  const extraLines = Math.max(0, ...labelLines.map((l) => l.length - 1));
  const m = { top: 30, right: multi ? 110 : 24, bottom: 44 + extraLines * 14, left: 56 };
  const pw = width - m.left - m.right;
  const ph = height - m.top - m.bottom;

  // Scales
  const values = line
    ? series.flatMap((s) => s.points.map((p) => p[1]))
    : data.map((d) => d.value);
  const yTicks = ticks(Math.min(0, ...values), Math.max(...values));
  const [y0, y1] = [yTicks[0], yTicks[yTicks.length - 1]];
  const sy = (v: number) => m.top + ph - ((v - y0) / (y1 - y0)) * ph;

  const xs = [
    ...new Set(series.flatMap((s) => s.points.map((p) => p[0]))),
  ].sort((a, b) => a - b);
  const [x0, x1] = [xs[0] ?? 0, xs[xs.length - 1] ?? 1];
  const sx = (v: number) => m.left + ((v - x0) / (x1 - x0 || 1)) * pw;
  const xTicks = line
    ? ticks(x0, x1, Math.max(2, Math.min(6, Math.floor(pw / 90)))).filter(
        (t) => t >= x0 && t <= x1,
      )
    : [];

  const band = pw / Math.max(1, data.length);
  const barW = Math.min(24, band * 0.6);

  // Readout for the hovered x (line) or bar.
  const hx = line && hover !== null ? xs[hover] : null;
  const readout =
    line && hx !== null
      ? {
          left: sx(hx),
          top: m.top,
          head: fmt(hx, x),
          rows: series.map((s, i) => ({
            color: COLORS[i],
            name: s.name,
            value: s.points.find((p) => p[0] === hx)?.[1],
          })),
        }
      : !line && hover !== null
        ? {
            left: m.left + band * (hover + 0.5),
            top: sy(data[hover].value) - 8,
            head: data[hover].label,
            rows: [
              { color: COLORS[0], name: y.label, value: data[hover].value },
            ],
          }
        : null;

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const px =
      e.clientX - e.currentTarget.getBoundingClientRect().left + m.left;
    let best = 0;
    xs.forEach(
      (v, i) =>
        Math.abs(sx(v) - px) < Math.abs(sx(xs[best]) - px) && (best = i),
    );
    setHover(best);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const n = line ? xs.length : data.length;
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step || !n) return;
    e.preventDefault();
    setHover((h) => (h === null ? 0 : Math.min(n - 1, Math.max(0, h + step))));
  };

  const path = (s: Series) =>
    s.points.map((p, i) => `${i ? "L" : "M"}${sx(p[0])},${sy(p[1])}`).join(" ");

  return (
    <figure className="not-prose my-12">
      <figcaption>
        <p className="text-xl font-medium tracking-[-0.01em]">{title}</p>
        {subtitle && <p className="mt-1 text-base text-muted">{subtitle}</p>}
      </figcaption>

      {multi && (
        <ul
          className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm"
          aria-label="Legend"
        >
          {series.map((s, i) => (
            <li key={s.name} className="flex items-center gap-2">
              <span
                aria-hidden
                className="h-0.5 w-5 rounded-full"
                style={{ background: COLORS[i] }}
              />
              {s.name}
            </li>
          ))}
        </ul>
      )}

      <div ref={box} className="relative mt-4">
        <svg
          // viewBox scales the first (server-sized) render to fit until the real width is measured.
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`${title}. Use the left and right arrow keys to read values, or open the data table below.`}
          tabIndex={0}
          onKeyDown={onKey}
          onBlur={() => setHover(null)}
          className="block h-auto w-full overflow-visible rounded-sm focus-visible:outline-2"
        >
          {/* Grid and y-axis */}
          {yTicks.map((t) => (
            <g key={t}>
              <line
                x1={m.left}
                x2={m.left + pw}
                y1={sy(t)}
                y2={sy(t)}
                stroke="var(--line)"
                strokeWidth={1}
              />
              <text
                x={m.left - 10}
                y={sy(t)}
                dy="0.32em"
                textAnchor="end"
                className="fill-muted text-xs tabular-nums"
              >
                {fmt(t, y)}
              </text>
            </g>
          ))}
          {/* Y-axis title sits above the axis, level with the tick labels, never rotated. */}
          <text x={0} y={6} dy="0.32em" className="fill-muted text-xs">
            {y.label}
          </text>

          {line ? (
            <>
              {xTicks.map((t) => (
                <text
                  key={t}
                  x={sx(t)}
                  y={m.top + ph + 20}
                  textAnchor="middle"
                  className="fill-muted text-xs tabular-nums"
                >
                  {fmt(t, x)}
                </text>
              ))}
              {x && (
                <text
                  x={m.left + pw / 2}
                  y={height - 4}
                  textAnchor="middle"
                  className="fill-muted text-xs"
                >
                  {x.label}
                </text>
              )}
              {series.map((s, i) => {
                const last = s.points[s.points.length - 1];
                return (
                  <g key={s.name}>
                    <path
                      d={path(s)}
                      fill="none"
                      stroke={COLORS[i]}
                      strokeWidth={2}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                    <circle
                      cx={sx(last[0])}
                      cy={sy(last[1])}
                      r={4}
                      fill={COLORS[i]}
                      stroke="var(--paper)"
                      strokeWidth={2}
                    />
                    {multi && (
                      <text
                        x={sx(last[0]) + 10}
                        y={sy(last[1])}
                        dy="0.32em"
                        className="fill-ink text-xs font-medium"
                      >
                        {s.name}
                      </text>
                    )}
                  </g>
                );
              })}
              {hx !== null && (
                <g aria-hidden>
                  <line
                    x1={sx(hx)}
                    x2={sx(hx)}
                    y1={m.top}
                    y2={m.top + ph}
                    stroke="var(--ink)"
                    strokeOpacity={0.3}
                    strokeWidth={1}
                  />
                  {series.map((s, i) => {
                    const p = s.points.find((q) => q[0] === hx);
                    return p ? (
                      <circle
                        key={s.name}
                        cx={sx(p[0])}
                        cy={sy(p[1])}
                        r={4.5}
                        fill={COLORS[i]}
                        stroke="var(--paper)"
                        strokeWidth={2}
                      />
                    ) : null;
                  })}
                </g>
              )}
              <rect
                x={m.left}
                y={m.top}
                width={pw}
                height={ph}
                fill="transparent"
                onPointerMove={onMove}
                onPointerLeave={() => setHover(null)}
              />
            </>
          ) : (
            data.map((d, i) => {
              const cx = m.left + band * (i + 0.5);
              const top = sy(d.value);
              const base = sy(Math.max(0, y0));
              const r = Math.min(4, (base - top) / 2);
              return (
                <g
                  key={d.label}
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover(null)}
                  opacity={hover === null || hover === i ? 1 : 0.55}
                >
                  {/* Hit target: the whole band, taller than the bar. */}
                  <rect
                    x={cx - band / 2}
                    y={m.top}
                    width={band}
                    height={ph}
                    fill="transparent"
                  />
                  <path
                    d={`M${cx - barW / 2},${base} V${top + r} Q${cx - barW / 2},${top} ${cx - barW / 2 + r},${top} H${cx + barW / 2 - r} Q${cx + barW / 2},${top} ${cx + barW / 2},${top + r} V${base} Z`}
                    fill={COLORS[0]}
                  />
                  <text
                    x={cx}
                    y={top - 8}
                    textAnchor="middle"
                    className="fill-ink text-xs font-medium tabular-nums"
                  >
                    {fmt(d.value, y)}
                  </text>
                  <text
                    x={cx}
                    y={m.top + ph + 20}
                    textAnchor="middle"
                    className="fill-muted text-xs"
                  >
                    {labelLines[i].map((l, j) => (
                      <tspan key={j} x={cx} dy={j ? 14 : 0}>
                        {l}
                      </tspan>
                    ))}
                  </text>
                </g>
              );
            })
          )}
        </svg>

        {readout && (
          <div
            aria-hidden
            className="pointer-events-none absolute z-10 min-w-36 -translate-x-1/2 -translate-y-full border border-line bg-paper px-3 py-2 text-sm shadow-sm"
            style={{
              left: Math.min(Math.max(readout.left, 80), width - 80),
              top: readout.top,
            }}
          >
            <p className="text-muted">{readout.head}</p>
            {readout.rows.map((r) => (
              <p key={r.name} className="mt-1 flex items-center gap-2">
                <span
                  aria-hidden
                  className="size-2 rounded-full"
                  style={{ background: r.color }}
                />
                <strong className="font-medium tabular-nums">
                  {r.value === undefined ? "–" : fmt(r.value, y)}
                </strong>
                <span className="text-muted">{r.name}</span>
              </p>
            ))}
          </div>
        )}
      </div>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-muted hover:text-ink">
          View data as a table
        </summary>
        <table className="mt-3 w-full border-collapse text-left tabular-nums">
          <thead>
            <tr>
              <th className="border-b border-ink py-1.5 pr-4 font-medium">
                {line ? (x?.label ?? "") : "Category"}
              </th>
              {line ? (
                series.map((s) => (
                  <th
                    key={s.name}
                    className="border-b border-ink py-1.5 pr-4 font-medium"
                  >
                    {s.name}
                  </th>
                ))
              ) : (
                <th className="border-b border-ink py-1.5 pr-4 font-medium">
                  {y.label}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {line
              ? xs.map((v) => (
                  <tr key={v}>
                    <td className="border-b border-line py-1.5 pr-4">
                      {fmt(v, x)}
                    </td>
                    {series.map((s) => {
                      const p = s.points.find((q) => q[0] === v);
                      return (
                        <td
                          key={s.name}
                          className="border-b border-line py-1.5 pr-4"
                        >
                          {p ? fmt(p[1], y) : "–"}
                        </td>
                      );
                    })}
                  </tr>
                ))
              : data.map((d) => (
                  <tr key={d.label}>
                    <td className="border-b border-line py-1.5 pr-4">
                      {d.label}
                    </td>
                    <td className="border-b border-line py-1.5 pr-4">
                      {fmt(d.value, y)}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </details>

      {source && <p className="mt-3 text-sm text-muted">Source: {source}</p>}
    </figure>
  );
}

export default Chart;
