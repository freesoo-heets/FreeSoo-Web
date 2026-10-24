export default async function handler(req,res) {
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 const section=String(req.query.section||'');
 if(!['notices','guides','skills'].includes(section))return res.status(400).json({error:'Invalid section'});
 const url=process.env.SUPABASE_URL;
 const key=process.env.SUPABASE_ANON_KEY||process.env.SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return res.status(503).json({error:'Supabase not configured'});
 const match=/^Bearer (.+)$/.exec(String(req.headers.authorization||''));
 if(!match)return res.status(401).json({error:'Login required'});
 try{
  const valid=await fetch(url.replace(/\/$/,'')+'/auth/v1/user',{headers:{apikey:key,Authorization:'Bearer '+match[1]}});
  if(!valid.ok)return res.status(401).json({error:'Invalid session'});
  const response=await fetch(url.replace(/\/$/,'')+'/rest/v1/site_content?section=eq.'+section+'&select=payload',{
    headers:{apikey:key,Authorization:'Bearer '+match[1]}
  });
  if(!response.ok)return res.status(502).json({error:'Content access failed'});
  const rows=await response.json();
  if(!rows.length)return res.status(404).json({error:'Content not found'});
  return res.status(200).json(rows[0].payload);
 }catch{return res.status(502).json({error:'Content unavailable'});}
}
