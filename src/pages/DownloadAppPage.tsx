import React from 'react';
import { DownloadAppSection } from '../components/DownloadAppSection';
import Navbar from '../components/navigation/Navbar';
import { DynamicFooter } from '../components/DynamicFooter';
import { SEO } from '../components/SEO';

export default function DownloadAppPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <SEO title="Download Edulpha Mobile App | Offline Revision" description="Download GradeBoost60 / Edulpha Android APK to practice past papers and study offline." />
      <Navbar />

      <div className="pt-20">
        <DownloadAppSection />
      </div>

      <DynamicFooter />
    </div>
  );
}
