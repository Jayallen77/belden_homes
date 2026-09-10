# VPS deployment

The launch target is the owner's VPS with Google Workspace/Gmail email. No live deployment, DNS change, or real test email has been performed in this task.

## Runtime

Use Node.js 22 or newer. Install the locked dependencies with `pnpm install --frozen-lockfile`, then run `pnpm build`. Serve the site through `node server/index.mjs`; do not expose the repository with a generic static server. The server serves only `dist/client`, keeps source spreadsheets and credentials private, and handles `/api/inquiry`.

The build regenerates all public HTML from `data/belden-models.json`, `data/business.json`, and `scripts/render-site.mjs`. Shared hours and contact information come from one business record. `pnpm test` runs mail-handler tests using an in-memory mail transport; those tests do not send email.

## Gmail delivery

Copy `.env.example` into a protected server environment file, such as `/etc/belden.env`, readable only by the service administrator. Set `SMTP_USER` to the real Google Workspace mailbox used to send and `SMTP_PASS` to its app password. If inquiries@ is an alias, authenticate with the actual mailbox account; the destination is still fixed to inquiries@beldenhomesinc.com in the handler. Gmail app passwords require two-step verification and may be restricted by Workspace policy. See https://support.google.com/accounts/answer/185833 and https://nodemailer.com/usage/using-gmail/.

The default connection is smtp.gmail.com with implicit TLS on port 465. Port 587 with STARTTLS is also supported. The VPS must allow outbound access to the selected SMTP port. Do not use a normal Google account password. Do not put credentials in client code, Git, or this document.

Set `PUBLIC_ORIGIN` to the exact canonical HTTPS origin. The production server refuses to start without the SMTP credentials and HTTPS origin. A successful SMTP authentication check is not evidence of inbox receipt.

To verify the configuration without sending mail, load the same environment securely and run `node server/verify-smtp.mjs`. After deployment and owner authorization, submit one clearly identified inquiry and check receipt in the destination inbox, including spam and Reply-To. Only then mark live delivery verified.

## Service and HTTPS

Example Linux files are in `deploy/`. The systemd unit assumes the application at `/var/www/belden`, a dedicated `belden` user/group, Node at `/usr/bin/node`, and environment values in `/etc/belden.env`. Adjust those paths to the VPS. The unit gives the service write access only to its private state directory at `/var/lib/belden`.

The Caddy example redirects the apex domain to www, terminates HTTPS, compresses responses, and proxies to 127.0.0.1:3000. It overwrites X-Real-IP with the connecting client address. Use `TRUST_PROXY=true` only with that trusted local proxy. Never expose the Node port publicly while trusting user-supplied IP headers. Coordinate this configuration with existing VPS sites; do not replace an existing proxy configuration blindly.

## Inquiry behavior

- Required fields and length limits are checked in both the browser and server; unknown model names are rejected.
- A hidden spam field, same-origin checks, a 16 KB body limit, and a per-IP attempt limit reduce abuse.
- The recipient is fixed. User input cannot change the destination or inject mail headers.
- Success is returned only when SMTP accepts the intended recipient. This is server acceptance, not proof of final inbox delivery.
- A private journal records request IDs, payload hashes, timestamps, and pending/accepted states, without storing form contents. Accepted retries return success without a second message. Uncertain delivery states require contacting Belden rather than risking automatic duplicates.
- SMTP failure and missing configuration produce a clear error and retain browser form entries. Native submissions without JavaScript receive a readable response page.
- The attempt limiter is designed for one VPS process. A multi-instance deployment needs a shared limiter and atomic shared journal.

## Before domain cutover

Resolve the model-source items in `docs/launch-review.md`; confirm SMTP authentication and an authorized end-to-end inbox test; verify the production certificate, canonical host, redirects, and contact form from an external connection. Keep the prior site available for rollback until those checks pass. The existing Sites configuration is retained for historical compatibility, but a Sites-only deployment does not include the VPS SMTP process.
