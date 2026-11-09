import { pgTable, text, integer, timestamp, boolean, numeric, bigint, jsonb, uuid, index } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// 1. Users Table
export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    uid: text('uid').notNull().unique(), // Firebase Auth UID
    fullName: text('full_name').notNull(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash'), // Nullable for OAuth Google users
    avatarUrl: text('avatar_url'),
    role: text('role').notNull().default('user'), // 'user' | 'admin'
    accountStatus: text('account_status').notNull().default('active'), // 'active' | 'suspended' | 'deactivated'
    emailVerified: boolean('email_verified').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_users_email').on(table.email),
    index('idx_users_uid').on(table.uid),
    index('idx_users_role').on(table.role),
  ]
);

// 2. Subscriptions Table
export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tier: text('tier').notNull().default('free'), // 'free' | 'pro' | 'enterprise'
    status: text('status').notNull().default('active'), // 'active' | 'canceled' | 'expired' | 'past_due'
    startDate: timestamp('start_date', { withTimezone: true }).defaultNow().notNull(),
    endDate: timestamp('end_date', { withTimezone: true }),
    creditsRefillAmount: integer('credits_refill_amount').notNull().default(50),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_subscriptions_user').on(table.userId),
    index('idx_subscriptions_status').on(table.status),
  ]
);

// 3a. User Balances Table (enforces non-negative balance)
export const userBalances = pgTable(
  'user_balances',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    currentCredits: integer('current_credits').notNull().default(50),
    totalUsedCredits: integer('total_used_credits').notNull().default(0),
    totalPurchasedCredits: integer('total_purchased_credits').notNull().default(50),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_user_balances_user').on(table.userId),
  ]
);

// 3b. Credit Transactions Table
export const creditTransactions = pgTable(
  'credit_transactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(), // 'addition' | 'deduction' | 'refund' | 'subscription_grant' | 'coupon_redeem'
    amount: integer('amount').notNull(),
    balanceAfter: integer('balance_after').notNull(),
    description: text('description'),
    referenceId: text('reference_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_credit_tx_user').on(table.userId, table.createdAt),
  ]
);

// 4. Video Projects Table
export const videoProjects = pgTable(
  'video_projects',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    productDescription: text('product_description').notNull(),
    productImageUrl: text('product_image_url'),
    targetUrl: text('target_url'),
    adStyle: text('ad_style').default('إعلان تسويقي ديناميكي ועصري'),
    aspectRatio: text('aspect_ratio').default('9:16'),
    duration: text('duration').default('10 ثوانٍ'),
    language: text('language').default('العربية (الفصحى الحديثة)'),
    voiceover: text('voiceover').default('تعليق صوتي حماسي ومحفز (Puck)'),
    backgroundMusic: text('background_music').default('موسيقى تجارية حماسية (Upbeat Commercial)'),
    status: text('status').notNull().default('pending'), // 'pending' | 'processing' | 'completed' | 'failed'
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_projects_user').on(table.userId, table.createdAt),
    index('idx_projects_status').on(table.status),
  ]
);

// 5. Generated Videos Table
export const generatedVideos = pgTable(
  'generated_videos',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => videoProjects.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    videoUrl: text('video_url').notNull(),
    thumbnailUrl: text('thumbnail_url'),
    format: text('format').default('mp4'),
    durationSeconds: integer('duration_seconds').default(10),
    fileSizeBytes: bigint('file_size_bytes', { mode: 'number' }).default(0),
    status: text('status').notNull().default('ready'), // 'ready' | 'archived' | 'deleted'
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_videos_user').on(table.userId, table.createdAt),
    index('idx_videos_project').on(table.projectId),
  ]
);

// 6. Payments Table
export const payments = pgTable(
  'payments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').default('SAR'),
    paymentMethod: text('payment_method').notNull(), // 'card' | 'apple_pay' | 'stc_pay' | 'coupon' | 'wire_transfer'
    transactionReference: text('transaction_reference').notNull().unique(),
    status: text('status').notNull().default('completed'), // 'pending' | 'completed' | 'failed' | 'refunded'
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_payments_user').on(table.userId, table.createdAt),
  ]
);

// 7. AI Operation Logs Table
export const aiOperationLogs = pgTable(
  'ai_operation_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    operationType: text('operation_type').notNull(), // 'video_generation' | 'url_analysis' | 'story_expansion'
    modelName: text('model_name').notNull().default('gemini-omni-1.1-flash'),
    creditsSpent: integer('credits_spent').notNull().default(0),
    status: text('status').notNull(), // 'success' | 'failed' | 'rate_limited'
    errorMessage: text('error_message'),
    executionTimeMs: integer('execution_time_ms'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_ai_logs_user').on(table.userId, table.createdAt),
  ]
);

// 8. Notifications Table
export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    message: text('message').notNull(),
    type: text('type').notNull(), // 'video_success' | 'operation_failed' | 'subscription' | 'payment' | 'system'
    isRead: boolean('is_read').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_notifications_user').on(table.userId, table.isRead, table.createdAt),
  ]
);

// 9. Saved Items (Favorites) Table
export const savedItems = pgTable(
  'saved_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id').references(() => videoProjects.id, { onDelete: 'cascade' }),
    videoId: uuid('video_id').references(() => generatedVideos.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    category: text('category').default('إعلان'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_saved_user').on(table.userId, table.createdAt),
  ]
);

// 10. System Settings Table
export const systemSettings = pgTable(
  'system_settings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    settingKey: text('setting_key').notNull().unique(),
    settingValue: jsonb('setting_value').notNull(),
    description: text('description'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  }
);

// 11. Activity Logs Table
export const activityLogs = pgTable(
  'activity_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    action: text('action').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_activity_user').on(table.userId, table.createdAt),
  ]
);

// Relations Definitions
export const usersRelations = relations(users, ({ many, one }) => ({
  subscriptions: many(subscriptions),
  balance: one(userBalances, {
    fields: [users.id],
    references: [userBalances.userId],
  }),
  projects: many(videoProjects),
  videos: many(generatedVideos),
  payments: many(payments),
  notifications: many(notifications),
  savedItems: many(savedItems),
}));

export const videoProjectsRelations = relations(videoProjects, ({ one, many }) => ({
  author: one(users, {
    fields: [videoProjects.userId],
    references: [users.id],
  }),
  generatedVideos: many(generatedVideos),
}));
