window.Freesoo = {
  cfg: window.FREESOO_CONFIG || {},
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
