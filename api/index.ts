import type { Request, Response } from 'express';
import appPromise from '../server';

export default async function handler(req: Request, res: Response) {
  try {
    const app = await appPromise;
    return app(req, res);
  } catch (err: any) {
    console.error('❌ Vercel Serverless Function Error:', err);
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ في الخادم (Vercel Serverless Function Exception)',
      message: err?.message || String(err),
    });
  }
}
