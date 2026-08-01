import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const { limit = '50', offset = '0', unreadOnly = 'false' } = req.query;

      const logs = await prisma.notificationLog.findMany({
        where: {
          userId,
          ...(unreadOnly === 'true' && { read: false }),
        },
        orderBy: { notificationDate: 'desc' },
        take: Math.min(parseInt(limit as string, 10) || 50, 100),
        skip: parseInt(offset as string, 10) || 0,
      });

      const total = await prisma.notificationLog.count({
        where: {
          userId,
          ...(unreadOnly === 'true' && { read: false }),
        },
      });

      return res.status(200).json({
        logs,
        total,
        limit: Math.min(parseInt(limit as string, 10) || 50, 100),
        offset: parseInt(offset as string, 10) || 0,
      });
    } catch (error) {
      console.error('Error fetching notification logs:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, read } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'id is required' });
      }

      // Verify log belongs to user
      const log = await prisma.notificationLog.findUnique({
        where: { id },
      });

      if (!log || log.userId !== userId) {
        return res.status(404).json({ error: 'Notification log not found' });
      }

      const updated = await prisma.notificationLog.update({
        where: { id },
        data: {
          ...(typeof read !== 'undefined' && { read }),
        },
      });

      return res.status(200).json(updated);
    } catch (error) {
      console.error('Error updating notification log:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
