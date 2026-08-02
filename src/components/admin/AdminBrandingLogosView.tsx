import React, { useState, useEffect } from 'react';
import { Card, Button } from '../ui';
import { getSystemSettings, updateSystemSettings, SystemSettings } from '../../services/settingsService';
import LogoImageUploader from './LogoImageUploader';
import { Save, Image as ImageIcon, Sparkles, Layout, Globe, Shield, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSettings } from '../../contexts/SettingsContext';

/**
 * Dedicated Admin Branding & Logo Management View
 * Manages:
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
  }>({
    platformLogoUrl: '',
    landingLogoUrl: '',
    footerLogoUrl: '',
    partnerLogoUrl: '',
    institutionLogoUrl: '',
    sponsorLogoUrl: '',
    aiLogoUrl: '',
    faviconUrl: '',
    appIconUrl: '',
  });

  useEffect(() => {
    loadLogos();
  }, []);

  const loadLogos = async () => {
    setLoading(true);
    try {
      const settings = await getSystemSettings();
      if (settings) {
        setLogos({
          platformLogoUrl: settings.platformLogoUrl || settings.logoUrl || '',
          landingLogoUrl: settings.landingLogoUrl || settings.logoUrl || '',
          footerLogoUrl: settings.footerLogoUrl || settings.logoUrl || '',
          partnerLogoUrl: settings.partnerLogoUrl || '',
          institutionLogoUrl: settings.institutionLogoUrl || '',
          sponsorLogoUrl: settings.sponsorLogoUrl || '',
          aiLogoUrl: settings.aiLogoUrl || '',
          faviconUrl: settings.faviconUrl || '',
          appIconUrl: settings.appIconUrl || '',
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

  const handleSaveAllLogos = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await updateSystemSettings({
        ...logos,
        logoUrl: logos.platformLogoUrl || logos.landingLogoUrl || '/edulpha-logo.png',
      });
      await refreshSettings();
      toast.success('All platform logos & branding assets updated successfully!');
    } catch (err) {
      console.error('Failed to save logos:', err);
      toast.error('Failed to save branding logos');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-bold flex items-center justify-center gap-2">
        <RefreshCw className="animate-spin" size={20} />
        Loading branding assets...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ImageIcon className="text-indigo-600" size={26} />
            Logo & Brand Asset Management
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Upload, optimize, replace, and delete all 9 official platform logos and brand marks.
          </p>
        </div>
        <Button
          onClick={handleSaveAllLogos}
          loading={saving}
          className="rounded-xl px-6 py-2.5 font-bold shadow-md"
        >
          <Save size={18} className="mr-2" /> Save All Logos
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Platform Logo */}
        <Card className="p-5 border border-slate-200 rounded-2xl space-y-4 hover:shadow-md transition-shadow">
          <LogoImageUploader
            label="1. Platform Logo"
            description="Main navbar & header logo visible across student & admin portals."
            initialUrl={logos.platformLogoUrl}
            aspectRatioHint="Recommended: 250x60px PNG/SVG"
            folder="logos/platform"
            onUploadComplete={(url) => handleLogoChange('platformLogoUrl', url)}
          />
        </Card>

        {/* 2. Landing Page Logo */}
        <Card className="p-5 border border-slate-200 rounded-2xl space-y-4 hover:shadow-md transition-shadow">
          <LogoImageUploader
            label="2. Landing Page Logo"
            description="High-resolution hero branding on the public homepage."
            initialUrl={logos.landingLogoUrl}
            aspectRatioHint="Recommended: 300x80px PNG/SVG"
            folder="logos/landing"
            onUploadComplete={(url) => handleLogoChange('landingLogoUrl', url)}
          />
        </Card>

        {/* 3. Footer Logo */}
        <Card className="p-5 border border-slate-200 rounded-2xl space-y-4 hover:shadow-md transition-shadow">
          <LogoImageUploader
            label="3. Footer Logo"
            description="Monochrome or light version for dark page footers."
            initialUrl={logos.footerLogoUrl}
            aspectRatioHint="Recommended: 200x50px Light PNG/SVG"
            folder="logos/footer"
            onUploadComplete={(url) => handleLogoChange('footerLogoUrl', url)}
          />
        </Card>

        {/* 4. Partner Logos */}
        <Card className="p-5 border border-slate-200 rounded-2xl space-y-4 hover:shadow-md transition-shadow">
          <LogoImageUploader
            label="4. Partner Logos"
            description="Official educational partners banner mark."
            initialUrl={logos.partnerLogoUrl}
            aspectRatioHint="Recommended: 200x80px PNG"
            folder="logos/partner"
            onUploadComplete={(url) => handleLogoChange('partnerLogoUrl', url)}
          />
        </Card>

        {/* 5. Institution Logos */}
        <Card className="p-5 border border-slate-200 rounded-2xl space-y-4 hover:shadow-md transition-shadow">
          <LogoImageUploader
            label="5. Institution Logos"
            description="School, Ministry, & Exam Board seal / emblem."
            initialUrl={logos.institutionLogoUrl}
            aspectRatioHint="Recommended: 150x150px Square PNG/SVG"
            folder="logos/institution"
            onUploadComplete={(url) => handleLogoChange('institutionLogoUrl', url)}
          />
        </Card>

        {/* 6. Sponsor Logos */}
        <Card className="p-5 border border-slate-200 rounded-2xl space-y-4 hover:shadow-md transition-shadow">
          <LogoImageUploader
            label="6. Sponsor Logos"
            description="Scholarship & corporate sponsor branding emblem."
            initialUrl={logos.sponsorLogoUrl}
            aspectRatioHint="Recommended: 200x80px PNG"
            folder="logos/sponsor"
            onUploadComplete={(url) => handleLogoChange('sponsorLogoUrl', url)}
          />
        </Card>

        {/* 7. AI Logo (Edulpha AI) */}
        <Card className="p-5 border border-slate-200 rounded-2xl space-y-4 hover:shadow-md transition-shadow">
          <LogoImageUploader
            label="7. AI Logo (Edulpha AI)"
            description="Avatar mark for the 24/7 AI Smart Tutor chatbot."
            initialUrl={logos.aiLogoUrl}
            aspectRatioHint="Recommended: 128x128px Circular PNG/SVG"
            folder="logos/ai"
            onUploadComplete={(url) => handleLogoChange('aiLogoUrl', url)}
          />
        </Card>

        {/* 8. Favicon */}
        <Card className="p-5 border border-slate-200 rounded-2xl space-y-4 hover:shadow-md transition-shadow">
          <LogoImageUploader
            label="8. Favicon"
            description="Browser tab icon displayed in browser windows."
            initialUrl={logos.faviconUrl}
            accept="image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml"
            aspectRatioHint="Recommended: 32x32px or 64x64px ICO/PNG"
            folder="logos/favicon"
            onUploadComplete={(url) => handleLogoChange('faviconUrl', url)}
          />
        </Card>

        {/* 9. App Icon */}
        <Card className="p-5 border border-slate-200 rounded-2xl space-y-4 hover:shadow-md transition-shadow">
          <LogoImageUploader
            label="9. App Icon"
            description="Android PWA & Mobile App shortcut icon."
            initialUrl={logos.appIconUrl}
            aspectRatioHint="Recommended: 512x512px High-Res PNG"
            folder="logos/app_icon"
            onUploadComplete={(url) => handleLogoChange('appIconUrl', url)}
          />
        </Card>
      </div>

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
