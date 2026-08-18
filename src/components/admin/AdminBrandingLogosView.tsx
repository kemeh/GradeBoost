import React, { useState, useEffect } from 'react';
import { Card, Button } from '../ui';
import { getSystemSettings, updateSystemSettings, SystemSettings } from '../../services/settingsService';
import LogoImageUploader from './LogoImageUploader';
import { 
  Save, Image as ImageIcon, Sparkles, Layout, 
  Globe, Shield, RefreshCw, CheckCircle2, RotateCcw,
  Layers, Bot, Smartphone
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSettings } from '../../contexts/SettingsContext';

const DEFAULT_BRANDING_LOGOS = {
  platformLogoUrl: '/edulpha-logo.png',
  landingLogoUrl: '/edulpha-logo.png',
  footerLogoUrl: '/edulpha-logo.png',
  partnerLogoUrl: '',
  institutionLogoUrl: '',
  sponsorLogoUrl: '',
  aiLogoUrl: '/ai-logo.png',
  faviconUrl: '/favicon.ico',
  appIconUrl: '/icon.png',
};

/**
 * Dedicated Admin Branding & Logo Management View
 * Manages all 9 official platform logos and brand marks:
 * 1. Platform Logo
 * 2. Landing Page Logo
 * 3. Footer Logo
 * 4. Partner Logos / Header
 * 5. Institution Logos
 * 6. Sponsor Logos
 * 7. AI Logo (Edulpha AI)
 * 8. Favicon (.ico / .png)
 * 9. App Icon (.png / webp)
 */
export default function AdminBrandingLogosView() {
  const { refreshSettings } = useSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logos, setLogos] = useState<{
    platformLogoUrl: string;
    landingLogoUrl: string;
    footerLogoUrl: string;
    partnerLogoUrl: string;
    institutionLogoUrl: string;
    sponsorLogoUrl: string;
    aiLogoUrl: string;
    faviconUrl: string;
    appIconUrl: string;
  }>(DEFAULT_BRANDING_LOGOS);

  useEffect(() => {
    loadLogos();
  }, []);

  const loadLogos = async () => {
    setLoading(true);
    try {
      const settings = await getSystemSettings();
      if (settings) {
        setLogos({
          platformLogoUrl: settings.platformLogoUrl || settings.logoUrl || DEFAULT_BRANDING_LOGOS.platformLogoUrl,
          landingLogoUrl: settings.landingLogoUrl || settings.logoUrl || DEFAULT_BRANDING_LOGOS.landingLogoUrl,
          footerLogoUrl: settings.footerLogoUrl || settings.logoUrl || DEFAULT_BRANDING_LOGOS.footerLogoUrl,
          partnerLogoUrl: settings.partnerLogoUrl || '',
          institutionLogoUrl: settings.institutionLogoUrl || '',
          sponsorLogoUrl: settings.sponsorLogoUrl || '',
          aiLogoUrl: settings.aiLogoUrl || DEFAULT_BRANDING_LOGOS.aiLogoUrl,
          faviconUrl: settings.faviconUrl || DEFAULT_BRANDING_LOGOS.faviconUrl,
          appIconUrl: settings.appIconUrl || DEFAULT_BRANDING_LOGOS.appIconUrl,
        });
      }
    } catch (err) {
      console.error('Error loading branding logos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (key: keyof typeof logos, url: string) => {
    setLogos((prev) => ({ ...prev, [key]: url }));
  };

  const handleSingleLogoSave = async (key: keyof typeof logos, url: string) => {
    const updatedLogos = {
      ...logos,
      [key]: url,
    };
    setLogos(updatedLogos);

    try {
      await updateSystemSettings({
        ...updatedLogos,
        logoUrl: key === 'platformLogoUrl' || key === 'landingLogoUrl' 
          ? url || '/edulpha-logo.png' 
          : updatedLogos.platformLogoUrl || updatedLogos.landingLogoUrl || '/edulpha-logo.png',
        platformLogoUrl: key === 'platformLogoUrl' ? url : updatedLogos.platformLogoUrl,
      });
      await refreshSettings();
    } catch (err) {
      console.error(`Failed to auto-save ${key}:`, err);
      toast.error('Failed to save logo to database');
    }
  };

  const handleSaveAllLogos = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    const toastId = toast.loading('Saving all branding settings...');
    try {
      const primaryLogo = logos.platformLogoUrl || logos.landingLogoUrl || '/edulpha-logo.png';
      await updateSystemSettings({
        ...logos,
        logoUrl: primaryLogo,
      });
      await refreshSettings();
      toast.success('All platform logos & branding assets saved and applied successfully!', { id: toastId });
    } catch (err) {
      console.error('Failed to save logos:', err);
      toast.error('Failed to save branding logos', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleResetAllDefaults = async () => {
    if (!window.confirm('Reset all logos to default Edulpha branding?')) return;
    setSaving(true);
    try {
      setLogos(DEFAULT_BRANDING_LOGOS);
      await updateSystemSettings({
        ...DEFAULT_BRANDING_LOGOS,
        logoUrl: DEFAULT_BRANDING_LOGOS.platformLogoUrl,
      });
      await refreshSettings();
      toast.success('All logos reset to default branding assets!');
    } catch (err) {
      console.error('Failed to reset logos:', err);
      toast.error('Failed to reset logos');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-bold flex flex-col items-center justify-center gap-3">
        <RefreshCw className="animate-spin text-indigo-600" size={24} />
        <span>Loading branding assets & configurations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <ImageIcon size={20} />
            </div>
            Logo & Brand Asset Management
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Configure, upload, replace, and save all 9 platform branding marks across web & mobile portals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleResetAllDefaults}
            disabled={saving}
            className="rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 border-slate-200"
          >
            <RotateCcw size={14} className="mr-1.5" /> Reset Defaults
          </Button>
          <Button
            onClick={handleSaveAllLogos}
            loading={saving}
            className="rounded-xl px-5 py-2 text-xs font-bold shadow-xs"
          >
            <Save size={16} className="mr-1.5" /> Save All Logos
          </Button>
        </div>
      </div>

      {/* Live Brand Preview Bar */}
      <div className="p-4 sm:p-5 bg-slate-900 text-white rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers size={14} className="text-indigo-400" /> Active Platform Branding Preview
          </span>
          <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 size={11} /> Live In-App Sync
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-center space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Navbar Logo</span>
            <div className="h-10 flex items-center justify-center p-1 bg-slate-900/50 rounded-lg">
              <img 
                src={logos.platformLogoUrl || '/edulpha-logo.png'} 
                alt="Platform Logo" 
                className="max-h-8 max-w-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).src = '/edulpha-logo.png'; }}
              />
            </div>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-center space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Footer Logo</span>
            <div className="h-10 flex items-center justify-center p-1 bg-slate-900/50 rounded-lg">
              <img 
                src={logos.footerLogoUrl || '/edulpha-logo.png'} 
                alt="Footer Logo" 
                className="max-h-8 max-w-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).src = '/edulpha-logo.png'; }}
              />
            </div>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-center space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI Tutor Bot</span>
            <div className="h-10 flex items-center justify-center p-1 bg-slate-900/50 rounded-lg">
              <img 
                src={logos.aiLogoUrl || '/ai-logo.png'} 
                alt="AI Logo" 
                className="max-h-8 max-w-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).src = '/ai-logo.png'; }}
              />
            </div>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-center space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">App & Favicon</span>
            <div className="h-10 flex items-center justify-center gap-2 p-1 bg-slate-900/50 rounded-lg">
              <img 
                src={logos.faviconUrl || '/favicon.ico'} 
                alt="Favicon" 
                className="h-6 w-6 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).src = '/favicon.ico'; }}
              />
              <img 
                src={logos.appIconUrl || '/icon.png'} 
                alt="App Icon" 
                className="h-7 w-7 object-contain rounded-md"
                onError={(e) => { (e.target as HTMLImageElement).src = '/icon.png'; }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logos 3-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Platform Logo */}
        <Card className="p-5 border border-slate-200 rounded-2xl space-y-4 hover:shadow-md transition-shadow">
          <LogoImageUploader
            label="1. Platform Logo"
            description="Main navbar & header logo visible across student & admin portals."
            initialUrl={logos.platformLogoUrl}
            defaultUrl="/edulpha-logo.png"
            aspectRatioHint="250x60px PNG/SVG"
            folder="logos/platform"
            onUploadComplete={(url) => handleLogoChange('platformLogoUrl', url)}
            onSave={(url) => handleSingleLogoSave('platformLogoUrl', url)}
          />
        </Card>

        {/* 2. Landing Page Logo */}
        <Card className="p-5 border border-slate-200 rounded-2xl space-y-4 hover:shadow-md transition-shadow">
          <LogoImageUploader
            label="2. Landing Page Logo"
            description="High-resolution hero branding on the public homepage."
            initialUrl={logos.landingLogoUrl}
            defaultUrl="/edulpha-logo.png"
            aspectRatioHint="300x80px PNG/SVG"
            folder="logos/landing"
            onUploadComplete={(url) => handleLogoChange('landingLogoUrl', url)}
            onSave={(url) => handleSingleLogoSave('landingLogoUrl', url)}
          />
        </Card>

        {/* 3. Footer Logo */}
        <Card className="p-5 border border-slate-200 rounded-2xl space-y-4 hover:shadow-md transition-shadow">
          <LogoImageUploader
            label="3. Footer Logo"
            description="Monochrome or light version for dark page footers."
            initialUrl={logos.footerLogoUrl}
            defaultUrl="/edulpha-logo.png"
            aspectRatioHint="200x50px Light PNG/SVG"
            folder="logos/footer"
            onUploadComplete={(url) => handleLogoChange('footerLogoUrl', url)}
            onSave={(url) => handleSingleLogoSave('footerLogoUrl', url)}
          />
        </Card>

        {/* 4. Partner Logos */}
        <Card className="p-5 border border-slate-200 rounded-2xl space-y-4 hover:shadow-md transition-shadow">
          <LogoImageUploader
            label="4. Partner Logos"
            description="Official educational partners banner mark."
            initialUrl={logos.partnerLogoUrl}
            aspectRatioHint="200x80px PNG"
            folder="logos/partner"
            onUploadComplete={(url) => handleLogoChange('partnerLogoUrl', url)}
            onSave={(url) => handleSingleLogoSave('partnerLogoUrl', url)}
          />
        </Card>

        {/* 5. Institution Logos */}
        <Card className="p-5 border border-slate-200 rounded-2xl space-y-4 hover:shadow-md transition-shadow">
          <LogoImageUploader
            label="5. Institution Logos"
            description="School, Ministry, & Exam Board seal / emblem."
            initialUrl={logos.institutionLogoUrl}
            aspectRatioHint="150x150px Square PNG/SVG"
            folder="logos/institution"
            onUploadComplete={(url) => handleLogoChange('institutionLogoUrl', url)}
            onSave={(url) => handleSingleLogoSave('institutionLogoUrl', url)}
          />
        </Card>

        {/* 6. Sponsor Logos */}
        <Card className="p-5 border border-slate-200 rounded-2xl space-y-4 hover:shadow-md transition-shadow">
          <LogoImageUploader
            label="6. Sponsor Logos"
            description="Scholarship & corporate sponsor branding emblem."
            initialUrl={logos.sponsorLogoUrl}
            aspectRatioHint="200x80px PNG"
            folder="logos/sponsor"
            onUploadComplete={(url) => handleLogoChange('sponsorLogoUrl', url)}
            onSave={(url) => handleSingleLogoSave('sponsorLogoUrl', url)}
          />
        </Card>

        {/* 7. AI Logo (Edulpha AI) */}
        <Card className="p-5 border border-slate-200 rounded-2xl space-y-4 hover:shadow-md transition-shadow">
          <LogoImageUploader
            label="7. AI Logo (Edulpha AI)"
            description="Avatar mark for the 24/7 AI Smart Tutor chatbot."
            initialUrl={logos.aiLogoUrl}
            defaultUrl="/ai-logo.png"
            aspectRatioHint="128x128px Circular PNG/SVG"
            folder="logos/ai"
            onUploadComplete={(url) => handleLogoChange('aiLogoUrl', url)}
            onSave={(url) => handleSingleLogoSave('aiLogoUrl', url)}
          />
        </Card>

        {/* 8. Favicon */}
        <Card className="p-5 border border-slate-200 rounded-2xl space-y-4 hover:shadow-md transition-shadow">
          <LogoImageUploader
            label="8. Favicon"
            description="Browser tab icon displayed in browser windows."
            initialUrl={logos.faviconUrl}
            defaultUrl="/favicon.ico"
            accept="image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml"
            aspectRatioHint="32x32px or 64x64px ICO/PNG"
            folder="logos/favicon"
            onUploadComplete={(url) => handleLogoChange('faviconUrl', url)}
            onSave={(url) => handleSingleLogoSave('faviconUrl', url)}
          />
        </Card>

        {/* 9. App Icon */}
        <Card className="p-5 border border-slate-200 rounded-2xl space-y-4 hover:shadow-md transition-shadow">
          <LogoImageUploader
            label="9. App Icon"
            description="Android PWA & Mobile App shortcut icon."
            initialUrl={logos.appIconUrl}
            defaultUrl="/icon.png"
            aspectRatioHint="512x512px High-Res PNG"
            folder="logos/app_icon"
            onUploadComplete={(url) => handleLogoChange('appIconUrl', url)}
            onSave={(url) => handleSingleLogoSave('appIconUrl', url)}
          />
        </Card>
      </div>

      {/* Bottom Save Action */}
      <div className="pt-4 flex justify-end">
        <Button
          onClick={handleSaveAllLogos}
          loading={saving}
          size="lg"
          className="rounded-2xl px-10 py-3 text-base font-black shadow-lg"
        >
          <Save size={20} className="mr-2" /> Save All Branding Settings
        </Button>
      </div>
    </div>
  );
}
