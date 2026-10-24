import {createClient} from '@supabase/supabase-js';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 const url=process.env.SUPABASE_URL,publicKey=process.env.SUPABASE_ANON_KEY||process.env.SUPABASE_PUBLISHABLE_KEY;
 const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!publicKey||!secret)return res.status(503).json({error:'계정 탈퇴 서버 설정이 필요합니다.'});
 const token=/^Bearer (.+)$/.exec(String(req.headers.authorization||''))?.[1];
 if(!token)return res.status(401).json({error:'Login required'});
 try{
  const publicClient=createClient(url,publicKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:{user},error}=await publicClient.auth.getUser(token);
  if(error||!user)return res.status(401).json({error:'Invalid session'});
  const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:isAdmin,error:adminErr}=await admin.from('site_admins').select('user_id').eq('user_id',user.id).maybeSingle();
  if(adminErr)return res.status(500).json({error:'권한 확인 실패'});
  if(isAdmin)return res.status(403).json({error:'관리자는 다른 관리자에게 권한을 이전한 뒤 탈퇴할 수 있습니다.'});
  const {data:profile,error:profileErr}=await admin.from('member_profiles').select('user_id').eq('user_id',user.id).maybeSingle();
  if(profileErr)return res.status(500).json({error:'계정 확인 실패'});
  if(!profile)return res.status(403).json({error:'프로필 확인 후 탈퇴할 수 있습니다.'});
  // Confirm possession of account password immediately before permanent deletion.
  if(typeof req.body?.password!=='string'||!user.email)return res.status(400).json({error:'비밀번호 확인이 필요합니다.'});
  const {error:reauthError}=await publicClient.auth.signInWithPassword({email:user.email,password:req.body.password});
  if(reauthError)return res.status(403).json({error:'비밀번호가 일치하지 않습니다.'});
  const {error:deleteError}=await admin.auth.admin.deleteUser(user.id);
  if(deleteError)return res.status(409).json({error:'계정 탈퇴 실패: 연동된 Storage 파일 등 확인이 필요합니다.'});
  return res.status(200).json({success:true});
 }catch{return res.status(500).json({error:'탈퇴 처리 중 오류가 발생했습니다.'});}
}
