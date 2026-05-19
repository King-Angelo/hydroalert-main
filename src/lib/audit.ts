import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export async function writeAuditLog(
  adminId: string,
  adminEmail: string,
  action: string,
  target: string,
  details: string
): Promise<void> {
  try {
    await addDoc(collection(db, 'auditLogs'), {
      adminId,
      adminEmail,
      action,
      target,
      details,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error(error);
  }
}
