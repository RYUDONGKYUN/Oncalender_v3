import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db.server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const { anniversaryId } = req.query;

      if (anniversaryId) {
        // Get notification settings for a specific anniversary
        const settings = await prisma.anniversaryNotification.findUnique({
          where: {
            userId_anniversaryId: {
              userId,
              anniversaryId: anniversaryId as string,
            },
          },
        });

        if (!settings) {
          // Return default settings
          return res.status(200).json({
            anniversaryId,
            notifyBefore: 1,
            enabled: true,
            notificationType: 'push',
          });
        }

        return res.status(200).json(settings);
      }

      // Get all notification settings for the user
      const settings = await prisma.anniversaryNotification.findMany({
        where: { userId },
        include: { anniversary: true },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json(settings);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { anniversaryId, notifyBefore, enabled, notificationType } = req.body;

      if (!anniversaryId) {
        return res.status(400).json({ error: 'anniversaryId is required' });
      }

      // Verify anniversary belongs to user
      const anniversary = await prisma.anniversary.findFirst({
        where: { id: anniversaryId, userId },
      });

      if (!anniversary) {
        return res.status(404).json({ error: 'Anniversary not found' });
      }

      const settings = await prisma.anniversaryNotification.upsert({
        where: {
          userId_anniversaryId: {
            userId,
            anniversaryId,
          },
        },
        create: {
          userId,
          anniversaryId,
          notifyBefore: notifyBefore || 1,
          enabled: enabled !== false,
          notificationType: notificationType || 'push',
        },
        update: {
          ...(notifyBefore !== undefined && { notifyBefore }),
          ...(enabled !== undefined && { enabled }),
          ...(notificationType && { notificationType }),
        },
      });

      return res.status(200).json(settings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
