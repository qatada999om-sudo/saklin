'use client';
import { useState } from 'react';
import { API_BASE } from '../../components/auth';

export default function Forgot(){
  const [email,setEmail] = useState('');
  const [ok,setOk] = useState(false); const [err,setErr] = useState('');
  async function submit(e:any){ e.preventDefault(); setErr('');
    const res = await fetch(API_BASE + '/auth/forgot', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email}) });
    if (res.ok) setOk(true); else setErr(await res.text() || 'تعذّر الإرسال');
  }
  return (
    <main style={{minHeight:'100vh', display:'grid', placeItems:'center'}}>
      <form onSubmit={submit} style={{background:'#fff', border:'1px solid #eee', borderRadius:16, padding:24, width:360}}>
        <div style={{fontSize:20, fontWeight:800, marginBottom:12}}>استعادة كلمة المرور</div>
        {!ok ? (<>
          <label style={{display:'grid', gap:6, marginBottom:10}}>البريد الإلكتروني
            <input value={email} onChange={e=>setEmail(e.target.value)} style={{padding:10, border:'1px solid #ddd', borderRadius:10}}/>
          </label>
          {err && <div style={{color:'#b00', fontSize:12, marginBottom:10}}>{err}</div>}
          <button type='submit' style={{width:'100%', padding:12, background:'#0E7C66', color:'#fff', border:'none', borderRadius:12}}>إرسال رابط التعيين</button>
        </>) : (<div>لو كان البريد موجودًا سنرسل رابط تعيين كلمة المرور.</div>)}
      </form>
    </main>
  );
}
