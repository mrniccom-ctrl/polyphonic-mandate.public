// Cloudflare Worker example: worker/worker.js
// Behavior:
// - POST /chat with JSON {"message":"..."} returns {"reply":"..."}
// - If the OPENAI_API_KEY secret is set, the worker will forward the message to OpenAI's chat completions endpoint.
// - Otherwise the worker returns a simple echo response.

const OPENAI_KEY = typeof OPENAI_API_KEY !== 'undefined' ? OPENAI_API_KEY : (globalThis.OPENAI_API_KEY ?? null);

addEventListener('fetch', event => {
  event.respondWith(handle(event.request));
});

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function handle(request) {
  if (request.method === 'OPTIONS') return new Response(null, {status:204, headers: CORS_HEADERS});
  const url = new URL(request.url);
  if (request.method !== 'POST' || !url.pathname.endsWith('/chat')) {
    return new Response('Not found', {status:404, headers: CORS_HEADERS});
  }

  let body;
  try { body = await request.json(); } catch (e) {
    return new Response(JSON.stringify({error: 'Invalid JSON'}), {status:400, headers: {...CORS_HEADERS, 'Content-Type':'application/json'}});
  }

  const message = (body && body.message) ? String(body.message) : '';
  if (message.length === 0) {
    return new Response(JSON.stringify({error:'Empty message'}), {status:400, headers: {...CORS_HEADERS, 'Content-Type':'application/json'}});
  }

  if (OPENAI_KEY) {
    try {
      const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + OPENAI_KEY,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{role:'user', content: message}],
          max_tokens: 300,
        }),
      });
      const data = await openaiResp.json();
      const reply = data?.choices?.[0]?.message?.content ?? JSON.stringify(data);
      return new Response(JSON.stringify({reply}), {status:200, headers: {...CORS_HEADERS, 'Content-Type':'application/json'}});
    } catch (err) {
      return new Response(JSON.stringify({error: 'Upstream OpenAI error', detail: String(err)}), {status:502, headers: {...CORS_HEADERS, 'Content-Type':'application/json'}});
    }
  }

  const reply = `Echo: ${message}`;
  return new Response(JSON.stringify({reply}), {status:200, headers: {...CORS_HEADERS, 'Content-Type':'application/json'}});
}
