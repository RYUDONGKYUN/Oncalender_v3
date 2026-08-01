import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string;
  const { id } = req.query;

  if (!userId || !id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const event = await prisma.event.findFirst({
        where: {
          id: id as string,
          calendar: { userId },
        },
        include: { calendar: true },
      });

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      return res.status(200).json(event);
    } catch (error) {
      console.error('Error fetching event:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { title, description, location, startAt, endAt, allDay, recurrenceRule, color, reminders } = req.body;

      // Verify event belongs to user
      const event = await prisma.event.findFirst({
        where: {
          id: id as string,
          calendar: { userId },
        },
      });

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const updated = await prisma.event.update({
        where: { id: id as string },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(location !== undefined && { location }),
          ...(startAt && { startAt: new Date(startAt) }),
          ...(endAt && { endAt: new Date(endAt) }),
          ...(typeof allDay !== 'undefined' && { allDay }),
          ...(recurrenceRule !== undefined && { recurrenceRule }),
          ...(color !== undefined && { color }),
          ...(reminders && { reminders }),
        },
        include: { calendar: true },
      });

      return res.status(200).json(updated);
    } catch (error) {
      console.error('Error updating event:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Verify event belongs to user
      const event = await prisma.event.findFirst({
        where: {
          id: id as string,
          calendar: { userId },
        },
      });

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      await prisma.event.delete({
        where: { id: id as string },
      });

      return res.status(204).send('');
    } catch (error) {
      console.error('Error deleting event:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
