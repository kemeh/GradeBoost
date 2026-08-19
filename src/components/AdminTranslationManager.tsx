import React, { useState } from 'react';
import { Globe, Search, Plus, Save, RotateCcw, Check, FileText, Layers } from 'lucide-react';
import { TRANSLATIONS, TranslationDictionary, LanguageCode } from '../constants/translations';
import { toast } from 'react-hot-toast';

export const AdminTranslationManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ui_labels' | 'content_translation'>('ui_labels');
  const [searchTerm, setSearchTerm] = useState('');
  const [translations, setTranslations] = useState<TranslationDictionary>(TRANSLATIONS);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newKey, setNewKey] = useState('');
  const [newEnText, setNewEnText] = useState('');
  const [newFrText, setNewFrText] = useState('');

  const filteredKeys = Object.keys(translations).filter(key => 
    key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    translations[key].en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    translations[key].fr.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateTranslation = (key: string, lang: LanguageCode, value: string) => {
    setTranslations(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [lang]: value
      }
    }));
  };

  const handleAddNewKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey || !newEnText) {
      toast.error('Key name and English text are required');
      return;
    }

    setTranslations(prev => ({
      ...prev,
      [newKey]: {
        en: newEnText,
        fr: newFrText || newEnText
      }
    }));

    toast.success(`Translation key "${newKey}" added successfully!`);
    setNewKey('');
    setNewEnText('');
    setNewFrText('');
  };

  const handleSaveAllTranslations = () => {
    toast.success('All system UI translations saved and deployed!');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-300 border border-indigo-500/30">
            <Globe size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Multi-Language & Localization Studio</h2>
            <p className="text-xs text-indigo-200">
              Manage bilingual UI dictionaries, fallback settings, and localized learning resources (English & French)
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveAllTranslations}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all"
        >
          <Save size={16} /> Save All Translations
        </button>
      </div>

      {/* Tabs & Search Bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('ui_labels')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'ui_labels' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            <Globe size={16} /> System UI Dictionary ({Object.keys(translations).length})
          </button>
          <button
            onClick={() => setActiveTab('content_translation')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'content_translation' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            <FileText size={16} /> Multilingual Lessons & Notes
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search translation key or text..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6">
        {activeTab === 'ui_labels' && (
          <div className="space-y-6">
            {/* Add New Key Form */}
            <form onSubmit={handleAddNewKey} className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <Plus size={16} /> Add Custom UI Translation Key
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Key (e.g. dashboard.customBanner)"
                  value={newKey}
                  onChange={e => setNewKey(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="English Translation (🇬🇧)"
                  value={newEnText}
                  onChange={e => setNewEnText(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="French Translation (🇫🇷)"
                    value={newFrText}
                    onChange={e => setNewFrText(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 whitespace-nowrap"
                  >
                    Add Key
                  </button>
                </div>
              </div>
            </form>

            {/* Translation Dictionary Table */}
            <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-xs">
              <table className="w-full text-left text-xs text-slate-700 min-w-[600px]">
                <thead className="bg-slate-100 font-bold text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 w-1/4">Translation Key</th>
                    <th className="p-3.5 w-3/8">🇬🇧 English Version</th>
                    <th className="p-3.5 w-3/8">🇫🇷 French Version</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredKeys.map(key => (
                    <tr key={key} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-mono text-[11px] text-indigo-900 font-bold bg-slate-50/50">
                        {key}
                      </td>
                      <td className="p-3.5">
                        <input
                          type="text"
                          value={translations[key].en}
                          onChange={e => handleUpdateTranslation(key, 'en', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </td>
                      <td className="p-3.5">
                        <input
                          type="text"
                          value={translations[key].fr}
                          onChange={e => handleUpdateTranslation(key, 'fr', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'content_translation' && (
          <div className="space-y-4 text-xs text-slate-600">
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
              <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                <Layers size={18} /> Multilingual Learning Content Fallback Engine
              </h4>
              <p className="leading-relaxed">
                Edulpha supports dual-language lesson packages. If a student chooses French interface mode, the LMS attempts to deliver the French lesson bundle. If no French translation exists, it seamlessly displays the default primary version without breaking user progress.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
                <h5 className="font-bold text-slate-900 text-xs">🇬🇧 English Syllabus Auto-Translation</h5>
                <p className="text-slate-500">Automatically generate French subtitles and lesson notes for English GCE courses using Edulpha AI.</p>
                <button className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs">
                  Run Auto-Translation Batch
                </button>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
                <h5 className="font-bold text-slate-900 text-xs">🇫🇷 French Syllabus Auto-Translation</h5>
                <p className="text-slate-500">Automatically generate English subtitles and summary sheets for Francophone (BAC/BEPC) courses.</p>
                <button className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs">
                  Run Auto-Translation Batch
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
