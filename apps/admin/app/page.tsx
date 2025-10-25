'use client';
import { useEffect, useState } from 'react';
import { api } from '../components/auth';

export default function Home(){
  const [user,setUser] = useState<any>(null);
  useEffect(()=>{ api('/auth/me').then(setUser).catch(()=>location.href='/login'); },[]);
  return (
    <main style={{padding:16}}>
      <div style={{background:'#fff', border:'1px solid #eee', borderRadius:16, padding:16}}>
        <div style={{fontWeight:800, fontSize:18}}>لوحة التحكم (محمي)</div>
        <div style={{marginTop:8, color:'#555'}}>المستخدم: {user?.user?.email || '...'}</div>
      </div>
    </main>
  );
}
