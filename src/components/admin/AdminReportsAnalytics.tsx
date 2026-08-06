import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Card, Button, Badge, cn } from '../ui';
import { FileSpreadsheet, Download, TrendingUp, AlertTriangle, CheckCircle2, Search, Filter, BarChart2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../utils/dateUtils';

export default function AdminReportsAnalytics() {
  const [studentsReport, setStudentsReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | 'at_risk' | 'high_performing'>('all');

  useEffect(() => {
    fetchAcademicReports();
  }, []);

  const fetchAcademicReports = async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const examAttemptsSnap = await getDocs(collection(db, 'exam_attempts'));
      const attemptsList = examAttemptsSnap.docs.map(d => d.data());

      const reportData = usersSnap.docs.map(doc => {
        const u = doc.data();
        const studentAttempts = attemptsList.filter(a => a.userId === doc.id || a.userEmail === u.email);
        const totalExams = studentAttempts.length;
        const passedExams = studentAttempts.filter(a => a.passed || (a.percentage && a.percentage >= 50)).length;
        const avgPercentage = totalExams > 0
          ? Math.round(studentAttempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / totalExams)
          : (u.diagnosticResults?.avgScore ? Math.round(u.diagnosticResults.avgScore) : 0);

        const isAtRisk = avgPercentage > 0 && avgPercentage < 45;
        const isHighPerforming = avgPercentage >= 75;

        return {
          uid: doc.id,
          name: u.name || 'Unnamed Student',
          email: u.email,
          role: u.role || 'student',
          subject: u.subject || 'Biology',
          level: u.level || 'Ordinary level',
          totalExams,
          passedExams,
          avgPercentage,
          isAtRisk,
          isHighPerforming,
          hasTakenDiagnostic: !!u.hasTakenDiagnostic,
        };
      });

      setStudentsReport(reportData.filter(r => r.role === 'student'));
    } catch (err) {
      console.error('Error generating academic reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (studentsReport.length === 0) {
      toast.error('No report data available to export');
      return;
    }

    const headers = ['Name', 'Email', 'Subject', 'Level', 'Exams Taken', 'Exams Passed', 'Average Score %', 'Status'];
    const rows = studentsReport.map(s => [
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.subject}"`,
      `"${s.level}"`,
      s.totalExams,
      s.passedExams,
      `${s.avgPercentage}%`,
      s.isAtRisk ? 'At Risk' : s.isHighPerforming ? 'High Performing' : 'Average',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Edulpha_Academic_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Academic Performance Report exported as CSV!');
  };

  const filteredReports = studentsReport.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk = 
      filterRisk === 'all' ? true :
      filterRisk === 'at_risk' ? s.isAtRisk :
      s.isHighPerforming;

    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Academic Reports & Student Intelligence</h2>
          <p className="text-sm font-medium text-slate-500">
            Diagnostic insights, pass rate analysis, and exportable CSV student mastery reports.
          </p>
        </div>
        <Button onClick={handleExportCSV} className="rounded-2xl">
          <Download size={16} className="mr-2" /> Export CSV Report
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search report by student name, email, or subject..."
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <select
              className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none"
              value={filterRisk}
              onChange={e => setFilterRisk(e.target.value as any)}
            >
              <option value="all">All Performance Tiers</option>
              <option value="at_risk">At-Risk Students (&lt;45%)</option>
              <option value="high_performing">High Performers (&ge;75%)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Reports Table */}
      <Card className="p-0 overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">No student reports matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-black tracking-widest text-slate-400">
                  <th className="p-4 pl-6">Student</th>
                  <th className="p-4">Subject & Level</th>
                  <th className="p-4">Exams Completed</th>
                  <th className="p-4">Average Score</th>
                  <th className="p-4">Diagnostic Status</th>
                  <th className="p-4 pr-6 text-right">Performance Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map(s => (
                  <tr key={s.uid} className="hover:bg-slate-50/50">
                    <td className="p-4 pl-6 font-bold text-slate-900 text-sm">
                      {s.name}
                      <span className="block text-xs font-medium text-slate-400">{s.email}</span>
                    </td>
                    <td className="p-4 text-xs font-bold text-indigo-600">
                      {s.subject}
                      <span className="block text-[10px] text-slate-400 font-medium">{s.level}</span>
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-700">
                      {s.totalExams} exams ({s.passedExams} passed)
                    </td>
                    <td className="p-4 text-sm font-black text-slate-900">
                      {s.avgPercentage > 0 ? `${s.avgPercentage}%` : 'N/A'}
                    </td>
                    <td className="p-4 text-xs font-bold">
                      {s.hasTakenDiagnostic ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 size={14} /> Completed
                        </span>
                      ) : (
                        <span className="text-slate-400">Pending</span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {s.isAtRisk ? (
                        <Badge variant="danger" className="rounded-xl">At Risk (&lt;45%)</Badge>
                      ) : s.isHighPerforming ? (
                        <Badge variant="success" className="rounded-xl">High Performer (&ge;75%)</Badge>
                      ) : (
                        <Badge variant="neutral" className="rounded-xl">On Track</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
