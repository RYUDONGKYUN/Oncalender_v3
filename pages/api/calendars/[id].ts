import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db.server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string;
  const { id } = req.query;

  if (!userId || !id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const calendar = await prisma.calendar.findFirst({
        where: { id: id as string, userId },
        include: { events: true },
      });

      if (!calendar) {
        return res.status(404).json({ error: 'Calendar not found' });
      }

      return res.status(200).json(calendar);
    } catch (error) {
      console.error('Error fetching calendar:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { name, color, isDefault } = req.body;

      const calendar = await prisma.calendar.updateMany({
        where: { id: id as string, userId },
        data: {
          ...(name && { name }),
          ...(color && { color }),
          ...(typeof isDefault !== 'undefined' && { isDefault }),
        },
      });

      if (calendar.count === 0) {
        return res.status(404).json({ error: 'Calendar not found' });
      }

      const updated = await prisma.calendar.findUnique({
        where: { id: id as string },
      });

      return res.status(200).json(updated);
    } catch (error) {
      console.error('Error updating calendar:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const calendar = await prisma.calendar.deleteMany({
        where: { id: id as string, userId },
      });

      if (calendar.count === 0) {
        return res.status(404).json({ error: 'Calendar not found' });
      }

      return res.status(204).send('');
    } catch (error) {
      console.error('Error deleting calendar:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
