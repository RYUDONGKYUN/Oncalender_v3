import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';
import { getAnniversarySolarDate } from '../../../lib/lunar';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string;
  const { id } = req.query;

  if (!userId || !id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const anniversary = await prisma.anniversary.findFirst({
        where: { id: id as string, userId },
        include: { occurrences: { orderBy: { year: 'asc' } } },
      });

      if (!anniversary) {
        return res.status(404).json({ error: 'Anniversary not found' });
      }

      return res.status(200).json(anniversary);
    } catch (error) {
      console.error('Error fetching anniversary:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { title, category, leapPolicy, repeatUntilYear } = req.body;

      // Verify anniversary belongs to user
      const anniversary = await prisma.anniversary.findFirst({
        where: { id: id as string, userId },
      });

      if (!anniversary) {
        return res.status(404).json({ error: 'Anniversary not found' });
      }

      // Update anniversary
      const updated = await prisma.anniversary.update({
        where: { id: id as string },
        data: {
          ...(title && { title }),
          ...(category && { category }),
          ...(leapPolicy && { leapPolicy }),
          ...(repeatUntilYear && { repeatUntilYear }),
        },
      });

      // Recalculate occurrences if repeatUntilYear changed
      if (repeatUntilYear && repeatUntilYear !== anniversary.repeatUntilYear) {
        // Delete old occurrences beyond new repeatUntilYear
        await prisma.anniversaryOccurrence.deleteMany({
          where: {
            anniversaryId: id as string,
            year: { gt: repeatUntilYear },
          },
        });

        // Create new occurrences for new years
        const currentOccurrences = await prisma.anniversaryOccurrence.findMany({
          where: { anniversaryId: id as string },
          orderBy: { year: 'desc' },
          take: 1,
        });

        const maxYear = currentOccurrences[0]?.year || anniversary.originYear;

        for (let year = maxYear + 1; year <= repeatUntilYear; year++) {
          const solarDate = getAnniversarySolarDate(
            anniversary.originYear,
            anniversary.originMonth,
            anniversary.originDay,
            year,
            anniversary.calendarType as 'solar' | 'lunar',
            leapPolicy as 'nearest_normal' | 'exact_only'
          );

          if (solarDate) {
            await prisma.anniversaryOccurrence.create({
              data: {
                anniversaryId: id as string,
                year,
                resolvedSolarDate: solarDate,
              },
            });
          }
        }
      }

      const anniversaryWithOccurrences = await prisma.anniversary.findUnique({
        where: { id: id as string },
        include: { occurrences: { orderBy: { year: 'asc' } } },
      });

      return res.status(200).json(anniversaryWithOccurrences);
    } catch (error) {
      console.error('Error updating anniversary:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Verify anniversary belongs to user
      const anniversary = await prisma.anniversary.findFirst({
        where: { id: id as string, userId },
      });

      if (!anniversary) {
        return res.status(404).json({ error: 'Anniversary not found' });
      }

      // Delete anniversary (occurrences will cascade delete)
      await prisma.anniversary.delete({
        where: { id: id as string },
      });

      return res.status(204).send('');
    } catch (error) {
      console.error('Error deleting anniversary:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
