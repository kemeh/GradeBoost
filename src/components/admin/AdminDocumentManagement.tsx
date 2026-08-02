import React, { useState } from 'react';
import { FileText, Plus, ShieldCheck, ExternalLink, CheckCircle2 } from 'lucide-react';

export function AdminDocumentManagement() {
  const [activeDoc, setActiveDoc] = useState('privacy-policy');

  const docs = [
    { id: 'privacy-policy', title: 'Privacy Policy', updated: '2026-07-15' },
    { id: 'terms-and-conditions', title: 'Terms & Conditions', updated: '2026-07-10' },
    { id: 'cookie-policy', title: 'Cookie Policy', updated: '2026-06-28' },
    { id: 'data-protection', title: 'Data Protection Policy', updated: '2026-07-01' },
    { id: 'refund-policy', title: 'Refund & Billing Policy', updated: '2026-05-20' },
    { id: 'partner-guide', title: 'School Partner Guide', updated: '2026-08-01' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Legal & Compliance Governance</h3>
          <p className="text-xs text-slate-500 mt-0.5">Manage public terms, privacy policies, and institutional guides shown on the platform.</p>
        </div>

        <button className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-1.5 text-xs shadow-xs">
          <Plus size={16} /> Create Governance Document
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          {docs.map(doc => (
            <button
              key={doc.id}
              onClick={() => setActiveDoc(doc.id)}
              className={`w-full text-left p-4 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between ${
                activeDoc === doc.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText size={16} />
                <span>{doc.title}</span>
              </div>
              <span className="text-[10px] opacity-75">{doc.updated}</span>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 bg-white p-8 rounded-3xl border border-slate-200 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h4 className="font-black text-slate-900 text-base">
                {docs.find(d => d.id === activeDoc)?.title}
              </h4>
              <p className="text-xs text-slate-400">Last modified: {docs.find(d => d.id === activeDoc)?.updated}</p>
            </div>

            <a
              href={`/${activeDoc}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <ExternalLink size={14} /> Preview Live
            </a>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-medium flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>Document published and active across English and French platform views.</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Document Content Editor</label>
              <textarea
                className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 outline-none focus:border-indigo-500"
                defaultValue={`# ${docs.find(d => d.id === activeDoc)?.title}\n\n1. Overview\nEdulpha platform maintains strict compliance with national MINESEC guidelines.\n\n2. Privacy & Data Handling\nUser analytics are protected with AES-256 encryption.`}
              />
            </div>

            <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs">
              Save Document Updates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
