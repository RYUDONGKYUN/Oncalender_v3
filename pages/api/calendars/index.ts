import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get userId from auth (simplified)
  const userId = req.headers['x-user-id'] as string;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const calendars = await prisma.calendar.findMany({
        where: { userId },
        include: { _count: { select: { events: true } } },
      });
      return res.status(200).json(calendars);
    } catch (error) {
      console.error('Error fetching calendars:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, color, isDefault } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Calendar name is required' });
      }

      const calendar = await prisma.calendar.create({
        data: {
          userId,
          name,
          color: color || '#4285F4',
          isDefault: isDefault || false,
        },
      });

      return res.status(201).json(calendar);
    } catch (error) {
      console.error('Error creating calendar:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
