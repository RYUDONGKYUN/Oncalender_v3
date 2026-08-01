import { NextApiRequest, NextApiResponse } from 'next';
import { listGoogleCalendars, syncGoogleCalendar } from '../../../lib/google-calendar';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string;
  const accessToken = req.headers['x-google-access-token'] as string;

  if (!userId || !accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const googleCalendars = await listGoogleCalendars(userId, accessToken);
      return res.status(200).json(googleCalendars);
    } catch (error) {
      console.error('Error listing Google Calendars:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { googleCalendarId, calendarName } = req.body;

      if (!googleCalendarId || !calendarName) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const calendar = await syncGoogleCalendar(userId, googleCalendarId, accessToken, calendarName);
      return res.status(201).json(calendar);
    } catch (error) {
      console.error('Error syncing Google Calendar:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
