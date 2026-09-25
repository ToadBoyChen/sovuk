/**
 * "Follow a request" — one prompt's journey, step by step. Generic on
 * purpose: no model or library names until choices are final.
 */

/** Stations on the request's path, in order, with what each one does. */
export interface Station {
  name: string;
  role: string;
  /** Short facts shown while the request is at this station. */
  facts: [label: string, value: string][];
}

export const stations: Station[] = [
  {
    name: "You",
    role: "Any app or device",
    facts: [
      ["Endpoint", "One UK address"],
      ["Feels like", "Any AI service"],
    ],
  },
  {
    name: "Gateway",
    role: "UK entry point",
    facts: [
      ["Hosted", "In the UK"],
      ["Checks", "Identity, limits, safety"],
      ["Overseas fallback", "None"],
    ],
  },
  {
    name: "Router",
    role: "Picks the model",
    facts: [
      ["Reads", "Length, complexity, reasoning"],
      ["Chooses", "The right-sized model"],
    ],
  },
  {
    name: "Registry",
    role: "Finds a node",
    facts: [
      ["Tracks", "Status, capacity, location"],
      ["Only", "Accredited nodes"],
      ["Picks", "Nearest with room"],
    ],
  },
  {
    name: "UK node",
    role: "Runs the model",
    facts: [
      ["Hardware", "UK-hosted GPUs"],
      ["Model", "Latest verified version"],
      ["Meanwhile", "Training continues"],
    ],
  },
];

export interface RequestStep {
  title: string;
  body: string;
  /** Index into `stations`: where the request is during this step. */
  at: number;
}

export const steps: RequestStep[] = [
  {
    title: "You send a prompt",
    body: "Everyone uses one public endpoint. It looks like any AI service — but it's hosted in the UK.",
    at: 0,
  },
  {
    title: "It lands at a UK gateway",
    body: "The gateway checks the request and keeps it onshore. There is no fallback to an overseas provider.",
    at: 1,
  },
  {
    title: "A router picks the model",
    body: "A small, fast classifier reads the prompt's length and complexity and chooses the right-sized model — no bigger than it needs.",
    at: 2,
  },
  {
    title: "The registry picks a node",
    body: "A live registry of accredited nodes finds the nearest one with that model loaded and room to run it.",
    at: 3,
  },
  {
    title: "A British node answers",
    body: "The model runs on UK hardware. Training carries on underneath, so spare capacity is never wasted.",
    at: 4,
  },
  {
    title: "The answer comes home",
    body: "The response returns to you and the request is recorded for audit. At no point did it leave the UK.",
    at: 0,
  },
];
