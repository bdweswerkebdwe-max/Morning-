export interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
  tier: 'free' | 'pro' | 'enterprise';
  role: 'admin' | 'user';
  avatar: string;
  isAdmin?: boolean;
  createdAt?: string;
  token?: string;
}

export type ProjectType = 'video' | 'creative_video' | 'image' | 'copy' | 'product_ad' | 'actor_video' | 'translation' | 'marketing_plan' | 'workflow';

export interface Project {
  id: string;
  userId: string;
  title: string;
  type: ProjectType;
  platform?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  progress?: number;
  errorMessage?: string;
  content: any;
  createdAt: string;
}

export interface Template {
  id: string;
  title: string;
  category: string;
  description: string;
  product: string;
  platform: string;
  tone: string;
  audience: string;
  goal: string;
  icon: string;
  previewUrl?: string;
}

export interface AIActor {
  id: string;
  name: string;
  nameAr: string;
  gender: 'male' | 'female';
  age: string;
  dialect: 'saudi' | 'egyptian' | 'emirati' | 'levantine' | 'msa' | 'english';
  dialectNameAr: string;
  style: 'corporate' | 'casual' | 'ugc' | 'traditional';
  avatarUrl: string;
  voiceSampleUrl?: string;
  videoPreviewUrl?: string;
  isCustom?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'credit_deduction' | 'credit_addition' | 'subscription' | 'refund' | 'coupon';
  amount: number;
  description: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  credits: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  usedBy?: string[];
}

export interface WorkflowVariant {
  id: string;
  hook: string;
  actorId: string;
  language: string;
  aspectRatio: string;
  status: 'pending' | 'completed' | 'failed';
  resultUrl?: string;
}

