import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const response = await fetch('/api/config',{cache:'no-store'});
if (!response.ok) throw new Error('인증 설정을 불러오지 못했습니다.');
const cfg = await response.json();
export const authClient = createClient(cfg.url,cfg.anonKey);
export async function requireMember() {
 const {data:{user},error} = await authClient.auth.getUser();
 if(error||!user){ location.replace('login.html?next='+encodeURIComponent(location.pathname+location.search)); return false; }
 document.documentElement.classList.add('member-ready');
 const slot=document.getElementById('memberActions');
 if(slot){const email=document.createElement('span');email.textContent=user.email||'회원';slot.append(email);const out=document.createElement('button');out.className='btn btn-secondary';out.textContent='로그아웃';out.addEventListener('click',async()=>{await authClient.auth.signOut();location.replace('login.html');});slot.append(out);}
 return true;
}
export async function fetchMemberContent(section) {
 const {data:{session}}=await authClient.auth.getSession();
 if(!session?.access_token)throw Error('로그인이 필요합니다.');
 const r=await fetch('/api/content?section='+encodeURIComponent(section),{headers:{Authorization:'Bearer '+session.access_token},cache:'no-store'});
 if(!r.ok)throw Error(r.status===401?'로그인 세션이 만료되었습니다.':'콘텐츠를 불러오지 못했습니다.');
 return r.json();
}
