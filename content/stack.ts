/**
 * "The stack" — the layers sovereign AI depends on, top to bottom. Kept
 * generic on purpose: no model or library names until choices are final.
 */
export interface Layer {
  title: string;
  summary: string;
  points: string[];
}

export const stack: Layer[] = [
  {
    title: "Policy",
    summary: "UK law, open standards and clear rules for who may take part.",
    points: ["Accreditation criteria", "Audit and rollback", "Open standards"],
  },
  {
    title: "Applications",
    summary: "Public services, universities and businesses build on one UK endpoint.",
    points: ["Public sector", "Health and research", "Regional SMEs"],
  },
  {
    title: "Models",
    summary: "Open-weight models, adapted on British data — then specialists for high-value domains.",
    points: ["Open-weight base models", "British fine-tuning", "Domain specialists"],
  },
  {
    title: "Routing",
    summary: "Each request goes to the right-sized model on the nearest available UK node.",
    points: ["Single public entry point", "Model selection", "Node registry"],
  },
  {
    title: "Compute",
    summary: "GPUs pooled from accredited institutions, companies and individuals across the UK.",
    points: ["Decentralised nodes", "Inference and training together", "Signed update ledger"],
  },
  {
    title: "Energy",
    summary: "Powered and hosted on British soil, under British jurisdiction.",
    points: ["UK sites", "UK grid", "UK jurisdiction"],
  },
];
