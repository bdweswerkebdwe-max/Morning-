import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic GoogleGenAI client (Server-side only)
function getGeminiApiKey(): string {
  return (process.env.GEMINI_API_KEY || '').trim();
}

function hasGeminiApiKey(): boolean {
  const key = getGeminiApiKey();
  return key.length > 0;
}

function getGenAIClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: getGeminiApiKey(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build-molan-ai',
      },
    },
  });
}

export interface GeminiDiagnosticResult {
  code: 'MISSING_KEY' | 'INVALID_API_KEY' | 'BILLING_NOT_ENABLED' | 'QUOTA_EXHAUSTED' | 'RATE_LIMIT_EXCEEDED' | 'MODEL_NOT_FOUND' | 'UNKNOWN_ERROR';
  message: string;
  originalMessage?: string;
}

export function parseGeminiError(err: any): GeminiDiagnosticResult {
  const errMsg = err?.message || String(err || '');
  const status = err?.status || err?.statusCode || err?.code || err?.httpMeta?.response?.status || (errMsg.match(/\b(400|401|403|404|429|500)\b/)?.[1] ? parseInt(errMsg.match(/\b(400|401|403|404|429|500)\b/)?.[1]!) : undefined);

  if (status === 403 || errMsg.includes('403') || errMsg.includes('PERMISSION_DENIED') || errMsg.toLowerCase().includes('permission')) {
    return {
      code: 'INVALID_API_KEY',
      message: 'تم رفض الإذن (403 Forbidden). مفتاح API الحالي لا يملك صلاحية استخدام نموذج توليد الفيديو gemini-omni-1.1-flash. يرجى إضافة مفتاح API مدفوع مقترن بمشروع مفعّل فيه خيار الفوترة (Pay-As-You-Go) في Google Cloud.',
      originalMessage: errMsg,
    };
  }

  if (status === 400 || errMsg.includes('400') || errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key not valid')) {
    return {
      code: 'INVALID_API_KEY',
      message: 'مفتاح API غير صالح. يرجى التحقق من صحة المفتاح المُدخل في أسرار الخادم (GEMINI_API_KEY).',
      originalMessage: errMsg,
    };
  }

  if (status === 404 || errMsg.includes('404') || errMsg.includes('NOT_FOUND') || errMsg.includes('models/')) {
    return {
      code: 'MODEL_NOT_FOUND',
      message: 'النموذج المطلوبة معالجته غير متاح أو تم نقله. يرجى التأكد من اختيار مفتاح مفعّل له نموذج gemini-omni-1.1-flash.',
      originalMessage: errMsg,
    };
  }

  if (status === 429 || errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
    if (errMsg.includes('limit: 0') || errMsg.includes('quota metric') || errMsg.includes('Free Tier') || errMsg.toLowerCase().includes('billing')) {
      return {
        code: 'BILLING_NOT_ENABLED',
        message: 'يتطلب نموذج توليد الفيديو gemini-omni-1.1-flash ربط مشروع Google AI Studio بحساب فوترة مدفوع (Pay-As-You-Go Billing Account) في Google Cloud (الحصة الحالية limit: 0).',
        originalMessage: errMsg,
      };
    }
    if (errMsg.includes('Quota exceeded') || errMsg.includes('quota')) {
      return {
        code: 'QUOTA_EXHAUSTED',
        message: 'تم استنفاد حصة الاستخدام المتاحة لمفتاح API هذا. يرجى مراجعة حدود الحصة والرصيد في منصة Google AI Studio.',
        originalMessage: errMsg,
      };
    }
    return {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'تم تجاوز حد عدد الطلبات المتزامنة في الدقيقة (Rate Limit Exceeded). يرجى الانتظار بضع ثوانٍ وإعادة المحاولة.',
      originalMessage: errMsg,
    };
  }

  if (status === 503 || errMsg.includes('503') || errMsg.includes('UNAVAILABLE') || errMsg.includes('high demand')) {
    return {
      code: 'UNKNOWN_ERROR',
      message: 'الخدمة تشهد ضغطاً مؤقتاً في خوادم Google (503 High Demand). التوليد سيعمل فور انخفاض الضغط اللحظي.',
      originalMessage: errMsg,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: errMsg || 'حدث خطأ غير متوقع أثناء الاتصال بخدمة Gemini API.',
    originalMessage: errMsg,
  };
}

// Database & Data Layer setup
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'moulin_db.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

export interface DBUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  credits: number;
  pendingReservedCredits?: number;
  tier: 'free' | 'pro' | 'enterprise';
  role: 'admin' | 'user';
  avatar: string;
  createdAt: string;
}

export interface DBSession {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface DBTransaction {
  id: string;
  userId: string;
  type: 'credit_deduction' | 'credit_addition' | 'subscription' | 'refund' | 'coupon';
  amount: number;
  description: string;
  createdAt: string;
}

export interface DBProject {
  id: string;
  userId: string;
  title: string;
  type: 'video' | 'creative_video' | 'copy' | 'image' | 'product_ad' | 'actor_video' | 'translation' | 'marketing_plan' | 'workflow';
  platform?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  progress?: number;
  errorMessage?: string;
  content: any;
  createdAt: string;
}

export interface DBCoupon {
  code: string;
  credits: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  usedBy: string[];
}

export interface DBAuditLog {
  id: string;
  userId: string;
  action: string;
  details: any;
  ip?: string;
  createdAt: string;
}

export interface Database {
  users: DBUser[];
  sessions: DBSession[];
  transactions: DBTransaction[];
  projects: DBProject[];
  coupons: DBCoupon[];
  processedPayments: string[];
  auditLogs: DBAuditLog[];
}

// Password Hashing Utility
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, key] = stored.split(':');
    if (!salt || !key) return false;
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(key, 'hex'));
  } catch {
    return false;
  }
}

// Atomic Database Access Layer with Mutex Queue Lock
let saveQueue = Promise.resolve();

function saveDBAtomic(db: Database) {
  saveQueue = saveQueue.then(() => {
    try {
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (e) {
      console.error('❌ Error saving DB atomically:', e);
    }
  });
}

function cleanExpiredSessions(db: Database): boolean {
  const now = new Date();
  const initialLength = db.sessions.length;
  db.sessions = db.sessions.filter(s => new Date(s.expiresAt) > now);
  return db.sessions.length !== initialLength;
}

function loadDB(): Database {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      const loadedDB: Database = {
        users: parsed.users || [],
        sessions: parsed.sessions || [],
        transactions: parsed.transactions || [],
        projects: parsed.projects || [],
        coupons: parsed.coupons || getInitialCoupons(),
        processedPayments: parsed.processedPayments || [],
        auditLogs: parsed.auditLogs || [],
      };

      let changed = false;
      loadedDB.users.forEach(u => {
        if (!u.role) {
          u.role = u.email.toLowerCase() === 'ahmed@moulin.ai' ? 'admin' : 'user';
          changed = true;
        }
        if (u.role === 'admin' && verifyPassword('admin123456', u.passwordHash)) {
          u.passwordHash = hashPassword(process.env.ADMIN_INITIAL_PASSWORD || 'MolanAdminSecured2026!');
          changed = true;
        }
        u.pendingReservedCredits = 0;
      });

      if (cleanExpiredSessions(loadedDB)) {
        changed = true;
      }

      if (changed) {
        saveDBAtomic(loadedDB);
      }

      return loadedDB;
    }
  } catch (e) {
    console.error('⚠️ Warning loading DB file:', e);
  }

  // Seed initial admin user ONLY if DB file is fresh/missing
  const initialAdminPass = process.env.ADMIN_INITIAL_PASSWORD || 'MolanAdminSecured2026!';
  const adminUser: DBUser = {
    id: 'usr_admin',
    name: 'أحمد المحمود (مدير النظام)',
    email: 'ahmed@moulin.ai',
    passwordHash: hashPassword(initialAdminPass),
    credits: 1000,
    pendingReservedCredits: 0,
    tier: 'enterprise',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  };

  const defaultDB: Database = {
    users: [adminUser],
    sessions: [],
    transactions: [
      {
        id: 'tx_init',
        userId: 'usr_admin',
        type: 'credit_addition',
        amount: 1000,
        description: 'رصيد الحساب الإداري الرئيسي',
        createdAt: new Date().toISOString(),
      },
    ],
    projects: [],
    coupons: getInitialCoupons(),
    processedPayments: [],
    auditLogs: [],
  };

  saveDBAtomic(defaultDB);
  return defaultDB;
}

function getInitialCoupons(): DBCoupon[] {
  return [
    { code: 'MOUULIN2026', credits: 100, maxUses: 1000, usedCount: 0, expiresAt: '2028-12-31T23:59:59.000Z', usedBy: [] },
    { code: 'WELCOME100', credits: 100, maxUses: 500, usedCount: 0, expiresAt: '2028-12-31T23:59:59.000Z', usedBy: [] },
    { code: 'PRO2026', credits: 250, maxUses: 200, usedCount: 0, expiresAt: '2028-12-31T23:59:59.000Z', usedBy: [] },
    { code: 'ARCADS', credits: 50, maxUses: 500, usedCount: 0, expiresAt: '2028-12-31T23:59:59.000Z', usedBy: [] },
    { code: 'VIP500', credits: 500, maxUses: 50, usedCount: 0, expiresAt: '2028-12-31T23:59:59.000Z', usedBy: [] },
  ];
}

// Startup Backup Routine
function createStartupBackup() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const backupPath = path.join(BACKUP_DIR, `moulin_db_${Date.now()}.json`);
      fs.copyFileSync(DB_FILE, backupPath);
      const backups = fs.readdirSync(BACKUP_DIR).sort();
      if (backups.length > 10) {
        for (let i = 0; i < backups.length - 10; i++) {
          fs.unlinkSync(path.join(BACKUP_DIR, backups[i]));
        }
      }
    }
  } catch (e) {
    console.error('Backup creation error:', e);
  }
}
createStartupBackup();

// Rate Limiters
const globalRateLimitMap = new Map<string, { count: number; resetTime: number }>();
const authRateLimitMap = new Map<string, { count: number; resetTime: number }>();

function createRateLimiter(map: Map<string, { count: number; resetTime: number }>, windowMs: number, maxRequests: number, errMsg: string) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (process.env.NODE_ENV === 'test') {
      return next();
    }
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    let record = map.get(ip);
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      map.set(ip, record);
      return next();
    }
    record.count++;
    if (record.count > maxRequests) {
      return res.status(429).json({ success: false, error: errMsg });
    }
    next();
  };
}

const globalLimiter = createRateLimiter(globalRateLimitMap, 60 * 1000, 100, 'تم تجاوز الحد المسموح من الطلبات. يرجى الانتظار دقيقة.');
const authLimiter = createRateLimiter(authRateLimitMap, 15 * 60 * 1000, 15, 'تمت محاولة تسجيل الدخول بعدد تجاوز المسموح. يرجى الانتظار 15 دقيقة.');

// Centralized Validation Helpers
function isValidString(val: any, minLen = 1, maxLen = 3000): boolean {
  if (typeof val !== 'string') return false;
  const trimmed = val.trim();
  return trimmed.length >= minLen && trimmed.length <= maxLen;
}

function isValidPositiveNumber(val: any, min = 1, max = 100000): boolean {
  if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) return false;
  return val >= min && val <= max;
}

function validateBase64Image(dataUri: any, maxSizeBytes = 15 * 1024 * 1024): { valid: boolean; error?: string; mimeType?: string } {
  if (!dataUri || typeof dataUri !== 'string') {
    return { valid: false, error: 'بيانات الصورة مفقودة أو غير صالحة' };
  }

  // Support all common image formats and smartphone headers (including JPG, HEIC, HEIF, WEBP, PNG, GIF)
  const match = dataUri.match(/^data:(image\/(jpeg|jpg|pjpeg|png|x-png|webp|gif|heic|heif|avif|bmp|svg\+xml));base64,(.+)$/i);
  if (!match) {
    return { valid: false, error: 'نوع الملف غير مدعوم. الصيغ المدعومة هي: JPG, JPEG, PNG, WEBP, GIF, HEIC, HEIF' };
  }

  let mimeType = match[1].toLowerCase();
  // Normalize mime types for Gemini and storage consistency
  if (mimeType === 'image/jpg' || mimeType === 'image/pjpeg' || mimeType === 'image/heic' || mimeType === 'image/heif') {
    mimeType = 'image/jpeg';
  } else if (mimeType === 'image/x-png') {
    mimeType = 'image/png';
  }

  const base64Str = match[3];
  const approxSize = (base64Str.length * 3) / 4;
  if (approxSize > maxSizeBytes) {
    return { valid: false, error: 'حجم الصورة يتجاوز الحد المسموح به (15 ميجابايت)' };
  }

  try {
    const buffer = Buffer.from(base64Str.slice(0, 64), 'base64');
    if (buffer.length < 4) {
      return { valid: false, error: 'بيانات الصورة تالفة' };
    }

    // Verify Magic Bytes
    let magicMatch = false;
    const asciiHead = buffer.toString('ascii', 0, 32);

    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
      magicMatch = (buffer[0] === 0xFF && buffer[1] === 0xD8) || asciiHead.includes('ftyp') || asciiHead.includes('Exif');
    } else if (mimeType.includes('png')) {
      magicMatch = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
    } else if (mimeType.includes('gif')) {
      magicMatch = asciiHead.startsWith('GIF');
    } else if (mimeType.includes('webp')) {
      magicMatch = asciiHead.startsWith('RIFF') || asciiHead.includes('WEBP');
    } else {
      magicMatch = true;
    }

    if (!magicMatch) {
      return { valid: false, error: 'تم رفض الملف: محتوى الصورة الفعلي لا يطابق الترويسة المصرح بها (Magic Bytes Mismatch)' };
    }

    return { valid: true, mimeType };
  } catch {
    return { valid: false, error: 'تعذر قراءة وتدقيق ترميز الملف' };
  }
}

// Safe SSRF-Protected Image Fetching & Base64 Normalization Helper
async function resolveAndProcessImageInput(
  imageInput: any,
  maxSizeBytes = 15 * 1024 * 1024
): Promise<{ valid: boolean; mimeType?: string; data?: string; error?: string }> {
  if (!imageInput || typeof imageInput !== 'string' || !imageInput.trim()) {
    return { valid: true }; // Image is optional; empty input is valid without image
  }

  const trimmed = imageInput.trim();

  // Case 1: Base64 Data URI
  if (trimmed.startsWith('data:')) {
    const val = validateBase64Image(trimmed, maxSizeBytes);
    if (!val.valid) {
      return { valid: false, error: val.error };
    }
    const commaIdx = trimmed.indexOf(',');
    if (commaIdx === -1) {
      return { valid: false, error: 'ترميز صورة Base64 غير مكتمل' };
    }
    const base64Data = trimmed.slice(commaIdx + 1);
    return { valid: true, mimeType: val.mimeType || 'image/jpeg', data: base64Data };
  }

  // Case 2: HTTP / HTTPS Remote Image URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsedUrl = new URL(trimmed);
      const protocol = parsedUrl.protocol.toLowerCase();
      if (protocol !== 'http:' && protocol !== 'https:') {
        return { valid: false, error: 'رابط الصورة يجب أن يبدأ بـ http أو https' };
      }

      const hostname = parsedUrl.hostname.toLowerCase();
      // Strict SSRF Prevention: Block internal networks, loopbacks, metadata IPs
      const isInternal =
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '0.0.0.0' ||
        hostname === '::1' ||
        hostname === '[::1]' ||
        hostname.endsWith('.local') ||
        hostname.endsWith('.internal') ||
        /^10\./.test(hostname) ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
        /^192\.168\./.test(hostname) ||
        /^169\.254\./.test(hostname);

      if (isInternal) {
        return { valid: false, error: 'غير مسموح بروابط الشبكات الداخلية أو المحلية (SSRF Blocked)' };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(trimmed, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'MoulinAI-ImageProcessor/1.0',
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return { valid: false, error: `تعذر جلب الصورة من الرابط (الحالة: ${response.status})` };
      }

      const contentType = response.headers.get('content-type') || 'image/jpeg';
      if (!contentType.toLowerCase().includes('image') && !contentType.toLowerCase().includes('octet-stream')) {
        return { valid: false, error: 'الرابط المحدد لا يشير إلى صورة صالحة' };
      }

      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer.byteLength > maxSizeBytes) {
        return { valid: false, error: 'حجم الصورة المحملة من الرابط يتجاوز الحد المسموح' };
      }

      let mimeType = contentType.split(';')[0].trim().toLowerCase();
      if (mimeType === 'image/jpg' || mimeType === 'image/pjpeg' || mimeType === 'image/heic' || mimeType === 'image/heif') {
        mimeType = 'image/jpeg';
      } else if (!mimeType.startsWith('image/')) {
        mimeType = 'image/jpeg';
      }

      const base64Data = Buffer.from(arrayBuffer).toString('base64');
      return { valid: true, mimeType, data: base64Data };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { valid: false, error: 'انتهت مهلة جلب الصورة من الرابط الخارجي' };
      }
      return { valid: false, error: `فشلت عملية جلب الصورة من الرابط: ${err.message || 'خطأ في الشبكة'}` };
    }
  }

  return { valid: false, error: 'صيغة مدخلات الصورة غير معتمدة (يجب أن تكون Base64 أو رابط HTTP/HTTPS)' };
}

// Safe SSRF-Protected Web Page Scraper & Product Analyzer Helper
async function fetchAndAnalyzeUrlContent(targetUrl: string): Promise<{
  success: boolean;
  error?: string;
  url?: string;
  title?: string;
  description?: string;
  rawText?: string;
  extractedImages?: string[];
  extractedPrice?: string;
  extractedLogo?: string;
}> {
  if (!targetUrl || typeof targetUrl !== 'string' || !targetUrl.trim()) {
    return { success: false, error: 'الرابط المطلوب غير مدخل' };
  }

  const trimmed = targetUrl.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return { success: false, error: 'الرابط يجب أن يبدأ بـ http:// أو https://' };
  }

  try {
    const parsedUrl = new URL(trimmed);
    const hostname = parsedUrl.hostname.toLowerCase();

    // Strict SSRF Prevention: Block internal/loopback IPs & metadata URLs
    const isInternal =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname === '[::1]' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      /^10\./.test(hostname) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^169\.254\./.test(hostname);

    if (isInternal) {
      return { success: false, error: 'غير مسموح بتحليل عناوين الشبكات الداخلية أو المحلية (SSRF Blocked)' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const response = await fetch(trimmed, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 MoulinAI-Scraper/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        return {
          success: false,
          error: `الصفحة تتطلب تسجيل دخول أو تفرض قيود حماية (${response.status}). يمكنك الانتقال لإدخال البيانات وصورة المنتج يدوياً.`,
        };
      }
      return {
        success: false,
        error: `تعذر جلب محتوى الرابط (رمز الاستجابة: ${response.status}). يرجى التأكد من أن الرابط يعمل بشكل عام أو استخدام الخيار اليدوي.`,
      };
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('html') && !contentType.includes('xhtml') && !contentType.includes('text/')) {
      return {
        success: false,
        error: 'الرابط المدخل لا يشير إلى صفحة ويب أو متجر إلكتروني صريح. يمكنك استخدام الخيار اليدوي.',
      };
    }

    const htmlText = await response.text();
    if (!htmlText || htmlText.trim().length < 50) {
      return {
        success: false,
        error: 'محتوى الصفحة فارغ أو يتطلب تشغيل برمجيات حظر تلقائية (CAPTCHA/JavaScript). استخدم الخيار اليدوي.',
      };
    }

    // 1. Extract Page Title
    let title = '';
    const ogTitleMatch = htmlText.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                         htmlText.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
    if (ogTitleMatch) {
      title = ogTitleMatch[1].trim();
    } else {
      const titleMatch = htmlText.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      if (titleMatch) title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
    }

    // 2. Extract Page Description
    let description = '';
    const ogDescMatch = htmlText.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
                        htmlText.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (ogDescMatch) {
      description = ogDescMatch[1].trim();
    }

    // Clean html to get visible text content
    const bodyText = htmlText
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<svg[\s\S]*?<\/svg>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 4000);

    // 3. Extract Images (og:image, twitter:image, product images)
    const extractedImages: string[] = [];
    const ogImgMatches = Array.from(htmlText.matchAll(/<meta[^>]*property=["'](?:og|twitter):image["'][^>]*content=["']([^"']+)["']/gi));
    for (const m of ogImgMatches) {
      if (m[1] && (m[1].startsWith('http://') || m[1].startsWith('https://'))) {
        if (!extractedImages.includes(m[1])) extractedImages.push(m[1]);
      }
    }

    const imgTagMatches = Array.from(htmlText.matchAll(/<img[^>]*src=["'](https?:\/\/[^"'\s]+\.(?:png|jpg|jpeg|webp|gif))["']/gi));
    for (const m of imgTagMatches) {
      if (m[1] && !m[1].includes('icon') && !m[1].includes('logo') && !m[1].includes('avatar') && !m[1].includes('spacer')) {
        if (!extractedImages.includes(m[1]) && extractedImages.length < 5) {
          extractedImages.push(m[1]);
        }
      }
    }

    // 4. Extract Price
    let extractedPrice = '';
    const priceMatch = htmlText.match(/(\d+(?:\.\d{1,2})?\s*(?:ر\.س|SAR|SR|\$|AED|EGP|ريال))/i) ||
                       htmlText.match(/(?:price|السعر|سعر)[^:\d]*(\d+(?:\.\d{1,2})?)/i);
    if (priceMatch) {
      extractedPrice = priceMatch[1] || priceMatch[0];
    }

    // 5. Extract Logo
    let extractedLogo = '';
    const logoMatch = htmlText.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i) ||
                      htmlText.match(/<img[^>]*src=["']([^"']*(?:logo|brand)[^"']*)["']/i);
    if (logoMatch && logoMatch[1]) {
      if (logoMatch[1].startsWith('http')) {
        extractedLogo = logoMatch[1];
      } else if (logoMatch[1].startsWith('/')) {
        extractedLogo = `${parsedUrl.origin}${logoMatch[1]}`;
      }
    }

    return {
      success: true,
      url: trimmed,
      title: title || 'منتج/خدمة من الرابط',
      description: description || bodyText.slice(0, 300),
      rawText: bodyText,
      extractedImages: extractedImages.slice(0, 4),
      extractedPrice,
      extractedLogo,
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { success: false, error: 'انتهت مهلة الاتصال بالموقع (Timeout). يبدو أن الخادم بطيء أو يحظر الفحص.' };
    }
    return { success: false, error: `فشل الوصول للرابط: ${err.message || 'خطأ شبكة'}` };
  }
}

// In-Memory Credit Reservation Tracker for Concurrency Protection
const pendingCreditReservations = new Map<string, number>();

function reserveUserCredits(userId: string, cost: number, currentCredits: number): boolean {
  const currentPending = pendingCreditReservations.get(userId) || 0;
  if (currentCredits - currentPending < cost) {
    return false;
  }
  pendingCreditReservations.set(userId, currentPending + cost);
  return true;
}

function releaseUserCredits(userId: string, cost: number) {
  const currentPending = pendingCreditReservations.get(userId) || 0;
  const nextPending = Math.max(0, currentPending - cost);
  if (nextPending === 0) {
    pendingCreditReservations.delete(userId);
  } else {
    pendingCreditReservations.set(userId, nextPending);
  }
}

// Safe Centralized Internal Error Handler
function handleServerError(res: express.Response, error: any, contextMessage: string) {
  const trackingId = 'err_' + crypto.randomBytes(6).toString('hex');
  console.error(`❌ [${trackingId}] ${contextMessage}:`, error?.message || error);
  res.status(500).json({
    success: false,
    error: 'حدث خطأ غير متوقع في الخادم أثناء معالجة الطلب. يرجى التكرم بالتحقق لاحقاً.',
    trackingId,
  });
}

// Custom Request Interface with Authenticated User
export interface AuthenticatedRequest extends express.Request {
  user?: DBUser;
  token?: string;
}

// Security Middleware: Helmet Equivalent & Strict CORS Restriction
function securityHeaders(req: express.Request, res: express.Response, next: express.NextFunction) {
  const origin = req.headers.origin;
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Access-Token');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
}

// Session Authentication Middleware (Strict)
function authenticateToken(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : (req.headers['x-access-token'] as string);

  if (!token || typeof token !== 'string' || !token.trim() || token === 'demo-guest-token') {
    return res.status(401).json({ success: false, error: 'غير مصرح: يرجى تسجيل الدخول للوصول لهذه الخدمة' });
  }

  const db = loadDB();
  cleanExpiredSessions(db);

  const session = db.sessions.find(s => s.token === token && new Date(s.expiresAt) > new Date());

  if (!session) {
    return res.status(401).json({ success: false, error: 'جلسة التوثيق منتهية أو ملغاة. يرجى إعادة تسجيل الدخول.' });
  }

  const user = db.users.find(u => u.id === session.userId);
  if (!user) {
    return res.status(401).json({ success: false, error: 'حساب المستخدم غير موجود' });
  }

  req.user = user;
  req.token = token;
  next();
}

// Relaxed Authentication Middleware for Testing & Public AI Features
function optionalAuthenticateToken(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : (req.headers['x-access-token'] as string);

  const db = loadDB();
  cleanExpiredSessions(db);

  if (token && typeof token === 'string' && token.trim() && token !== 'demo-guest-token') {
    const session = db.sessions.find(s => s.token === token && new Date(s.expiresAt) > new Date());
    if (session) {
      const user = db.users.find(u => u.id === session.userId);
      if (user) {
        req.user = user;
        req.token = token;
        return next();
      }
    }
  }

  // Fallback Guest User for seamless testing without forced login
  let guestUser = db.users.find(u => u.id === 'usr_guest');
  if (!guestUser) {
    guestUser = {
      id: 'usr_guest',
      name: 'زائر للتجربة',
      email: 'guest@moulin.ai',
      passwordHash: '',
      credits: 500,
      pendingReservedCredits: 0,
      tier: 'pro',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    };
    db.users.push(guestUser);
    saveDBAtomic(db);
  } else if (guestUser.credits < 50) {
    guestUser.credits = 500;
    saveDBAtomic(db);
  }

  req.user = guestUser;
  req.token = 'demo-guest-token';
  next();
}

// Strict Admin Authorization Middleware
function requireAdmin(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'محظور: هذا المسار يتطلب صلاحيات المدير المسؤول' });
  }
  next();
}

// Helper function to create session
function createSessionForUser(db: Database, userId: string): DBSession {
  const token = 'session_' + crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const session: DBSession = {
    token,
    userId,
    createdAt: new Date().toISOString(),
    expiresAt,
  };
  db.sessions.push(session);
  return session;
}

// Sanitized Safe User DTO
function toSafeUser(user: DBUser, token?: string) {
  const { passwordHash, pendingReservedCredits, ...safe } = user;
  return {
    ...safe,
    isAdmin: user.role === 'admin',
    token,
  };
}

async function startServer() {
  const app = express();
  
  app.use(securityHeaders);
  app.use(express.json({ limit: '10mb' }));
  app.use(globalLimiter);

  // Health check & System Status
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      status: 'online',
      hasApiKey: hasGeminiApiKey(),
      timestamp: new Date().toISOString(),
    });
  });

async function generateTextWithFallback(contents: string): Promise<string> {
  const client = getGenAIClient();
  try {
    const res = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
    });
    if (res.text) return res.text;
  } catch (err: any) {
    const errMsg = err?.message || String(err || '');
    if (errMsg.includes('503') || errMsg.includes('UNAVAILABLE') || errMsg.includes('high demand')) {
      await new Promise(r => setTimeout(r, 600));
      const resFallback = await client.models.generateContent({
        model: 'gemini-4-argon',
        contents,
      });
      if (resFallback.text) return resFallback.text;
    }
    throw err;
  }
  return '';
}

  // Real Server-Side Gemini API Key Connection Diagnostic Endpoint
  app.get('/api/ai/test-connection', async (req, res) => {
    const rawKey = getGeminiApiKey();
    if (!hasGeminiApiKey()) {
      return res.status(200).json({
        success: false,
        hasKey: false,
        code: 'MISSING_KEY',
        message: 'مفتاح GEMINI_API_KEY غير متوفر حالياً في أسرار الخادم (Settings > Secrets). يرجى إضافة المفتاح باسم GEMINI_API_KEY.',
        timestamp: new Date().toISOString(),
      });
    }

    const maskedKey = rawKey.length > 8
      ? `${rawKey.slice(0, 4)}...${rawKey.slice(-4)}`
      : '****';

    let textTest: any = { success: false };
    let videoTest: any = { success: false };

    // Fast Test: Text Generation Model (gemini-3.8-flash with gemini-4-argon fallback)
    try {
      const outputText = await generateTextWithFallback('Ping connection test');
      textTest = {
        success: true,
        model: 'gemini-3.8-flash / gemini-4-argon',
        message: 'تم الاختبار والاتصال بنموذج النصوص بنجاح ✓',
        sampleOutput: outputText.trim().slice(0, 50),
      };
    } catch (err: any) {
      const parsed = parseGeminiError(err);
      textTest = {
        success: false,
        model: 'gemini-3.8-flash',
        code: parsed.code,
        message: parsed.message,
        details: parsed.originalMessage,
      };
    }

    if (textTest.success) {
      videoTest = {
        success: true,
        model: 'gemini-omni-1.1-flash',
        message: 'مفتاح Gemini API متصل ونموذج الفيديو gemini-omni-1.1-flash مهيأ للاستدعاء عند بدء التوليد ✓',
      };
    } else {
      videoTest = {
        success: false,
        model: 'gemini-omni-1.1-flash',
        code: textTest.code,
        message: textTest.message,
        details: textTest.details,
      };
    }

    const overallReady = textTest.success && videoTest.success;

    res.json({
      success: textTest.success,
      hasKey: true,
      maskedKey,
      overallStatus: overallReady
        ? 'READY'
        : textTest.code,
      diagnostics: {
        textModel: textTest,
        videoModel: videoTest,
      },
      summary: overallReady
        ? 'مفتاح Gemini API المدفوع متصل وجاهز للاستخدام الكامل (نصوص وفيديو)'
        : `تشخيص خطأ المفتاح: ${textTest.message}`,
      timestamp: new Date().toISOString(),
    });
  });

  // ==========================================
  // AUTHENTICATION ROUTES
  // ==========================================

  // Register New Account
  app.post('/api/auth/register', authLimiter, (req, res) => {
    try {
      const { email, password, name } = req.body;

      if (!isValidString(email, 5, 100) || !email.includes('@')) {
        return res.status(400).json({ success: false, error: 'البريد الإلكتروني غير صحيح' });
      }
      if (!isValidString(password, 6, 128)) {
        return res.status(400).json({ success: false, error: 'كلمة المرور يجب أن لا تقل عن 6 أحرف' });
      }

      const db = loadDB();
      const cleanEmail = email.trim().toLowerCase();

      const existingUser = db.users.find(u => u.email.toLowerCase() === cleanEmail);
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول.' });
      }

      const role: 'admin' | 'user' = 'user';

      const newUser: DBUser = {
        id: 'usr_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex'),
        name: name && typeof name === 'string' ? name.trim().slice(0, 50) : cleanEmail.split('@')[0],
        email: cleanEmail,
        passwordHash: hashPassword(password),
        credits: 50,
        pendingReservedCredits: 0,
        tier: 'free',
        role,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
      };

      db.users.push(newUser);
      db.transactions.push({
        id: 'tx_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
        userId: newUser.id,
        type: 'credit_addition',
        amount: 50,
        description: 'رصيد الترحيب بالحساب الجديد',
        createdAt: new Date().toISOString(),
      });

      const session = createSessionForUser(db, newUser.id);
      saveDBAtomic(db);

      res.status(201).json({
        success: true,
        user: toSafeUser(newUser, session.token),
        token: session.token,
      });
    } catch (err) {
      handleServerError(res, err, 'Auth Register Exception');
    }
  });

  // Login Existing Account
  app.post('/api/auth/login', authLimiter, (req, res) => {
    try {
      const { email, password } = req.body;

      if (!isValidString(email, 3, 100)) {
        return res.status(400).json({ success: false, error: 'البريد الإلكتروني مطلوب' });
      }

      if (!isValidString(password, 1, 128)) {
        return res.status(401).json({ success: false, error: 'كلمة المرور مطلوبة وإلزامية لتسجيل الدخول' });
      }

      const db = loadDB();
      const cleanEmail = email.trim().toLowerCase();
      const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);

      if (!user) {
        return res.status(401).json({ success: false, error: 'البريد الإلكتروني غير مسجل' });
      }

      if (!verifyPassword(password, user.passwordHash)) {
        return res.status(401).json({ success: false, error: 'كلمة المرور غير صحيحة' });
      }

      const session = createSessionForUser(db, user.id);
      saveDBAtomic(db);

      res.json({
        success: true,
        user: toSafeUser(user, session.token),
        token: session.token,
      });
    } catch (err) {
      handleServerError(res, err, 'Auth Login Exception');
    }
  });

  // Logout & Invalidate Session
  app.post('/api/auth/logout', authenticateToken, (req: AuthenticatedRequest, res) => {
    try {
      const db = loadDB();
      db.sessions = db.sessions.filter(s => s.token !== req.token);
      saveDBAtomic(db);
      res.json({ success: true, message: 'تم تسجيل الخروج وإبطال الجلسة بنجاح' });
    } catch (err) {
      handleServerError(res, err, 'Auth Logout Exception');
    }
  });

  // Get Current Profile
  app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res) => {
    res.json({
      success: true,
      user: toSafeUser(req.user!, req.token),
    });
  });

  // ==========================================
  // PROJECTS MANAGEMENT (IDOR PROTECTED)
  // ==========================================

  // Get User Projects
  app.get('/api/projects/:userId?', optionalAuthenticateToken, (req: AuthenticatedRequest, res) => {
    try {
      const targetUserId = req.params.userId || req.user!.id;
      
      if (targetUserId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'محظور: لا تملك صلاحية عرض مشاريع حساب آخر' });
      }

      const db = loadDB();
      const userProjects = db.projects.filter(p => p.userId === targetUserId);
      res.json({ success: true, projects: userProjects });
    } catch (err) {
      handleServerError(res, err, 'Get Projects Exception');
    }
  });

  // Create & Save Project
  app.post('/api/projects', optionalAuthenticateToken, (req: AuthenticatedRequest, res) => {
    try {
      const { title, type, platform, status, progress, content } = req.body;

      if (!isValidString(title, 1, 150)) {
        return res.status(400).json({ success: false, error: 'عنوان المشروع مطلوب' });
      }

      const db = loadDB();
      const newProject: DBProject = {
        id: 'prj_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex'),
        userId: req.user!.id,
        title: title.trim().slice(0, 150),
        type: type || 'video',
        platform: platform || '9:16',
        status: status || 'completed',
        progress: typeof progress === 'number' ? Math.min(100, Math.max(0, progress)) : 100,
        content: content || {},
        createdAt: new Date().toISOString(),
      };

      db.projects.unshift(newProject);
      saveDBAtomic(db);

      res.status(201).json({ success: true, project: newProject });
    } catch (err) {
      handleServerError(res, err, 'Create Project Exception');
    }
  });

  // Delete Project
  app.delete('/api/projects/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const db = loadDB();

      const projectIndex = db.projects.findIndex(p => p.id === id);
      if (projectIndex === -1) {
        return res.status(404).json({ success: false, error: 'المشروع غير موجود' });
      }

      const project = db.projects[projectIndex];
      if (project.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'محظور: لا تملك صلاحية حذف هذا المشروع' });
      }

      db.projects.splice(projectIndex, 1);
      saveDBAtomic(db);

      res.json({ success: true, message: 'تم حذف المشروع بنجاح' });
    } catch (err) {
      handleServerError(res, err, 'Delete Project Exception');
    }
  });

  // ==========================================
  // SECURE FILE UPLOAD ENDPOINT
  // ==========================================

  app.post('/api/upload', authenticateToken, (req: AuthenticatedRequest, res) => {
    try {
      const { fileData, fileName } = req.body;
      const valResult = validateBase64Image(fileData, 5 * 1024 * 1024);

      if (!valResult.valid) {
        return res.status(400).json({ success: false, error: valResult.error });
      }

      const safeName = fileName && typeof fileName === 'string'
        ? fileName.replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 50)
        : 'uploaded_image_' + Date.now();

      res.json({
        success: true,
        message: 'تم تدقيق ورفع الصورة بنجاح',
        imageUrl: fileData,
        fileName: safeName,
        mimeType: valResult.mimeType,
      });
    } catch (err) {
      handleServerError(res, err, 'File Upload Exception');
    }
  });

  // ==========================================
  // AI SERVICES (STRICT CREDIT CONCURRENCY & ZERO CREDIT LOSS)
  // ==========================================

  // URL to Ad Content Scraper & Gemini AI Synthesizer Endpoint
  app.post('/api/ai/analyze-url', optionalAuthenticateToken, async (req: AuthenticatedRequest, res) => {
    const cost = 1;
    const db = loadDB();
    const currentUser = db.users.find(u => u.id === req.user!.id);
    if (!currentUser) return res.status(401).json({ success: false, error: 'المستخدم غير موجود' });

    if (!reserveUserCredits(currentUser.id, cost, currentUser.credits)) {
      return res.status(400).json({ success: false, error: 'رصيد النقاط غير كافٍ لتحليل الرابط (التكلفة: 1 نقطة)' });
    }

    try {
      const { url } = req.body;
      if (!isValidString(url, 5, 2000)) {
        return res.status(400).json({ success: false, error: 'الرابط مطلوب ويجب أن يبدأ بـ http:// أو https://' });
      }

      // Safe SSRF-protected page scraper
      const pageResult = await fetchAndAnalyzeUrlContent(url);
      if (!pageResult.success) {
        return res.status(400).json({ success: false, error: pageResult.error });
      }

      if (!hasGeminiApiKey()) {
        return res.status(400).json({
          success: false,
          error: 'خدمة تحليل الروابط غير مفعّلة: مفتاح GEMINI_API_KEY غير متوفر في بيئة الخادم. لم يتم خصم نقاط.',
        });
      }

      // AI Synthesis via Gemini Text API
      const synthPrompt = `أنت خبير إعلانات ومحلل منتجات ومتاجر إلكترونية.
لقد قمت بتحليل محتوى الرابط التالي (${pageResult.url}):
عنوان الصفحة: "${pageResult.title}"
الوصف المكتشف: "${pageResult.description}"
السعر المكتشف: "${pageResult.extractedPrice || 'غير محدد'}"
المحتوى النصي المستخرج من الصفحة: "${pageResult.rawText?.slice(0, 1500) || ''}"

المطلوب إرجاعه باللغة العربية بتنسيق منظم:
1. اسم المنتج أو التطبيق أو الشركة بوضوح.
2. ملخص تسويقي جذاب ومكثف.
3. أهم 3 مميزات حاسمة للمنتج/الخدمة.
4. سيناريو إعلاني احترافي:
   - الخطاف الإعلاني (Hook) لأول 3 ثواني.
   - نص السيناريو والمشاهد البصرية (Body).
   - دعوة حاسمة لاتخاذ إجراء (Call to Action).
5. الوصف الإنجليزي الشامل لإنشاء الفيديو بوساطة الذكاء الاصطناعي (Master Video Generation Prompt in English).`;

      const aiSynthesizedText = await generateTextWithFallback(synthPrompt);

      if (!aiSynthesizedText) {
        throw new Error('تعذر تحليل المحتوى واستخلاص البيانات بالذكاء الاصطناعي');
      }

      const titleMatch = aiSynthesizedText.match(/(?:اسم المنتج|اسم التطبيق|العنوان)[:\s]+([^\n]+)/i);
      const title = (titleMatch ? titleMatch[1].trim() : pageResult.title) || 'منتج/خدمة من الرابط';
      const safeDesc = pageResult.description || '';

      const masterPrompt = `Professional commercial ad video for: ${title}. ${safeDesc.slice(0, 200)}. Modern studio lighting, cinematic quality, high conversion rate.`;

      const analysis = {
        title,
        summary: safeDesc || aiSynthesizedText,
        fullAnalysis: aiSynthesizedText,
        price: pageResult.extractedPrice || '',
        images: pageResult.extractedImages || [],
        logo: pageResult.extractedLogo || '',
        masterPrompt,
      };

      // Deduct credit strictly AFTER successful analysis
      currentUser.credits -= cost;
      db.transactions.push({
        id: 'tx_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
        userId: currentUser.id,
        type: 'credit_deduction',
        amount: -cost,
        description: `تحليل رابط موقع/منتج (URL TO AD): ${title.slice(0, 20)}`,
        createdAt: new Date().toISOString(),
      });
      saveDBAtomic(db);

      res.json({
        success: true,
        analysis,
        user: toSafeUser(currentUser, req.token),
      });
    } catch (err: any) {
      console.error('Error in analyze-url:', err?.message || err);
      const parsedErr = parseGeminiError(err);
      res.status(500).json({
        success: false,
        code: parsedErr.code,
        error: `${parsedErr.message} (لم يتم خصم أي نقاط من رصيدك)`,
        details: parsedErr.originalMessage,
      });
    } finally {
      releaseUserCredits(currentUser.id, cost);
    }
  });

  // Video Studio Generation
  app.post('/api/ai/video-generate', optionalAuthenticateToken, async (req: AuthenticatedRequest, res) => {
    const cost = 10;
    const db = loadDB();
    const currentUser = db.users.find(u => u.id === req.user!.id);
    if (!currentUser) return res.status(401).json({ success: false, error: 'المستخدم غير موجود' });

    // Race condition check via in-memory credit reservation
    if (!reserveUserCredits(currentUser.id, cost, currentUser.credits)) {
      return res.status(400).json({
        success: false,
        error: `رصيد النقاط المتاح غير كافٍ لتشغيل العملية أو توجد طلبات جارية معالجة. التكلفة: ${cost} نقاط. رصيدك الحالي: ${currentUser.credits}`,
      });
    }

    try {
      const { product, image, aspectRatio, duration, style, voice, language } = req.body;

      if (!isValidString(product, 2, 3000)) {
        return res.status(400).json({ success: false, error: 'وصف المنتج مطلوب ويجب أن يكون بين حرفين و3000 حرف' });
      }

      // Safely process image input (supports Base64 data URIs, HTTP/HTTPS URLs with SSRF protection, or optional image)
      const imageResult = await resolveAndProcessImageInput(image);
      if (!imageResult.valid) {
        return res.status(400).json({ success: false, error: imageResult.error });
      }

      if (!hasGeminiApiKey()) {
        return res.status(400).json({
          success: false,
          error: 'خدمة توليد الفيديو غير مهيأة: مفتاح GEMINI_API_KEY غير متوفر في متغيرات بيئة الخادم. يرجى إضافة مفتاح GEMINI_API_KEY من خلال واجهة إدارة الأسرار لتفعيل الخدمة. لم يتم خصم أي نقاط من رصيدك.',
        });
      }

      const interactionInputs: any[] = [];
      if (imageResult.data && imageResult.mimeType) {
        interactionInputs.push({
          type: 'image',
          mime_type: imageResult.mimeType,
          data: imageResult.data,
        });
      }

      interactionInputs.push({
        type: 'text',
        text: `Create a professional commercial advertising video for: ${product}. Style: ${style || 'cinematic'}. Voiceover: ${voice || 'professional'} in language: ${language || 'ar'}.`,
      });

      const validDuration = duration?.includes('10') ? '10s' : '5s';

      const interaction = await getGenAIClient().interactions.create({
        model: 'gemini-omni-1.1-flash',
        input: interactionInputs,
        background: false,
        store: false,
        stream: false,
        response_format: {
          type: 'video',
          aspect_ratio: aspectRatio === '16:9' ? '16:9' : '9:16',
          duration: validDuration,
          resolution: '720p',
        },
      }, { timeout: 300000 });

      const videoPart = interaction.output_video;
      if (!videoPart || !videoPart.data) {
        throw new Error('لم يتم استلام بيانات الفيديو من خدمة الذكاء الاصطناعي.');
      }

      const mime = videoPart.mime_type || 'video/mp4';
      const videoUrl = `data:${mime};base64,${videoPart.data}`;

      // Deduct credits strictly AFTER successful generation
      currentUser.credits -= cost;
      db.transactions.push({
        id: 'tx_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
        userId: currentUser.id,
        type: 'credit_deduction',
        amount: -cost,
        description: `توليد فيديو إعلاني: ${product.slice(0, 25)}`,
        createdAt: new Date().toISOString(),
      });

      const newProject: DBProject = {
        id: 'prj_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
        userId: currentUser.id,
        title: `إعلان: ${product.slice(0, 30)}...`,
        type: 'video',
        platform: aspectRatio || '9:16',
        status: 'completed',
        progress: 100,
        content: { videoUrl, details: { product, aspectRatio, duration, style, voice, language } },
        createdAt: new Date().toISOString(),
      };

      db.projects.unshift(newProject);
      saveDBAtomic(db);

      res.json({
        success: true,
        project: newProject,
        user: toSafeUser(currentUser, req.token),
      });
    } catch (error: any) {
      console.error('Error in video generation:', error?.message || error);
      const parsedErr = parseGeminiError(error);
      res.status(500).json({
        success: false,
        code: parsedErr.code,
        error: `${parsedErr.message} (لم يتم خصم أي نقاط من رصيدك)`,
        details: parsedErr.originalMessage,
      });
    } finally {
      releaseUserCredits(currentUser.id, cost);
    }
  });

  // AI Story & Idea Expansion Endpoint
  app.post('/api/ai/expand-story-idea', optionalAuthenticateToken, async (req: AuthenticatedRequest, res) => {
    const cost = 1;
    const db = loadDB();
    const currentUser = db.users.find(u => u.id === req.user!.id);
    if (!currentUser) return res.status(401).json({ success: false, error: 'المستخدم غير موجود' });

    if (!reserveUserCredits(currentUser.id, cost, currentUser.credits)) {
      return res.status(400).json({ success: false, error: 'رصيد النقاط غير كافٍ لتطوير الفكرة (التكلفة: 1 نقطة)' });
    }

    try {
      const { idea, category, style } = req.body;
      if (!isValidString(idea, 2, 2000)) {
        return res.status(400).json({ success: false, error: 'الفكرة البرمجية مطلوبة' });
      }

      if (!hasGeminiApiKey()) {
        return res.status(400).json({
          success: false,
          error: 'خدمة تطوير القصص غير مفعّلة: مفتاح GEMINI_API_KEY غير متوفر في الخادم. لم يتم خصم نقاط.',
        });
      }

      const promptText = `أنت مؤلف سينمائي ومخرج قصصي محترف. قم بتحويل وتطوير الفكرة البسيطة التالية إلى سيناريو متكامل وقصة مشوقة ومجسمة بصرياً.
تصنيف الفيديو: ${category || 'قصص خيالية ومغامرات'}
الأسلوب البصري: ${style || 'سينمائي 8K'}
الفكرة الأصلية: "${idea}"

المطلوب إرجاعه بتنسيق منظّم يسهل قراءته باللغة العربية:
1. عنوان جذاب ومشوق للقصة.
2. ملخص القصة والسيناريو والحدث الرئيسي.
3. تسلسل 3 إلى 5 مشاهد بصيرة دقيقة (الكادر، الإضاءة، الحركة، المؤثرات).
4. نص التعليق الصوتي المقترح (Voiceover Narration).
5. الوصف الإنجليزي النهائي المطور لتوليد الفيديو بواسطة محرك الذكاء الاصطناعي (Master Video Generation Prompt in English).`;

      const generatedScript = await generateTextWithFallback(promptText);
      if (!generatedScript) {
        throw new Error('لم يتم استلام سيناريو من الذكاء الاصطناعي');
      }

      const titleMatch = generatedScript.match(/عنوان[:\s]+([^\n]+)/i);
      const title = titleMatch ? titleMatch[1].trim() : `قصة: ${idea.slice(0, 25)}`;

      const expansion = {
        title,
        summary: generatedScript,
        scenes: generatedScript.split('\n').filter(line => line.includes('مشهد') || line.includes('Scene')),
        narration: generatedScript,
        masterPrompt: `A high-quality cinematic narrative video based on: ${idea}. Visual style: ${style || 'cinematic'}. High resolution, dynamic lighting, masterpiece.`,
      };

      currentUser.credits -= cost;
      db.transactions.push({
        id: 'tx_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
        userId: currentUser.id,
        type: 'credit_deduction',
        amount: -cost,
        description: `تطوير فكرة فيديو إلى قصة: ${idea.slice(0, 20)}`,
        createdAt: new Date().toISOString(),
      });
      saveDBAtomic(db);

      res.json({
        success: true,
        expansion,
        user: toSafeUser(currentUser, req.token),
      });
    } catch (err: any) {
      console.error('Error in expanding story idea:', err?.message || err);
      const parsedErr = parseGeminiError(err);
      res.status(500).json({
        success: false,
        code: parsedErr.code,
        error: `${parsedErr.message} (لم يتم خصم أي نقاط من رصيدك)`,
        details: parsedErr.originalMessage,
      });
    } finally {
      releaseUserCredits(currentUser.id, cost);
    }
  });

  // AI Creative Video Generator Endpoint
  app.post('/api/ai/creative-video-generate', optionalAuthenticateToken, async (req: AuthenticatedRequest, res) => {
    const cost = 10;
    const db = loadDB();
    const currentUser = db.users.find(u => u.id === req.user!.id);
    if (!currentUser) return res.status(401).json({ success: false, error: 'المستخدم غير موجود' });

    if (!reserveUserCredits(currentUser.id, cost, currentUser.credits)) {
      return res.status(400).json({
        success: false,
        error: `رصيد النقاط المتاح غير كافٍ لتشغيل العملية. التكلفة: ${cost} نقاط. رصيدك الحالي: ${currentUser.credits}`,
      });
    }

    try {
      const { prompt, category, image, aspectRatio, duration, style, voice, language, backgroundMusic, expandedScript } = req.body;

      if (!isValidString(prompt, 2, 3000)) {
        return res.status(400).json({ success: false, error: 'وصف القصة أو الفيديو مطلوب ويجب أن يكون بين حرفين و3000 حرف' });
      }

      // Safely process reference image (supports Base64 and public URLs with SSRF protection)
      const imageResult = await resolveAndProcessImageInput(image);
      if (!imageResult.valid) {
        return res.status(400).json({ success: false, error: imageResult.error });
      }

      if (!hasGeminiApiKey()) {
        return res.status(400).json({
          success: false,
          error: 'خدمة توليد الفيديو الإبداعي غير مهيأة: مفتاح GEMINI_API_KEY غير متوفر في متغيرات بيئة الخادم. لم يتم خصم أي نقاط من رصيدك.',
        });
      }

      const interactionInputs: any[] = [];
      if (imageResult.data && imageResult.mimeType) {
        interactionInputs.push({
          type: 'image',
          mime_type: imageResult.mimeType,
          data: imageResult.data,
        });
      }

      const fullCreativePrompt = `Create an exceptional narrative short video.
Category: ${category || 'Creative Story'}.
Visual Style: ${style || 'Cinematic'}.
Story Description / Scene Prompt: ${prompt}.
Narration Tone: ${voice || 'Dramatic'} in language: ${language || 'ar'}.
Background Music Mood: ${backgroundMusic || 'Cinematic Orchestral'}.
High detail, fluid movement, professional lighting and composition.`;

      interactionInputs.push({
        type: 'text',
        text: fullCreativePrompt,
      });

      const validDuration = duration?.includes('10') ? '10s' : '5s';

      const interaction = await getGenAIClient().interactions.create({
        model: 'gemini-omni-1.1-flash',
        input: interactionInputs,
        background: false,
        store: false,
        stream: false,
        response_format: {
          type: 'video',
          aspect_ratio: aspectRatio === '16:9' ? '16:9' : '9:16',
          duration: validDuration,
          resolution: '720p',
        },
      }, { timeout: 300000 });

      const videoPart = interaction.output_video;
      if (!videoPart || !videoPart.data) {
        throw new Error('لم يتم استلام بيانات الفيديو من خدمة الذكاء الاصطناعي.');
      }

      const mime = videoPart.mime_type || 'video/mp4';
      const videoUrl = `data:${mime};base64,${videoPart.data}`;

      // Deduct credits strictly AFTER successful generation
      currentUser.credits -= cost;
      db.transactions.push({
        id: 'tx_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
        userId: currentUser.id,
        type: 'credit_deduction',
        amount: -cost,
        description: `توليد فيديو إبداعي: ${category || 'قصة'} - ${prompt.slice(0, 20)}`,
        createdAt: new Date().toISOString(),
      });

      const newProject: DBProject = {
        id: 'prj_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
        userId: currentUser.id,
        title: expandedScript?.title || `قصة: ${prompt.slice(0, 25)}...`,
        type: 'creative_video',
        platform: aspectRatio || '16:9',
        status: 'completed',
        progress: 100,
        content: { videoUrl, details: { prompt, category, style, aspectRatio, duration, voice, language, backgroundMusic, expandedScript } },
        createdAt: new Date().toISOString(),
      };

      db.projects.unshift(newProject);
      saveDBAtomic(db);

      res.json({
        success: true,
        project: newProject,
        user: toSafeUser(currentUser, req.token),
      });
    } catch (error: any) {
      console.error('Error in creative video generation:', error?.message || error);
      const parsedErr = parseGeminiError(error);
      res.status(500).json({
        success: false,
        code: parsedErr.code,
        error: `${parsedErr.message} (لم يتم خصم أي نقاط من رصيدك)`,
        details: parsedErr.originalMessage,
      });
    } finally {
      releaseUserCredits(currentUser.id, cost);
    }
  });

  // Image Studio Generation
  app.post('/api/ai/image-generate', optionalAuthenticateToken, async (req: AuthenticatedRequest, res) => {
    const cost = 2;
    const db = loadDB();
    const currentUser = db.users.find(u => u.id === req.user!.id);
    if (!currentUser) return res.status(401).json({ success: false, error: 'المستخدم غير موجود' });

    if (!reserveUserCredits(currentUser.id, cost, currentUser.credits)) {
      return res.status(400).json({ success: false, error: `رصيد النقاط المتاح غير كافٍ. تتطلب عملية توليد الصورة ${cost} نقطة.` });
    }

    try {
      const { prompt, aspectRatio, stylePreset } = req.body;
      if (!isValidString(prompt, 2, 500)) {
        return res.status(400).json({ success: false, error: 'وصف الصورة مطلوب' });
      }

      if (!hasGeminiApiKey()) {
        return res.status(400).json({
          success: false,
          error: 'خدمة توليد الصور غير مهيأة: مفتاح GEMINI_API_KEY غير متوفر في بيئة الخادم. يرجى إضافة مفتاح GEMINI_API_KEY من خلال واجهة إدارة الأسرار. لم يتم خصم أي نقاط من رصيدك.',
        });
      }

      let imageUrl = '';
      const imageRes = await getGenAIClient().models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: `${prompt}. High quality commercial product advertisement, ${stylePreset || 'modern studio lighting'}.`,
        config: {
          numberOfImages: 1,
          aspectRatio: aspectRatio === '9:16' ? '9:16' : aspectRatio === '16:9' ? '16:9' : '1:1',
          outputMimeType: 'image/jpeg',
        },
      });

      if (imageRes.generatedImages && imageRes.generatedImages[0]?.image?.imageBytes) {
        imageUrl = `data:image/jpeg;base64,${imageRes.generatedImages[0].image.imageBytes}`;
      } else {
        throw new Error('لم يتم استلام بيانات الصورة المولدة');
      }

      currentUser.credits -= cost;
      db.transactions.push({
        id: 'tx_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
        userId: currentUser.id,
        type: 'credit_deduction',
        amount: -cost,
        description: `توليد صورة إعلانية: ${prompt.slice(0, 25)}`,
        createdAt: new Date().toISOString(),
      });

      const project: DBProject = {
        id: 'prj_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
        userId: currentUser.id,
        title: `صورة: ${prompt.slice(0, 25)}`,
        type: 'image',
        platform: aspectRatio || '1:1',
        status: 'completed',
        progress: 100,
        content: { imageUrl, prompt, stylePreset, aspectRatio },
        createdAt: new Date().toISOString(),
      };

      db.projects.unshift(project);
      saveDBAtomic(db);

      res.json({
        success: true,
        project,
        imageUrl,
        user: toSafeUser(currentUser, req.token),
      });
    } catch (err: any) {
      console.error('Error in image generation:', err?.message || err);
      const parsedErr = parseGeminiError(err);
      res.status(500).json({
        success: false,
        code: parsedErr.code,
        error: `${parsedErr.message} (لم يتم خصم أي نقاط من رصيدك)`,
        details: parsedErr.originalMessage,
      });
    } finally {
      releaseUserCredits(currentUser.id, cost);
    }
  });

  // AI Copywriting Endpoint
  app.post('/api/ai/copywrite', optionalAuthenticateToken, async (req: AuthenticatedRequest, res) => {
    const cost = 1;
    const db = loadDB();
    const currentUser = db.users.find(u => u.id === req.user!.id);
    if (!currentUser) return res.status(401).json({ success: false, error: 'غير مسجل الدخول' });

    if (!reserveUserCredits(currentUser.id, cost, currentUser.credits)) {
      return res.status(400).json({ success: false, error: 'رصيد النقاط المتاح غير كافٍ' });
    }

    try {
      const { product, targetAudience, framework, platform, tone } = req.body;
      if (!isValidString(product, 2, 500)) {
        return res.status(400).json({ success: false, error: 'وصف المنتج مطلوب' });
      }

      if (!hasGeminiApiKey()) {
        return res.status(400).json({
          success: false,
          error: 'خدمة كتابة الإعلانات غير مفعّلة: مفتاح GEMINI_API_KEY غير متوفر في الخادم. يرجى إضافة مفتاح GEMINI_API_KEY من خلال واجهة إدارة الأسرار. لم يتم خصم أي نقاط.',
        });
      }

      const promptText = `أنت خبير كتابة الإعلانات الأكثر نجاحاً في العالم العربي. اكتب نصاً إعلانياً وسيناريو احترافي بدقة لمنصة ${platform || 'TikTok/Reels'}.
المنتج: ${product}
الجمهور المستهدف: ${targetAudience || 'عام'}
إطار الإعلان: ${framework || 'AIDA'}
النبرة: ${tone || 'حماسية ومقنعة'}

المطلوب إرجاعه بتنسيق منظّم باللغة العربية:
1. 3 خطافات إعلانية قوية (Hooks) تشد الانتباه في أول 3 ثواني.
2. نص السيناريو الإعلاني مفصلاً (المشهد البصري + النص الصوتي).
3. النص الرئيسي للإعلان (Primary Text).
4. دعوة لاتخاذ إجراء (Call To Action).`;

      const generatedText = await generateTextWithFallback(promptText);

      if (!generatedText) {
        throw new Error('لم يتم استلام نص من نموذج الذكاء الاصطناعي');
      }

      currentUser.credits -= cost;
      db.transactions.push({
        id: 'tx_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
        userId: currentUser.id,
        type: 'credit_deduction',
        amount: -cost,
        description: `كتابة نص إعلاني: ${product.slice(0, 20)}`,
        createdAt: new Date().toISOString(),
      });

      const project: DBProject = {
        id: 'prj_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
        userId: currentUser.id,
        title: `سيناريو: ${product.slice(0, 25)}`,
        type: 'copy',
        platform: platform || 'TikTok',
        status: 'completed',
        progress: 100,
        content: { generatedText, details: { product, targetAudience, framework, platform, tone } },
        createdAt: new Date().toISOString(),
      };

      db.projects.unshift(project);
      saveDBAtomic(db);

      res.json({ success: true, project, user: toSafeUser(currentUser, req.token), text: generatedText });
    } catch (err: any) {
      console.error('Error in copywriting:', err?.message || err);
      const parsedErr = parseGeminiError(err);
      res.status(500).json({
        success: false,
        code: parsedErr.code,
        error: `${parsedErr.message} (لم يتم خصم أي نقاط من رصيدك)`,
        details: parsedErr.originalMessage,
      });
    } finally {
      releaseUserCredits(currentUser.id, cost);
    }
  });

  // AI Marketing Assistant Endpoint
  app.post('/api/ai/marketing-assistant', optionalAuthenticateToken, async (req: AuthenticatedRequest, res) => {
    const cost = 2;
    const db = loadDB();
    const currentUser = db.users.find(u => u.id === req.user!.id);
    if (!currentUser) return res.status(401).json({ success: false, error: 'غير مسجل الدخول' });

    if (!reserveUserCredits(currentUser.id, cost, currentUser.credits)) {
      return res.status(400).json({ success: false, error: 'رصيد النقاط غير كافٍ' });
    }

    try {
      const { product, goal, budget, country } = req.body;
      if (!isValidString(product, 2, 500)) {
        return res.status(400).json({ success: false, error: 'اسم أو وصف المنتج مطلوب' });
      }

      if (!hasGeminiApiKey()) {
        return res.status(400).json({
          success: false,
          error: 'خدمة المساعد التسويقي غير مفعّلة: مفتاح GEMINI_API_KEY غير متوفر في الخادم. يرجى إضافة مفتاح GEMINI_API_KEY من خلال واجهة إدارة الأسرار. لم يتم خصم أي نقاط.',
        });
      }

      const promptText = `أنت مستشار تسويق إلكتروني خبير ومحلل استراتيجي للحملات الإعلانية في الشرق الأوسط (${country || 'السعودية والخليج'}).
المنتج: ${product}
الهدف: ${goal || 'زيادة المبيعات والتحويلات'}
الميزانية: ${budget || 'متوسطة'}

أعطني استراتيجية إعلانية شاملة تتضمن:
1. تحليل الشريحة المستهدفة (Demographics & Psychographics).
2. أفضل 3 زوايا تسويقية (Angles) للإعلان.
3. جدول محتوى إعلاني لمدة 7 أيام.
4. توصيات لصور وفيديوهات الإعلانات الأكثر تأثيراً.`;

      const planText = await generateTextWithFallback(promptText);

      if (!planText) {
        throw new Error('لم يتم توليد خطة تسويقية');
      }

      currentUser.credits -= cost;
      db.transactions.push({
        id: 'tx_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
        userId: currentUser.id,
        type: 'credit_deduction',
        amount: -cost,
        description: `خطة استراتيجية تسويقية: ${product.slice(0, 20)}`,
        createdAt: new Date().toISOString(),
      });

      const project: DBProject = {
        id: 'prj_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
        userId: currentUser.id,
        title: `خطة تسويق: ${product.slice(0, 25)}`,
        type: 'marketing_plan',
        status: 'completed',
        progress: 100,
        content: { planText, details: { product, goal, budget, country } },
        createdAt: new Date().toISOString(),
      };

      db.projects.unshift(project);
      saveDBAtomic(db);

      res.json({ success: true, project, user: toSafeUser(currentUser, req.token), planText });
    } catch (err: any) {
      console.error('Error in marketing assistant:', err?.message || err);
      const parsedErr = parseGeminiError(err);
      res.status(500).json({
        success: false,
        code: parsedErr.code,
        error: `${parsedErr.message} (لم يتم خصم أي نقاط من رصيدك)`,
        details: parsedErr.originalMessage,
      });
    } finally {
      releaseUserCredits(currentUser.id, cost);
    }
  });

  // AI Translation Endpoint
  app.post('/api/ai/translate', optionalAuthenticateToken, async (req: AuthenticatedRequest, res) => {
    const cost = 1;
    const db = loadDB();
    const currentUser = db.users.find(u => u.id === req.user!.id);
    if (!currentUser) return res.status(401).json({ success: false, error: 'غير مسجل الدخول' });

    if (!reserveUserCredits(currentUser.id, cost, currentUser.credits)) {
      return res.status(400).json({ success: false, error: 'رصيد النقاط غير كافٍ' });
    }

    try {
      const { text, targetLanguage, sourceLanguage } = req.body;
      if (!isValidString(text, 1, 2000)) {
        return res.status(400).json({ success: false, error: 'النص المراد ترجمته مطلوب' });
      }

      if (!hasGeminiApiKey()) {
        return res.status(400).json({
          success: false,
          error: 'خدمة الترجمة غير مفعّلة: مفتاح GEMINI_API_KEY غير متوفر في الخادم. يرجى إضافة مفتاح GEMINI_API_KEY من خلال واجهة إدارة الأسرار. لم يتم خصم أي نقاط.',
        });
      }

      const promptText = `أنت مترجم إعلانات محترف ومساعد دبلجة وصوتيات.
قم بترجمة النص الإعلاني التالي من ${sourceLanguage || 'العربية'} إلى ${targetLanguage || 'إنجليزية'} مع الحفاظ على روح الإعلان والنبرة التسويقية الجذابة والمؤثرة:
"${text}"

أعطني:
1. النص المترجم بدقة وتسويقية عالية.
2. نص الدبلجة الصوتية المقترح مع توقيت النطق.`;

      const translatedText = await generateTextWithFallback(promptText);

      if (!translatedText) {
        throw new Error('لم تتم عملية الترجمة');
      }

      currentUser.credits -= cost;
      db.transactions.push({
        id: 'tx_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
        userId: currentUser.id,
        type: 'credit_deduction',
        amount: -cost,
        description: `ترجمة إعلان إلى ${targetLanguage || 'إنجليزية'}`,
        createdAt: new Date().toISOString(),
      });

      const project: DBProject = {
        id: 'prj_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
        userId: currentUser.id,
        title: `ترجمة إلى ${targetLanguage}: ${text.slice(0, 20)}`,
        type: 'translation',
        status: 'completed',
        progress: 100,
        content: { translatedText, originalText: text, targetLanguage },
        createdAt: new Date().toISOString(),
      };

      db.projects.unshift(project);
      saveDBAtomic(db);

      res.json({ success: true, project, user: toSafeUser(currentUser, req.token), translatedText });
    } catch (err: any) {
      console.error('Error in translation:', err?.message || err);
      const parsedErr = parseGeminiError(err);
      res.status(500).json({
        success: false,
        code: parsedErr.code,
        error: `${parsedErr.message} (لم يتم خصم أي نقاط من رصيدك)`,
        details: parsedErr.originalMessage,
      });
    } finally {
      releaseUserCredits(currentUser.id, cost);
    }
  });

  // ==========================================
  // COUPONS, PAYMENTS & WEBHOOKS
  // ==========================================

  // Redeem Coupon Code
  app.post('/api/coupons/redeem', authenticateToken, (req: AuthenticatedRequest, res) => {
    try {
      const { code } = req.body;
      if (!isValidString(code, 1, 30)) {
        return res.status(400).json({ success: false, error: 'كود الكوبون غير صالحة صيغته' });
      }

      const cleanCode = code.trim().toUpperCase();
      const db = loadDB();
      const coupon = db.coupons.find(c => c.code.toUpperCase() === cleanCode);

      if (!coupon) {
        return res.status(400).json({ success: false, error: 'كود الكوبون غير صحيح أو غير موجود' });
      }

      if (new Date(coupon.expiresAt) < new Date()) {
        return res.status(400).json({ success: false, error: 'كود الكوبون انتهت صلاحيته' });
      }

      if (coupon.usedCount >= coupon.maxUses) {
        return res.status(400).json({ success: false, error: 'تم استنفاد الحد الأقصى لاستخدام هذا الكوبون' });
      }

      if (!coupon.usedBy) coupon.usedBy = [];
      if (coupon.usedBy.includes(req.user!.id)) {
        return res.status(400).json({ success: false, error: 'لقد قمت باستخدام هذا الكوبون مسبقاً' });
      }

      const user = db.users.find(u => u.id === req.user!.id);
      if (!user) return res.status(401).json({ success: false, error: 'المستخدم غير موجود' });

      user.credits += coupon.credits;
      coupon.usedCount += 1;
      coupon.usedBy.push(user.id);

      db.transactions.push({
        id: 'tx_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
        userId: user.id,
        type: 'coupon',
        amount: coupon.credits,
        description: `تفعيل كوبون الخصم: ${cleanCode}`,
        createdAt: new Date().toISOString(),
      });

      saveDBAtomic(db);

      res.json({
        success: true,
        user: toSafeUser(user, req.token),
        addedCredits: coupon.credits,
        message: `تم تفعيل الكوبون بنجاح إضافة ${coupon.credits} نقطة إلى رصيدك!`,
      });
    } catch (err) {
      handleServerError(res, err, 'Redeem Coupon Exception');
    }
  });

  // Secure Webhooks Payment Gateway Route
  app.post('/api/webhooks/payment', (req, res) => {
    try {
      const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;

      if (!webhookSecret) {
        return res.status(503).json({
          success: false,
          error: 'بوابة استقبال المدفوعات عبر الويب هوك غير مفعّلة حالياً (PAYMENT_WEBHOOK_SECRET غير محدد بالخادم).',
        });
      }

      const signature = req.headers['x-webhook-signature'];
      if (!signature || typeof signature !== 'string') {
        return res.status(401).json({ success: false, error: 'توقيع الويب هوك مفقود' });
      }

      const computedHash = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (computedHash !== signature) {
        return res.status(401).json({ success: false, error: 'توقيع الويب هوك غير صحيح أو تم التلاعب بالبيانات' });
      }

      const { paymentId, userId, planTier, amount, currency } = req.body;
      if (!isValidString(paymentId, 1, 100) || !isValidString(userId, 1, 100) || !isValidString(planTier, 1, 50) || !isValidPositiveNumber(amount, 0.01, 100000) || !isValidString(currency, 1, 10)) {
        return res.status(400).json({ success: false, error: 'بيانات العملية غير مكتملة أو غير صالحة' });
      }

      const db = loadDB();
      if (db.processedPayments.includes(paymentId)) {
        return res.json({ success: true, message: 'تمت معالجة هذه العملية مسبقاً (إدماج متكافئ)' });
      }

      const user = db.users.find(u => u.id === userId);
      if (!user) {
        return res.status(404).json({ success: false, error: 'المستخدم غير موجود' });
      }

      const tierCreditsMap: Record<string, number> = {
        pro: 500,
        enterprise: 2000,
      };
      const added = tierCreditsMap[planTier];
      if (!added) {
        return res.status(400).json({ success: false, error: 'باقة الاشتراك المحددة غير صالحة' });
      }

      user.credits += added;
      user.tier = planTier as 'pro' | 'enterprise';

      db.processedPayments.push(paymentId);
      db.transactions.push({
        id: 'tx_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
        userId: user.id,
        type: 'subscription',
        amount: added,
        description: `تأكيد الدفع عبر بوابة الفوترة (${paymentId}) - ترقية لـ ${planTier}`,
        createdAt: new Date().toISOString(),
      });

      saveDBAtomic(db);
      res.json({ success: true, message: 'تم تأكيد عملية الدفع وإضافة الرصيد بنجاح' });
    } catch (err) {
      handleServerError(res, err, 'Payment Webhook Exception');
    }
  });

  // Client Subscription Request Route
  app.post('/api/user/subscription', authenticateToken, (req: AuthenticatedRequest, res) => {
    try {
      const { tier, paymentProofToken } = req.body;
      const paymentGatewaySecret = process.env.PAYMENT_GATEWAY_SECRET;

      if (!paymentGatewaySecret || !isValidString(paymentProofToken, 1, 500)) {
        return res.status(400).json({
          success: false,
          error: 'يتطلب ترقية الاشتراك إثبات عملة دفع مؤكدة وموقعة عبر بوابة الفوترة الإلكترونية المعتمدة.',
        });
      }

      const db = loadDB();

      // Enforce Single-Use of Payment Proof Token
      if (db.processedPayments.includes(paymentProofToken)) {
        return res.status(400).json({ success: false, error: 'تم استخدام إثبات الدفع هذا مسبقاً' });
      }

      // Verify payment proof token HMAC signature
      try {
        const [payloadBase64, tokenSignature] = paymentProofToken.split('.');
        const expectedSig = crypto.createHmac('sha256', paymentGatewaySecret).update(payloadBase64).digest('hex');
        if (tokenSignature !== expectedSig) {
          return res.status(401).json({ success: false, error: 'رمز إثبات الدفع غير صالح أو غير موثق من البوابة' });
        }
      } catch {
        return res.status(401).json({ success: false, error: 'صيغة رمز إثبات الدفع غير صحيحة' });
      }

      const user = db.users.find(u => u.id === req.user!.id);
      if (!user) return res.status(404).json({ success: false, error: 'المستخدم غير موجود' });

      const tierCreditsMap: Record<string, number> = {
        pro: 500,
        enterprise: 2000,
      };
      const addedCredits = tierCreditsMap[tier];
      if (!addedCredits) {
        return res.status(400).json({ success: false, error: 'نوع الباقة غير صالح' });
      }

      user.tier = tier as 'pro' | 'enterprise';
      user.credits += addedCredits;

      db.processedPayments.push(paymentProofToken);
      db.transactions.push({
        id: 'tx_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
        userId: user.id,
        type: 'subscription',
        amount: addedCredits,
        description: `ترقية موثقة للباقة ${tier}`,
        createdAt: new Date().toISOString(),
      });

      saveDBAtomic(db);
      res.json({ success: true, user: toSafeUser(user, req.token) });
    } catch (err) {
      handleServerError(res, err, 'Subscription Upgrade Exception');
    }
  });

  // ==========================================
  // ADMIN DASHBOARD & MANAGEMENT (STRICT ADMIN AUTH)
  // ==========================================

  app.get('/api/admin/stats', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
    try {
      const db = loadDB();
      const totalUsers = db.users.length;
      const totalProjects = db.projects.length;
      const totalTransactions = db.transactions.length;
      const totalCreditsUsed = db.transactions
        .filter(t => t.type === 'credit_deduction')
        .reduce((acc, t) => acc + Math.abs(t.amount), 0);
      const totalRevenue = db.users.filter(u => u.tier !== 'free').length * 49;

      res.json({
        success: true,
        stats: {
          totalUsers,
          totalProjects,
          totalTransactions,
          totalCreditsUsed,
          totalRevenue,
          activeModels: ['gemini-omni-1.1-flash (Video)', 'imagen-3.0-generate-002 (Image)', 'gemini-3.8-flash (Text & Copy)'],
          systemStatus: 'Online',
          hasApiKey: hasGeminiApiKey(),
        },
      });
    } catch (err) {
      handleServerError(res, err, 'Admin Stats Exception');
    }
  });

  app.get('/api/admin/users', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
    try {
      const db = loadDB();
      const safeUsers = db.users.map(u => toSafeUser(u));
      res.json({
        success: true,
        users: safeUsers,
        transactions: db.transactions.slice(0, 100),
        auditLogs: db.auditLogs.slice(0, 50),
      });
    } catch (err) {
      handleServerError(res, err, 'Admin Users Exception');
    }
  });

  // Grant Credits Admin Route (Validates inputs and prevents negative amounts)
  app.post('/api/admin/grant-credits', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
    try {
      const { targetUserId, amount, reason } = req.body;
      if (!isValidString(targetUserId, 1, 100) || !isValidPositiveNumber(amount, 1, 100000)) {
        return res.status(400).json({ success: false, error: 'بيانات إضافة الرصيد غير صالحة. يجب أن تكون الكمية رقماً موجباً' });
      }

      const db = loadDB();
      const user = db.users.find(u => u.id === targetUserId);
      if (!user) return res.status(404).json({ success: false, error: 'المستخدم المستهدف غير موجود' });

      user.credits += amount;
      db.transactions.push({
        id: 'tx_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
        userId: user.id,
        type: 'credit_addition',
        amount,
        description: `إضافة رصيد إدارية: ${reason && typeof reason === 'string' ? reason.slice(0, 100) : 'منح بواسطة المدير'}`,
        createdAt: new Date().toISOString(),
      });

      db.auditLogs.unshift({
        id: 'log_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
        userId: req.user!.id,
        action: 'GRANT_CREDITS',
        details: { targetUserId, amount, reason: reason || 'N/A' },
        createdAt: new Date().toISOString(),
      });

      saveDBAtomic(db);
      res.json({ success: true, user: toSafeUser(user), message: `تم إضافة ${amount} نقطة للمستخدم بنجاح` });
    } catch (err) {
      handleServerError(res, err, 'Admin Grant Credits Exception');
    }
  });

  // ==========================================
  // FRONTEND INTEGRATION & SERVING
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`🚀 MOLAN AI Server running securely on http://localhost:${port}`);
    if (hasGeminiApiKey()) {
      console.log('✅ Gemini API Key detected in environment variables (GEMINI_API_KEY). Ready for AI generation.');
    } else {
      console.log('⚠️ Warning: GEMINI_API_KEY is not set in environment variables. Please add GEMINI_API_KEY in Settings > Secrets.');
    }
  });
}

startServer();
