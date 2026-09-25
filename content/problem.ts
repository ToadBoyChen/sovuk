/**
 * "The problem" map. Hubs are illustrative: approximate headquarters and
 * data-centre regions of major AI and cloud providers a UK request can be
 * served from today. No figures are shown; swap or cite as the research
 * develops.
 */
export interface MapPlace {
  name: string;
  lat: number;
  lon: number;
}

export interface Hub extends MapPlace {
  /** Shown when the hub is hovered, focused or tapped. */
  companies: string[];
}

export const london: MapPlace = { name: "London", lat: 51.507, lon: -0.128 };

export const hubs: Hub[] = [
  {
    name: "Seattle",
    lat: 47.62,
    lon: -122.24,
    companies: ["Microsoft", "Amazon"],
  },
  {
    name: "Bay Area",
    lat: 37.6,
    lon: -122.2,
    companies: ["OpenAI", "Anthropic", "Google", "Meta", "Nvidia"],
  },
  {
    name: "Northern Virginia data centres",
    lat: 39.04,
    lon: -77.49,
    companies: ["AWS", "Microsoft Azure", "Google Cloud"],
  },
  {
    name: "Dublin data centres",
    lat: 53.35,
    lon: -6.26,
    companies: ["Microsoft", "Google", "Meta", "AWS"],
  },
  {
    name: "Paris",
    lat: 48.86,
    lon: 2.35,
    companies: ["Mistral AI", "Scaleway", "OVHcloud"],
  },
  {
    name: "Frankfurt data centres",
    lat: 50.11,
    lon: 8.68,
    companies: ["AWS", "Microsoft Azure", "Google Cloud"],
  },
  {
    name: "Hangzhou",
    lat: 30.27,
    lon: 120.16,
    companies: ["DeepSeek", "Alibaba Cloud"],
  },
];

/** UK sites the sovereign view loops between, in loop order. */
export const ukSites: MapPlace[] = [
  london,
  { name: "Cardiff", lat: 51.48, lon: -3.18 },
  { name: "Belfast", lat: 54.6, lon: -5.93 },
  { name: "Edinburgh", lat: 55.95, lon: -3.19 },
  { name: "Manchester", lat: 53.48, lon: -2.24 },
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
