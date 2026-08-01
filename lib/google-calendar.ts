import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from './db.server';

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export async function getGoogleCalendarAuth(accessToken: string) {
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  return oauth2Client;
}

export async function getGoogleCalendarEvents(
  userId: string,
  calendarId: string,
  accessToken: string,
  startDate: Date,
  endDate: Date
) {
  try {
    // Check cache first
    const cached = await prisma.googleCalendarCache.findFirst({
      where: {
        userId,
        googleCalendarId: calendarId,
        fetchedAt: {
          gte: new Date(Date.now() - CACHE_TTL),
        },
      },
    });

    if (cached) {
      return cached.payload;
    }

    // Fetch from Google Calendar API
    const auth = await getGoogleCalendarAuth(accessToken);
    const calendar = google.calendar({ version: 'v3', auth } as any);

    const response = await calendar.events.list({
      calendarId,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    // Cache the result
    if (response.data.items) {
      await prisma.googleCalendarCache.upsert({
        where: {
          id: `${userId}-${calendarId}`,
        },
        create: {
          userId,
          googleCalendarId: calendarId,
          payload: response.data.items,
          fetchedAt: new Date(),
        },
        update: {
          payload: response.data.items,
          fetchedAt: new Date(),
        },
      });
    }

    return response.data.items || [];
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    throw error;
  }
}

export async function listGoogleCalendars(userId: string, accessToken: string) {
  try {
    const auth = await getGoogleCalendarAuth(accessToken);
    const calendar = google.calendar({ version: 'v3', auth } as any);

    const response = await calendar.calendarList.list();
    return response.data.items || [];
  } catch (error) {
    console.error('Error listing Google Calendars:', error);
    throw error;
  }
}

export async function syncGoogleCalendar(
  userId: string,
  googleCalendarId: string,
  accessToken: string,
  calendarName: string
) {
  try {
    // Create or update local calendar
    const calendar = await prisma.calendar.upsert({
      where: {
        userId_name: {
          userId,
          name: calendarName,
        },
      },
      create: {
        userId,
        name: calendarName,
        source: 'google',
        color: '#4285F4',
      },
      update: {
        source: 'google',
      },
    });

    return calendar;
  } catch (error) {
    console.error('Error syncing Google Calendar:', error);
    throw error;
  }
}
