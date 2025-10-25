'use client';
import { useEffect, useState } from 'react';
import { API_BASE } from '../../components/auth';

export default function Reset(){
  const [pwd,setPwd] = useState(''); const [ok,setOk] = useState(false); const [err,setErr] = useState('');
  const [token,setToken] = useState('');
  useEffect(()=>{
    const url = new URL(window.location.href);
    setToken(url.searchParams.get('token') || '');
  },[]);
  async function submit(e:any){ e.preventDefault(); setErr('');
    const res = await fetch(API_BASE + '/auth/reset', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({token, password: pwd}) });
    if (res.ok) setOk(true); else setErr(await res.text() || 'تعذّر التعيين');
  }
  return (
    <main style={{minHeight:'100vh', display:'grid', placeItems:'center'}}>
      <form onSubmit={submit} style={{background:'#fff', border:'1px solid #eee', borderRadius:16, padding:24, width:360}}>
        <div style={{fontSize:20, fontWeight:800, marginBottom:12}}>تعيين كلمة مرور جديدة</div>
        {!ok ? (<>
          <label style={{display:'grid', gap:6, marginBottom:10}}>كلمة المرور الجديدة
            <input type='password' value={pwd} onChange={e=>setPwd(e.target.value)} style={{padding:10, border:'1px solid #ddd', borderRadius:10}}/>
          </label>
          {err && <div style={{color:'#b00', fontSize:12, marginBottom:10}}>{err}</div>}
          <button type='submit' style={{width:'100%', padding:12, background:'#0E7C66', color:'#fff', border:'none', borderRadius:12}}>تعيين</button>
        </>) : (<div>تم تعيين كلمة المرور. يمكنك <a href='/login'>تسجيل الدخول</a> الآن.</div>)}
      </form>
    </main>
  );
}
