import { handleEnquiry, type EnquiryEnv } from './enquiry';

/**
 * Entry Worker for the site.
 *
 * Cloudflare serves matching static assets before this runs, so in practice
 * only paths with no corresponding file reach here. The enquiry endpoint is
 * handled directly; everything else is handed back to the asset server, which
 * also produces the 404 page.
 *
 * This replaces the Pages Function that previously lived at
 * functions/api/enquiry.ts — file-based routing is Pages-only.
 */
interface Env extends EnquiryEnv {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/enquiry') {
      if (request.method !== 'POST') {
        return new Response('Method not allowed', {
          status: 405,
          headers: { allow: 'POST' },
        });
      }
      return handleEnquiry(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
