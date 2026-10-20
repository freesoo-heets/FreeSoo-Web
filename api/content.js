export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
  const name=String(req.query.section||'');
  if(!['notices','guides','skills'].includes(name)) return res.status(400).json({error:'Invalid section'});
  const url=process.env.SUPABASE_URL;
  const key=process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if(!url || !key) return res.status(503).json({error:'Supabase not configured'});
  try {
    const response=await fetch(url.replace(/\/$/,'')+'/rest/v1/site_content?section=eq.'+name+'&select=payload', {headers:{apikey:key,Authorization:'Bearer '+key}});
    if(!response.ok) return res.status(502).json({error:'Supabase request failed'});
    const rows=await response.json();
    if(!rows.length || (name==='guides' && Array.isArray(rows[0].payload) && rows[0].payload.length===0) || (name==='skills' && (!rows[0].payload.jobs?.length)) || (name==='notices' && !rows[0].payload.notices?.length && !rows[0].payload.events?.length)) return res.status(404).json({error:'Content not migrated; use local JSON fallback'});
    return res.status(200).json(rows[0].payload);
  } catch { return res.status(502).json({error:'Content unavailable'}); }
}
