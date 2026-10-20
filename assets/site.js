window.Freesoo = {
  cfg: window.FREESOO_CONFIG || {},
  async fetchContent(section, fallbackPath) {
    try {
      const response = await fetch('/api/content?section=' + encodeURIComponent(section), {cache:'no-store'});
      if (!response.ok) throw new Error('Supabase unavailable');
      return response.json();
    } catch {
      const local = await fetch(fallbackPath);
      if (!local.ok) throw new Error('콘텐츠 로드 실패');
      return local.json();
    }
  },
  async fetchContent(section, fallbackPath) {
    try {const r=await fetch('/api/content?section='+encodeURIComponent(section),{cache:'no-store'});if(!r.ok)throw Error('Supabase unavailable');return r;}
    catch {const r=await fetch(fallbackPath);if(!r.ok)throw Error('콘텐츠 로드 실패');return r;}
  },
  getLocal(key, fallback = null) {
    try { const raw = localStorage.getItem('freesoo:' + key); return raw === null ? fallback : JSON.parse(raw); }
    catch { return fallback; }
  },
  setLocal(key, value) {
    try { localStorage.setItem('freesoo:' + key, JSON.stringify(value)); return true; }
    catch { return false; }
  },
  async authorizeUpload(token) {
    const base = String(this.cfg.UPLOAD_API_BASE || '').replace(/\/$/, '');
    if (!base || !/^https:\/\//i.test(base)) throw new Error('UPLOAD_API_BASE HTTPS 설정이 필요합니다.');
    const response = await fetch(base + '/auth', { headers: { Authorization: 'Bearer ' + token }, cache: 'no-store' });
    if (!response.ok) throw new Error('업로드 인증 실패: Worker 토큰을 확인하세요.');
    return true;
  },
  esc(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  },
  pinDateSort(a, b) {
    const pinA = Boolean(a?.pin);
    const pinB = Boolean(b?.pin);
    if (pinA !== pinB) return Number(pinB) - Number(pinA);
    return String(b?.date || '').localeCompare(String(a?.date || ''));
  },
  resolveMedia(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    const base = (window.FREESOO_CONFIG?.CDN_BASE || '').replace(/\/$/, '');
    if (!base) return path;
    return `${base}/${String(path).replace(/^\//, '')}`;
  },
  initMenu(activeKey) {
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.getElementById('mainNav');
    menuToggle?.addEventListener('click', () => nav?.classList.toggle('open'));
    if (activeKey) {
      document.querySelector(`[data-nav="${activeKey}"]`)?.classList.add('active');
    }
  }
};
