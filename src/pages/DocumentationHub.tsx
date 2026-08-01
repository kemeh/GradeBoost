import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Users, Shield, Code, Smartphone, Server, 
  Lock, Scale, Building2, CheckCircle2, Activity, Search, 
  Download, Copy, Printer, Check, ChevronRight, Menu, X, 
  ArrowLeft, ExternalLink, Sparkles, BookOpen, Layers, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DOC_CATEGORIES, PRE_LAUNCH_DOCUMENTS, DocItem, DocCategory } from '../data/preLaunchDocPackage';
import { useLanguage } from '../contexts/LanguageContext';
import { SEO } from '../components/SEO';
import toast from 'react-hot-toast';

export default function DocumentationHub() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedAudience, setSelectedAudience] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeDocId, setActiveDocId] = useState<string>(PRE_LAUNCH_DOCUMENTS[0].id);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // Filter documents based on Category, Audience, and Search Query
  const filteredDocs = useMemo(() => {
    return PRE_LAUNCH_DOCUMENTS.filter(doc => {
      const matchesCategory = selectedCategoryId === 'all' || doc.categoryId === selectedCategoryId;
      const matchesAudience = selectedAudience === 'All' || doc.audience.includes(selectedAudience as any);
      const matchesSearch = searchQuery === '' || 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesAudience && matchesSearch;
    });
  }, [selectedCategoryId, selectedAudience, searchQuery]);

  // Active Document
  const activeDoc = useMemo(() => {
    return PRE_LAUNCH_DOCUMENTS.find(d => d.id === activeDocId) || filteredDocs[0] || PRE_LAUNCH_DOCUMENTS[0];
  }, [activeDocId, filteredDocs]);

  const handleCopyContent = () => {
    if (!activeDoc) return;
    navigator.clipboard.writeText(activeDoc.content);
    setCopiedId(true);
    toast.success('Document content copied to clipboard!');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleDownloadSingleDoc = () => {
    if (!activeDoc) return;
    const blob = new Blob([activeDoc.content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeDoc.id}_${activeDoc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded ${activeDoc.title}`);
  };

  const handleDownloadFullPackage = () => {
    let fullContent = `# EDULPHA PRE-LAUNCH DOCUMENTATION PACKAGE\n`;
    fullContent += `Generated: ${new Date().toISOString()}\n\n`;
    fullContent += `=`.repeat(80) + `\n\n`;

    PRE_LAUNCH_DOCUMENTS.forEach(doc => {
      fullContent += `\n\n# DOCUMENT: ${doc.title.toUpperCase()}\n`;
      fullContent += `Category: ${doc.category}\n`;
      fullContent += `Target Audience: ${doc.audience.join(', ')}\n`;
      fullContent += `Last Updated: ${doc.lastUpdated}\n`;
      fullContent += `-`.repeat(80) + `\n\n`;
      fullContent += doc.content + `\n\n`;
    });

    const blob = new Blob([fullContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Edulpha_PreLaunch_Documentation_Package_Master.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded Full Pre-Launch Documentation Package!');
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return <FileText size={18} />;
      case 'Users': return <Users size={18} />;
      case 'Shield': return <Shield size={18} />;
      case 'Code': return <Code size={18} />;
      case 'Smartphone': return <Smartphone size={18} />;
      case 'Server': return <Server size={18} />;
      case 'Lock': return <Lock size={18} />;
      case 'Scale': return <Scale size={18} />;
      case 'Building2': return <Building2 size={18} />;
      case 'CheckCircle2': return <CheckCircle2 size={18} />;
      case 'Activity': return <Activity size={18} />;
      default: return <BookOpen size={18} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <SEO 
        title={`${activeDoc ? activeDoc.title : 'Pre-Launch Documentation Package'} | Technical & Legal Hub`}
        description={activeDoc ? activeDoc.summary : "Comprehensive technical, legal, security, and operational pre-launch documentation for the Edulpha platform."}
        keywords={`Edulpha Documentation, ${activeDoc?.category || ''}, Technical Specifications, Security Architecture`}
      />
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition flex items-center gap-2 text-xs font-bold"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Main Platform</span>
          </button>
          
          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 font-black text-lg">
              E
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white tracking-tight text-base">Edulpha</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Pre-Launch Docs v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Master Pre-Launch Technical, Operational & Legal Documentation Hub
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadFullPackage}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-indigo-600/20"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export Full Package (.MD)</span>
            <span className="sm:hidden">Export All</span>
          </button>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl lg:hidden"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-80 bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-300 transform lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0 top-16' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Search & Filter Bar */}
          <div className="p-4 space-y-3 border-b border-slate-800/80">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search across all 11 doc packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Audience Pills */}
            <div className="flex flex-wrap gap-1">
              {['All', 'Users', 'Administrators', 'Developers', 'Legal & Compliance', 'Partners'].map((aud) => (
                <button
                  key={aud}
                  onClick={() => setSelectedAudience(aud)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                    selectedAudience === aud
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                  }`}
                >
                  {aud}
                </button>
              ))}
            </div>
          </div>

          {/* Categories List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                selectedCategoryId === 'all'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <Layers size={16} /> All Documentation Packages
              </span>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md text-[10px]">
                {PRE_LAUNCH_DOCUMENTS.length}
              </span>
            </button>

            <div className="pt-2 pb-1 px-2 text-[10px] font-black uppercase text-slate-500 tracking-wider">
              11 Document Categories
            </div>

            {DOC_CATEGORIES.map((cat) => {
              const count = PRE_LAUNCH_DOCUMENTS.filter(d => d.categoryId === cat.id).length;
              const isSelected = selectedCategoryId === cat.id;

              return (
                <div key={cat.id} className="space-y-1">
                  <button
                    onClick={() => setSelectedCategoryId(isSelected ? 'all' : cat.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between group ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <span className={isSelected ? 'text-white' : 'text-indigo-400 group-hover:text-indigo-300'}>
                        {getCategoryIcon(cat.iconName)}
                      </span>
                      <span className="truncate">{cat.name}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                      isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>

                  {/* Document Items List under category if selected or searching */}
                  {(isSelected || searchQuery !== '') && (
                    <div className="pl-6 space-y-1 my-1">
                      {PRE_LAUNCH_DOCUMENTS
                        .filter(d => d.categoryId === cat.id)
                        .map(doc => {
                          const isActive = activeDoc.id === doc.id;
                          return (
                            <button
                              key={doc.id}
                              onClick={() => {
                                setActiveDocId(doc.id);
                                setSidebarOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition truncate flex items-center gap-2 ${
                                isActive
                                  ? 'bg-slate-800 text-indigo-300 font-bold border-l-2 border-indigo-500'
                                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                              }`}
                            >
                              <ChevronRight size={12} className={isActive ? 'text-indigo-400' : 'text-slate-600'} />
                              <span className="truncate">{doc.title}</span>
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-900 p-6 lg:p-10 space-y-8 custom-scrollbar">
          {/* Document Header Metadata */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-[10px] font-black uppercase tracking-wider">
                    {activeDoc.category}
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 size={12} /> Approved for Pre-Launch
                  </span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight mt-2">
                  {activeDoc.title}
                </h1>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyContent}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-slate-700"
                >
                  {copiedId ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedId ? 'Copied' : 'Copy MD'}</span>
                </button>
                <button
                  onClick={handleDownloadSingleDoc}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow"
                >
                  <Download size={14} />
                  <span>Download Doc</span>
                </button>
              </div>
            </div>

            {/* Doc Summary & Tags */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="md:col-span-2 bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Executive Overview</span>
                <p className="text-slate-300 font-medium leading-relaxed">{activeDoc.summary}</p>
              </div>
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Target Audience</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activeDoc.audience.map(aud => (
                      <span key={aud} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-bold text-[10px]">
                        {aud}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
                  <span>Last Updated:</span>
                  <span className="font-mono text-slate-200 font-bold">{activeDoc.lastUpdated}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Document Content View */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 lg:p-10 shadow-xl space-y-6">
            <div className="prose prose-invert prose-indigo max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {activeDoc.content}
            </div>
          </div>

          {/* Bottom Quick Docs Selector Grid */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <BookOpen size={16} className="text-indigo-400" /> Complete Pre-Launch Documentation Index ({PRE_LAUNCH_DOCUMENTS.length} Documents)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRE_LAUNCH_DOCUMENTS.map((doc) => {
                const isActive = doc.id === activeDoc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setActiveDocId(doc.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isActive
                        ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-600/10'
                        : 'bg-slate-950 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 truncate max-w-[180px]">
                          {doc.category}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                            <Eye size={12} /> Viewing
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-white text-sm line-clamp-1">
                        {doc.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {doc.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] font-bold text-slate-400">
                      <span>{doc.audience.slice(0, 2).join(', ')}</span>
                      <span className="text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Read Doc <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
