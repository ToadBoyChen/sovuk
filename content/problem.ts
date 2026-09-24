/**
 * "The problem" map. Destinations are illustrative examples of where UK AI
 * requests can be processed today — major overseas cloud and AI hubs. No
 * figures are shown; swap or cite as the research develops.
 */
export interface MapPlace {
  name: string;
  lat: number;
  lon: number;
  /** Which side of its dot the label sits. Default "right". */
  label?: "left" | "right";
}

export const london: MapPlace = { name: "London", lat: 51.507, lon: -0.128 };

export const destinations: MapPlace[] = [
  { name: "US West", lat: 45.6, lon: -121.2, label: "left" },
  { name: "US East", lat: 38.9, lon: -77.4, label: "left" },
  { name: "Ireland", lat: 53.35, lon: -6.26, label: "left" },
  { name: "Germany", lat: 50.11, lon: 8.68 },
  { name: "China", lat: 31.2, lon: 121.5 },
];

/** UK sites the sovereign view loops between. */
export const ukSites: MapPlace[] = [
  london,
  { name: "Manchester", lat: 53.48, lon: -2.24 },
  { name: "Edinburgh", lat: 55.95, lon: -3.19 },
];

export const views = {
  today: {
    label: "Today",
    caption:
      "A prompt typed in the UK can be processed thousands of miles away — on hardware, and under laws, the UK does not control.",
  },
  sovereign: {
    label: "With sovereign compute",
    caption: "The same prompt, trained, served and answered on UK soil — under UK law, end to end.",
  },
} as const;

export type View = keyof typeof views;
