/**
 * Founding team — three equal co-founders, listed alphabetically by surname.
 * Drop a portrait (ideally 4:5) in /public/team and point `photo` at it; the
 * halftone is generated from the photo automatically.
 */
export interface TeamMember {
  name: string;
  role: string;
  /** Discipline, shown as the headline of their background. */
  field: string;
  /** Institution and qualification. */
  background: string;
  photo: string;
  linkedin?: string;
}

export const team: TeamMember[] = [
  {
    name: "Toby Chen",
    role: "Co-founder",
    field: "Mathematics",
    background: "First-class graduate, Queen Mary University of London",
    photo: "/team/placeholder.svg",
  },
  {
    name: "Victoria de Bruijn",
    role: "Co-founder",
    field: "Architecture",
    background: "Master's in Architecture, University of Leeds",
    photo: "/team/placeholder.svg",
  },
  {
    name: "Emma Walker",
    role: "Co-founder",
    field: "Astrophysics",
    background: "University of St Andrews",
    photo: "/team/placeholder.svg",
  },
];
