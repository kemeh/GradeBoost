import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  BookOpen, Wrench, Briefcase, Sparkles, FileText, Wrench as ToolIcon,
  LineChart, Calendar, Smartphone, WifiOff, Award, Trophy, ArrowRight,
  CheckCircle2, Heart, Zap, Users
} from 'lucide-react';
import { Badge, Button, Card } from './ui';
import { useLanguage } from '../contexts/LanguageContext';

export function WhyStudentsLoveEdulpha() {
  const { language } = useLanguage();
  const isFr = language === 'fr';

  const points = [
    {
      icon: BookOpen,
      title: isFr ? 'Enseignement Général & Technique' : 'Covers General & Technical Education',
      desc: isFr
        ? 'Plateforme unifiée conçue spécifiquement pour le sous-système GCE anglophone et le sous-système francophone / technique.'
        : 'Unified platform engineered specifically for both English GCE (Grammar) and Technical/Vocational sub-systems.',
      badge: isFr ? 'Double Sous-système' : 'Dual Sub-systems',
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
    },
    {
      icon: Briefcase,
      title: isFr ? 'Filières Commerciales & Pro' : 'Commercial & Vocational Learning',
      desc: isFr
        ? 'Modules dédiés aux futurs comptables, managers, techniciens, informaticiens et entrepreneurs.'
        : 'Dedicated modules for future accountants, managers, technicians, computer engineers, and entrepreneurs.',
      badge: isFr ? 'Prêt pour la Carrière' : 'Career Ready',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    {
      icon: Sparkles,
      title: isFr ? 'Assistant de Révision IA' : 'AI-Powered Study Assistant',
      desc: isFr
        ? 'Tuteur IA Edulpha disponible 24/7 pour des explications étape par étape en mathématiques, physique, comptabilité et formules.'
        : 'Instant 24/7 Edulpha AI tutor explaining step-by-step solutions for mathematics, physics, accounting, and technical formulas.',
      badge: isFr ? 'Assistant IA Edulpha' : 'Edulpha AI Assistant',
      color: 'bg-amber-50 text-amber-600 border-amber-200'
    },
    {
      icon: FileText,
      title: isFr ? 'Bibliothèque d’Épreuves Officiel' : 'Exam Question Library',
      desc: isFr
        ? 'Annales et épreuves avec corrigés vérifiés du MINESEC et du Cameroon GCE Board.'
        : 'Past examination papers with verified MINESEC & Cameroon GCE Board solution guides and paper breakdowns.',
      badge: isFr ? 'Épreuves Officiel' : 'Official Past Papers',
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      icon: ToolIcon,
      title: isFr ? 'Ressources Pratiques & Ateliers' : 'Practical Learning Resources',
      desc: isFr
        ? 'Schémas électriques, règles de sécurité en atelier, dessin technique et exercices de comptabilité.'
        : 'Circuit schematics, workshop safety rules, technical drawing exercises, and commercial ledger calculations.',
      badge: isFr ? 'Pratique & Ateliers' : 'Hands-on Practice',
      color: 'bg-purple-50 text-purple-600 border-purple-200'
    },
    {
      icon: LineChart,
      title: isFr ? 'Suivi de Progrès & Stats' : 'Progress Tracking & Analytics',
      desc: isFr
        ? 'Tableau de bord en temps réel identifiant vos lacunes, votre progression et la prédiction de vos notes.'
        : 'Real-time mastery dashboard pinpointing exact weak topics, revision progress, and predicted examination grades.',
      badge: isFr ? 'Stats Intelligentes' : 'Smart Metrics',
      color: 'bg-teal-50 text-teal-600 border-teal-200'
    },
    {
      icon: Calendar,
      title: isFr ? 'Planning de Révision Sur Mesure' : 'Personalized Study Plans',
      desc: isFr
        ? 'Emplois du temps personnalisés générés selon la date de votre examen pour garantir une révision complète.'
        : 'Custom study schedules generated around your target exam date, ensuring complete coverage before exam day.',
      badge: isFr ? 'Planning Personnalisé' : 'Tailored Schedule',
      color: 'bg-rose-50 text-rose-600 border-rose-200'
    },
    {
      icon: Smartphone,
      title: isFr ? 'Révision Mobile Partout' : 'Mobile Learning Anywhere',
      desc: isFr
        ? 'Expérience fluide optimisée pour smartphones, tablettes et ordinateurs avec un design adaptatif.'
        : 'Seamless study experience optimized across smartphones, tablets, and desktop computers with responsive layouts.',
      badge: isFr ? 'Multi-Appareils' : 'Multi-Device',
      color: 'bg-cyan-50 text-cyan-600 border-cyan-200'
    },
    {
      icon: WifiOff,
      title: isFr ? 'Mode 100% Hors-Ligne' : '100% Offline Support',
      desc: isFr
        ? 'Application Android APK dédiée permettant d’étudier les cours et épreuves sans connexion Internet.'
        : 'Dedicated Android APK allowing students to study notes, practice questions, and timed mocks with zero internet data.',
      badge: isFr ? 'APK Hors-Ligne' : 'Offline APK',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      icon: Award,
      title: isFr ? 'Examens Blancs Chronométrés' : 'Mock Examinations & Timers',
      desc: isFr
        ? 'Simulez les conditions réelles d’examen avec des épreuves 1 et 2 chronométrées et bilans instantanés.'
        : 'Simulate official examination conditions with timed paper 1 & paper 2 drills and automated score summaries.',
      badge: isFr ? 'Conditions Réelles' : 'Exam Conditions',
      color: 'bg-violet-50 text-violet-600 border-violet-200'
    },
    {
      icon: Trophy,
      title: isFr ? 'Classements & Badges' : 'Leaderboards & Achievements',
      desc: isFr
        ? 'Restez motivé avec les séries d’étude quotidiennes, duels entre camarades et badges à débloquer.'
        : 'Stay motivated with daily study streaks, peer battle duels, school rankings, and unlockable achievement badges.',
      badge: isFr ? 'Révision Ludique' : 'Gamified Revision',
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    }
  ];

  return (
    <section id="why-edulpha" className="py-24 px-6 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Section Title */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="primary" className="bg-rose-50 text-rose-700 border-rose-200">
            <Heart size={14} className="inline mr-1 text-rose-500 fill-rose-500" />
            {isFr ? 'Choix des Élèves & Enseignants' : 'Student & Educator Choice'}
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            {isFr ? (
              <>
                Pourquoi les Élèves Aiment <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Edulpha</span>
              </>
            ) : (
              <>
                Why Students Love <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Edulpha</span>
              </>
            )}
          </h2>
          <p className="text-slate-600 font-medium text-base sm:text-lg leading-relaxed">
            {isFr
              ? 'Des élèves de l’enseignement général aux spécialistes de l’enseignement technique et commercial, Edulpha simplifie les révisions et développe la confiance académique.'
              : 'From General Grammar students to Technical and Commercial specialists, Edulpha is built to simplify exam prep, boost pass rates, and foster academic confidence.'}
          </p>
        </div>

        {/* 11 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {points.map((pt, idx) => {
            const IconComp = pt.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: (idx % 3) * 0.1 }}
              >
                <Card className="p-8 h-full bg-white border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${pt.color} group-hover:scale-110 transition-transform duration-300`}>
                        <IconComp size={26} />
                      </div>
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {pt.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                      {pt.title}
                    </h3>

                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      {pt.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-indigo-600 gap-1 opacity-90 group-hover:opacity-100">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span>{isFr ? 'Inclus dans tous les forfaits' : 'Included in All Plans'}</span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Call to Action */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-md flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600 flex items-center justify-center lg:justify-start gap-1">
              <Zap size={16} className="text-amber-500 fill-amber-500" />
              {isFr ? 'Garantie de Préparation Complète aux Examens' : 'Complete Exam Preparedness Guaranteed'}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isFr
                ? 'Prêt à réussir vos examens Généraux, Techniques ou Commerciaux ?'
                : 'Ready to Master Your General, Technical, or Commercial Exams?'}
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              {isFr
                ? 'Rejoignez les élèves du Cameroun qui réussissent le GCE, le BEPC, le Probatoire, le Baccalauréat et le TVEE avec Edulpha.'
                : 'Join students across Cameroon passing their GCE Ordinary & Advanced levels, TVEE Intermediate/Advanced exams, and Baccalauréat with Edulpha.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <Link to="/features">
              <Button size="lg" variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold px-6 py-4 rounded-xl flex items-center gap-2">
                <span>{isFr ? 'Découvrir nos fonctionnalités' : 'Learn More Features'}</span>
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-4 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2">
                <span>{isFr ? 'Commencer les révisions gratuites' : 'Start Free Revision'}</span>
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
