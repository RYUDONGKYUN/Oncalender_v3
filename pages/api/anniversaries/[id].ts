import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db.server';
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
      const { title, category, originYear, originMonth, originDay, calendarType, leapPolicy, repeatUntilYear } = req.body;

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
          ...(title !== undefined && { title }),
          ...(category !== undefined && { category }),
          ...(originYear !== undefined && { originYear }),
          ...(originMonth !== undefined && { originMonth }),
          ...(originDay !== undefined && { originDay }),
          ...(calendarType !== undefined && { calendarType }),
          ...(leapPolicy !== undefined && { leapPolicy }),
          ...(repeatUntilYear !== undefined && { repeatUntilYear }),
        },
      });

      // Recalculate occurrences if date or calendar type changed
      const dateChanged = originYear !== anniversary.originYear ||
                         originMonth !== anniversary.originMonth ||
                         originDay !== anniversary.originDay ||
                         calendarType !== anniversary.calendarType;

      if (dateChanged || (repeatUntilYear && repeatUntilYear !== anniversary.repeatUntilYear)) {
        // Delete old occurrences
        await prisma.anniversaryOccurrence.deleteMany({
          where: { anniversaryId: id as string },
        });

        // Create new occurrences
        const currentYear = new Date().getFullYear();
        const finalYear = repeatUntilYear || 2100;
        const occurrences = [];

        for (let year = Math.max(originYear || anniversary.originYear, currentYear); year <= finalYear; year++) {
          const solarDate = getAnniversarySolarDate(
            originYear || anniversary.originYear,
            originMonth || anniversary.originMonth,
            originDay || anniversary.originDay,
            year,
            (calendarType || anniversary.calendarType) as 'solar' | 'lunar',
            (leapPolicy || anniversary.leapPolicy) as 'nearest_normal' | 'exact_only'
          );

          if (solarDate) {
            occurrences.push({
              anniversaryId: id as string,
              year,
              resolvedSolarDate: solarDate,
            });
          }
        }

        if (occurrences.length > 0) {
          await prisma.anniversaryOccurrence.createMany({
            data: occurrences,
            skipDuplicates: true,
          });
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
