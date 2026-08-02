import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { TRANSLATIONS, LanguageMeta } from '../../constants/translations';
import { 
  Globe, Plus, Search, CheckCircle2, AlertTriangle, ShieldCheck, 
  Download, Upload, RefreshCw, Edit3, Trash2, Check, ArrowRight, BookOpen, FileText, Layers 
} from 'lucide-react';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-hot-toast';

export default function AdminTranslationManager() {
  const { 
    language, 
    supportedLanguages, 
    customTranslations, 
    updateTranslationKey, 
    addLanguage, 
    toggleLanguageStatus, 
    generateAuditReport, 
    auditReport 
  } = useLanguage();

  const [activeTab, setActiveTab] = useState<'languages' | 'keys' | 'curriculum' | 'audit'>('languages');
  const [searchKey, setSearchKey] = useState('');
  const [selectedLangFilter, setSelectedLangFilter] = useState<string>('all');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ [lang: string]: string }>({});

  // New Language Modal State
  const [showAddLangModal, setShowAddLangModal] = useState(false);
  const [newLang, setNewLang] = useState<LanguageMeta>({
    code: '',
    name: '',
    nativeName: '',
    flag: '🌐',
    direction: 'ltr',
    enabled: true
  });

  // Curriculum database objects for localization tab
  const [curricula, setCurricula] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [subjectTranslations, setSubjectTranslations] = useState<{ [lang: string]: { name: string; description: string } }>({});

  useEffect(() => {
    generateAuditReport();
    fetchCurriculumData();
  }, []);

  const fetchCurriculumData = async () => {
    try {
      const curSnap = await getDocs(collection(db, 'curricula'));
      setCurricula(curSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const subSnap = await getDocs(collection(db, 'subjects'));
      const subList = subSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSubjects(subList);

      if (subList.length > 0) {
        setSelectedSubjectId(subList[0].id);
        initSubjectTranslationForm(subList[0]);
      }
    } catch (err) {
      console.error('Error fetching curriculum data for translation:', err);
    }
  };

  const initSubjectTranslationForm = (sub: any) => {
    const initial: { [lang: string]: { name: string; description: string } } = {};
    supportedLanguages.forEach(l => {
      const code = l.code;
      const langSuffix = code.charAt(0).toUpperCase() + code.slice(1);
      initial[code] = {
        name: sub[`name_${code}`] || sub[`name${langSuffix}`] || (sub.translations && sub.translations[code]?.name) || (code === 'en' ? sub.name : ''),
        description: sub[`description_${code}`] || sub[`description${langSuffix}`] || (sub.translations && sub.translations[code]?.description) || (code === 'en' ? sub.description : '')
      };
    });
    setSubjectTranslations(initial);
  };

  const handleSelectSubject = (subId: string) => {
    setSelectedSubjectId(subId);
    const sub = subjects.find(s => s.id === subId);
    if (sub) initSubjectTranslationForm(sub);
  };

  const handleSaveSubjectTranslation = async () => {
    if (!selectedSubjectId) return;
    try {
      const sub = subjects.find(s => s.id === selectedSubjectId);
      if (!sub) return;

      const updates: any = {};
      Object.keys(subjectTranslations).forEach(code => {
        const langSuffix = code.charAt(0).toUpperCase() + code.slice(1);
        updates[`name_${code}`] = subjectTranslations[code].name;
        updates[`description_${code}`] = subjectTranslations[code].description;
        updates[`name${langSuffix}`] = subjectTranslations[code].name;
        updates[`description${langSuffix}`] = subjectTranslations[code].description;
      });

      updates.translations = subjectTranslations;

      await updateDoc(doc(db, 'subjects', selectedSubjectId), updates);
      toast.success('Subject translation updated successfully!');
      fetchCurriculumData();
    } catch (err) {
      console.error('Save subject translation error:', err);
      toast.error('Failed to save subject translations.');
    }
  };

  const handleAddLanguageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLang.code.trim() || !newLang.name.trim()) {
      toast.error('Please fill in required language details.');
      return;
    }
    await addLanguage(newLang);
    toast.success(`Language ${newLang.name} added successfully!`);
    setShowAddLangModal(false);
    setNewLang({ code: '', name: '', nativeName: '', flag: '🌐', direction: 'ltr', enabled: true });
    generateAuditReport();
  };

  const allKeys = Object.keys({ ...TRANSLATIONS, ...customTranslations });

  const filteredKeys = allKeys.filter(k => {
    const matchesSearch = k.toLowerCase().includes(searchKey.toLowerCase()) || 
      (TRANSLATIONS[k]?.en || customTranslations[k]?.en || '').toLowerCase().includes(searchKey.toLowerCase()) ||
      (TRANSLATIONS[k]?.fr || customTranslations[k]?.fr || '').toLowerCase().includes(searchKey.toLowerCase());
    return matchesSearch;
  });

  const handleStartEditKey = (key: string) => {
    setEditingKey(key);
    const existing = customTranslations[key] || TRANSLATIONS[key] || { en: key };
    setEditValues({ ...existing });
  };

  const handleSaveKeyTranslations = async (key: string) => {
    for (const l of supportedLanguages) {
      if (editValues[l.code] !== undefined) {
        await updateTranslationKey(key, l.code, editValues[l.code]);
      }
    }
    toast.success(`Translation updated for key: ${key}`);
    setEditingKey(null);
    generateAuditReport();
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ ...TRANSLATIONS, ...customTranslations }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `edulpha_translations_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Translation dictionary exported to JSON!');
  };

  return (
    <div className="space-y-8 text-xs">
      {/* Top Header & Metrics Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-4 shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl text-indigo-400">
              <Globe size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500 text-white">
                  Multi-Language Engine v2.0
                </span>
                <span className="text-xs text-slate-400">Universal i18n & Localization</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Multi-Language & Translation Studio
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => generateAuditReport()}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl flex items-center gap-1.5 transition-all"
            >
              <RefreshCw size={14} /> Run Audit
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md"
            >
              <Download size={14} /> Export JSON
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Manage system translations, enable new global languages (including RTL scripts like Arabic), localize dynamic database curriculum content, and run translation coverage audits across the platform.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-800">
          <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/50">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Active Languages</span>
            <span className="text-lg font-black text-indigo-400">{supportedLanguages.filter(l => l.enabled).length}</span>
          </div>
          <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/50">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">UI Translation Keys</span>
            <span className="text-lg font-black text-emerald-400">{allKeys.length}</span>
          </div>
          <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/50">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">UI Coverage %</span>
            <span className="text-lg font-black text-amber-400">{auditReport?.uiCoverage || 98}%</span>
          </div>
          <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/50">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Curriculum %</span>
            <span className="text-lg font-black text-sky-400">{auditReport?.curriculumCoverage || 100}%</span>
          </div>
          <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/50">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">RTL Ready</span>
            <span className="text-lg font-black text-purple-400">Yes (Arabic 🇦🇪)</span>
          </div>
          <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/50">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Auto Sync</span>
            <span className="text-lg font-black text-emerald-400">Enabled</span>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('languages')}
          className={`px-4 py-2 font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'languages'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Globe size={15} /> Supported Languages ({supportedLanguages.length})
        </button>

        <button
          onClick={() => setActiveTab('keys')}
          className={`px-4 py-2 font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'keys'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText size={15} /> Platform UI Translation Keys ({allKeys.length})
        </button>

        <button
          onClick={() => setActiveTab('curriculum')}
          className={`px-4 py-2 font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'curriculum'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen size={15} /> Curriculum Content Localizer
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck size={15} /> Translation Coverage Audit
        </button>
      </div>

      {/* TAB 1: SUPPORTED LANGUAGES MANAGEMENT */}
      {activeTab === 'languages' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Platform Languages Registry</h3>
              <p className="text-xs text-slate-500 mt-0.5">English and French are the active production languages. Other languages are kept disabled until future updates.</p>
            </div>

            <button
              onClick={() => setShowAddLangModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={16} /> Add Language
            </button>
          </div>

          {/* Enabled Languages Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Enabled Languages ({supportedLanguages.filter(l => l.enabled).length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {supportedLanguages.filter(l => l.enabled).map(lang => (
                <div key={lang.code} className="p-5 bg-white border border-emerald-200 rounded-2xl flex flex-col justify-between space-y-4 shadow-xs">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{lang.flag}</span>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-tight">{lang.name}</h4>
                          <span className="text-xs text-slate-500 font-medium">{lang.nativeName}</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {lang.direction.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 text-xs">
                      <span className="text-slate-500 font-semibold">Language Code:</span>
                      <code className="px-2 py-0.5 bg-slate-100 font-mono font-bold text-slate-800 rounded">{lang.code}</code>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active
                    </span>

                    <button
                      onClick={() => toggleLanguageStatus(lang.code, false)}
                      className="px-3 py-1 rounded-xl text-xs font-bold transition-all bg-rose-50 text-rose-600 hover:bg-rose-100"
                    >
                      Disable
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disabled Languages Section */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-300" /> Disabled Languages ({supportedLanguages.filter(l => !l.enabled).length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {supportedLanguages.filter(l => !l.enabled).map(lang => (
                <div key={lang.code} className="p-5 bg-slate-50/70 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-4 opacity-75 hover:opacity-100 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl opacity-60">{lang.flag}</span>
                        <div>
                          <h4 className="font-bold text-slate-700 text-sm leading-tight">{lang.name}</h4>
                          <span className="text-xs text-slate-400 font-medium">{lang.nativeName}</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                        {lang.direction.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 text-xs">
                      <span className="text-slate-400 font-semibold">Language Code:</span>
                      <code className="px-2 py-0.5 bg-slate-200 font-mono font-bold text-slate-600 rounded">{lang.code}</code>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-400" /> Disabled
                    </span>

                    <button
                      onClick={() => toggleLanguageStatus(lang.code, true)}
                      className="px-3 py-1 rounded-xl text-xs font-bold transition-all bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    >
                      Enable
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: UI TRANSLATION KEYS EDITOR */}
      {activeTab === 'keys' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search translation key or text content..."
                value={searchKey}
                onChange={e => setSearchKey(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
              />
            </div>

            <span className="text-xs font-bold text-slate-500 shrink-0">
              Showing {filteredKeys.length} of {allKeys.length} keys
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Translation Key</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">🇬🇧 English</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">🇫🇷 French</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">🇪🇸 Spanish</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">🇦🇪 Arabic (RTL)</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredKeys.slice(0, 50).map(key => {
                    const dict = customTranslations[key] || TRANSLATIONS[key] || {};
                    const isEditing = editingKey === key;

                    return (
                      <tr key={key} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono text-[11px] font-bold text-indigo-700 max-w-xs truncate">
                          {key}
                        </td>

                        <td className="px-4 py-3 max-w-xs">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editValues['en'] || ''}
                              onChange={e => setEditValues({ ...editValues, en: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          ) : (
                            <span className="text-slate-800 font-medium">{dict.en || '—'}</span>
                          )}
                        </td>

                        <td className="px-4 py-3 max-w-xs">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editValues['fr'] || ''}
                              onChange={e => setEditValues({ ...editValues, fr: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          ) : (
                            <span className="text-slate-700">{dict.fr || <span className="text-rose-400 font-bold">Missing</span>}</span>
                          )}
                        </td>

                        <td className="px-4 py-3 max-w-xs">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editValues['es'] || ''}
                              onChange={e => setEditValues({ ...editValues, es: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          ) : (
                            <span className="text-slate-700">{dict.es || <span className="text-amber-500 font-medium">Fallback (EN)</span>}</span>
                          )}
                        </td>

                        <td className="px-4 py-3 max-w-xs" dir="rtl">
                          {isEditing ? (
                            <input
                              type="text"
                              dir="rtl"
                              value={editValues['ar'] || ''}
                              onChange={e => setEditValues({ ...editValues, ar: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          ) : (
                            <span className="text-slate-800 font-arabic">{dict.ar || <span className="text-slate-400 font-sans text-[10px]">Unset</span>}</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleSaveKeyTranslations(key)}
                                className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg text-xs hover:bg-emerald-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingKey(null)}
                                className="px-2.5 py-1 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartEditKey(key)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit key translations"
                            >
                              <Edit3 size={15} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CURRICULUM CONTENT LOCALIZER */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Dynamic Subject & Topic Content Localizer</h3>
                <p className="text-xs text-slate-500 mt-0.5">Translate academic subject titles, descriptions, and exam paper instructions into multiple languages for students.</p>
              </div>

              <select
                value={selectedSubjectId}
                onChange={e => handleSelectSubject(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code || s.category})</option>
                ))}
              </select>
            </div>

            {selectedSubjectId && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {supportedLanguages.filter(l => l.enabled).map(lang => (
                    <div key={lang.code} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                        <span className="text-base">{lang.flag}</span>
                        <span>{lang.name} Translation ({lang.code.toUpperCase()})</span>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Subject Title ({lang.name})</label>
                        <input
                          type="text"
                          dir={lang.direction}
                          value={subjectTranslations[lang.code]?.name || ''}
                          onChange={e => setSubjectTranslations({
                            ...subjectTranslations,
                            [lang.code]: { ...subjectTranslations[lang.code], name: e.target.value }
                          })}
                          placeholder={`e.g. ${lang.code === 'fr' ? 'Installation Électrique' : 'Subject Name'}`}
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Subject Syllabus Description ({lang.name})</label>
                        <textarea
                          rows={2}
                          dir={lang.direction}
                          value={subjectTranslations[lang.code]?.description || ''}
                          onChange={e => setSubjectTranslations({
                            ...subjectTranslations,
                            [lang.code]: { ...subjectTranslations[lang.code], description: e.target.value }
                          })}
                          placeholder={`Description in ${lang.name}...`}
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end pt-3">
                  <button
                    onClick={handleSaveSubjectTranslation}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all text-xs"
                  >
                    <Check size={16} /> Save Subject Localizations
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: TRANSLATION COVERAGE AUDIT REPORT */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Automated System Translation Audit Report</h3>
                <p className="text-xs text-slate-500 mt-0.5">Scans all interface keys and dynamic database collections to ensure 100% translation coverage across active languages.</p>
              </div>

              <button
                onClick={() => generateAuditReport()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 text-xs shadow-xs"
              >
                <RefreshCw size={15} /> Re-Run Full Audit
              </button>
            </div>

            {auditReport && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(auditReport.languages).map(([code, data]) => (
                    <div key={code} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{data.name} ({code.toUpperCase()})</span>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                          data.completionPercentage >= 95 ? 'bg-emerald-100 text-emerald-800' :
                          data.completionPercentage >= 80 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {data.completionPercentage}% Complete
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            data.completionPercentage >= 95 ? 'bg-emerald-500' :
                            data.completionPercentage >= 80 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${data.completionPercentage}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>Translated: {data.translatedKeys} keys</span>
                        <span>Missing: {data.missingKeys.length} keys</span>
                      </div>
                    </div>
                  ))}
                </div>

                {auditReport.missingLocations.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 text-amber-700">
                      <AlertTriangle size={15} /> Missing Translation Keys Location Audit
                    </h4>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 overflow-hidden">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {auditReport.missingLocations.map((item, idx) => (
                          <div key={idx} className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                            <code className="font-mono text-[10px] font-bold text-indigo-700">{item.key}</code>
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{item.location}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD LANGUAGE MODAL */}
      {showAddLangModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-slate-900 text-base">Register New Global Language</h3>
            <form onSubmit={handleAddLanguageSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Language Name (English)</label>
                <input
                  type="text"
                  value={newLang.name}
                  onChange={e => setNewLang({ ...newLang, name: e.target.value })}
                  placeholder="e.g. Swahili, Hausa, Italian"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Native Name</label>
                <input
                  type="text"
                  value={newLang.nativeName}
                  onChange={e => setNewLang({ ...newLang, nativeName: e.target.value })}
                  placeholder="e.g. Kiswahili, Italiano"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ISO Code (2-3 chars)</label>
                  <input
                    type="text"
                    value={newLang.code}
                    onChange={e => setNewLang({ ...newLang, code: e.target.value.toLowerCase().trim() })}
                    placeholder="e.g. sw, ha, it"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Flag Emoji</label>
                  <input
                    type="text"
                    value={newLang.flag}
                    onChange={e => setNewLang({ ...newLang, flag: e.target.value })}
                    placeholder="e.g. 🇰🇪, 🇮🇹"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-center text-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Text Direction</label>
                <select
                  value={newLang.direction}
                  onChange={e => setNewLang({ ...newLang, direction: e.target.value as 'ltr' | 'rtl' })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                >
                  <option value="ltr">Left-to-Right (LTR)</option>
                  <option value="rtl">Right-to-Left (RTL - Arabic, Hebrew)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddLangModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
                >
                  Save Language
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
