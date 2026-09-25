import "server-only";

import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon, Position } from "geojson";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import countries10m from "world-atlas/countries-10m.json";
import countries50m from "world-atlas/countries-50m.json";
import land50m from "world-atlas/land-50m.json";
import type { MapGrid } from "@/lib/mapGrid";

/**
 * Builds a `MapGrid` from world-atlas data at render time, so no map is
 * committed to the repo. Pages are static, so this runs once per build.
 *
 * Plain equirectangular projection with longitude scaled by cos(`lat0`),
 * mirrored on the client by `projectToGrid`. Cells are filled by scanline
 * rasterising the outlines with `supersample`² samples per cell.
 */
export interface GeoGridOptions {
  bounds: { latMin: number; latMax: number; lonMin: number; lonMax: number };
  rows: number;
  /** Latitude whose scale the grid keeps true. Default: the middle of `bounds`. */
  lat0?: number;
  /** Draw only this country (ISO 3166 numeric id, e.g. "826" for the UK) instead of all land. */
  only?: string;
  /** Mark this country's cells "*" on top of the land. */
  highlight?: string;
  /** Outline detail. "10m" is finest; "50m" is plenty for the whole world. */
  detail?: "10m" | "50m";
  /**
   * Fix the column count, e.g. to match another grid so the two can be
   * zoomed between. The grid stays centred on the middle of `bounds`.
   */
  cols?: number;
  /** Share of a cell that must be land for it to count. Default 0.4. */
  minCoverage?: number;
  /** Same for `highlight`. Default 0: any hit counts, as small countries vanish at world scale. */
  highlightCoverage?: number;
  supersample?: number;
}

type Topo = Topology<{ countries: GeometryCollection } & { land: GeometryCollection }>;
const COUNTRIES = { "10m": countries10m, "50m": countries50m } as unknown as Record<string, Topo>;
const LAND = land50m as unknown as Topo;

interface Ring {
  points: Position[];
  latMin: number;
  latMax: number;
}

function ringsOf(geometry: Geometry): Ring[] {
  const polygons =
    geometry.type === "Polygon"
      ? [(geometry as Polygon).coordinates]
      : geometry.type === "MultiPolygon"
        ? (geometry as MultiPolygon).coordinates
        : [];
  return polygons.flat().flatMap((ring) => {
    // Rings that cross the antimeridian jump between ±180°. Unwrap them so
    // longitudes run continuously, then add a copy shifted back by 360° so
    // both sides of the map get their part.
    const points: Position[] = [];
    let offset = 0;
    ring.forEach(([lon, lat], i) => {
      if (i > 0) {
        const prev = ring[i - 1][0];
        if (lon - prev > 180) offset -= 360;
        else if (prev - lon > 180) offset += 360;
      }
      points.push([lon + offset, lat]);
    });
    // A ring that circles a pole (Antarctica) doesn't close once unwrapped:
    // close it along the pole.
    if (offset) {
      const pole = points[0][1] < 0 ? -90 : 90;
      points.push([points[points.length - 1][0], pole], [points[0][0], pole]);
    }
    const lats = points.map((p) => p[1]);
    const lons = points.map((p) => p[0]);
    const base = { latMin: Math.min(...lats), latMax: Math.max(...lats) };
    const shift = Math.max(...lons) > 180 ? -360 : Math.min(...lons) < -180 ? 360 : 0;
    const out = [{ points, ...base }];
    if (shift) out.push({ points: points.map(([lon, lat]) => [lon + shift, lat]), ...base });
    return out;
  });
}

function country(detail: string, id: string): Ring[] {
  const topo = COUNTRIES[detail];
  const geom = topo.objects.countries.geometries.find((g) => g.id === id);
  if (!geom) throw new Error(`geoGrid: no country with id ${id}`);
  return ringsOf((feature(topo, geom) as Feature).geometry);
}

/** Per-cell count of supersamples inside `rings` (even-odd fill). */
function coverage(rings: Ring[], grid: Omit<MapGrid, "data">, ss: number): Uint16Array {
  const { cols, rows, latMax, lonMin, cellDeg, lonPerCell } = grid;
  const counts = new Uint16Array(cols * rows);
  const subCols = cols * ss;
  for (let sy = 0; sy < rows * ss; sy++) {
    const lat = latMax - ((sy + 0.5) / ss) * cellDeg;
    const xs: number[] = [];
    for (const ring of rings) {
      if (lat < ring.latMin || lat > ring.latMax) continue;
      const pts = ring.points;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [lonA, latA] = pts[j];
        const [lonB, latB] = pts[i];
        if (latA > lat === latB > lat) continue;
        const lon = lonA + ((lat - latA) / (latB - latA)) * (lonB - lonA);
        xs.push(((lon - lonMin) / lonPerCell) * ss);
      }
    }
    xs.sort((a, b) => a - b);
    const row = Math.floor(sy / ss) * cols;
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const from = Math.max(0, Math.ceil(xs[k] - 0.5));
      const to = Math.min(subCols - 1, Math.floor(xs[k + 1] - 0.5));
      for (let sx = from; sx <= to; sx++) counts[row + Math.floor(sx / ss)]++;
    }
  }
  return counts;
}

/** Maps used on the site. */
export const MAPS = {
  /** The world, Antarctica cropped, with the UK highlighted. */
  world: {
    bounds: { latMin: -56, latMax: 80, lonMin: -180, lonMax: 180 },
    rows: 80,
    lat0: 0,
    highlight: "826",
  },
  /** The British Isles and near Europe, UK highlighted, on the same grid size as `world` to zoom into. */
  britishIsles: {
    bounds: { latMin: 48, latMax: 61, lonMin: -12, lonMax: 8 },
    rows: 80,
    cols: 212,
    lat0: 54.5,
    highlight: "826",
    highlightCoverage: 0.4,
    detail: "10m",
  },
  /** The United Kingdom on its own. */
  uk: {
    bounds: { latMin: 49.85, latMax: 60.9, lonMin: -8.2, lonMax: 1.8 },
    rows: 96,
    lat0: 55,
    only: "826",
    detail: "10m",
  },
} satisfies Record<string, GeoGridOptions>;

const cache = new Map<string, MapGrid>();

export function geoGrid(options: GeoGridOptions): MapGrid {
  const key = JSON.stringify(options);
  const hit = cache.get(key);
  if (hit) return hit;

  const {
    bounds: { latMin, latMax, lonMin, lonMax },
    rows,
    lat0 = (latMin + latMax) / 2,
    only,
    highlight,
    detail = "50m",
    minCoverage = 0.4,
    highlightCoverage = 0,
    supersample: ss = 4,
  } = options;

  const cellDeg = (latMax - latMin) / rows;
  const lonScale = Math.cos((lat0 * Math.PI) / 180);
  const lonPerCell = cellDeg / lonScale;
  const cols = options.cols ?? Math.round((lonMax - lonMin) / lonPerCell);
  const left = options.cols ? (lonMin + lonMax) / 2 - (cols * lonPerCell) / 2 : lonMin;
  const shape = { cols, rows, latMax, lonMin: left, cellDeg, lonPerCell };

  const landRings = only
    ? country(detail, only)
    : (feature(LAND, LAND.objects.land) as FeatureCollection).features.flatMap((f) => ringsOf(f.geometry));
  const land = coverage(landRings, shape, ss);
  const marked = highlight ? coverage(country(detail, highlight), shape, ss) : null;

  const need = minCoverage * ss * ss;
  const needMarked = Math.max(1, highlightCoverage * ss * ss);
  const data: string[] = [];
  for (let y = 0; y < rows; y++) {
    let line = "";
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      line += marked && marked[i] >= needMarked ? "*" : land[i] >= need ? "#" : ".";
    }
    data.push(line);
  }

  const grid = { ...shape, data };
  cache.set(key, grid);
  return grid;
}
