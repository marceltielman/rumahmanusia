/** Shapes mirroring the Sanity schema in studio/schemaTypes. */

export type IconName =
  | 'eye' | 'chat' | 'target' | 'brain' | 'layers' | 'clock' | 'activity'
  | 'network' | 'book' | 'award' | 'users' | 'presentation' | 'heart'
  | 'clipboard-check' | 'sliders' | 'trending-up';

export interface Link { label: string; href: string; }
export interface Labelled { label: string; value: string; }

export interface Site {
  title: string;
  description: string;
  wordmark: string;
  tagline: string;
  cta: string;
  themeColor: string;
  email: string;
  whatsapp: string;
  programColumns: number;
  collapsedPrograms: number;
  autoplayMs: number;
  quickAsks: readonly string[];
  contacts: readonly Labelled[];
  offices: readonly { city: string; address: readonly string[] }[];
  nav: readonly Link[];
  footer: {
    services: readonly string[];
    explore: readonly Link[];
    follow: readonly string[];
    legal: string;
  };
}

export interface Stat { from: number; to: number; suffix: string; label: string; }

export interface Hero {
  eyebrow: string;
  heading: string;
  lead: string;
  secondaryCta: Link;
  tags: readonly string[];
  stats: readonly Stat[];
  slots: { panel: string; wide: string };
  images: { panel: string | null; wide: string | null };
}

export interface Heading { eyebrow: string; heading?: string; lead?: string; }

export interface Sections {
  clients: { eyebrow: string };
  vision: Heading & { missionEyebrow: string; mission: readonly { title: string; body: string }[] };
  what: Heading;
  strategies: Heading;
  formats: Heading & { slots: readonly string[]; images: readonly string[] | null };
  programs: Heading & { searchLabel: string; searchPlaceholder: string; emptyNote: string };
  schedule: Heading & { playLabel: string; playHint: string; chartLabel: string };
  online: Heading & {
    modulesLabel: string; webinarsLabel: string; slot: string; image: string | null;
  };
  advantages: Heading;
  testimony: { eyebrow: string };
  team: Heading;
  cta: Heading & { secondary: Link };
  contact: Heading & {
    formTitle: string;
    fields: readonly {
      name: string; label: string; type: string;
      placeholder?: string; required?: boolean;
    }[];
  };
}

export interface Service { num: string; name: string; icon: IconName; body: string; }
export interface Advantage { num: string; title: string; icon: IconName; body: string; }
export interface Strategy { name: string; items: readonly { name: string; icon: IconName }[]; }
export interface Audience {
  name: string;
  items: readonly { num: string; title: string; body: string }[];
}
export interface Track { name: string; programs: readonly string[]; }
export interface ScheduleMonth { month: string; topics: readonly string[]; }
export interface Testimonial { quote: string; source: string; lang: string; }
export interface FeaturedClient { name: string; domain: string; logo: string | null; }
export interface TeamMember { name: string | null; photo: string | null; }

export interface Content {
  site: Site;
  hero: Hero;
  sections: Sections;
  services: readonly Service[];
  strategies: readonly Strategy[];
  audiences: readonly Audience[];
  advantages: readonly Advantage[];
  online: { modules: readonly string[]; webinars: readonly string[] };
  programs: { tracks: readonly Track[] };
  schedule: readonly ScheduleMonth[];
  testimonials: readonly Testimonial[];
  clients: { featured: readonly FeaturedClient[]; all: readonly string[] };
  team: {
    founder: { name: string; role: string; photo: string | null };
    members: readonly TeamMember[];
    note: string;
  };
}
