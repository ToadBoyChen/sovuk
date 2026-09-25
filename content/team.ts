/**
 * Founding team — three equal co-founders, listed alphabetically by surname.
 * Drop a portrait (ideally 4:5) in /public/team and point `photo` at it; the
 * halftone is generated from the photo automatically.
 */
export interface Location {
  name: string;
  lat: number;
  lon: number;
  /** Which side of its pin the map label sits. Default "right". */
  label?: "left" | "right";
}

export interface TeamMember {
  name: string;
  role: string;
  /** Discipline, shown as the headline of their background. */
  field: string;
  /** Institution and qualification. */
  background: string;
  photo: string;
  linkedin?: string;
  /** Where they're based, pinned on the team's UK map. */
  location: Location;
}

// Placeholder locations (each member's university) — swap for where people are based.
export const team: TeamMember[] = [
  {
    name: "Toby Chen",
    role: "Co-founder",
    field: "Mathematics",
    background: "First-class graduate, Queen Mary University of London",
    photo: "/team/placeholder.svg",
    location: { name: "London", lat: 51.507, lon: -0.128 },
  },
  {
    name: "Victoria de Bruijn",
    role: "Co-founder",
    field: "Architecture",
    background: "Master's in Architecture, University of Leeds",
    photo: "/team/placeholder.svg",
    location: { name: "Leeds", lat: 53.8, lon: -1.549 },
  },
  {
    name: "Emma Walker",
    role: "Co-founder",
    field: "Astrophysics",
    background: "University of St Andrews",
    photo: "/team/placeholder.svg",
    location: { name: "St Andrews", lat: 56.34, lon: -2.796 },
  },
];
