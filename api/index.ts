import type { Request, Response } from 'express';
import { appPromise } from '../server';

/**
 * Vercel's rewrite sends every /api/* URL through this function with its
 * original route in the `path` query parameter. Restore the Express route
 * before handing off so the existing /api/* handlers keep their URLs.
 */
export default async function handler(req: Request, res: Response) {
  try {
    const requestUrl = new URL(req.url || '/', 'http://vercel.local');
    const route = requestUrl.searchParams.get('path');

    if (!route) {
      return res.status(404).json({ success: false, error: 'مسار API غير موجود' });
    }

    const query = new URLSearchParams(requestUrl.searchParams);
    query.delete('path');
    req.url = `/api/${route.replace(/^\/+/, '')}${query.size ? `?${query.toString()}` : ''}`;

    const app = await appPromise;
    return app(req, res);
  } catch (err) {
    console.error('Vercel serverless function initialization failed:', err);
    return res.status(500).json({
      success: false,
      error: 'تعذر تهيئة خدمة الخادم.',
    });
  }
}
