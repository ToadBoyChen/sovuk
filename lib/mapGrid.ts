/**
 * A dot grid of some part of the map, built on the server by `geoGrid` and
 * passed to client components as plain data. Each row is a string: "#" land,
 * "*" highlighted country, "." sea.
 */
export interface MapGrid {
  cols: number;
  rows: number;
  latMax: number;
  lonMin: number;
  /** Degrees of latitude per row. */
  cellDeg: number;
  /** Degrees of longitude per column. */
  lonPerCell: number;
  data: string[];
}

/** Maps a latitude/longitude to fractional grid coordinates. */
export function projectToGrid(grid: MapGrid, lat: number, lon: number) {
  return {
    x: (lon - grid.lonMin) / grid.lonPerCell,
    y: (grid.latMax - lat) / grid.cellDeg,
  };
}
