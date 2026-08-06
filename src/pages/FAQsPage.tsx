import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Search } from 'lucide-react';
import Navbar from '../components/navigation/Navbar';
import { DynamicFooter } from '../components/DynamicFooter';
import { SEO } from '../components/SEO';
import { Badge } from '../components/ui';

export default function FAQsPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [search, setSearch] = useState('');

  const faqs = [
    {
      q: 'Does Edulpha work offline without internet?',
      a: 'Yes! Download the Edulpha Android APK to save past questions, notes, and offline diagnostic tests onto your device memory.'
    },
    {
      q: 'Are GCE and MINESEC marking schemes included?',
      a: 'Yes, Edulpha provides verified step-by-step corrections conforming to official GCE Board and MINESEC Baccalauréat marking keys.'
    },
    {
      q: 'Which payment methods are supported for subscriptions?',
      a: 'We accept MTN Mobile Money (MoMo), Orange Money, Express Union, Bank Cards (Visa/Mastercard), and Flutterwave across Africa.'
    },
    {
      q: 'How does the Edulpha AI step-by-step solver work?',
      a: 'Type your question or snap a photo of a math problem or physics circuit. Edulpha AI breaks down the solution into simple step-by-step steps with explanations.'
    },
    {
      q: 'Can schools register multiple students under group licenses?',
      a: 'Yes! Schools and TVEE institutes can request group discount onboarding. Contact our partnerships team for custom school keys.'
    }
  ];

  const filtered = faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <SEO title="Frequently Asked Questions (FAQs) | Edulpha" description="Find answers to common questions about subscriptions, offline app, past paper coverage, and Edulpha AI." />
      <Navbar />

      <section className="pt-28 pb-16 px-4 sm:px-6 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 px-3 py-1 text-xs uppercase font-black">
            HELP & SUPPORT HUB
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black">Frequently Asked Questions</h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Everything you need to know about Edulpha platform features, subscriptions, and mobile learning.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-4">
          {filtered.map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full p-5 text-left font-bold text-sm flex items-center justify-between gap-4"
              >
                <span>{item.q}</span>
                <ChevronDown size={18} className={`transition-transform ${openIdx === idx ? 'rotate-180 text-indigo-500' : 'text-slate-400'}`} />
              </button>
              {openIdx === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <DynamicFooter />
    </div>
  );
}
