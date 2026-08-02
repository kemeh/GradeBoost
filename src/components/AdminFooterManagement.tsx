import React, { useEffect, useState } from 'react';
import { 
  getFooterConfig, saveFooterConfig, getFooterVersionHistory, 
  FooterConfig, FooterLink, SocialMediaLink, FooterVersionHistory, DEFAULT_FOOTER_CONFIG 
} from '../services/footerService';
import { DynamicFooter } from './DynamicFooter';
import { 
  Save, Eye, RotateCcw, Plus, Trash2, ArrowUp, ArrowDown, 
  Globe, Shield, Mail, FileText, CheckCircle2, History, Send, Link as LinkIcon, Edit3, Share2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export const AdminFooterManagement: React.FC = () => {
  const [config, setConfig] = useState<FooterConfig>(DEFAULT_FOOTER_CONFIG);
  const [activeSubTab, setActiveSubTab] = useState<'brand' | 'quickLinks' | 'legal' | 'resources' | 'social' | 'contact' | 'newsletter'>('brand');
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [versions, setVersions] = useState<FooterVersionHistory[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getFooterConfig();
      setConfig(data);
    } catch (e) {
      toast.error('Failed to load footer settings');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const hist = await getFooterVersionHistory();
      setVersions(hist);
      setShowHistoryModal(true);
    } catch (e) {
      toast.error('Failed to fetch version history');
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await saveFooterConfig(config, 'admin', false);
      toast.success('Footer draft saved locally & synced.');
    } catch (e) {
      toast.error('Failed to save draft.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await saveFooterConfig(config, 'admin', true);
      setConfig(prev => ({ ...prev, version: prev.version + 1, published: true }));
      toast.success(`Footer v${config.version + 1} published live to Landing Page!`);
    } catch (e) {
      toast.error('Failed to publish footer update.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRestoreVersion = (histConfig: FooterConfig) => {
    setConfig(histConfig);
    setShowHistoryModal(false);
    toast.success(`Restored footer version ${histConfig.version}`);
  };

  // Helper manipulators for array lists (QuickLinks, Legal, Resources, Social)
  const updateLinkList = (
    key: 'quickLinks' | 'legalDocuments' | 'resources', 
    index: number, 
    field: keyof FooterLink, 
    value: any
  ) => {
    const updated = [...config[key]];
    updated[index] = { ...updated[index], [field]: value };
    setConfig({ ...config, [key]: updated });
  };

  const addLinkItem = (key: 'quickLinks' | 'legalDocuments' | 'resources') => {
    const list = config[key] || [];
    const newId = `${key.slice(0, 3)}-${Date.now()}`;
    const newItem: FooterLink = {
      id: newId,
      label: 'New Link',
      url: '#',
      enabled: true,
      order: list.length + 1,
    };
    setConfig({ ...config, [key]: [...list, newItem] });
  };

  const removeLinkItem = (key: 'quickLinks' | 'legalDocuments' | 'resources', index: number) => {
    const list = [...config[key]];
    list.splice(index, 1);
    setConfig({ ...config, [key]: list });
  };

  const moveLinkItem = (key: 'quickLinks' | 'legalDocuments' | 'resources', index: number, direction: 'up' | 'down') => {
    const list = [...config[key]];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    // update order field
    list.forEach((item, idx) => { item.order = idx + 1; });
    setConfig({ ...config, [key]: list });
  };

  // Social manipulators
  const updateSocialItem = (index: number, field: keyof SocialMediaLink, value: any) => {
    const list = [...config.socialLinks];
    list[index] = { ...list[index], [field]: value };
    setConfig({ ...config, socialLinks: list });
  };

  const addSocialItem = () => {
    const newSocial: SocialMediaLink = {
      id: `soc-${Date.now()}`,
      platform: 'Facebook',
      url: 'https://',
      enabled: true,
      iconName: 'Globe',
      order: config.socialLinks.length + 1,
    };
    setConfig({ ...config, socialLinks: [...config.socialLinks, newSocial] });
  };

  const removeSocialItem = (index: number) => {
    const list = [...config.socialLinks];
    list.splice(index, 1);
    setConfig({ ...config, socialLinks: list });
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium">
        Loading Footer Management Module...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-black rounded-full uppercase tracking-wider">
              Footer v{config.version}
            </span>
            <span className={`text-xs font-bold ${config.published ? 'text-emerald-600' : 'text-amber-600'}`}>
              • {config.published ? 'Published Live' : 'Draft / Unsaved Changes'}
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">Footer Content Management</h2>
          <p className="text-xs text-slate-500">
            Customize branding, navigation links, legal documents, social links, contact info, and newsletter banners.
          </p>
        </div>

        {/* View Switcher & Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${viewMode === 'split' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode('edit')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${viewMode === 'edit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
            >
              Edit Only
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${viewMode === 'preview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
            >
              Preview Only
            </button>
          </div>

          <button
            onClick={loadHistory}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            <History size={14} /> Version Log
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <Save size={14} /> {isSaving ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition shadow-lg shadow-indigo-200"
          >
            <Send size={14} /> {isPublishing ? 'Publishing...' : 'Publish Live'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`grid gap-6 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        
        {/* EDIT PANEL */}
        {(viewMode === 'split' || viewMode === 'edit') && (
          <div className={`${viewMode === 'split' ? 'lg:col-span-6' : 'w-full'} bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col`}>
            
            {/* Sub Tabs Bar */}
            <div className="bg-slate-50 border-b border-slate-200 p-2 flex overflow-x-auto gap-1">
              {[
                { id: 'brand', label: 'Brand & Logo', icon: Shield },
                { id: 'quickLinks', label: 'Navigation', icon: LinkIcon },
                { id: 'legal', label: 'Legal Policies', icon: FileText },
                { id: 'resources', label: 'Resources', icon: Edit3 },
                { id: 'social', label: 'Social Media', icon: Share2 },
                { id: 'contact', label: 'Contact & Map', icon: Mail },
                { id: 'newsletter', label: 'Newsletter', icon: Send },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap flex items-center gap-1.5 transition ${activeSubTab === tab.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'}`}
                >
                  <tab.icon size={13} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Sub Tab Contents */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[750px]">
              
              {/* TAB 1: BRAND */}
              {activeSubTab === 'brand' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Brand Information</h3>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Brand Name</label>
                    <input
                      type="text"
                      value={config.brand.name}
                      onChange={(e) => setConfig({ ...config, brand: { ...config.brand, name: e.target.value } })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Logo URL</label>
                    <input
                      type="text"
                      value={config.brand.logoUrl}
                      onChange={(e) => setConfig({ ...config, brand: { ...config.brand, logoUrl: e.target.value } })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Brand Description</label>
                    <textarea
                      rows={3}
                      value={config.brand.description}
                      onChange={(e) => setConfig({ ...config, brand: { ...config.brand, description: e.target.value } })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Brand Slogan</label>
                    <input
                      type="text"
                      value={config.brand.slogan}
                      onChange={(e) => setConfig({ ...config, brand: { ...config.brand, slogan: e.target.value } })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Copyright Statement</label>
                    <input
                      type="text"
                      value={config.brand.copyright}
                      onChange={(e) => setConfig({ ...config, brand: { ...config.brand, copyright: e.target.value } })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white outline-none"
                    />
                  </div>
                  <div className="pt-2 flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.brand.showEncryptedBadge}
                        onChange={(e) => setConfig({ ...config, brand: { ...config.brand, showEncryptedBadge: e.target.checked } })}
                        className="rounded text-indigo-600 focus:ring-0"
                      />
                      <span className="text-xs font-bold text-slate-700">Display "AES-256 Encrypted" Security Badge</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.brand.showBilingualBadge}
                        onChange={(e) => setConfig({ ...config, brand: { ...config.brand, showBilingualBadge: e.target.checked } })}
                        className="rounded text-indigo-600 focus:ring-0"
                      />
                      <span className="text-xs font-bold text-slate-700">Display "Bilingual Support" Language Badge</span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2, 3, 4: LINK LIST EDITORS (QUICK LINKS, LEGAL, RESOURCES) */}
              {(activeSubTab === 'quickLinks' || activeSubTab === 'legal' || activeSubTab === 'resources') && (() => {
                const keyMap = { quickLinks: 'quickLinks', legal: 'legalDocuments', resources: 'resources' } as const;
                const fieldKey = keyMap[activeSubTab];
                const links = config[fieldKey] || [];

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                        {activeSubTab === 'quickLinks' ? 'Platform Navigation Links' : activeSubTab === 'legal' ? 'Legal Documents' : 'Resource Links'}
                      </h3>
                      <button
                        onClick={() => addLinkItem(fieldKey)}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                      >
                        <Plus size={14} /> Add Link
                      </button>
                    </div>

                    <div className="space-y-2">
                      {links.map((item, index) => (
                        <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.enabled}
                            onChange={(e) => updateLinkList(fieldKey, index, 'enabled', e.target.checked)}
                            className="rounded text-indigo-600 focus:ring-0 shrink-0"
                            title="Toggle link visibility"
                          />
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => updateLinkList(fieldKey, index, 'label', e.target.value)}
                            placeholder="Link Label"
                            className="w-1/3 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                          />
                          <input
                            type="text"
                            value={item.url}
                            onChange={(e) => updateLinkList(fieldKey, index, 'url', e.target.value)}
                            placeholder="URL / Path e.g. /privacy-policy"
                            className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-600 outline-none"
                          />
                          <button
                            onClick={() => moveLinkItem(fieldKey, index, 'up')}
                            disabled={index === 0}
                            className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => moveLinkItem(fieldKey, index, 'down')}
                            disabled={index === links.length - 1}
                            className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            onClick={() => removeLinkItem(fieldKey, index)}
                            className="p-1.5 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* TAB 5: SOCIAL MEDIA LINKS */}
              {activeSubTab === 'social' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Social Media Channels</h3>
                    <button
                      onClick={addSocialItem}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                    >
                      <Plus size={14} /> Add Social Link
                    </button>
                  </div>

                  <div className="space-y-2">
                    {config.socialLinks.map((item, index) => (
                      <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={(e) => updateSocialItem(index, 'enabled', e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-0 shrink-0"
                        />
                        <select
                          value={item.platform}
                          onChange={(e) => updateSocialItem(index, 'platform', e.target.value)}
                          className="px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                        >
                          <option value="Facebook">Facebook</option>
                          <option value="Instagram">Instagram</option>
                          <option value="X (Twitter)">X (Twitter)</option>
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="TikTok">TikTok</option>
                          <option value="YouTube">YouTube</option>
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="Telegram">Telegram</option>
                        </select>
                        <input
                          type="text"
                          value={item.url}
                          onChange={(e) => updateSocialItem(index, 'url', e.target.value)}
                          placeholder="Channel URL"
                          className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-600 outline-none"
                        />
                        <button
                          onClick={() => removeSocialItem(index)}
                          className="p-1.5 text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: CONTACT INFORMATION */}
              {activeSubTab === 'contact' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Contact Details & Address</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Primary Support Email</label>
                      <input
                        type="text"
                        value={config.contactInfo.email}
                        onChange={(e) => setConfig({ ...config, contactInfo: { ...config.contactInfo, email: e.target.value } })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Partnerships Email</label>
                      <input
                        type="text"
                        value={config.contactInfo.secondaryEmail || ''}
                        onChange={(e) => setConfig({ ...config, contactInfo: { ...config.contactInfo, secondaryEmail: e.target.value } })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Primary Phone / WhatsApp</label>
                      <input
                        type="text"
                        value={config.contactInfo.phone}
                        onChange={(e) => setConfig({ ...config, contactInfo: { ...config.contactInfo, phone: e.target.value } })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Secondary Phone</label>
                      <input
                        type="text"
                        value={config.contactInfo.secondaryPhone || ''}
                        onChange={(e) => setConfig({ ...config, contactInfo: { ...config.contactInfo, secondaryPhone: e.target.value } })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Physical Office Address</label>
                    <input
                      type="text"
                      value={config.contactInfo.address}
                      onChange={(e) => setConfig({ ...config, contactInfo: { ...config.contactInfo, address: e.target.value } })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Operating Business Hours</label>
                    <input
                      type="text"
                      value={config.contactInfo.businessHours}
                      onChange={(e) => setConfig({ ...config, contactInfo: { ...config.contactInfo, businessHours: e.target.value } })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 7: NEWSLETTER */}
              {activeSubTab === 'newsletter' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Newsletter Subscription Banner</h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.newsletter.enabled}
                        onChange={(e) => setConfig({ ...config, newsletter: { ...config.newsletter, enabled: e.target.checked } })}
                        className="rounded text-indigo-600 focus:ring-0"
                      />
                      <span className="text-xs font-bold text-slate-700">Enable Banner</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Headline</label>
                    <input
                      type="text"
                      value={config.newsletter.heading}
                      onChange={(e) => setConfig({ ...config, newsletter: { ...config.newsletter, heading: e.target.value } })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subtext / Description</label>
                    <textarea
                      rows={2}
                      value={config.newsletter.description}
                      onChange={(e) => setConfig({ ...config, newsletter: { ...config.newsletter, description: e.target.value } })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Button Text</label>
                      <input
                        type="text"
                        value={config.newsletter.buttonText}
                        onChange={(e) => setConfig({ ...config, newsletter: { ...config.newsletter, buttonText: e.target.value } })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Input Placeholder</label>
                      <input
                        type="text"
                        value={config.newsletter.placeholderText}
                        onChange={(e) => setConfig({ ...config, newsletter: { ...config.newsletter, placeholderText: e.target.value } })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* LIVE PREVIEW PANEL */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className={`${viewMode === 'split' ? 'lg:col-span-6' : 'w-full'} bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl flex flex-col`}>
            <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Eye size={14} className="text-indigo-400" /> Live Interactive Preview
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                Real-Time Rendering
              </span>
            </div>
            
            <div className="overflow-y-auto max-h-[750px] p-2 bg-slate-950">
              <DynamicFooter overrideConfig={config} />
            </div>
          </div>
        )}

      </div>

      {/* VERSION HISTORY MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl border border-slate-200 shadow-2xl overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <History className="text-indigo-600" size={20} />
                <h3 className="text-lg font-black text-slate-900">Footer Revision History</h3>
              </div>
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {versions.map((ver) => (
                <div key={ver.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-black rounded-full">
                        Version {ver.version}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(ver.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 font-medium">
                      Saved by <strong className="text-slate-800">{ver.createdBy}</strong> • Brand Name: "{ver.config?.brand?.name || 'Edulpha'}"
                    </p>
                  </div>

                  <button
                    onClick={() => handleRestoreVersion(ver.config)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shrink-0 transition"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
