/**
 * POST /api/enquiry
 *
 * Delivers the contact form to the enquiry address. Replaces a `mailto:`
 * handoff that silently lost submissions on mobile and webmail.
 *
 * Replies JSON to a fetch and HTML to a plain form post, so the form still
 * works with JavaScript disabled.
 *
 * Required Worker environment variables:
 *   RESEND_API_KEY   from resend.com; never committed
 *   ENQUIRY_TO       destination, e.g. layanan@rumahmanusia.com
 *   ENQUIRY_FROM     a verified sender on a domain verified in Resend,
 *                    e.g. "Rumah Manusia <website@rumahmanusia.com>"
 */

export interface EnquiryEnv {
  RESEND_API_KEY?: string;
  ENQUIRY_TO?: string;
  ENQUIRY_FROM?: string;
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Anything larger is not a contact form submission. */
const MAX_BODY_BYTES = 16 * 1024;
const MAX_FIELD = 2000;

/** A human takes longer than this to read the page and fill four fields. */
const MIN_FILL_MS = 3000;

const FIELDS = ['name', 'org', 'email', 'topic'] as const;
type Field = (typeof FIELDS)[number];

export async function handleEnquiry(request: Request, env: EnquiryEnv): Promise<Response> {
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');

  const reply = (status: number, ok: boolean, message: string) =>
    wantsJson
      ? Response.json({ ok, message }, { status })
      : htmlResponse(status, ok, message);

  try {
    const length = Number(request.headers.get('content-length') ?? 0);
    if (length > MAX_BODY_BYTES) {
      return reply(413, false, 'That submission was too large.');
    }

    const form = await readForm(request);
    if (!form) return reply(415, false, 'Unsupported content type.');

    const values = {} as Record<Field, string>;
    for (const field of FIELDS) {
      values[field] = (form.get(field) ?? '').toString().trim().slice(0, MAX_FIELD);
    }

    /* Two quiet spam signals. A bot fills every field it finds, and posts
       faster than a person can read. Neither is announced to the client. */
    const honeypot = (form.get('company_website') ?? '').toString();
    const renderedAt = Number(form.get('rendered_at') ?? 0);
    const tooFast = renderedAt > 0 && Date.now() - renderedAt < MIN_FILL_MS;
    if (honeypot || tooFast) {
      // Report success so a bot learns nothing, but send nothing.
      return reply(200, true, 'Thank you — your request has been sent.');
    }

    if (!values.name || !values.email) {
      return reply(400, false, 'Please add your name and email.');
    }
    if (!EMAIL.test(values.email)) {
      return reply(400, false, 'That email address looks incomplete.');
    }

    const to = env.ENQUIRY_TO;
    const from = env.ENQUIRY_FROM;
    const key = env.RESEND_API_KEY;
    if (!to || !from || !key) {
      console.error('enquiry: missing RESEND_API_KEY, ENQUIRY_TO or ENQUIRY_FROM');
      return reply(500, false, 'The form is not configured yet. Please email us directly.');
    }

    const sent = await send({ key, to, from, values, request });
    if (!sent.ok) {
      console.error('enquiry: provider rejected the message', sent.detail);
      return reply(502, false, 'We could not send that just now. Please try again, or email us directly.');
    }

    return reply(200, true, 'Thank you — your request has been sent. We usually reply within a day.');
  } catch (error) {
    console.error('enquiry: unhandled', error);
    return reply(500, false, 'Something went wrong. Please email us directly.');
  }
}

async function readForm(request: Request): Promise<FormData | null> {
  const type = request.headers.get('content-type') ?? '';
  if (type.includes('form')) return request.formData();
  if (type.includes('application/json')) {
    const body = (await request.json()) as Record<string, unknown>;
    const form = new FormData();
    for (const [k, v] of Object.entries(body)) form.set(k, String(v ?? ''));
    return form;
  }
  return null;
}

async function send(args: {
  key: string;
  to: string;
  from: string;
  values: Record<Field, string>;
  request: Request;
}): Promise<{ ok: boolean; detail?: string }> {
  const { key, to, from, values, request } = args;
  const subject = 'Program request' + (values.topic ? `: ${values.topic}` : '');

  const lines = [
    `Name: ${values.name}`,
    `Organization: ${values.org || '—'}`,
    `Email: ${values.email}`,
    `Program of interest: ${values.topic || '—'}`,
    '',
    `Sent from ${new URL(request.url).host}`,
    `Country: ${request.headers.get('cf-ipcountry') ?? 'unknown'}`,
  ];

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${key}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      // So a reply in the mail client goes to the enquirer, not to ourselves.
      reply_to: values.email,
      subject,
      text: lines.join('\n'),
    }),
  });

  if (response.ok) return { ok: true };
  return { ok: false, detail: `${response.status} ${await response.text()}` };
}

/** Plain confirmation for a no-JavaScript submit. Styled minimally on purpose. */
function htmlResponse(status: number, ok: boolean, message: string): Response {
  const escape = (s: string) =>
    s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

  return new Response(
    `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${ok ? 'Request sent' : 'Request not sent'} — Rumah Manusia</title>
<style>
  body { margin:0; min-height:100vh; display:grid; place-items:center; padding:24px;
         font:16px/1.6 system-ui, sans-serif; color:#201e1d; background:#ffffff; }
  main { max-width:44ch; text-align:center; }
  h1 { font-size:26px; line-height:1.2; margin:0 0 12px; font-weight:600; }
  a { display:inline-block; margin-top:22px; padding:11px 20px; border-radius:12px;
      background:#00aeef; color:#201e1d; text-decoration:none; font-weight:600; }
</style></head>
<body><main>
  <h1>${ok ? 'Thank you' : 'That did not send'}</h1>
  <p>${escape(message)}</p>
  <a href="/">Back to the site</a>
</main></body></html>`,
    { status, headers: { 'content-type': 'text/html; charset=utf-8' } }
  );
}
