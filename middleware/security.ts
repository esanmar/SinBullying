import type { VercelRequest, VercelResponse } from '@vercel/node';

// Security headers middleware
export const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.vercel.app https://*.vercel-storage.com",
    "media-src 'self' blob:",
  ].join('; '),
};

// Rate limiting helper (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  req: VercelRequest,
  res: VercelResponse,
  limit: number = 10,
  windowMs: number = 60000
): boolean {
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const key = `${ip}-${req.url}`;
  const now = Date.now();
  
  const rateData = rateLimitMap.get(key);
  
  if (!rateData || now > rateData.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (rateData.count >= limit) {
    res.status(429).json({ error: 'Too many requests' });
    return false;
  }
  
  rateData.count++;
  return true;
}

// Audit log function
export interface AuditLogEntry {
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  ip: string;
  userAgent: string;
  details?: any;
}

export async function logAuditEvent(
  entry: Omit<AuditLogEntry, 'timestamp'>
): Promise<void> {
  // In production, save to database
  const logEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date(),
  };
  
  console.log('[AUDIT]', JSON.stringify(logEntry));
  
  // TODO: Save to Vercel Postgres
  // await sql`INSERT INTO audit_logs ...`;
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>"']/g, '')
    .substring(0, 10000); // Max length
}

// Validate file uploads
export function validateFileUpload(file: {
  type: string;
  size: number;
}): { valid: boolean; error?: string } {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'application/pdf',
  ];
  
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Tipo de archivo no permitido' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Archivo demasiado grande (máximo 10MB)' };
  }
  
  return { valid: true };
}
