/** Roadmap phases. Labels only — add `when` once dates are agreed. */
export interface Place {
  name: string;
  lat: number;
  lon: number;
  /** Which side of its cluster the map label sits. Default "right". */
  label?: "left" | "right";
}

export interface Phase {
  title: string;
  summary: string;
  status: "now" | "next" | "later";
  when?: string;
  points: string[];
  /**
   * Where this phase lights up on the roadmap's UK map. Each place lights a
   * cluster of dots; `reach` is the cluster radius in map dots. Set
   * `everywhere` to light the whole country.
   */
  places: Place[];
  reach: number;
  everywhere?: boolean;
}

const london = { name: "London", lat: 51.507, lon: -0.128 };

export const roadmap: Phase[] = [
  {
    title: "Framework",
    summary: "Define what 'sovereign' means for AI compute, end to end.",
    status: "now",
    points: ["Sovereignty criteria", "Reference architecture", "Open consultation"],
    places: [london],
    reach: 3,
  },
  {
    title: "Policy",
    summary: "Work with government and industry to turn the framework into standards.",
    status: "next",
    points: ["Policy briefs", "Parliamentary engagement", "Procurement guidance"],
    places: [
      london,
      { name: "Edinburgh", lat: 55.953, lon: -3.189 },
      { name: "Cardiff", lat: 51.481, lon: -3.179, label: "left" },
      { name: "Belfast", lat: 54.597, lon: -5.93, label: "left" },
    ],
    reach: 4,
  },
  {
    title: "Pilot",
    summary: "Run real inference and training workloads entirely on UK soil.",
    status: "later",
    points: ["Partner datacentres", "First workloads", "Independent audit"],
    // Placeholder pilot regions — swap for real partner sites.
    places: [
      { name: "Thames Valley", lat: 51.51, lon: -0.6 },
      { name: "Manchester", lat: 53.48, lon: -2.24 },
      { name: "South Wales", lat: 51.59, lon: -3.0, label: "left" },
      { name: "Teesside", lat: 54.57, lon: -1.23 },
      { name: "Central Scotland", lat: 55.86, lon: -4.25, label: "left" },
    ],
    reach: 6,
  },
  {
    title: "Scale",
    summary: "Make sovereign compute the default choice for British organisations.",
    status: "later",
    points: ["National capacity", "Public-sector adoption", "Export the model"],
    places: [],
    reach: 0,
    everywhere: true,
  },
];
