'use client';
import { useEffect, useState } from 'react';
import { api } from '../../components/auth';

export default function AuditPage(){
  const [rows,setRows] = useState<any[]>([]);
  const [action,setAction] = useState(''); const [actor,setActor] = useState('');
  async function load(){ const q = new URLSearchParams({ ...(action?{action}:{}), ...(actor?{actor}:{}), limit:'200' }).toString(); const data = await api('/audit?'+q); setRows(data); }
  useEffect(()=>{ load(); }, []);
  return (
    <main style={{padding:16}}>
      <div style={{display:'flex', gap:8, marginBottom:8}}>
        <input placeholder='فلترة بـ action' value={action} onChange={e=>setAction(e.target.value)} style={{padding:8, border:'1px solid #ddd', borderRadius:8}}/>
        <input placeholder='فلترة بـ actor (بريد/معرّف)' value={actor} onChange={e=>setActor(e.target.value)} style={{padding:8, border:'1px solid #ddd', borderRadius:8}}/>
        <button onClick={load} style={{padding:'8px 12px', borderRadius:8, background:'#0E7C66', color:'#fff', border:'none'}}>تطبيق</button>
      </div>
      <table style={{width:'100%', borderCollapse:'collapse'}}>
        <thead><tr><th>الوقت</th><th>العملية</th><th>الفاعل</th><th>الموضوع</th><th>تفاصيل</th></tr></thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i} style={{borderTop:'1px solid #f1f1f1'}}>
              <td>{new Date(r.at).toLocaleString('ar-EG')}</td>
              <td>{r.action}</td>
              <td>{r.actor_email||r.actor_id||'—'} ({r.actor_role||'—'})</td>
              <td>{r.subject||'—'}</td>
              <td><pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(r.meta||{}, null, 2)}</pre></td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
