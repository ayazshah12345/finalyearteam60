import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { dbStore } from './db-store';
import { prisma } from './prisma';
import { User, Role } from '../types';

export async function getAuthenticatedUser(req?: Request): Promise<User> {
  // 1. Check Session Cookie (Primary persistent mechanism)
  try {
    const cookieStore = await cookies();
    const sessionUserId = cookieStore.get('sgip_session_user_id')?.value;
    if (sessionUserId) {
      const u = dbStore.getUserById(sessionUserId);
      if (u) {
        dbStore.setActiveUser(u.id);
        return u;
      }
      try {
        const dbUser = await prisma.user.findUnique({ where: { id: sessionUserId } });
        if (dbUser) {
          const formatted: User = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role as any,
            department: dbUser.department,
            batch: dbUser.batch || '2022-2026',
            semester: dbUser.semester || 6,
            rollNumber: dbUser.rollNumber || undefined,
            avatarUrl: dbUser.avatarUrl || undefined,
            cgpa: dbUser.cgpa || 8.0,
            backlogs: dbUser.backlogs || 0,
            bio: dbUser.bio || 'VSB Student',
            createdAt: dbUser.createdAt.toISOString()
          };
          dbStore.addUser(formatted);
          dbStore.setActiveUser(formatted.id);
          return formatted;
        }
      } catch (e) {}
    }
  } catch (e) {}

  // 2. Check Request Header 'x-user-id' (Direct client fetch fallback)
  if (req) {
    const headerUserId = req.headers.get('x-user-id');
    if (headerUserId) {
      const u = dbStore.getUserById(headerUserId);
      if (u) {
        dbStore.setActiveUser(u.id);
        return u;
      }
      try {
        const dbUser = await prisma.user.findUnique({ where: { id: headerUserId } });
        if (dbUser) {
          const formatted: User = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role as any,
            department: dbUser.department,
            batch: dbUser.batch || '2022-2026',
            semester: dbUser.semester || 6,
            rollNumber: dbUser.rollNumber || undefined,
            avatarUrl: dbUser.avatarUrl || undefined,
            cgpa: dbUser.cgpa || 8.0,
            backlogs: dbUser.backlogs || 0,
            bio: dbUser.bio || 'VSB Student',
            createdAt: dbUser.createdAt.toISOString()
          };
          dbStore.addUser(formatted);
          dbStore.setActiveUser(formatted.id);
          return formatted;
        }
      } catch (e) {}
    }
  }

  // 3. Fallback to in-memory active user
  return dbStore.getActiveUser();
}

export function getAuthenticatedUserSync(): User {
  return dbStore.getActiveUser();
}

export async function authorizeRole(
  allowedRoles: Role[],
  req?: Request
): Promise<{ authorized: boolean; user: User; errorResponse?: NextResponse }> {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return {
      authorized: false,
      user: null as any,
      errorResponse: NextResponse.json({ error: 'Unauthorized. Session missing. Please sign in.' }, { status: 401 })
    };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      authorized: false,
      user,
      errorResponse: NextResponse.json({ error: `Forbidden. Role ${user.role} is not permitted to access this resource.` }, { status: 403 })
    };
  }

  return { authorized: true, user };
}
