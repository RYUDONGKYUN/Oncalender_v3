import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';
import { getAnniversarySolarDate, getAnniversaryAge } from '../../../lib/lunar';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const anniversaries = await prisma.anniversary.findMany({
        where: { userId },
        include: { occurrences: { orderBy: { year: 'asc' } } },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json(anniversaries);
    } catch (error) {
      console.error('Error fetching anniversaries:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, category, originYear, originMonth, originDay, calendarType, isLeapMonth, leapPolicy, repeatUntilYear } = req.body;

      if (!title || !originYear || !originMonth || !originDay) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const anniversary = await prisma.anniversary.create({
        data: {
          userId,
          title,
          category: category || '기타',
          originYear,
          originMonth,
          originDay,
          calendarType: calendarType || 'solar',
          isLeapMonth: isLeapMonth || false,
          leapPolicy: leapPolicy || 'nearest_normal',
          repeatUntilYear: repeatUntilYear || 2100,
        },
      });

      // Create anniversary occurrences for all years
      const currentYear = new Date().getFullYear();
      const occurrences = [];

      for (let year = Math.max(originYear, currentYear); year <= repeatUntilYear; year++) {
        const solarDate = getAnniversarySolarDate(originYear, originMonth, originDay, year, calendarType as 'solar' | 'lunar', leapPolicy as 'nearest_normal' | 'exact_only');

        if (solarDate) {
          occurrences.push({
            anniversaryId: anniversary.id,
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

      const anniversaryWithOccurrences = await prisma.anniversary.findUnique({
        where: { id: anniversary.id },
        include: { occurrences: { orderBy: { year: 'asc' } } },
      });

      return res.status(201).json(anniversaryWithOccurrences);
    } catch (error) {
      console.error('Error creating anniversary:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
