export default function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
  const url=process.env.SUPABASE_URL || '';
  const anonKey=process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '';
  if(!url || !anonKey) return res.status(503).json({error:'Supabase environment variables missing'});
  return res.status(200).json({url,anonKey});
}
