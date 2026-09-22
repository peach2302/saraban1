/**
 * Audit Log Routes
 * E-Saraban Backend
 */

import { Router, Request, Response } from 'express';
import { getAuditLogs, countAuditLogs } from '../services/auditLog.service.js';
import type { AuditAction } from '../services/auditLog.service.js';

const router = Router();

/**
 * GET /api/audit-logs
 * ดึง Audit Logs
 * Query params: action, userId, limit, offset
 */
router.get('/', (req: Request, res: Response) => {
  const action = req.query.action as AuditAction | undefined;
  const userId = req.query.userId as string | undefined;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
  const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

  const logs = getAuditLogs({ action, userId, limit, offset });

  res.json({
    success: true,
    data: {
      logs,
      total: countAuditLogs(action),
      limit,
      offset,
    },
  });
});

/**
 * GET /api/audit-logs/count
 * นับจำนวน Audit Logs
 */
router.get('/count', (req: Request, res: Response) => {
  const action = req.query.action as AuditAction | undefined;
  const count = countAuditLogs(action);

  res.json({
    success: true,
    data: { count, action: action || 'ALL' },
  });
});

export default router;
