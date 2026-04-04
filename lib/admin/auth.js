import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// Admin yetkilendirme modülü
// TDD: İlgili testler → tests/admin/admin-auth.test.mjs

export const ADMIN_READ_ROLES = ['admin', 'superadmin'];
export const ADMIN_WRITE_ROLES = ['superadmin'];

export function normalizeRole(role) {
    return typeof role === 'string' ? role.trim().toLowerCase() : '';
}

export function isPrivilegedRole(role) {
    return ADMIN_READ_ROLES.includes(normalizeRole(role));
}

export function isSuperAdminRole(role) {
    return ADMIN_WRITE_ROLES.includes(normalizeRole(role));
}

export function isAdmin(user) {
    return isPrivilegedRole(user?.role);
}

export function canManageAdmin(user) {
    return isSuperAdminRole(user?.role);
}

export async function requireAdmin({ user } = {}) {
    if (isAdmin(user)) {
        return null;
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function requireSuperAdmin({ user } = {}) {
    if (canManageAdmin(user)) {
        return null;
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export function getRoleFromRequestHeaders(req) {
    return normalizeRole(
        req?.headers?.get?.('role') || req?.headers?.get?.('x-user-role')
    );
}

export function isAdminRequest(req) {
    return isPrivilegedRole(getRoleFromRequestHeaders(req));
}

export function isSuperAdminRequest(req) {
    return isSuperAdminRole(getRoleFromRequestHeaders(req));
}

function readAdminToken(req) {
    return req?.cookies?.get?.('admin_token')?.value || '';
}

function decodeAdminEmail(tokenValue) {
    if (!tokenValue || !tokenValue.startsWith('admin-session-token:')) {
        return '';
    }

    const base64Email = tokenValue.split(':')[1];

    try {
        return Buffer.from(base64Email, 'base64').toString('utf-8');
    } catch {
        return '';
    }
}

async function findAdminUserByEmail(email) {
    if (!email) {
        return null;
    }

    const result = await pool.query(
        'SELECT id, email, name, surname, role FROM users WHERE email = $1 LIMIT 1',
        [email]
    );

    if (result.rowCount === 0) {
        return null;
    }

    const user = result.rows[0];
    return isPrivilegedRole(user.role) ? user : null;
}

export async function getAdminUserFromCookie(req) {
    const email = decodeAdminEmail(readAdminToken(req));
    return findAdminUserByEmail(email);
}

export async function getAdminUserFromRequest(req) {
    const cookieUser = await getAdminUserFromCookie(req);
    if (cookieUser) {
        return cookieUser;
    }

    if (process.env.NODE_ENV === 'test') {
        const headerRole = getRoleFromRequestHeaders(req);

        if (isPrivilegedRole(headerRole)) {
            return { role: headerRole };
        }
    }

    return null;
}

export async function requireAdminReadAccess(req) {
    const admin = await getAdminUserFromRequest(req);
    return admin ? null : NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function requireAdminWriteAccess(req) {
    const admin = await getAdminUserFromRequest(req);

    if (canManageAdmin(admin)) {
        return null;
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
