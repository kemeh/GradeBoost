import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  RotateCcw, 
  School, 
  Shield, 
  Check, 
  Eye, 
  Download, 
  Sliders, 
  FileText, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { 
  SchoolBrandingSettings, 
  DEFAULT_SCHOOL_BRANDING 
} from '../../types/paperGenerator';
import { 
  getSchoolBranding, 
  updateSchoolBranding, 
  resetSchoolBrandingToDefault 
} from '../../services/schoolBrandingService';
import { 
  ExaminationLetterhead, 
  ExaminationWatermark, 
  ExaminationPageFooter 
} from './ExaminationLetterhead';
import { generateGCEPaper2PDF } from '../../utils/pdfGenerator';

interface ExaminationLetterheadSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export const ExaminationLetterheadSettingsModal: React.FC<ExaminationLetterheadSettingsModalProps> = ({
  isOpen,
  onClose,
  userId
}) => {
  const [formData, setFormData] = useState<SchoolBrandingSettings>(DEFAULT_SCHOOL_BRANDING);
  const [activeTab, setActiveTab] = useState<'details' | 'watermark' | 'preview'>('details');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isGeneratingTestPdf, setIsGeneratingTestPdf] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getSchoolBranding().then((loaded) => {
        setFormData(loaded);
      });
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTextChange = (field: keyof SchoolBrandingSettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWatermarkChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      watermark: {
        ...prev.watermark,
        enabled: prev.watermark?.enabled ?? true,
        text: prev.watermark?.text ?? 'OFFICIAL EXAMINATION PAPER',
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await updateSchoolBranding(formData, userId);
      setFormData(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save examination branding:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Reset school branding and watermark back to default Edulpha International Academy template?')) {
      return;
    }
    setIsSaving(true);
    try {
      const reset = await resetSchoolBrandingToDefault(userId);
      setFormData(reset);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to reset branding:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestPdf = async () => {
    setIsGeneratingTestPdf(true);
    try {
      await generateGCEPaper2PDF(
        {
          title: 'Paper 2 (Sample Practice)',
          paperType: 'Paper 2',
          subject: 'COMPUTER SCIENCE',
          year: formData.watermark?.academicYear || 2026,
          level: 'ADVANCED LEVEL',
          timeAllowed: '3 Hours',
          brandingSnapshot: formData,
          instructions: [
            'Answer ALL questions in Section A and THREE in Section B.',
            'All questions carry equal marks unless otherwise indicated.',
            'Credit will be given for tidy formatting and structured pseudocode.'
          ],
          questions: [
            {
              id: 1,
              text: 'Relational Database Design & Normalization in School Management Systems.',
              subparts: [
                { label: '(a)', text: 'Define the term Third Normal Form (3NF) and state its primary advantage in examination registries.', marks: 4 },
                { label: '(b)', text: 'Distinguish between a primary key and a surrogate candidate key with practical exam database schemas.', marks: 6 }
              ]
            }
          ]
        },
        { branding: formData }
      );
    } catch (err) {
      console.error('Test PDF generation failed:', err);
    } finally {
      setIsGeneratingTestPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200/60">
              <School size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                School Letterhead & Examination Watermark
              </h2>
              <p className="text-xs text-slate-500">
                Configure official school identity, crest, security watermark, and examination headers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'details'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            1. School Identity & Letterhead
          </button>
          <button
            onClick={() => setActiveTab('watermark')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'watermark'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            2. Examination Watermark & Security
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3.5 py-1.5 rounded-lg transition inline-flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Eye size={13} />
            3. Live Visual Preview
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {saveSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <Check size={16} className="text-emerald-600" />
              <span>Examination branding settings successfully updated and saved to system!</span>
            </div>
          )}

          {/* TAB 1: School Identity */}
          {activeTab === 'details' && (
            <div className="space-y-5">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <School size={16} className="text-indigo-600" />
                  Primary Institution Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      School / Institution Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.schoolName}
                      onChange={(e) => handleTextChange('schoolName', e.target.value)}
                      placeholder="e.g. EDULPHA INTERNATIONAL ACADEMY"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      School Motto
                    </label>
                    <input
                      type="text"
                      value={formData.motto}
                      onChange={(e) => handleTextChange('motto', e.target.value)}
                      placeholder='e.g. "Learn • Build • Lead"'
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      School Logo URL / Asset Path
                    </label>
                    <input
                      type="text"
                      value={formData.schoolLogoUrl}
                      onChange={(e) => handleTextChange('schoolLogoUrl', e.target.value)}
                      placeholder="/edulpha-logo.png"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Mailing / Physical Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleTextChange('address', e.target.value)}
                      placeholder="e.g. P.O. Box 1234, Yaoundé, Cameroon"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Telephone Contact
                    </label>
                    <input
                      type="text"
                      value={formData.telephone}
                      onChange={(e) => handleTextChange('telephone', e.target.value)}
                      placeholder="e.g. +237 6XX XXX XXX"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Official Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleTextChange('email', e.target.value)}
                      placeholder="e.g. info@edulpha.academy"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Official Website
                    </label>
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) => handleTextChange('website', e.target.value)}
                      placeholder="e.g. www.edulpha.academy"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Examination Centre Code
                    </label>
                    <input
                      type="text"
                      value={formData.examinationCentreNumber || ''}
                      onChange={(e) => handleTextChange('examinationCentreNumber', e.target.value)}
                      placeholder="e.g. CENTRE NO: 0124"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Shield size={16} className="text-indigo-600" />
                  Board & Examination Authority
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Examination Board Header Text
                    </label>
                    <input
                      type="text"
                      value={formData.examinationBoardText || ''}
                      onChange={(e) => handleTextChange('examinationBoardText', e.target.value)}
                      placeholder="e.g. CAMEROON GENERAL CERTIFICATE OF EDUCATION BOARD"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Confidentiality & Security Label
                    </label>
                    <input
                      type="text"
                      value={formData.securityLabel || ''}
                      onChange={(e) => handleTextChange('securityLabel', e.target.value)}
                      placeholder="CONFIDENTIAL • OFFICIAL EXAMINATION DOCUMENT"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Running Footer Text
                    </label>
                    <input
                      type="text"
                      value={formData.footerText || ''}
                      onChange={(e) => handleTextChange('footerText', e.target.value)}
                      placeholder="EDULPHA INTERNATIONAL ACADEMY • CONFIDENTIAL"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Watermark Settings */}
          {activeTab === 'watermark' && (
            <div className="space-y-5">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Shield size={16} className="text-indigo-600" />
                      Security Watermark
                    </h3>
                    <p className="text-xs text-slate-500">
                      Subtle academic seal with angled text rendered behind exam question content
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.watermark?.enabled ?? true}
                      onChange={(e) => handleWatermarkChange('enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Primary Watermark Text
                    </label>
                    <input
                      type="text"
                      value={formData.watermark?.text || 'OFFICIAL EXAMINATION PAPER'}
                      onChange={(e) => handleWatermarkChange('text', e.target.value)}
                      placeholder="OFFICIAL EXAMINATION PAPER"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold uppercase focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Secondary Text (School / Institution)
                    </label>
                    <input
                      type="text"
                      value={formData.watermark?.secondaryText || formData.schoolName}
                      onChange={(e) => handleWatermarkChange('secondaryText', e.target.value)}
                      placeholder={formData.schoolName}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 uppercase focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Watermark Opacity: {Math.round((formData.watermark?.opacity ?? 0.09) * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.04"
                      max="0.22"
                      step="0.01"
                      value={formData.watermark?.opacity ?? 0.09}
                      onChange={(e) => handleWatermarkChange('opacity', parseFloat(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>4% (Very Subtle)</span>
                      <span>9% (Recommended)</span>
                      <span>22% (Prominent)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Watermark Rotation Angle: {formData.watermark?.rotation ?? -35}°
                    </label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      step="5"
                      value={formData.watermark?.rotation ?? -35}
                      onChange={(e) => handleWatermarkChange('rotation', parseInt(e.target.value, 10))}
                      className="w-full accent-indigo-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>-45° (Standard)</span>
                      <span>0° (Horizontal)</span>
                      <span>+45° (Reverse)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Session Year
                    </label>
                    <input
                      type="number"
                      value={formData.watermark?.academicYear || 2026}
                      onChange={(e) => handleWatermarkChange('academicYear', parseInt(e.target.value, 10) || 2026)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="repeatEveryPage"
                      checked={formData.watermark?.repeatEveryPage ?? true}
                      onChange={(e) => handleWatermarkChange('repeatEveryPage', e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="repeatEveryPage" className="text-slate-700 font-medium">
                      Repeat watermark on every page in PDF & Word exports
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Live Visual Preview */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-600 shrink-0" />
                  <span>Interactive Letterhead & Watermark Preview (Rendered as in final examinations)</span>
                </div>
                <button
                  onClick={handleTestPdf}
                  disabled={isGeneratingTestPdf}
                  className="px-3 py-1 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 inline-flex items-center gap-1.5 shadow-sm text-xs"
                >
                  <Download size={13} />
                  {isGeneratingTestPdf ? 'Generating...' : 'Export Test PDF'}
                </button>
              </div>

              {/* Realistic Paper Sheet */}
              <div className="relative bg-white border border-slate-300 rounded shadow-md p-6 sm:p-10 overflow-hidden min-h-[600px]">
                {/* Watermark */}
                <ExaminationWatermark branding={formData} year={formData.watermark?.academicYear || 2026} />

                {/* Letterhead */}
                <ExaminationLetterhead
                  branding={formData}
                  paperInfo={{
                    subject: 'COMPUTER SCIENCE',
                    paperType: 'Paper 2',
                    title: 'Paper 2',
                    year: formData.watermark?.academicYear || 2026,
                    level: 'ADVANCED LEVEL',
                    timeAllowed: '3 Hours',
                    totalMarks: 100
                  }}
                />

                {/* Sample Question Mockup */}
                <div className="relative z-10 space-y-4 mt-6">
                  <div className="bg-slate-100/90 px-3 py-1 rounded border border-slate-200 flex justify-between items-center text-xs font-bold uppercase text-slate-900">
                    <span>QUESTION 1</span>
                    <span className="italic font-normal text-slate-500 lowercase">[total: 17 marks]</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    This is a live preview demonstrating the exact typographic scale, margin proportions, and watermark subtlety across the examination paper.
                  </p>
                  <div className="pl-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span><strong>(a)</strong> Define the term database transaction ACID properties.</span>
                      <span className="font-mono text-teal-700 font-bold">[4 marks]</span>
                    </div>
                    <div className="flex justify-between">
                      <span><strong>(b)</strong> Construct an algorithm for binary search on sorted array elements.</span>
                      <span className="font-mono text-teal-700 font-bold">[6 marks]</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <ExaminationPageFooter
                  branding={formData}
                  pageNumber={1}
                  totalPages={4}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 bg-white">
          <button
            onClick={handleResetDefaults}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
          >
            <RotateCcw size={14} />
            Reset to Default Academy
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
            >
              <Save size={15} />
              {isSaving ? 'Saving Settings...' : 'Save School Branding'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
