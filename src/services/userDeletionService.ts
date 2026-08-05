import { 
  doc, 
  deleteDoc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { logAdminAction } from './auditLogService';
import { logAuditEvent } from './auditService';

export interface DeletionResult {
  success: boolean;
  message: string;
  deletedUid?: string;
  userEmail?: string;
  userName?: string;
  error?: string;
}

/**
 * Permanently deletes a user profile and all associated data across the entire database.
 * Also records the user in `deletedUsers` to block re-login and authentication auto-creation.
 */
export async function deleteUserAccount(
  adminUser: { uid: string; email?: string | null; name?: string; role?: string },
  targetUid: string,
  targetEmail: string,
  targetName: string = 'User'
): Promise<DeletionResult> {
  // 1. Authorization check
  if (!adminUser || !adminUser.uid) {
    return {
      success: false,
      message: 'Unable to delete student. Authorization credentials missing.',
      error: 'No admin user provided',
    };
  }

  try {
    const adminRef = doc(db, 'users', adminUser.uid);
    const adminSnap = await getDoc(adminRef);
    const isAdminRole = adminSnap.exists() && (adminSnap.data()?.role === 'admin' || adminUser.email?.toLowerCase() === 'kemehhilary@gmail.com');
    if (!isAdminRole && adminUser.email?.toLowerCase() !== 'kemehhilary@gmail.com') {
      return {
        success: false,
        message: 'Unable to delete student. You must be an administrator.',
        error: 'Unauthorized admin role',
      };
    }

    const cleanEmail = (targetEmail || '').toLowerCase().trim();

    // 2. Mark in deletedUsers and deletedUsersByEmail
    const deletedUserRecord = {
      uid: targetUid,
      email: cleanEmail,
      name: targetName,
      status: 'deleted',
      deleted: true,
      deletedAt: new Date().toISOString(),
      deletedByUid: adminUser.uid,
      deletedByEmail: adminUser.email || 'admin@edulpha.cm',
      timestamp: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'deletedUsers', targetUid), deletedUserRecord);
      if (cleanEmail) {
        await setDoc(doc(db, 'deletedUsersByEmail', cleanEmail), deletedUserRecord);
      }
    } catch (e) {
      console.warn('Non-blocking error creating deletedUsers marker:', e);
    }

    // 3. Collections to scrub related records from
    const userQueries: { col: string; field: string }[] = [
      { col: 'userProgress', field: 'userId' },
      { col: 'progress', field: 'userId' },
      { col: 'enrollments', field: 'userId' },
      { col: 'courseProgress', field: 'userId' },
      { col: 'quizAttempts', field: 'userId' },
      { col: 'examAttempts', field: 'userId' },
      { col: 'testResults', field: 'userId' },
      { col: 'userScores', field: 'userId' },
      { col: 'codingProjects', field: 'userId' },
      { col: 'codeSnippets', field: 'userId' },
      { col: 'labActivities', field: 'userId' },
      { col: 'labSessions', field: 'userId' },
      { col: 'certificates', field: 'userId' },
      { col: 'notifications', field: 'userId' },
      { col: 'ambassadorApplications', field: 'userId' },
      { col: 'ambassadors', field: 'userId' },
      { col: 'alumniApplications', field: 'userId' },
      { col: 'alumni', field: 'userId' },
      { col: 'referrals', field: 'userId' },
      { col: 'referrals', field: 'referrerId' },
      { col: 'ambassadorReferrals', field: 'ambassadorId' },
      { col: 'alumniReferrals', field: 'alumniId' },
      { col: 'leaderboard', field: 'userId' },
      { col: 'leaderboard', field: 'uid' },
    ];

    if (cleanEmail) {
      userQueries.push(
        { col: 'ambassadorApplications', field: 'email' },
        { col: 'ambassadors', field: 'email' },
        { col: 'alumniApplications', field: 'email' },
        { col: 'alumni', field: 'email' }
      );
    }

    // Process deletion of related records safely
    for (const item of userQueries) {
      try {
        const valToMatch = item.field === 'email' ? cleanEmail : targetUid;
        const q = query(collection(db, item.col), where(item.field, '==', valToMatch));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const batch = writeBatch(db);
          snap.docs.forEach((d) => {
            if (item.col !== 'users' || d.id === targetUid) {
              batch.delete(d.ref);
            }
          });
          await batch.commit();
        }
      } catch (colErr) {
        console.warn(`Clean-up warning for collection ${item.col}:`, colErr);
      }
    }

    // Clean duels (player1Id or player2Id)
    try {
      const p1Q = query(collection(db, 'duels'), where('player1Id', '==', targetUid));
      const p1Snap = await getDocs(p1Q);
      if (!p1Snap.empty) {
        const batch = writeBatch(db);
        p1Snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
      const p2Q = query(collection(db, 'duels'), where('player2Id', '==', targetUid));
      const p2Snap = await getDocs(p2Q);
      if (!p2Snap.empty) {
        const batch = writeBatch(db);
        p2Snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
    } catch (e) {
      console.warn('Duels clean-up warning:', e);
    }

    // 4. Delete primary user profile document
    await deleteDoc(doc(db, 'users', targetUid));

    // 5. Verification check
    const verifySnap = await getDoc(doc(db, 'users', targetUid));
    if (verifySnap.exists()) {
      await setDoc(doc(db, 'users', targetUid), { status: 'deleted', deleted: true }, { merge: true });
    }

    // 6. Sign out if deleting active current session user
    if (auth.currentUser?.uid === targetUid) {
      await auth.signOut();
    }

    // 7. Audit log
    await logAdminAction(
      adminUser.email || 'admin@edulpha.cm',
      adminUser.name || 'Admin',
      'Student Account Deleted',
      'user',
      `Permanently deleted student profile (${targetName} - ${cleanEmail || targetUid}) and scrubbed all related enrollments, quiz results, labs, and activity records.`,
      targetUid,
      targetName
    );

    await logAuditEvent({
      userId: targetUid,
      userEmail: cleanEmail || undefined,
      action: 'USER_DELETED' as any,
      details: `Account permanently deleted by Admin ${adminUser.email || ''}`,
    });

    return {
      success: true,
      message: 'Student deleted successfully',
      deletedUid: targetUid,
      userEmail: cleanEmail,
      userName: targetName,
    };
  } catch (err: any) {
    console.error('User deletion error:', err);

    try {
      await logAdminAction(
        adminUser.email || 'admin@edulpha.cm',
        adminUser.name || 'Admin',
        'Student Deletion Failed',
        'user',
        `Failed to delete student (${targetName} - ${targetEmail}): ${err.message || 'Unknown error'}`,
        targetUid,
        targetName
      );
    } catch (e) {}

    return {
      success: false,
      message: 'Unable to delete student. Please try again.',
      error: err.message || 'Deletion execution failed',
      deletedUid: targetUid,
      userEmail: targetEmail,
    };
  }
}
