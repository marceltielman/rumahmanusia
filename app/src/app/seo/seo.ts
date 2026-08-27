import { Meta, Title } from '@angular/platform-browser';
import {
  DOCUMENT, inject, provideAppInitializer, type EnvironmentProviders,
} from '@angular/core';
import { ContentService } from '../content/content.service';
import config from '../../../site.config.json';

const JSONLD_ID = 'rm-structured-data';

/**
 * Search and share metadata, applied during prerender so it reaches the static
 * HTML. Crawlers and WhatsApp's link unfurler do not run the application, so
 * anything set only after hydration would be invisible to them.
 *
 * Everything editorial comes from Sanity; only the canonical origin is a
 * constant, because that is deployment configuration rather than content.
 */
export function provideSeo(): EnvironmentProviders {
  return provideAppInitializer(() => {
    const content = inject(ContentService);
    const meta = inject(Meta);
    const titleService = inject(Title);
    const doc = inject(DOCUMENT);

    const site = content.site;
    const origin = config.origin;
    const shareImage = origin + config.shareImage;

    titleService.setTitle(site.title);

    const tags: Record<string, string> = {
      'description': site.description,

      'og:type': 'website',
      'og:site_name': 'Rumah Manusia',
      'og:title': site.title,
      'og:description': site.description,
      'og:url': origin + '/',
      'og:image': shareImage,
      'og:image:width': String(config.shareImageWidth),
      'og:image:height': String(config.shareImageHeight),
      'og:image:alt': `${site.wordmark} — ${site.tagline}`,
      'og:locale': config.locale,

      'twitter:card': 'summary_large_image',
      'twitter:title': site.title,
      'twitter:description': site.description,
      'twitter:image': shareImage,
      'twitter:image:alt': `${site.wordmark} — ${site.tagline}`,
    };

    for (const [name, value] of Object.entries(tags)) {
      // og:/twitter: use `property`; the rest use `name`.
      const attr = name.startsWith('og:') ? 'property' : 'name';
      meta.updateTag({ [attr]: name, content: value }, `${attr}='${name}'`);
    }

    upsertCanonical(doc, origin + '/');
    upsertStructuredData(doc, buildStructuredData(content, origin, shareImage));
  });
}

function upsertCanonical(doc: Document, href: string) {
  let link = doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = doc.createElement('link');
    link.setAttribute('rel', 'canonical');
    doc.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

/**
 * Built imperatively rather than in a template: Angular strips `<script>` from
 * templates. `textContent` is used, never `innerHTML`, so nothing is parsed
 * as markup.
 */
function upsertStructuredData(doc: Document, graph: unknown) {
  let script = doc.getElementById(JSONLD_ID) as HTMLScriptElement | null;
  if (!script) {
    script = doc.createElement('script');
    script.id = JSONLD_ID;
    script.type = 'application/ld+json';
    doc.head.appendChild(script);
  }
  script.textContent = JSON.stringify(graph);
}

/** "0819 9009 5350 · 0853 1000 2250" -> the first number in E.164. */
function primaryPhone(whatsapp: string): string {
  return '+' + whatsapp.replace(/\D/g, '');
}

/** Indonesian postal codes are five digits and sit at the end of the address. */
function postalCode(lines: readonly string[]): string | undefined {
  const match = lines.join(', ').match(/(\d{5})\s*$/);
  return match?.[1];
}

/**
 * Only handles that map unambiguously to a profile URL are emitted. Guessing a
 * URL that 404s is worse than omitting it — the YouTube entry is a channel name
 * with no handle, so it is deliberately left out until a real URL is known.
 */
function socialProfiles(contacts: readonly { label: string; value: string }[]): string[] {
  const urls: string[] = [];
  for (const { label, value } of contacts) {
    if (label.toLowerCase() === 'instagram' && value.startsWith('@')) {
      urls.push(`https://www.instagram.com/${value.slice(1)}/`);
    }
  }
  return urls;
}

function buildStructuredData(content: ContentService, origin: string, shareImage: string) {
  const site = content.site;
  const orgId = `${origin}/#organization`;

  const places = site.offices.map((office) => ({
    '@type': 'Place',
    name: `Rumah Manusia — ${office.city}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: office.address.join(', '),
      addressLocality: office.city,
      postalCode: postalCode(office.address),
      addressCountry: 'ID',
    },
  }));

  const organization = {
    '@type': ['Organization', 'EducationalOrganization'],
    '@id': orgId,
    name: 'Rumah Manusia',
    alternateName: site.wordmark,
    url: `${origin}/`,
    logo: {
      '@type': 'ImageObject',
      url: `${origin}/assets/logo-full.png`,
    },
    image: shareImage,
    description: site.description,
    slogan: site.tagline,
    email: site.email,
    telephone: primaryPhone(site.whatsapp),
    foundingDate: '2014',
    areaServed: { '@type': 'Country', name: 'Indonesia' },
    knowsLanguage: ['id', 'en'],
    address: places[0]?.address,
    location: places,
    sameAs: socialProfiles(site.contacts),
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      value: content.team.members.length + 1,
    },
  };

  const website = {
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    url: `${origin}/`,
    name: 'Rumah Manusia',
    description: site.description,
    inLanguage: 'en',
    publisher: { '@id': orgId },
  };

  /* The catalogue is the page's real search substance — long-tail queries land
     on individual program names. Emitted as nested catalogues, one per track. */
  const catalogue = {
    '@type': 'OfferCatalog',
    '@id': `${origin}/#programs`,
    name: 'Training programs',
    provider: { '@id': orgId },
    itemListElement: content.programs.tracks.map((track) => ({
      '@type': 'OfferCatalog',
      name: track.name,
      itemListElement: track.programs.map((program) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Course',
          name: program,
          provider: { '@id': orgId },
        },
      })),
    })),
  };

  return { '@context': 'https://schema.org', '@graph': [organization, website, catalogue] };
}
