'use client';
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export async function api(path:string, opts:any = {}){
  const res = await fetch(API_BASE + path, { 
    ...opts, 
    headers: { 'Content-Type':'application/json', ...(opts.headers||{}) },
    credentials: 'include'
  });
  if (res.status === 401) { if (typeof window !== 'undefined') window.location.href = '/login'; }
  return res.json();
}
