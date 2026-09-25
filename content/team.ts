/**
 * Founding team — three equal co-founders. The site shows them in a random
 * order on each visit, so no one is permanently listed first.
 * Drop a portrait (ideally 4:5) in /public/team and point `photo` at it; the
 * halftone is generated from the photo automatically.
 */
export interface TeamMember {
  /** URL of their page: /team/<slug>. */
  slug: string;
  name: string;
  role: string;
  /** Discipline, shown as the headline of their background. */
  field: string;
  /** Institution and qualification. */
  background: string;
  /** What they lead on, in plain terms. */
  focus: string;
  /** Direct address, used when someone contacts them from their page. */
  email: string;
  photo: string;
  linkedin?: string;
  /** Paragraphs for their page. */
  bio: string[];
  /** What they're responsible for, listed on their page. */
  responsibilities: string[];
}

export const team: TeamMember[] = [
  {
    slug: "toby-chen",
    // Placeholder — swap for a real address.
    email: "toby@example.co.uk",
    name: "Toby Chen",
    role: "Co-founder",
    field: "Mathematics",
    background: "First-class graduate, Queen Mary University of London",
    // Draft — edit.
    focus: "Models, routing and evaluation",
    photo: "/team/placeholder.svg",
    // Draft — edit.
    bio: [
      "Toby Chen is a mathematician and one of three co-founders of SovereignStrUKture, with a first-class degree from Queen Mary University of London.",
      "Toby leads work on the model layer: how open-weight models are adapted on British data, how each request is routed to the right model, and how results are evaluated before any model is released.",
    ],
    responsibilities: ["Adapting models on British data", "Request routing", "Evaluation and release checks"],
  },
  {
    slug: "victoria-de-bruijn",
    // Placeholder — swap for a real address.
    email: "victoria@example.co.uk",
    name: "Victoria de Bruijn",
    role: "Co-founder",
    field: "Architecture",
    background: "Master's in Architecture, University of Leeds",
    // Draft — edit.
    focus: "Sites, energy and physical infrastructure",
    photo: "/team/placeholder.svg",
    // Draft — edit.
    bio: [
      "Victoria de Bruijn is an architect and one of three co-founders of SovereignStrUKture, with a Master's in Architecture from the University of Leeds.",
      "Victoria leads work on the physical layer of sovereign compute: where it is sited, how it is powered and cooled, and how that infrastructure is planned and delivered across the UK.",
    ],
    responsibilities: ["Siting and planning", "Energy and cooling", "Physical infrastructure"],
  },
  {
    slug: "emma-walker",
    // Placeholder — swap for a real address.
    email: "emma@example.co.uk",
    name: "Emma Walker",
    role: "Co-founder",
    field: "Astrophysics",
    background: "University of St Andrews",
    // Draft — edit.
    focus: "Distributed compute and large-scale data",
    photo: "/team/placeholder.svg",
    // Draft — edit.
    bio: [
      "Emma Walker is an astrophysicist and one of three co-founders of SovereignStrUKture, having studied at the University of St Andrews.",
      "Astrophysics depends on distributed computing and very large datasets. Emma leads work on the compute layer: pooling accredited nodes across the UK, scheduling inference and training, and keeping large-scale data under UK jurisdiction.",
    ],
    responsibilities: ["Pooling UK compute nodes", "Scheduling inference and training", "Large-scale data handling"],
  },
];
