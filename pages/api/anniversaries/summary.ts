import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';
import { calculateDday, getAnniversaryAge } from '../../../lib/lunar';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const { days = '30' } = req.query;
      const daysCount = parseInt(days as string, 10) || 30;

      const now = new Date();
      const futureDate = new Date(now.getTime() + daysCount * 24 * 60 * 60 * 1000);

      // Get all anniversaries for the user
      const anniversaries = await prisma.anniversary.findMany({
        where: { userId },
        include: { occurrences: true },
      });

      // Calculate upcoming anniversaries
      const upcoming = [];

      for (const anniversary of anniversaries) {
        const currentYear = now.getFullYear();

        // Find occurrences within the time range
        for (const occurrence of anniversary.occurrences) {
          if (occurrence.year >= currentYear) {
            if (
              occurrence.resolvedSolarDate >= now &&
              occurrence.resolvedSolarDate <= futureDate
            ) {
              const dday = calculateDday(occurrence.resolvedSolarDate, now);
              const age = getAnniversaryAge(anniversary.originYear, occurrence.year);

              upcoming.push({
                id: anniversary.id,
                title: anniversary.title,
                category: anniversary.category,
                date: occurrence.resolvedSolarDate,
                year: occurrence.year,
                dday,
                age,
                originYear: anniversary.originYear,
              });
            }
          }
        }
      }

      // Sort by date
      upcoming.sort((a, b) => a.date.getTime() - b.date.getTime());

      return res.status(200).json({
        upcomingCount: upcoming.length,
        days: daysCount,
        upcoming,
      });
    } catch (error) {
      console.error('Error fetching anniversary summary:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
