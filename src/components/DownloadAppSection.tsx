import React from 'react';
import { motion } from 'motion/react';
import { 
  Download, QrCode, Smartphone, WifiOff, CheckCircle2, Star, ShieldCheck, 
  Sparkles, Play, Globe, ExternalLink, ArrowRight
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const DownloadAppSection: React.FC = () => {
  const { language } = useLanguage();
  const isFr = language === 'fr';

  return (
    <section id="mobile-app" className="py-24 px-6 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Information */}
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Smartphone size={14} />
            {isFr ? 'Expérience Application Mobile' : 'Mobile App Experience'}
          </div>

          <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            {isFr ? (
              <>
                Apprenez Partout & Toujours <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                  100% Fonctionnel Hors-Ligne
                </span>
              </>
            ) : (
              <>
                Learn Anytime, Anywhere <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                  100% Offline Capability
                </span>
              </>
            )}
          </h2>

          <p className="text-slate-300 text-base sm:text-lg font-medium leading-relaxed">
            {isFr
              ? 'Téléchargez l’APK Android d’Edulpha pour réviser les épreuves d’examens, lire vos cours hors-ligne et utiliser le tuteur IA sans consommer de données mobiles.'
              : 'Download the Edulpha Android APK to practice past questions, read offline lessons, and run AI revision drills without needing active internet or expensive mobile data bundles.'}
          </p>

          {/* Feature Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <WifiOff size={20} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">{isFr ? 'Zéro Donnée Requis' : 'Zero Data Required'}</h4>
                <p className="text-xs text-slate-400">{isFr ? 'Accédez à des milliers d’épreuves et corrigés hors-ligne.' : 'Access thousands of past questions and solutions offline.'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <Sparkles size={20} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">{isFr ? 'Résolveurs IA Hors-Ligne' : 'Offline AI Solvers'}</h4>
                <p className="text-xs text-slate-400">{isFr ? 'Démonstrations mathématiques et scientifiques enregistrées.' : 'Cached step-by-step math and science problem breakdowns.'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <ShieldCheck size={20} className="text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">{isFr ? 'Sécurisé AES-256' : 'AES-256 Secure'}</h4>
                <p className="text-xs text-slate-400">{isFr ? 'Synchronisation sécurisée dès le retour de la connexion.' : 'Safe offline progress syncing when back online.'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <Star size={20} className="text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">{isFr ? 'Diagnostic Instantané' : 'Instant Diagnostics'}</h4>
                <p className="text-xs text-slate-400">{isFr ? 'Calcul automatique des notes et repérage des points faibles.' : 'Automatic score calculations & weak topic alerts.'}</p>
              </div>
            </div>
          </div>

          {/* Download Buttons Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            
            {/* Direct APK Download Button */}
            <a 
              href="https://github.com/edulpha/app/releases/download/v1.0.0/edulpha-app.apk" 
              download
              className="px-8 py-4 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-xs rounded-2xl uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl shadow-emerald-400/20 hover:scale-105 transition-all"
            >
              <Download size={18} />
              <span>{isFr ? 'Télécharger l\'APK Android Direct' : 'Download Direct Android APK'}</span>
            </a>

            {/* Google Play (Coming Soon) */}
            <div className="px-6 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-3 text-slate-400">
              <Play size={20} className="text-slate-500" />
              <div className="text-left">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Google Play</span>
                <span className="text-xs font-bold text-slate-300">{isFr ? 'Bientôt Disponible' : 'Coming Soon'}</span>
              </div>
            </div>

            {/* App Store (Coming Soon) */}
            <div className="px-6 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-3 text-slate-400">
              <Smartphone size={20} className="text-slate-500" />
              <div className="text-left">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Apple App Store</span>
                <span className="text-xs font-bold text-slate-300">{isFr ? 'Bientôt Disponible' : 'Coming Soon'}</span>
              </div>
            </div>

          </div>

        </div>

        {/* Right Phone Mockup & QR Code */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-w-sm text-center relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-400 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider shadow-md">
              {isFr ? 'Scannez pour Installer' : 'Scan to Install on Mobile'}
            </div>

            {/* QR Code Container */}
            <div className="pt-4 flex justify-center">
              <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-200">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://edulpha.cm/download" 
                  alt="Download Edulpha Mobile App QR Code" 
                  className="w-44 h-44 object-contain"
                />
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">{isFr ? 'Scannez avec votre téléphone' : 'Scan with Phone Camera'}</h4>
              <p className="text-xs text-slate-400">{isFr ? 'Lien de téléchargement direct pour appareils Android (v6.0+)' : 'Instant download link for Android devices (v6.0+ supported)'}</p>
            </div>

            <div className="pt-2 border-t border-slate-900 flex items-center justify-center gap-4 text-xs font-bold text-emerald-400">
              <span className="flex items-center gap-1"><CheckCircle2 size={14} /> {isFr ? 'APK 100% Gratuit' : '100% Free APK'}</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={14} /> {isFr ? 'Sans Publicité' : 'No Ads'}</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
