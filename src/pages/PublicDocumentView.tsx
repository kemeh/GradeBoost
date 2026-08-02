import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';

interface PublicDocumentViewProps {
  fixedSlug?: string;
}

export default function PublicDocumentView({ fixedSlug }: PublicDocumentViewProps) {
  const location = useLocation();
  const path = fixedSlug || location.pathname.replace('/', '');

  const docTitles: Record<string, { title: string; subtitle: string }> = {
    'privacy-policy': { title: 'Privacy Policy', subtitle: 'How Edulpha handles, encrypts, and protects student and school data.' },
    'terms-and-conditions': { title: 'Terms & Conditions', subtitle: 'General terms governing the use of Edulpha web & mobile services.' },
    'cookie-policy': { title: 'Cookie Policy', subtitle: 'Information on local session cookies and offline APK cache storage.' },
    'data-protection': { title: 'Data Protection Policy', subtitle: 'Compliance with Cameroonian and international data privacy laws.' },
    'user-agreement': { title: 'User Agreement', subtitle: 'Code of conduct for students, teachers, and school administrators.' },
    'community-guidelines': { title: 'Community Guidelines', subtitle: 'Standards for discussion forums, peer duels, and LMS classrooms.' },
    'refund-policy': { title: 'Refund & Billing Policy', subtitle: 'Subscription terms, mobile payment handling, and refund eligibility.' },
    'disclaimer': { title: 'Official Disclaimer', subtitle: 'Academic preparation disclaimer regarding examination board materials.' },
    'intellectual-property': { title: 'Intellectual Property', subtitle: 'Copyright policies regarding past papers, AI models, and curriculum content.' },
    'user-guide': { title: 'Student & Parent Guide', subtitle: 'Getting started guide for students and parents preparing for national exams.' },
    'partner-guide': { title: 'School Partner Guide', subtitle: 'Manual for partner institutions deploying Edulpha LMS across classrooms.' },
    'security-policy': { title: 'Security Architecture', subtitle: 'Technical specifications of AES-256 encryption and offline APK signatures.' },
  };

  const currentDoc = docTitles[path] || {
    title: path.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    subtitle: 'Official Edulpha platform governance document.'
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white py-16 px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-white transition">
          <ArrowLeft size={16} /> Back to Home Page
        </Link>

        <div className="space-y-4 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-full text-[11px] font-black uppercase">
            <FileText size={14} /> Official Governance Document
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">{currentDoc.title}</h1>
          <p className="text-slate-400 text-lg font-medium">{currentDoc.subtitle}</p>
        </div>

        <div className="bg-slate-950 p-8 sm:p-12 rounded-3xl border border-slate-800 space-y-8 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-400" /> 1. Introduction & Core Scope
            </h2>
            <p>
              This document outlines the operational guidelines for {currentDoc.title} within the Edulpha learning system. 
              Edulpha is committed to delivering high-quality, transparent, and secure educational tools aligned with the Cameroonian 
              Ministry of Secondary Education (MINESEC) and the Cameroon GCE Board standards.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <CheckCircle2 size={20} className="text-indigo-400" /> 2. Standards & Compliance
            </h2>
            <p>
              All user account data, diagnostic mock test scores, past paper revision metrics, and Edulpha AI interaction logs 
              are processed under strict privacy protocols. Users retain ownership of their study analytics, while partner schools 
              enjoy administrative controls over enrolled student groups.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <CheckCircle2 size={20} className="text-purple-400" /> 3. Support & Contact
            </h2>
            <p>
              If you have any questions or require formal documentation regarding {currentDoc.title}, please contact our compliance team:
            </p>
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-xs font-mono text-indigo-300 space-y-1">
              <div>Email: legal@edulpha.cm</div>
              <div>Phone: +237 670 000 000</div>
              <div>Address: Edulpha Hub, Akwa, Douala, Cameroon</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
