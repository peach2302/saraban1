/**
 * Audit Log Service
 * E-Saraban — ระบบสารบรรณอิเล็กทรอนิกส์
 * 
 * บันทึก Audit Log สำหรับทุก Action สำคัญ
 * ตามกฎ: ทุก Action สำคัญต้องมี Audit Log
 * 
 * Phase 1A: เก็บ Log ใน Memory (จะเปลี่ยนเป็น Google Sheets ใน Phase ถัดไป)
 */

export type AuditAction =
  // Connection
  | 'CONNECTION_TEST'
  | 'SCHEMA_DISCOVERY'
  // Read
  | 'SHEET_READ'
  | 'SHEET_HEADERS_READ'
  | 'SHEET_METADATA_READ'
  | 'SHEET_NAMES_READ'
  | 'ROW_FIND'
  // Write
  | 'ROW_APPEND'
  | 'ROW_UPDATE'
  | 'BATCH_UPDATE'
  // Auth (Phase ถัดไป)
  | 'LOGIN'
  | 'LOGOUT'
  | 'TOKEN_REFRESH'
  // System
  | 'SYSTEM_START'
  | 'SYSTEM_ERROR'
  | 'CONFIG_CHANGE';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: AuditAction;
  userId?: string;
  userName?: string;
  resource?: string;
  details?: Record<string, unknown>;
  status: 'SUCCESS' | 'FAILURE' | 'ERROR';
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
}

// In-memory store (จะเปลี่ยนเป็น Google Sheets ใน Phase ถัดไป)
const auditLogs: AuditLogEntry[] = [];
const MAX_LOGS = 10000;

let logCounter = 0;

/**
 * สร้าง Audit Log Entry
 */
export function createAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
  logCounter++;

  const log: AuditLogEntry = {
    ...entry,
    id: `audit_${Date.now()}_${logCounter}`,
    timestamp: new Date().toISOString(),
  };

  auditLogs.push(log);

  // จำกัดจำนวน logs ใน memory
  if (auditLogs.length > MAX_LOGS) {
    auditLogs.splice(0, auditLogs.length - MAX_LOGS);
  }

  // Log to console
  const statusIcon = log.status === 'SUCCESS' ? '✅' : log.status === 'FAILURE' ? '❌' : '⚠️';
  console.log(
    `[AUDIT] ${statusIcon} ${log.action} | ${log.resource || 'N/A'} | ${log.status}` +
    (log.userId ? ` | User: ${log.userId}` : '')
  );

  return log;
}

/**
 * ดึง Audit Logs ทั้งหมด
 */
export function getAuditLogs(options?: {
  action?: AuditAction;
  userId?: string;
  limit?: number;
  offset?: number;
}): AuditLogEntry[] {
  let filtered = [...auditLogs];

  if (options?.action) {
    filtered = filtered.filter((log) => log.action === options.action);
  }

  if (options?.userId) {
    filtered = filtered.filter((log) => log.userId === options.userId);
  }

  // เรียงจากใหม่ไปเก่า
  filtered.reverse();

  const offset = options?.offset || 0;
  const limit = options?.limit || 50;

  return filtered.slice(offset, offset + limit);
}

/**
 * นับจำนวน Audit Logs
 */
export function countAuditLogs(action?: AuditAction): number {
  if (action) {
    return auditLogs.filter((log) => log.action === action).length;
  }
  return auditLogs.length;
}

/**
 * Middleware สำหรับ Express
 * เพิ่ม audit log ให้กับ request
 */
export function auditMiddleware(action: AuditAction, resourceExtractor?: (req: any) => string) {
  return (req: any, res: any, next: any) => {
    const originalSend = res.send;

    res.send = function (body: any) {
      const resource = resourceExtractor ? resourceExtractor(req) : req.path;
      const statusCode = res.statusCode;

      createAuditLog({
        action,
        resource,
        status: statusCode >= 400 ? 'FAILURE' : 'SUCCESS',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          method: req.method,
          path: req.path,
          statusCode,
        },
      });

      return originalSend.call(this, body);
    };

    next();
  };
}
