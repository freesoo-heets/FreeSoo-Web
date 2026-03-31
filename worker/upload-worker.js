export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '*';
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors(origin) });
    }
    if (url.pathname === '/health') {
      return json({ ok: true, bucket: env.BUCKET_NAME || 'configured' }, origin);
    }
    const auth = request.headers.get('Authorization') || '';
    if (!auth.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, origin, 401);
    if (auth.slice(7) !== env.UPLOAD_API_TOKEN) return json({ error: 'Forbidden' }, origin, 403);
    if (request.method === 'PUT' && url.pathname.startsWith('/upload/')) {
      const key = decodeURIComponent(url.pathname.replace(/^\/upload\//, ''));
      if (!key) return json({ error: 'Missing key' }, origin, 400);
      const body = await request.arrayBuffer();
      const contentType = request.headers.get('Content-Type') || 'application/octet-stream';
      const cacheControl = request.headers.get('X-Cache-Control') || 'public, max-age=31536000, immutable';
      await env.MEDIA_BUCKET.put(key, body, { httpMetadata: { contentType, cacheControl }, customMetadata: { uploadedAt: new Date().toISOString() } });
      return json({ ok: true, key }, origin);
    }
    return json({ error: 'Not found' }, origin, 404);
  }
};
function cors(origin) {
  return { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS', 'Access-Control-Allow-Headers': 'Authorization,Content-Type,X-Cache-Control', 'Access-Control-Max-Age': '86400' };
}
function json(data, origin, status=200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors(origin) } });
}
