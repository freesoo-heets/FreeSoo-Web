const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
const allowed = { '.mp4': ['video/mp4'], '.webm': ['video/webm'], '.mov': ['video/quicktime'], '.jpg': ['image/jpeg'], '.jpeg': ['image/jpeg'], '.png': ['image/png'], '.webp': ['image/webp'] };
function cors(origin, env) {
  const permitted = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const ok = permitted.includes(origin);
  return { ...(ok ? { 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin' } : {}), 'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS', 'Access-Control-Allow-Headers': 'Authorization,Content-Type', 'Access-Control-Max-Age': '600' };
}
function json(payload, origin, env, status = 200) { return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...cors(origin, env) } }); }
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin, env) });
    if (url.pathname === '/health' && request.method === 'GET') return json({ ok: true }, origin, env);
    const auth = request.headers.get('Authorization') || '';
    if (!env.UPLOAD_API_TOKEN || !auth.startsWith('Bearer ') || auth.slice(7) !== env.UPLOAD_API_TOKEN)
      return json({ error: 'Unauthorized' }, origin, env, 401);
    if (url.pathname === '/auth' && request.method === 'GET') return json({ ok: true }, origin, env);
    if (request.method !== 'PUT' || !url.pathname.startsWith('/upload/')) return json({ error: 'Not found' }, origin, env, 404);
    let key;
    try { key = decodeURIComponent(url.pathname.slice('/upload/'.length)); }
    catch { return json({ error: 'Invalid key' }, origin, env, 400); }
    if (!key || key.length > 240 || key.includes('..') || key.startsWith('/') || key.includes('\\') || /[\x00-\x1F]/.test(key))
      return json({ error: 'Invalid key' }, origin, env, 400);
    const ext = key.slice(key.lastIndexOf('.')).toLowerCase();
    const type = (request.headers.get('Content-Type') || '').split(';')[0].toLowerCase();
    if (!allowed[ext]?.includes(type)) return json({ error: 'Unsupported media type' }, origin, env, 415);
    const length = Number(request.headers.get('Content-Length') || 0);
    if (length > MAX_UPLOAD_BYTES) return json({ error: 'File too large' }, origin, env, 413);
    const body = await request.arrayBuffer();
    if (!body.byteLength || body.byteLength > MAX_UPLOAD_BYTES) return json({ error: 'Invalid file size' }, origin, env, 413);
    const cacheControl = 'public, max-age=604800';
    await env.MEDIA_BUCKET.put(key, body, { httpMetadata: { contentType: type, cacheControl }, customMetadata: { uploadedAt: new Date().toISOString() } });
    return json({ ok: true, key }, origin, env);
  }
};