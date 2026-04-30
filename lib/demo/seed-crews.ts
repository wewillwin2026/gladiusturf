import type { Crew } from "@/lib/shared/types";

export const CREWS: Crew[] = [
  {
    id: "cr_north",
    name: "Riverside North",
    members: [
      { name: "Devon Hayes", initials: "DH", role: "Lead" },
      { name: "Carlos Rey", initials: "CR", role: "Tech" },
      { name: "Mateo Aguilar", initials: "MA", role: "Tech" },
    ],
    vehiclePlate: "GLT-101",
    active: true,
  },
  {
    id: "cr_west",
    name: "Westshore",
    members: [
      { name: "Ana Soto", initials: "AS", role: "Lead" },
      { name: "Tyler Brooks", initials: "TB", role: "Tech" },
    ],
    vehiclePlate: "GLT-102",
    active: true,
  },
  {
    id: "cr_south",
    name: "Ballast Point",
    members: [
      { name: "Marcus James", initials: "MJ", role: "Lead" },
      { name: "Jorge Núñez", initials: "JN", role: "Tech" },
      { name: "Eli Park", initials: "EP", role: "Tech" },
    ],
    vehiclePlate: "GLT-103",
    active: true,
  },
  {
    id: "cr_downtown",
    name: "Hyde Park",
    members: [
      { name: "Bryce O'Neil", initials: "BO", role: "Lead" },
      { name: "Lila Romero", initials: "LR", role: "Tech" },
    ],
    vehiclePlate: "GLT-104",
    active: true,
  },
  {
    id: "cr_bayshore",
    name: "Bayshore",
    members: [
      { name: "Naomi Beale", initials: "NB", role: "Lead" },
      { name: "Reuben Zane", initials: "RZ", role: "Tech" },
      { name: "Saanvi Khanna", initials: "SK", role: "Tech" },
    ],
    vehiclePlate: "GLT-105",
    active: true,
  },
  {
    id: "cr_east",
    name: "Tampa East",
    members: [
      { name: "Dakota Reeves", initials: "DR", role: "Lead" },
      { name: "Imani Cole", initials: "IC", role: "Tech" },
    ],
    vehiclePlate: "GLT-106",
    active: true,
  },
];

const ROUTE_TO_CREW: Record<string, string> = {
  "R-NORTH": "cr_north",
  "R-WEST": "cr_west",
  "R-SOUTH": "cr_south",
  "R-DOWNTOWN": "cr_downtown",
  "R-BAYSHORE": "cr_bayshore",
  "R-EAST": "cr_east",
};

export function crewIdForRoute(routeId: string): string {
  return ROUTE_TO_CREW[routeId] ?? CREWS[0]!.id;
}
