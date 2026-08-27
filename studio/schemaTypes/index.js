import { site } from "./site.js";
import { hero, sections } from "./page.js";
import { services, strategies, audiences, advantages, online } from "./lists.js";
import { programs, schedule, testimonials, clients, team } from "./collections.js";

export const schemaTypes = [
  site, hero, sections,
  services, strategies, audiences, advantages, online,
  programs, schedule, testimonials, clients, team,
];

/* Desk order — also drives which types are treated as single documents. */
export const SINGLETONS = [
  { id: "site", title: "Site" },
  { id: "hero", title: "Hero" },
  { id: "sections", title: "Section headings" },
  { id: "services", title: "Services" },
  { id: "strategies", title: "Strategies" },
  { id: "audiences", title: "Formats" },
  { id: "programs", title: "Programs" },
  { id: "schedule", title: "Schedule" },
  { id: "online", title: "Online learning" },
  { id: "advantages", title: "Advantages" },
  { id: "testimonials", title: "Testimonials" },
  { id: "clients", title: "Clients" },
  { id: "team", title: "Team" },
];
