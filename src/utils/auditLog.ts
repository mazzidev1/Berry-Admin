import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/firebase';

export async function logAdminAction(params: {
  action: string;
  targetCollection: string;
  targetDocId: string;
  targetUserId?: string;
  changes?: Record<string, { before: any; after: any }>;
}): Promise<void> {
  try {
    const adminEmail = auth.currentUser?.email || 'unknown';
    await addDoc(collection(db, 'adminAuditLog'), {
      timestamp: serverTimestamp(),
      adminEmail,
      action: params.action,
      targetCollection: params.targetCollection,
      targetDocId: params.targetDocId,
      targetUserId: params.targetUserId || null,
      changes: params.changes || null,
    });
  } catch (error) {
    console.error('Failed to log admin action', error);
  }
}
