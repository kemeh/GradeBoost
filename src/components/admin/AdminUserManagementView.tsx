import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy, setDoc, serverTimestamp } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from '../../firebase';
import { UserProfile } from '../../types';
import { Button, Card, Badge, cn, Tabs, TabsList, TabsTrigger, TabsContent } from '../ui';
import { Search, Shield, User, GraduationCap, Unlock, Lock, UserX, UserCheck, KeyRound, History, Plus, X, Loader2, Mail, CheckCircle2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { adminUnlockAccount } from '../../services/authSecurityService';
import { logAuditEvent, fetchAuditLogs, AuditLogEntry } from '../../services/auditService';
import { deleteUserAccount } from '../../services/userDeletionService';
import { formatDate } from '../../utils/dateUtils';

export default function AdminUserManagementView() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<'all' | 'teachers' | 'students'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'locked'>('all');

  const [selectedUserLogs, setSelectedUserLogs] = useState<{ email: string; logs: AuditLogEntry[] } | null>(null);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    role: 'teacher' as 'student' | 'teacher' | 'admin',
    subject: 'Biology',
    level: 'Ordinary level',
    school: 'GCE Center',
    region: 'Center',
  });
  const [creating, setCreating] = useState(false);

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete || !currentUser) return;
    setIsDeleting(true);

    try {
      const adminUser = {
        uid: currentUser.uid,
        email: currentUser.email,
        name: currentUser.name || 'Admin',
        role: currentUser.role,
      };

      const result = await deleteUserAccount(
        adminUser,
        userToDelete.uid,
        userToDelete.email,
        userToDelete.name || 'Student'
      );

      if (result.success) {
        toast.success('Student deleted successfully');
        setUserToDelete(null);
        await fetchUsers();
      } else {
        toast.error(result.message || 'Unable to delete student. Please try again.');
      }
    } catch (err: any) {
      console.error('Delete user handler error:', err);
      toast.error('Unable to delete student. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as UserProfile[];
      setUsers(list);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load user list.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (uid: string, newRole: 'student' | 'teacher' | 'admin', userEmail: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        role: newRole,
        isPaid: newRole !== 'student',
        paymentStatus: newRole !== 'student' ? 'paid' : 'unpaid',
      });
      toast.success(`Role changed to ${newRole}`);
      await logAuditEvent({
        userId: uid,
        userEmail,
        action: 'ROLE_CHANGED',
        details: `Updated role to ${newRole} by Admin`,
      });
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const handleToggleStatus = async (userItem: UserProfile) => {
    const newStatus = userItem.status === 'suspended' ? 'active' : 'suspended';
    try {
      await updateDoc(doc(db, 'users', userItem.uid), { status: newStatus });
      toast.success(`Account set to ${newStatus}`);
      await logAuditEvent({
        userId: userItem.uid,
        userEmail: userItem.email,
        action: newStatus === 'suspended' ? 'USER_SUSPENDED' : 'USER_ACTIVATED',
        details: `Account status updated to ${newStatus}`,
      });
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleUnlockUser = async (userItem: UserProfile) => {
    try {
      await adminUnlockAccount(userItem.email, userItem.uid);
      toast.success(`Unlocked account for ${userItem.email}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to unlock account');
    }
  };

  const handleSendReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success(`Password reset email sent to ${email}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    }
  };

  const handleViewLogs = async (email: string) => {
    setLoadingLogs(true);
    try {
      const logs = await fetchAuditLogs(30, email);
      setSelectedUserLogs({ email, logs });
    } catch (error) {
      toast.error('Failed to fetch audit logs');
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const tempRef = doc(collection(db, 'users'));
      await setDoc(tempRef, {
        name: createForm.name,
        email: createForm.email,
        subject: createForm.subject,
        level: createForm.level,
        school: createForm.school,
        region: createForm.region,
        role: createForm.role,
        status: 'active',
        assignedPapers: ['paper1', 'paper2'],
        targetGrade: 'A',
        isPaid: createForm.role !== 'student',
        paymentStatus: createForm.role !== 'student' ? 'paid' : 'unpaid',
        createdAt: serverTimestamp(),
      });

      toast.success(`Created account for ${createForm.email}`);
      await logAuditEvent({
        userId: tempRef.id,
        userEmail: createForm.email,
        action: 'REGISTER_SUCCESS',
        details: `Account pre-created by Admin as ${createForm.role}`,
      });
      setShowCreateModal(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.school || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.subject || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = 
      subTab === 'all' ? true :
      subTab === 'teachers' ? u.role === 'teacher' :
      (u.role === 'student' || !u.role);

    const isLocked = u.isLocked || (u.failedLoginAttempts || 0) >= 5;
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'suspended' ? u.status === 'suspended' :
      statusFilter === 'locked' ? isLocked :
      (u.status !== 'suspended' && !isLocked);

    return matchesSearch && matchesTab && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Users, Teachers & Students</h2>
          <p className="text-sm font-medium text-slate-500">
            Comprehensive account management, role assignment, lockout resolution, and security auditing.
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="rounded-2xl">
          <Plus size={18} className="mr-2" /> Add User / Teacher
        </Button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setSubTab('all')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2",
            subTab === 'all' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
          )}
        >
          <User size={14} /> All Accounts ({users.length})
        </button>
        <button
          onClick={() => setSubTab('teachers')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2",
            subTab === 'teachers' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
          )}
        >
          <Shield size={14} /> Teachers ({users.filter(u => u.role === 'teacher').length})
        </button>
        <button
          onClick={() => setSubTab('students')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2",
            subTab === 'students' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
          )}
        >
          <GraduationCap size={14} /> Students ({users.filter(u => u.role === 'student' || !u.role).length})
        </button>
      </div>

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by name, email, subject, or school..."
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white outline-none"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <select
              className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="locked">Locked Out</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users Data Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-medium">
            No accounts found for the current selection.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-black tracking-widest text-slate-400">
                  <th className="p-4 pl-6">User / Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Subject & Level</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(userItem => {
                  const isLocked = userItem.isLocked || (userItem.failedLoginAttempts || 0) >= 5;
                  const isSuspended = userItem.status === 'suspended';

                  return (
                    <tr key={userItem.uid} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm",
                            userItem.role === 'admin' ? "bg-purple-100 text-purple-700" :
                            userItem.role === 'teacher' ? "bg-blue-100 text-blue-700" :
                            "bg-indigo-50 text-indigo-600"
                          )}>
                            {userItem.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm leading-tight">{userItem.name || 'Unnamed User'}</p>
                            <p className="text-xs text-slate-400 font-medium">{userItem.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <select
                          className="p-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                          value={userItem.role || 'student'}
                          onChange={e => handleRoleChange(userItem.uid, e.target.value as any, userItem.email)}
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>

                      <td className="p-4">
                        {isSuspended ? (
                          <Badge variant="danger" className="rounded-xl">Suspended</Badge>
                        ) : isLocked ? (
                          <Badge variant="warning" className="rounded-xl">Locked Out</Badge>
                        ) : (
                          <Badge variant="success" className="rounded-xl">Active</Badge>
                        )}
                      </td>

                      <td className="p-4">
                        <p className="text-xs font-bold text-slate-700">{userItem.subject || 'General'}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{userItem.level || 'Ordinary level'}</p>
                      </td>

                      <td className="p-4">
                        {userItem.paymentStatus === 'paid' || userItem.isPaid ? (
                          <Badge variant="success" className="rounded-xl">Paid</Badge>
                        ) : (
                          <Badge variant="neutral" className="rounded-xl">Unpaid</Badge>
                        )}
                      </td>

                      <td className="p-4 pr-6 text-right space-x-2">
                        {isLocked && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleUnlockUser(userItem)}
                            className="text-amber-600 border-amber-200 hover:bg-amber-50 rounded-xl"
                            title="Unlock Account"
                          >
                            <Unlock size={14} className="mr-1" /> Unlock
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(userItem)}
                          className={cn(
                            "rounded-xl",
                            isSuspended ? "text-emerald-600 border-emerald-200 hover:bg-emerald-50" : "text-red-600 border-red-200 hover:bg-red-50"
                          )}
                          title={isSuspended ? "Activate User" : "Suspend User"}
                        >
                          {isSuspended ? <UserCheck size={14} /> : <UserX size={14} />}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendReset(userItem.email)}
                          className="text-slate-600 border-slate-200 hover:bg-slate-100 rounded-xl"
                          title="Reset Password Email"
                        >
                          <KeyRound size={14} />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewLogs(userItem.email)}
                          className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 rounded-xl"
                          title="View Security Logs"
                        >
                          <History size={14} />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUserToDelete(userItem)}
                          className="text-red-600 border-red-200 hover:bg-red-50 rounded-xl"
                          title="Permanently Delete Student Account"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-6 bg-white border border-slate-100 shadow-2xl rounded-3xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Delete Account Confirmation</h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">{userToDelete.name || 'Student'} ({userToDelete.email})</p>
              </div>
            </div>

            <div className="p-4 bg-red-50/70 border border-red-100 rounded-2xl text-red-800 text-xs font-bold leading-relaxed">
              Are you sure you want to permanently delete this student? This action cannot be undone.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                disabled={isDeleting}
                onClick={() => setUserToDelete(null)}
                className="rounded-xl border-slate-200 font-bold text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={isDeleting}
                onClick={handleConfirmDeleteUser}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                Permanently Delete
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Audit Logs Modal */}
      {selectedUserLogs && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Audit Logs: {selectedUserLogs.email}</h3>
                <p className="text-xs text-slate-400 font-medium">Recorded activity and auth events</p>
              </div>
              <button onClick={() => setSelectedUserLogs(null)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {loadingLogs ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-indigo-600" size={24} />
              </div>
            ) : selectedUserLogs.logs.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No security activity logged.</p>
            ) : (
              <div className="space-y-3">
                {selectedUserLogs.logs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-indigo-600">{log.action}</span>
                      <p className="text-xs font-medium text-slate-700 mt-1">{log.details}</p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">
                      {log.timestamp?.toDate ? formatDate(log.timestamp.toDate().toISOString()) : 'Recent'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-black text-slate-900">Add Account Profile</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none mt-1"
                  value={createForm.name}
                  onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none mt-1"
                  value={createForm.email}
                  onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600">Role</label>
                <select
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none mt-1"
                  value={createForm.role}
                  onChange={e => setCreateForm({ ...createForm, role: e.target.value as any })}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600">Primary Subject</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none mt-1"
                  value={createForm.subject}
                  onChange={e => setCreateForm({ ...createForm, subject: e.target.value })}
                />
              </div>

              <Button type="submit" loading={creating} className="w-full rounded-xl">
                Create Account Profile
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
