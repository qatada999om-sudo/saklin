'use client';
import { useEffect, useState } from 'react';
import { api } from '../../components/auth';

type User = { id:number; name:string; email:string; phone?:string; role:string };

export default function UsersPage(){
  const [list,setList] = useState<User[]>([]);
  const [q,setQ] = useState('');
  const [form,setForm] = useState<any>({ name:'', email:'', phone:'', role:'admin', password:'' });
  const [editing,setEditing] = useState<User|null>(null);
  const [newPass,setNewPass] = useState('');

  async function load(){
    const qs = q ? `?q=${encodeURIComponent(q)}` : '';
    const data = await api('/users'+qs);
    setList(data);
  }
  useEffect(()=>{ load(); }, []);

  async function create(e:any){ e.preventDefault(); await api('/users',{method:'POST',body:JSON.stringify(form)}); setForm({ name:'', email:'', phone:'', role:'admin', password:'' }); await load(); }
  async function update(e:any){ e.preventDefault(); if(!editing) return; await api(`/users/${editing.id}`,{method:'PATCH', body: JSON.stringify(editing)}); setEditing(null); await load(); }
  async function remove(id:number){ if(confirm('حذف المستخدم؟')){ await api(`/users/${id}`,{method:'DELETE'}); await load(); } }
  async function resetPw(id:number){ if(!newPass) return alert('أدخل كلمة مرور جديدة'); await api(`/users/${id}/reset_password`,{method:'POST', body: JSON.stringify({ new_password:newPass })}); setNewPass(''); alert('تم تحديث كلمة المرور'); }

  return (
    <main style={{padding:16}}>
      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:12}}>
        <section style={{background:'#fff', border:'1px solid #eee', borderRadius:16, padding:16}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
            <div style={{fontWeight:800}}>المستخدمون</div>
            <div>
              <input placeholder='بحث بالاسم/البريد' value={q} onChange={e=>setQ(e.target.value)} style={{padding:8, border:'1px solid #ddd', borderRadius:8}}/>
              <button onClick={load} style={{marginInlineStart:8, padding:'8px 12px', borderRadius:8, background:'#0E7C66', color:'#fff', border:'none'}}>بحث</button>
            </div>
          </div>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead><tr><th style={{textAlign:'right'}}>#</th><th style={{textAlign:'right'}}>الاسم</th><th style={{textAlign:'right'}}>البريد</th><th style={{textAlign:'right'}}>الهاتف</th><th style={{textAlign:'right'}}>الدور</th><th /></tr></thead>
            <tbody>
              {list.map(u=>(
                <tr key={u.id} style={{borderTop:'1px solid #f2f2f2'}}>
                  <td>{u.id}</td><td>{u.name}</td><td>{u.email}</td><td>{u.phone||'—'}</td><td>{u.role}</td>
                  <td style={{textAlign:'left'}}>
                    <button onClick={()=>setEditing(u)} style={{marginInlineEnd:8}}>تعديل</button>
                    <button onClick={()=>remove(u.id)} style={{color:'#B00'}}>حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section style={{display:'grid', gap:12}}>
          <form onSubmit={create} style={{background:'#fff', border:'1px solid #eee', borderRadius:16, padding:16}}>
            <div style={{fontWeight:800, marginBottom:8}}>إنشاء مستخدم</div>
            <input placeholder='الاسم' value={form.name} onChange={e=>setForm({...form, name:e.target.value})} style={{padding:8, border:'1px solid #ddd', borderRadius:8, width:'100%', marginBottom:8}}/>
            <input placeholder='البريد' value={form.email} onChange={e=>setForm({...form, email:e.target.value})} style={{padding:8, border:'1px solid #ddd', borderRadius:8, width:'100%', marginBottom:8}}/>
            <input placeholder='الهاتف' value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} style={{padding:8, border:'1px solid #ddd', borderRadius:8, width:'100%', marginBottom:8}}/>
            <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})} style={{padding:8, border:'1px solid #ddd', borderRadius:8, width:'100%', marginBottom:8}}>
              <option value='admin'>admin</option>
              <option value='support'>support</option>
              <option value='merchant'>merchant</option>
            </select>
            <input placeholder='كلمة المرور' type='password' value={form.password} onChange={e=>setForm({...form, password:e.target.value})} style={{padding:8, border:'1px solid #ddd', borderRadius:8, width:'100%', marginBottom:8}}/>
            <button type='submit' style={{padding:'10px 12px', borderRadius:8, background:'#0E7C66', color:'#fff', border:'none', width:'100%'}}>إنشاء</button>
          </form>

          <form onSubmit={update} style={{background:'#fff', border:'1px solid #eee', borderRadius:16, padding:16}}>
            <div style={{fontWeight:800, marginBottom:8}}>تعديل مستخدم</div>
            {!editing && <div style={{color:'#777'}}>اختر مستخدمًا من الجدول</div>}
            {editing && (<>
              <input placeholder='الاسم' value={editing.name} onChange={e=>setEditing({...editing!, name:e.target.value})} style={{padding:8, border:'1px solid #ddd', borderRadius:8, width:'100%', marginBottom:8}}/>
              <input placeholder='البريد' value={editing.email} onChange={e=>setEditing({...editing!, email:e.target.value})} style={{padding:8, border:'1px solid #ddd', borderRadius:8, width:'100%', marginBottom:8}}/>
              <input placeholder='الهاتف' value={editing.phone||''} onChange={e=>setEditing({...editing!, phone:e.target.value})} style={{padding:8, border:'1px solid #ddd', borderRadius:8, width:'100%', marginBottom:8}}/>
              <select value={editing.role} onChange={e=>setEditing({...editing!, role:e.target.value})} style={{padding:8, border:'1px solid #ddd', borderRadius:8, width:'100%', marginBottom:8}}>
                <option value='admin'>admin</option>
                <option value='support'>support</option>
                <option value='merchant'>merchant</option>
              </select>
              <button type='submit' style={{padding:'10px 12px', borderRadius:8, background:'#1F3A5F', color:'#fff', border:'none', width:'100%'}}>حفظ التعديلات</button>
            </>)}
          </form>

          <div style={{background:'#fff', border:'1px solid #eee', borderRadius:16, padding:16}}>
            <div style={{fontWeight:800, marginBottom:8}}>إعادة تعيين كلمة مرور</div>
            <input placeholder='كلمة مرور جديدة' type='password' value={newPass} onChange={e=>setNewPass(e.target.value)} style={{padding:8, border:'1px solid #ddd', borderRadius:8, width:'100%', marginBottom:8}}/>
            <button onClick={()=>{ const id = editing?.id || (list[0]?.id); if(!id) return alert('اختر مستخدمًا'); resetPw(id); }} style={{padding:'10px 12px', borderRadius:8, background:'#F5B400', color:'#000', border:'none', width:'100%'}}>تحديث كلمة المرور للمحدد</button>
          </div>
        </section>
      </div>
    </main>
  );
}
