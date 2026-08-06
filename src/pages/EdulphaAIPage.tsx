import React from 'react';
import { Cpu, Sparkles, Zap, MessageSquare, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import Navbar from '../components/navigation/Navbar';
import { DynamicFooter } from '../components/DynamicFooter';
import { SEO } from '../components/SEO';
import { Badge, Button } from '../components/ui';
import { Link } from 'react-router-dom';

export default function EdulphaAIPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <SEO title="Edulpha AI Step-by-Step Tutor | Edulpha" description="AI study assistant tuned for African GCE Board, MINESEC, TVEE, and WASSCE marking schemes." />
      <Navbar />

      <section className="pt-28 pb-16 px-4 sm:px-6 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 px-3 py-1 text-xs uppercase font-black">
            24/7 INTELLIGENT TUTOR
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black">Meet Edulpha AI</h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Your personal AI tutor engineered specifically for African secondary and technical education curricula.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-black">What makes Edulpha AI unique?</h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Step-by-step working out:</strong> Never gives raw answers. Explains the underlying physical or mathematical principles.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Bilingual fluency:</strong> Translates complex explanations seamlessly between English and French.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Photo Diagram Scanner:</strong> Snap a photo of a math problem or physics circuit to get an instant explanation.</span>
              </div>
            </div>
            <div className="pt-4">
              <Link to="/auth?mode=register">
                <Button className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2">
                  <span>Try Edulpha AI Free</span>
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-200 font-mono text-xs space-y-3 shadow-2xl">
            <div className="flex items-center gap-2 text-indigo-400 font-bold border-b border-slate-800 pb-2">
              <Cpu size={16} />
              <span>Edulpha AI Assistant Demo</span>
            </div>
            <p className="text-slate-400">// Question: Solve 2x² - 5x + 3 = 0</p>
            <p className="text-emerald-400"># Step 1: Identify coefficients a=2, b=-5, c=3</p>
            <p className="text-slate-300"># Step 2: Calculate Discriminant Δ = b² - 4ac</p>
            <p className="text-amber-300">Δ = (-5)² - 4(2)(3) = 25 - 24 = 1</p>
            <p className="text-emerald-400"># Step 3: Roots x = (-b ± √Δ) / 2a</p>
            <p className="text-indigo-300">x₁ = (5 + 1) / 4 = 1.5, x₂ = (5 - 1) / 4 = 1</p>
          </div>
        </div>
      </section>

      <DynamicFooter />
    </div>
  );
}
