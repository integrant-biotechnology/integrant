// Vercel serverless function for the contact console. Lives at repo root
// /api so it deploys alongside the static Astro build — no adapter needed.
// Sends via the Resend REST API directly (no SDK dependency).
//
// Env:
//   RESEND_API_KEY — required to send; without it the endpoint answers 503
//   CONTACT_INBOX  — recipient (default admin@integrant.com.au)
//   CONTACT_FROM   — verified sender (default onboarding@resend.dev until
//                    the client's domain is verified in Resend)

// Vercel's function build has no @types/node — reach env via globalThis so
// the TypeScript pass stays clean without adding a type dependency.
const env: Record<string, string | undefined> = (globalThis as any).process?.env ?? {};

const MIN_FILL_MS = 3000;
const MAX_LEN = { name: 200, email: 320, subject: 300, message: 5000 } as const;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method' });
  }

  const body = req.body ?? {};
  const wantsJson = String(req.headers.accept ?? '').includes('application/json');

  const field = (key: string) => String(body[key] ?? '').trim();
  const name = field('name').slice(0, MAX_LEN.name);
  const email = field('email').slice(0, MAX_LEN.email);
  const subject = field('subject').slice(0, MAX_LEN.subject);
  const message = field('message').slice(0, MAX_LEN.message);

  // Spam controls: honeypot must be empty; the form must have been open for
  // a human-plausible interval. Both fail SILENTLY (200) so bots learn nothing.
  const honeypot = field('company');
  const ts = Number(field('ts'));
  if (honeypot || (Number.isFinite(ts) && ts > 0 && Date.now() - ts < MIN_FILL_MS)) {
    return respond(res, wantsJson, true);
  }

  if (!name || !subject || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'validation' });
  }

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) return res.status(503).json({ ok: false, error: 'unprovisioned' });

  const escape = (s: string) =>
    s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

  const send = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.CONTACT_FROM ?? 'Integrant website <onboarding@resend.dev>',
      to: [env.CONTACT_INBOX ?? 'admin@integrant.com.au'],
      reply_to: email,
      subject: `[integrant.com.au] ${subject}`,
      html: `<p><strong>${escape(name)}</strong> &lt;${escape(email)}&gt;</p><p>${escape(message).replace(/\n/g, '<br/>')}</p>`,
      text: `${name} <${email}>\n\n${message}`,
    }),
  });

  if (!send.ok) return res.status(502).json({ ok: false, error: 'delivery' });
  return respond(res, wantsJson, true);
}

function respond(res: any, wantsJson: boolean, ok: boolean) {
  if (wantsJson) return res.status(200).json({ ok });
  res.statusCode = 303;
  res.setHeader('Location', '/contact?sent=1');
  return res.end();
}
