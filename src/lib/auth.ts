import { NextResponse } from 'next/server';
import { dbStore } from './db-store';
import { User, Role } from '../types';

export function getAuthenticatedUser(): User {
  return dbStore.getActiveUser();
}

export function authorizeRole(allowedRoles: Role[]): { authorized: boolean; user: User; errorResponse?: NextResponse } {
  const user = getAuthenticatedUser();
  if (!user) {
    return {
      authorized: false,
      user: null as any,
      errorResponse: NextResponse.json({ error: 'Unauthorized. Session missing.' }, { status: 401 })
    };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      authorized: false,
      user,
      errorResponse: NextResponse.json({ error: `Forbidden. Role ${user.role} cannot perform this action.` }, { status: 403 })
    };
  }

  return { authorized: true, user };
}
