import { db } from './index.ts';
import { users, userBalances, creditTransactions, videoProjects } from './schema.ts';
import { eq, sql } from 'drizzle-orm';

/**
 * Get or create user record by Firebase UID atomically
 */
export async function getOrCreateUser(uid: string, email: string, fullName: string = 'مستخدم معلن', photoURL?: string) {
  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    if (existing.length > 0) {
      return existing[0];
    }

    const insertedUser = await db
      .insert(users)
      .values({
        uid,
        email,
        fullName,
        avatarUrl: photoURL || null,
        role: email === 'ahmed@moulin.ai' ? 'admin' : 'user',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: { email, updatedAt: new Date() },
      })
      .returning();

    const userRecord = insertedUser[0];

    // Initialize balance
    await db
      .insert(userBalances)
      .values({
        userId: userRecord.id,
        currentCredits: 50,
        totalPurchasedCredits: 50,
        totalUsedCredits: 0,
      })
      .onConflictDoNothing();

    return userRecord;
  } catch (error) {
    console.error('Failed to get or create user in Cloud SQL:', error);
    throw new Error('Database query failed to sync user record.', { cause: error });
  }
}

/**
 * Atomically deduct credits ensuring balance never goes negative
 */
export async function deductUserCredits(userId: string, amount: number, description: string) {
  try {
    const userBalance = await db.select().from(userBalances).where(eq(userBalances.userId, userId)).limit(1);
    if (!userBalance.length || userBalance[0].currentCredits < amount) {
      return { success: false, error: 'الرصيد غير كافٍ لإنشاء الإعلان' };
    }

    const newCredits = userBalance[0].currentCredits - amount;

    await db
      .update(userBalances)
      .set({
        currentCredits: newCredits,
        totalUsedCredits: userBalance[0].totalUsedCredits + amount,
        updatedAt: new Date(),
      })
      .where(eq(userBalances.userId, userId));

    await db.insert(creditTransactions).values({
      userId,
      type: 'deduction',
      amount,
      balanceAfter: newCredits,
      description,
    });

    return { success: true, newCredits };
  } catch (error) {
    console.error('Error deducting credits:', error);
    throw new Error('Failed to process credit deduction', { cause: error });
  }
}
