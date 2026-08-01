import { NextRequest } from 'next/server';
import { prisma } from './db';

export async function getUserFromRequest(req: NextRequest): Promise<string | null> {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      const sessionCookie = req.cookies.get('session')?.value;
      if (!sessionCookie) return null;

      const session = await prisma.session.findUnique({
        where: { token: sessionCookie },
      });

      if (!session || new Date() > session.expiresAt) {
        return null;
      }

      return session.userId;
    }

    const session = await prisma.session.findUnique({
      where: { token },
    });

    if (!session || new Date() > session.expiresAt) {
      return null;
    }

    return session.userId;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export function createSessionToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
