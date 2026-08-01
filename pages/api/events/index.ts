import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const { start, end, calendarId } = req.query;

      if (!start || !end) {
        return res.status(400).json({ error: 'start and end dates are required' });
      }

      const startDate = new Date(start as string);
      const endDate = new Date(end as string);

      const events = await prisma.event.findMany({
        where: {
          calendar: { userId },
          ...(calendarId && { calendarId: calendarId as string }),
          startAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: { calendar: true },
        orderBy: { startAt: 'asc' },
      });

      return res.status(200).json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { calendarId, title, description, location, startAt, endAt, allDay, recurrenceRule, color, reminders } = req.body;

      if (!calendarId || !title || !startAt || !endAt) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Verify calendar belongs to user
      const calendar = await prisma.calendar.findFirst({
        where: { id: calendarId, userId },
      });

      if (!calendar) {
        return res.status(404).json({ error: 'Calendar not found' });
      }

      const event = await prisma.event.create({
        data: {
          calendarId,
          title,
          description,
          location,
          startAt: new Date(startAt),
          endAt: new Date(endAt),
          allDay: allDay || false,
          recurrenceRule,
          color,
          reminders: reminders || [],
        },
        include: { calendar: true },
      });

      return res.status(201).json(event);
    } catch (error) {
      console.error('Error creating event:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
