import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { SystemNotification } from '../../types';
import { Card, Button, Badge, cn } from '../ui';
import { Bell, Send, Trash2, Users, GraduationCap, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../utils/dateUtils';

export default function AdminNotificationsManager() {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    targetAudience: 'all' as 'all' | 'students' | 'teachers',
    targetSubject: 'All Subjects',
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'system_notifications'), orderBy('createdAt', 'desc')));
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })) as SystemNotification[]);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await addDoc(collection(db, 'system_notifications'), {
        title: form.title,
        message: form.message,
        targetAudience: form.targetAudience,
        targetSubject: form.targetSubject,
        sentBy: 'System Admin',
        createdAt: serverTimestamp(),
      });

      toast.success('Broadcast notification sent to target users!');
      setShowModal(false);
      setForm({
        title: '',
        message: '',
        targetAudience: 'all',
        targetSubject: 'All Subjects',
      });
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to broadcast notification');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification broadcast?')) return;
    try {
      await deleteDoc(doc(db, 'system_notifications', id));
      toast.success('Notification removed');
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Broadcast Notifications & Announcements</h2>
          <p className="text-sm font-medium text-slate-500">
            Dispatch platform announcements, exam countdown reminders, and targeted study notifications.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="rounded-2xl">
          <Send size={16} className="mr-2" /> New Broadcast Announcement
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">No system notifications sent yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map(n => (
              <div key={n.id} className="p-6 hover:bg-slate-50/50 flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="indigo" className="text-[10px] uppercase">
                      Audience: {n.targetAudience}
                    </Badge>
                    {n.targetSubject && n.targetSubject !== 'All Subjects' && (
                      <Badge variant="neutral" className="text-[10px]">{n.targetSubject}</Badge>
                    )}
                    <span className="text-xs text-slate-400 font-bold">
                      {n.createdAt?.toDate ? formatDate(n.createdAt.toDate().toISOString()) : 'Recently'}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900">{n.title}</h3>
                  <p className="text-sm text-slate-600 font-medium">{n.message}</p>
                </div>

                <button 
                  onClick={() => handleDeleteNotification(n.id)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50"
                  title="Delete Announcement"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Broadcast Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-black text-slate-900">Broadcast System Announcement</h3>
              <button onClick={() => setShowModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600">Announcement Headline</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Mock Biology Paper 1 Live Now!" 
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-sm font-bold mt-1 outline-none"
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600">Target Audience</label>
                <select 
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold mt-1 outline-none"
                  value={form.targetAudience}
                  onChange={e => setForm({...form, targetAudience: e.target.value as any})}
                >
                  <option value="all">All System Accounts</option>
                  <option value="students">Students Only</option>
                  <option value="teachers">Teachers Only</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600">Notification Message Body</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Enter message details for students and teachers..." 
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold mt-1 outline-none"
                  value={form.message}
                  onChange={e => setForm({...form, message: e.target.value})}
                />
              </div>

              <Button type="submit" loading={sending} className="w-full rounded-xl">
                Dispatch Broadcast Announcement
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
