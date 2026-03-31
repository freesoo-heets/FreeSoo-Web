
window.Freesoo = (() => {
  const cfg = Object.assign({ CDN_BASE:'', UPLOAD_API_BASE:'', WEB_ANALYTICS_SNIPPET:'' }, window.FREESOO_CONFIG || {});
  const esc = (v='') => String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  const menu = () => { const t=document.getElementById('menuToggle'); const n=document.getElementById('mainNav'); t?.addEventListener('click',()=>n.classList.toggle('open')); };
  const pinDateSort = (a,b)=> (Number(!!b.pin)-Number(!!a.pin)) || String(b.date||'').localeCompare(String(a.date||''));
  const resolveMedia = (path='') => { if(!path) return ''; if(/^https?:\/\//.test(path)) return path; const cdn=(cfg.CDN_BASE||'').replace(/\/$/,''); const p=path.replace(/^\//,''); return cdn ? `${cdn}/${p}` : path; };
  const injectAnalytics = () => { const raw=cfg.WEB_ANALYTICS_SNIPPET; if(!raw) return; const wrap=document.createElement('div'); wrap.innerHTML=raw.trim(); const s=wrap.querySelector('script'); if(!s) return; const ns=document.createElement('script'); [...s.attributes].forEach(a=>ns.setAttribute(a.name,a.value)); ns.textContent=s.textContent; document.body.appendChild(ns); };
  const getLocal = (k,f)=> { try { return JSON.parse(localStorage.getItem(k)) ?? f; } catch { return f; } };
  const setLocal = (k,v)=> localStorage.setItem(k, JSON.stringify(v));
  return { cfg, esc, menu, pinDateSort, resolveMedia, injectAnalytics, getLocal, setLocal };
})();
window.addEventListener('DOMContentLoaded', ()=>{ Freesoo.menu(); Freesoo.injectAnalytics(); });
