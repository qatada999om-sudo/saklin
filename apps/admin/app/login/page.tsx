'use client';
import { useState } from 'react';
import { API_BASE } from '../../components/auth';

export default function Login(){
  const [email,setEmail] = useState('admin@saklin.om');
  const [password,setPassword] = useState('admin123');
  const [err,setErr] = useState('');
  async function submit(e:any){ e.preventDefault(); setErr('');
    const res = await fetch(API_BASE + '/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify({email,password}) });
    if (res.ok) { window.location.href='/'; }
    else { const t = await res.text(); setErr(t || 'خطأ في تسجيل الدخول'); }
  }
  return (
    <main style={{minHeight:'100vh', display:'grid', placeItems:'center'}}>
      <form onSubmit={submit} style={{background:'#fff', border:'1px solid #eee', borderRadius:16, padding:24, width:360}}>
        <div style={{fontSize:20, fontWeight:800, marginBottom:12}}>تسجيل الدخول – ساكلن</div>
        <label style={{display:'grid', gap:6, marginBottom:10}}>البريد الإلكتروني
          <input value={email} onChange={e=>setEmail(e.target.value)} style={{padding:10, border:'1px solid #ddd', borderRadius:10}}/>
        </label>
        <label style={{display:'grid', gap:6, marginBottom:10}}>كلمة المرور
          <input type='password' value={password} onChange={e=>setPassword(e.target.value)} style={{padding:10, border:'1px solid #ddd', borderRadius:10}}/>
        </label>
        {err && <div style={{color:'#b00', fontSize:12, marginBottom:10}}>{err}</div>}
        <button type='submit' style={{width:'100%', padding:12, background:'#0E7C66', color:'#fff', border:'none', borderRadius:12}}>دخول</button>
      <div style='margin-top:10px; text-align:center'><a href='/forgot'>نسيت كلمة المرور؟</a></div></form>
    </main>
  );
}
