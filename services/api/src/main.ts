import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Module, Controller, Get, Post, Patch, Delete, Body, Param, Query, Headers, Req, Res, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import * as cors from 'cors';
import * as jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const TOKEN_TTL_HOURS = Number(process.env.TOKEN_TTL_HOURS || 12);
const COOKIE_NAME = process.env.COOKIE_NAME || 'saklin_admin';
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;
const COOKIE_SECURE = (process.env.COOKIE_SECURE || 'true') === 'true';
const PUBLIC_ADMIN_URL = process.env.PUBLIC_ADMIN_URL || 'http://localhost:3000';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

type JwtUser = { sub: number; email: string; role: string };

function sign(user: any){
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: `${TOKEN_TTL_HOURS}h` });
}
function setAuthCookie(res: any, token: string){
  res.cookie(COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax', secure: COOKIE_SECURE, domain: COOKIE_DOMAIN, maxAge: TOKEN_TTL_HOURS*3600*1000, path: '/' });
}
function clearAuthCookie(res: any){ res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'lax', secure: COOKIE_SECURE, domain: COOKIE_DOMAIN, path: '/' }); }
function parseAuth(req: any){
  const c = req.cookies?.[COOKIE_NAME];
  if (c) return c;
  const h = req.headers['authorization'] as string | undefined;
  if (h && h.toLowerCase().startsWith('bearer ')) return h.slice(7);
  return null;
}
function requireAuth(req: any): JwtUser {
  const token = parseAuth(req);
  if (!token) throw new UnauthorizedException('missing token');
  try { const p: any = jwt.verify(token, JWT_SECRET); return { sub:p.sub, email:p.email, role:p.role }; }
  catch { throw new UnauthorizedException('invalid token'); }
}
function requireRole(user: JwtUser, roles: string[]){ if (!roles.includes(user.role)) throw new ForbiddenException('insufficient role'); }

async function verifyUser(email: string, password: string){
  const q = `SELECT id, email, role FROM users WHERE deleted_at IS NULL AND email = $1 AND password_hash = crypt($2, password_hash)`;
  const { rows } = await pool.query(q, [email, password]);
  return rows[0] || null;
}
async function getUserById(id: number){
  const { rows } = await pool.query('SELECT id, email, role, name, phone FROM users WHERE id=$1 AND deleted_at IS NULL', [id]);
  return rows[0] || null;
}
async function audit(actor: JwtUser | null, action: string, subject?: string, meta?: any){
  try { await pool.query('INSERT INTO audit_log(actor_id, actor_email, actor_role, action, subject, meta) VALUES ($1,$2,$3,$4,$5,$6)', [actor?.sub||null,actor?.email||null,actor?.role||null,action,subject||null,meta||null]); } catch {}
}

function sha256(x: string){ return crypto.createHash('sha256').update(x).digest('hex'); }
async function sendMail(to: string, subject: string, html: string){
  const host = process.env.SMTP_HOST, port = Number(process.env.SMTP_PORT||0), user = process.env.SMTP_USER, pass = process.env.SMTP_PASS, from = process.env.SMTP_FROM || 'Saklin <noreply@saklin.app>';
  if (!host || !port || !user || !pass) throw new BadRequestException('SMTP not configured');
  const transport = nodemailer.createTransport({ host, port, secure: port===465, auth: { user, pass } });
  await transport.sendMail({ from, to, subject, html });
}

@Controller('auth')
class AuthController {
  @Post('login')
  async login(@Body() body: any, @Res({ passthrough: true }) res: any) {
    const { email, password } = body || {};
    if (!email || !password) throw new UnauthorizedException('missing credentials');
    const user = await verifyUser(email, password);
    if (!user) throw new UnauthorizedException('invalid credentials');
    const token = sign(user);
    setAuthCookie(res, token);
    await audit({sub:user.id,email:user.email,role:user.role}, 'auth.login');
    return { ok: true, user, expires_in_hours: TOKEN_TTL_HOURS };
  }

  @Post('logout')
  async logout(@Req() req: any, @Res({ passthrough: true }) res: any) {
    const u = (()=>{ try { return requireAuth(req); } catch { return null; } })();
    clearAuthCookie(res);
    await audit(u, 'auth.logout');
    return { ok: true };
  }

  @Get('me')
  async me(@Req() req: any) {
    const u = requireAuth(req);
    const user = await getUserById(u.sub);
    if (!user) throw new UnauthorizedException('user not found');
    return { user };
  }

  @Post('forgot')
  async forgot(@Body() body: any){
    const email = (body?.email||'').toLowerCase().trim();
    if (!email) throw new BadRequestException('missing email');
    const { rows } = await pool.query('SELECT id, email FROM users WHERE deleted_at IS NULL AND email=$1', [email]);
    if (rows.length === 0) return { ok: true }; // don't leak
    const user = rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const hash = sha256(token);
    const expires = new Date(Date.now() + 1000*60*30); // 30 min
    await pool.query('INSERT INTO password_resets(user_id, token_hash, expires_at) VALUES ($1,$2,$3)', [user.id, hash, expires]);
    const link = `${PUBLIC_ADMIN_URL}/reset?token=${token}`;
    await sendMail(user.email, 'إعادة تعيين كلمة المرور – ساكلن', `<p>لإعادة تعيين كلمة المرور اضغط الرابط التالي (صالح 30 دقيقة):</p><p><a href="${link}">${link}</a></p>`);
    await audit(null, 'auth.forgot', String(user.id), { email });
    return { ok: true };
  }

  @Post('reset')
  async reset(@Body() body: any){
    const { token, password } = body || {};
    if (!token || !password) throw new BadRequestException('missing token/password');
    const hash = sha256(token);
    const { rows } = await pool.query('SELECT id, user_id, expires_at, used_at FROM password_resets WHERE token_hash=$1 ORDER BY id DESC LIMIT 1', [hash]);
    if (rows.length === 0) throw new BadRequestException('invalid token');
    const pr = rows[0];
    if (pr.used_at) throw new BadRequestException('token used');
    if (new Date(pr.expires_at).getTime() < Date.now()) throw new BadRequestException('token expired');
    await pool.query("UPDATE users SET password_hash = crypt($1, gen_salt('bf',10)) WHERE id = $2", [password, pr.user_id]);
    await pool.query('UPDATE password_resets SET used_at = NOW() WHERE id=$1', [pr.id]);
    await audit(null, 'auth.reset', String(pr.user_id));
    return { ok: true };
  }
}

@Controller('users')
class UsersController {
  @Get()
  async list(@Req() req: any, @Query('q') q?: string, @Query('role') role?: string) {
    const u = requireAuth(req); requireRole(u, ['admin','support']);
    let sql = 'SELECT id, name, email, phone, role FROM users WHERE deleted_at IS NULL';
    const params: any[] = [];
    if (q) { params.push('%'+q+'%'); sql += ` AND (email ILIKE $${params.length} OR name ILIKE $${params.length})`; }
    if (role) { params.push(role); sql += ` AND role = $${params.length}`; }
    sql += ' ORDER BY id DESC LIMIT 200';
    const { rows } = await pool.query(sql, params);
    await audit(u, 'users.list', null, { count: rows.length, q, role });
    return rows;
  }

  @Post()
  async create(@Req() req: any, @Body() body?: any) {
    const u = requireAuth(req); requireRole(u, ['admin']);
    const { name, email, phone, role, password, send_invite } = body || {};
    if (!name || !email || (!password && !send_invite) || !role) throw new BadRequestException('missing fields');
    const pwd = password || crypto.randomBytes(6).toString('hex');
    const { rows } = await pool.query(
      "INSERT INTO users (name, email, phone, role, password_hash, otp_verified) VALUES ($1,$2,$3,$4, crypt($5, gen_salt('bf',10)), true) RETURNING id, name, email, phone, role",
      [name, email, phone || null, role, pwd]
    );
    const created = rows[0];
    await audit(u, 'users.create', String(created.id), { name, email, role });
    if (send_invite) {
      const token = crypto.randomBytes(32).toString('hex');
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      const expires = new Date(Date.now() + 1000*60*60);
      await pool.query('INSERT INTO password_resets(user_id, token_hash, expires_at) VALUES ($1,$2,$3)', [created.id, hash, expires]);
      const link = `${PUBLIC_ADMIN_URL}/reset?token=${token}`;
      await sendMail(created.email, 'دعوتك إلى ساكلن (تعيين كلمة مرور)', `<p>تم إنشاء حسابك. عيّن كلمة المرور من هنا:</p><p><a href="${link}">${link}</a></p>`);
    }
    return created;
  }

  @Get(':id')
  async getOne(@Req() req: any, @Param('id') id?: string) {
    const u = requireAuth(req); requireRole(u, ['admin','support']);
    const { rows } = await pool.query('SELECT id, email, role, name, phone FROM users WHERE id=$1 AND deleted_at IS NULL', [Number(id)]);
    if (rows.length === 0) throw new UnauthorizedException('not found');
    await audit(u, 'users.get', id);
    return rows[0];
  }

  @Patch(':id')
  async update(@Req() req: any, @Param('id') id?: string, @Body() body?: any) {
    const u = requireAuth(req); requireRole(u, ['admin']);
    const fields = ['name','email','phone','role'];
    const sets: string[] = []; const params: any[] = [];
    fields.forEach((f)=>{ if (body && f in body) { params.push(body[f]); sets.push(`${f} = $${params.length}`); } });
    if (sets.length === 0) return { ok: true };
    params.push(Number(id));
    const sql = `UPDATE users SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING id, name, email, phone, role`;
    const { rows } = await pool.query(sql, params);
    await audit(u, 'users.update', id, { fields: Object.keys(body||{}) });
    return rows[0];
  }

  @Delete(':id')
  async softDelete(@Req() req: any, @Param('id') id?: string) {
    const u = requireAuth(req); requireRole(u, ['admin']);
    await pool.query('UPDATE users SET deleted_at = NOW() WHERE id = $1', [Number(id)]);
    await audit(u, 'users.delete', id);
    return { ok: true };
  }

  @Post(':id/reset_password')
  async resetPassword(@Req() req: any, @Param('id') id?: string, @Body() body?: any) {
    const u = requireAuth(req); requireRole(u, ['admin']);
    const { new_password } = body || {};
    if (!new_password) throw new BadRequestException('missing new_password');
    await pool.query("UPDATE users SET password_hash = crypt($1, gen_salt('bf',10)) WHERE id = $2", [new_password, Number(id)]);
    await audit(u, 'users.reset_password', id);
    return { ok: true };
  }
}

@Controller('audit')
class AuditController {
  @Get()
  async list(@Req() req: any, @Query('limit') limit?: string, @Query('actor') actor?: string, @Query('action') action?: string, @Query('since') since?: string) {
    const u = requireAuth(req); requireRole(u, ['admin','support']);
    let sql = 'SELECT id, at, actor_id, actor_email, actor_role, action, subject, meta FROM audit_log WHERE 1=1';
    const params: any[] = [];
    if (actor) { params.push(actor); sql += ` AND (actor_email = $${params.length} OR actor_id::text = $${params.length})`; }
    if (action) { params.push(action); sql += ` AND action = $${params.length}`; }
    if (since) { params.push(since); sql += ` AND at >= $${params.length}`; }
    sql += ' ORDER BY at DESC';
    const lim = Math.min(Number(limit||'100'), 500);
    sql += ` LIMIT ${lim}`;
    const { rows } = await pool.query(sql, params);
    await audit(u, 'audit.list', null, { count: rows.length });
    return rows;
  }
}

@Module({ controllers: [AuthController, UsersController, AuditController] })
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const origin = process.env.CORS_ORIGIN || 'http://localhost:3000';
  app.use(cors({ origin, credentials: true }));
  const cookieParser = require('cookie-parser');
  app.use(cookieParser());
  app.setGlobalPrefix('v1');
  await app.listen(process.env.PORT || 3001);
  console.log('Saklin API (v0.9) running on port', process.env.PORT || 3001);
}
bootstrap();
