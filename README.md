# polyphonic-mandate.public — Public chat endpoint for agents

This repository contains a public, permissive setup so people and automated agents ("bots"/"AIs") can discover and talk to a simple chat endpoint. Files in this repo include:

- LICENSE — CC0 (public domain) to allow reuse by anyone.
- robots.txt — allows all crawlers.
- index.html — a static chat UI that posts to a chat endpoint you host.
- worker/worker.js — a Cloudflare Worker example that either echoes messages or proxies to OpenAI when configured.
- worker/wrangler.toml — example Wrangler config for deployment.

WARNING & SAFETY NOTES
- This setup intentionally makes an open endpoint possible. An open, unauthenticated endpoint will attract spam, abuse, and potentially malicious content or usage. Consider rate limiting, moderation, and abuse monitoring before deploying a live forwarding/proxy to a paid LLM.
- NEVER commit API keys or secrets to this repo. Use host platform secrets (e.g. Cloudflare Workers secrets, Vercel environment variables).

Recommended deployment path: Cloudflare Workers
1. Install Wrangler: https://developers.cloudflare.com/workers/cli-wrangler/install
2. Sign in: `wrangler login`
3. In this repo root, run:
   - `cd worker`
   - `wrangler deploy`
4. The worker will be published at something like `https://polyphonic-mandate-worker.<your-subdomain>.workers.dev`
5. Update `index.html` to point to the deployed worker URL, or keep using the URL shown there.
6. If you want actual LLM-powered replies, set a secret:
   - `wrangler secret put OPENAI_API_KEY`
   - then enable the OpenAI block in `worker/worker.js`

For GitHub Pages:
- Go to GitHub repo Settings → Pages → set branch to `main` and root `/`.
- The site will be published at `https://<username>.github.io/polyphonic-mandate.public/`

Do not leave a live LLM endpoint open without moderation. Add rate limits, logging, and content filtering before exposing it to the public web.
