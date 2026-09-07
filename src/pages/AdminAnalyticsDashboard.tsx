import React, { useState, useEffect } from 'react';
import ModernDashboardLayout from '../components/layout/ModernDashboardLayout';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Users,
  DollarSign,
  Bot,
  FileText,
  Download,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  BookOpen,
  Award,
  Zap,
  Globe,
  RefreshCw,
  Sparkles,
  Search,
} from 'lucide-react';
import { AnalyticsService } from '../services/analyticsService';
import {
  PlatformOverviewMetrics,
  CurriculumAnalyticsItem,
  ContentAnalyticsData,
  AIAnalyticsData,
  PaymentAnalyticsData,
  GeneratedReport,
  AnalyticsFilter,
} from '../types';
import toast from 'react-hot-toast';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#6366F1'];

export const AdminAnalyticsDashboard: React.FC = () => {
  const [filter, setFilter] = useState<AnalyticsFilter>({
    dateRange: '30d',
    curriculum: 'all',
    language: 'all',
  });

  const [platformMetrics, setPlatformMetrics] = useState<PlatformOverviewMetrics>(
    AnalyticsService.getPlatformOverview(filter)
  );
  const [curriculumData, setCurriculumData] = useState<CurriculumAnalyticsItem[]>(
    AnalyticsService.getCurriculumAnalytics(filter)
  );
  const [contentData, setContentData] = useState<ContentAnalyticsData>(
    AnalyticsService.getContentAnalytics()
  );
  const [aiData, setAiData] = useState<AIAnalyticsData>(AnalyticsService.getAIAnalytics());
  const [paymentData, setPaymentData] = useState<PaymentAnalyticsData>(
    AnalyticsService.getPaymentAnalytics()
  );
  const [reports, setReports] = useState<GeneratedReport[]>(
    AnalyticsService.getGeneratedReports()
  );

  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'ai' | 'revenue' | 'reports'>('overview');
  const [showReportModal, setShowReportModal] = useState(false);
  const [newReportTitle, setNewReportTitle] = useState('');
  const [newReportCategory, setNewReportCategory] = useState<GeneratedReport['category']>('growth');
  const [newReportFormat, setNewReportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);

  // Real-time pulse state
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  const handleRefresh = () => {
    setPlatformMetrics(AnalyticsService.getPlatformOverview(filter));
    setCurriculumData(AnalyticsService.getCurriculumAnalytics(filter));
    setContentData(AnalyticsService.getContentAnalytics());
    setAiData(AnalyticsService.getAIAnalytics());
    setPaymentData(AnalyticsService.getPaymentAnalytics());
    setLastUpdated(new Date().toLocaleTimeString());
    toast.success('Analytics data synchronized');
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReportTitle.trim()) {
      toast.error('Please enter a report title');
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const generated = AnalyticsService.generateReport(
        newReportTitle,
        'admin',
        newReportCategory,
        newReportFormat,
        'System Administrator',
        filter
      );
      setReports(AnalyticsService.getGeneratedReports());
      setIsGenerating(false);
      setShowReportModal(false);
      setNewReportTitle('');
      toast.success(`Report "${generated.title}" generated successfully!`);
    }, 800);
  };

  const handleDownload = (rep: GeneratedReport) => {
    AnalyticsService.downloadReportFile(rep);
    toast.success(`Downloading ${rep.title}.${rep.format}`);
  };

  return (
    <ModernDashboardLayout role="admin" activeTab="reports">
      <div className="space-y-6 max-w-7xl mx-auto w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/10 text-blue-600 rounded-xl">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Executive Analytics & Reports Center
              </h1>
              <p className="text-sm text-slate-500">
                Cross-curriculum intelligence covering GCE O/A Levels, BEPC, Seconde, Première & Terminale
              </p>
            </div>
          </div>
        </div>

        {/* Real-time Ticker & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Real-time Updates Active ({lastUpdated})
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm shadow-sm transition"
          >
            <FileText className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <Filter className="w-4 h-4 text-slate-400" />
          Filter Data:
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          {/* Date Range */}
          <div>
            <select
              value={filter.dateRange}
              onChange={(e) => setFilter({ ...filter, dateRange: e.target.value as any })}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last 1 Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Curriculum Filter */}
          <div>
            <select
              value={filter.curriculum}
              onChange={(e) => setFilter({ ...filter, curriculum: e.target.value })}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Curricula (EN & FR)</option>
              <option value="gce_o">GCE Ordinary Level</option>
              <option value="gce_a">GCE Advanced Level</option>
              <option value="bepc">BEPC (Francophone)</option>
              <option value="terminale">Terminale / Baccalauréat</option>
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <select
              value={filter.language}
              onChange={(e) => setFilter({ ...filter, language: e.target.value as any })}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Languages</option>
              <option value="en">English System</option>
              <option value="fr">French System</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Users
            </span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">
              {platformMetrics.totalUsers.toLocaleString()}
            </h3>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +12.4% registration growth
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>DAU: {platformMetrics.dau.toLocaleString()}</span>
            <span>MAU: {platformMetrics.mau.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Monthly Revenue
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">
              {paymentData.monthlyRevenue.toLocaleString()} FCFA
            </h3>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +18.9% subscription growth
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Active Subs: {paymentData.activeSubscriptions.toLocaleString()}</span>
            <span>Pass Rate: 98.5%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              AI Tutor Queries
            </span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <Bot className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">
              {aiData.questionsAsked.toLocaleString()}
            </h3>
            <p className="text-xs text-purple-600 font-medium flex items-center gap-1 mt-1">
              <Sparkles className="w-3.5 h-3.5" /> {aiData.avgResponseRating}/5.0 Satisfaction
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Conversations: {aiData.totalConversations.toLocaleString()}</span>
            <span>Tokens: {(aiData.tokenConsumption / 1000000).toFixed(1)}M</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Learning Engagement
            </span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">
              {contentData.lessonViews.toLocaleString()} Views
            </h3>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <CheckCircle className="w-3.5 h-3.5" /> 88.2% Completion Rate
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Lessons: {contentData.totalLessons}</span>
            <span>Docs Saved: {contentData.documentDownloads.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Platform & User Growth', icon: Users },
          { id: 'curriculum', label: 'Curriculum & Exam Performance', icon: BookOpen },
          { id: 'ai', label: 'AI & Content Analytics', icon: Bot },
          { id: 'revenue', label: 'Payment & Subscriptions', icon: DollarSign },
          { id: 'reports', label: 'Report Generator & Downloads', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & USERS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Active Levels Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Active Student Learners by Level
                  </h3>
                  <p className="text-xs text-slate-500">
                    Distribution across English (GCE) and French (MINESEC/OBC) curricula
                  </p>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={curriculumData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="curriculum" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="activeUsers" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Active Students" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Language Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900">System & Language Usage</h3>
              <p className="text-xs text-slate-500">Bilingual engagement across English & French</p>
              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'English System', value: platformMetrics.englishUsersCount },
                        { name: 'French System', value: platformMetrics.frenchUsersCount },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#3B82F6" />
                      <Cell fill="#10B981" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span> English Curriculum (60%)
                  </span>
                  <span className="text-slate-900 font-bold">{platformMetrics.englishUsersCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span> French Curriculum (40%)
                  </span>
                  <span className="text-slate-900 font-bold">{platformMetrics.frenchUsersCount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CURRICULUM & EXAM */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Subject Performance & Pass Rate</h3>
            <p className="text-xs text-slate-500">Average score across Ordinary Level, Advanced Level, BEPC & Terminale</p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={curriculumData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="curriculum" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="avgScore" fill="#10B981" radius={[6, 6, 0, 0]} name="Average Score %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Curriculum Details Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Curriculum Engagement Audit</h3>
              <span className="text-xs text-slate-500">6 Major Sub-systems Enrolled</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                  <tr>
                    <th className="py-3 px-4">Curriculum / Level</th>
                    <th className="py-3 px-4">Active Learners</th>
                    <th className="py-3 px-4">Lessons Completed</th>
                    <th className="py-3 px-4">Avg Score</th>
                    <th className="py-3 px-4">Top Subjects</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {curriculumData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">{item.curriculum}</td>
                      <td className="py-3 px-4">{item.activeUsers.toLocaleString()}</td>
                      <td className="py-3 px-4">{item.completedLessons.toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">{item.avgScore}%</td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {item.popularSubjects.slice(0, 3).join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AI & CONTENT */}
      {activeTab === 'ai' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Usage by Curriculum */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Edulpha AI Queries by Curriculum</h3>
            <p className="text-xs text-slate-500 font-medium">Top requested subjects: Mathematics, Physics & Chemistry</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aiData.aiUsageByCurriculum}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="curriculum" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="queries" fill="#8B5CF6" radius={[6, 6, 0, 0]} name="Queries" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Popular AI Features */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Popular AI Learning Features</h3>
            <p className="text-xs text-slate-500 font-medium">Usage volume across AI Tutor capabilities</p>
            <div className="space-y-3">
              {aiData.popularFeatures.map((feat, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{feat.feature}</h4>
                      <p className="text-xs text-slate-500">Automated Step-by-Step Guidance</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-purple-600">{feat.usageCount.toLocaleString()} uses</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REVENUE */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Monthly Revenue Trend (FCFA)</h3>
            <p className="text-xs text-slate-500">Mobile Money (MTN MoMo, Orange Money) & Credit Card Subscriptions</p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={paymentData.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="#D1FAE5" strokeWidth={3} name="Revenue FCFA" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: REPORT GENERATOR */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Report Generation Center</h3>
              <p className="text-xs text-slate-500">Generate instantly downloadable PDF, Excel & CSV reports</p>
            </div>
            <button
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm flex items-center gap-2 transition"
            >
              <FileText className="w-4 h-4" />
              Create Custom Report
            </button>
          </div>

          {/* Generated Reports Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h3 className="font-bold text-slate-900">Recent Generated Reports</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {reports.map((rep) => (
                <div key={rep.id} className="p-4 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl mt-0.5">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{rep.title}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="uppercase font-bold text-blue-600 px-1.5 py-0.5 bg-blue-50 rounded">
                          {rep.format}
                        </span>
                        <span>• Generated by {rep.generatedBy}</span>
                        <span>• {new Date(rep.generatedAt).toLocaleString()}</span>
                        <span>• {rep.fileSize}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(rep)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 rounded-lg text-xs font-semibold transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download File
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Report Generation Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Generate Analytics Report
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Report Title</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 GCE O-Level Performance Audit"
                  value={newReportTitle}
                  onChange={(e) => setNewReportTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Report Category</label>
                <select
                  value={newReportCategory}
                  onChange={(e) => setNewReportCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="growth">Platform Growth & Active Users</option>
                  <option value="revenue">Revenue & Subscriptions</option>
                  <option value="content">Content & Video Analytics</option>
                  <option value="ai">Edulpha AI Tutor Usage</option>
                  <option value="exam">Examination & Quiz Performance</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Export Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['pdf', 'excel', 'csv'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setNewReportFormat(fmt)}
                      className={`py-2 text-center font-bold uppercase rounded-xl border text-xs transition ${
                        newReportFormat === fmt
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm transition flex items-center gap-2"
                >
                  {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {isGenerating ? 'Generating...' : 'Confirm & Export'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </ModernDashboardLayout>
  );
};

export default AdminAnalyticsDashboard;
