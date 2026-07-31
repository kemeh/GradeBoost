import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from '../firebase';
import { UserProfile } from '../types';
import { Button, Card, Badge, cn } from '../components/ui';
import { Search, Shield, User, GraduationCap, Unlock, Lock, UserX, UserCheck, KeyRound, History, Plus, X, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminUnlockAccount } from '../services/authSecurityService';
import { logAuditEvent, fetchAuditLogs, AuditLogEntry } from '../services/auditService';
import { formatDate } from '../utils/dateUtils';

export default function AdminUserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'teacher' | 'student'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'locked'>('all');
  
  const [selectedUserLogs, setSelectedUserLogs] = useState<{ email: string; logs: AuditLogEntry[] } | null>(null);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'teacher' as 'student' | 'teacher' | 'admin',
    subject: 'Biology',
    school: 'GCE Center',
    region: 'Center',
  });
  const [creating, setCreating] = useState(false);

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
      console.error('Error fetching users for admin:', error);
      toast.error('Failed to load user list.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (uid: string, newRole: 'student' | 'teacher' | 'admin', userEmail: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        role: newRole,
        // Teachers and admins automatically get payment access
        isPaid: newRole !== 'student',
        paymentStatus: newRole !== 'student' ? 'paid' : 'unpaid',
      });
      toast.success(`User role updated to ${newRole}`);
      await logAuditEvent({
        userId: uid,
        userEmail,
        action: 'ROLE_CHANGED',
        details: `Role updated to ${newRole} by Administrator`,
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const handleToggleStatus = async (userItem: UserProfile) => {
    const newStatus = userItem.status === 'suspended' ? 'active' : 'suspended';
    try {
      await updateDoc(doc(db, 'users', userItem.uid), {
        status: newStatus,
      });
      toast.success(`Account status set to ${newStatus}`);
      await logAuditEvent({
        userId: userItem.uid,
        userEmail: userItem.email,
        action: newStatus === 'suspended' ? 'USER_SUSPENDED' : 'USER_ACTIVATED',
        details: `User status changed to ${newStatus} by Administrator`,
      });
      fetchUsers();
    } catch (error) {
      console.error('Error changing status:', error);
      toast.error('Failed to change user status');
    }
  };

  const handleUnlockUser = async (userItem: UserProfile) => {
    try {
      await adminUnlockAccount(userItem.email, userItem.uid);
      toast.success(`Unlocked account for ${userItem.email}`);
      fetchUsers();
    } catch (error) {
      console.error('Error unlocking account:', error);
      toast.error('Failed to unlock account');
    }
  };

  const handleSendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success(`Password reset email sent to ${email}`);
      await logAuditEvent({
        userEmail: email,
        action: 'PASSWORD_RESET_REQUEST',
        details: 'Password reset link sent by Administrator',
      });
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      toast.error(error.message || 'Failed to send password reset');
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
      // Create profile document directly or via secondary auth if needed
      const tempRef = doc(collection(db, 'users'));
      await setDoc(tempRef, {
        name: createForm.name,
        email: createForm.email,
        subject: createForm.subject,
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

      toast.success(`User profile pre-created for ${createForm.email}`);
      await logAuditEvent({
        userId: tempRef.id,
        userEmail: createForm.email,
        action: 'REGISTER_SUCCESS',
        details: `Account profile pre-created by Admin with role ${createForm.role}`,
      });
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        email: '',
        password: '',
        role: 'teacher',
        subject: 'Biology',
        school: 'GCE Center',
        region: 'Center',
      });
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to create user:', error);
      toast.error(error.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.school || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || (u.role || 'student') === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'suspended' ? u.status === 'suspended' :
       statusFilter === 'locked' ? (u.isLocked || (u.failedLoginAttempts || 0) >= 5) :
       (u.status !== 'suspended' && !u.isLocked));

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">User Management & Security</h2>
          <p className="text-sm font-medium text-slate-500">
            Control roles, user access levels, audit security logs, and unlock accounts.
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="rounded-2xl">
          <Plus size={18} className="mr-2" /> Add User / Teacher
        </Button>
      </div>

      {/* Filters & Search */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by name, email, school..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-600 outline-none"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <select
              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as any)}
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          <div>
            <select
              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none"
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
            No users found matching your criteria.
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
                  <th className="p-4">Registered</th>
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
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-600">
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
                        <p className="text-xs font-bold text-slate-700">{userItem.subject || 'Not Set'}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{userItem.level || 'O-Level'}</p>
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-500">
                        {userItem.createdAt ? formatDate(userItem.createdAt) : 'N/A'}
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
                            isSuspended 
                              ? "text-emerald-600 border-emerald-200 hover:bg-emerald-50" 
                              : "text-red-600 border-red-200 hover:bg-red-50"
                          )}
                          title={isSuspended ? "Activate User" : "Suspend User"}
                        >
                          {isSuspended ? <UserCheck size={14} /> : <UserX size={14} />}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendPasswordReset(userItem.email)}
                          className="text-slate-600 border-slate-200 hover:bg-slate-100 rounded-xl"
                          title="Send Password Reset Email"
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* User Logs Modal */}
      {selectedUserLogs && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Audit Logs: {selectedUserLogs.email}</h3>
                <p className="text-xs text-slate-400 font-medium">Security and action history recorded by GradeBoost60</p>
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
              <p className="text-sm text-slate-500 text-center py-6">No audit log entries recorded for this user.</p>
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
              <h3 className="text-lg font-black text-slate-900">Add New User / Teacher</h3>
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
                <label className="text-xs font-bold text-slate-600">Subject</label>
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
