import { NextApiRequest, NextApiResponse } from 'next';
import { getGoogleCalendarEvents } from '../../../lib/google-calendar';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string;
  const accessToken = req.headers['x-google-access-token'] as string;

  if (!userId || !accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const { start, end, calendarId } = req.query;

      if (!start || !end || !calendarId) {
        return res.status(400).json({ error: 'start, end, and calendarId are required' });
      }

      const startDate = new Date(start as string);
      const endDate = new Date(end as string);

      const events = await getGoogleCalendarEvents(
        userId,
        calendarId as string,
        accessToken,
        startDate,
        endDate
      );

      return res.status(200).json(events);
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
