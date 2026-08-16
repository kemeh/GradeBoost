import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, Sparkles, Tag, ShieldCheck, Zap, Star } from 'lucide-react';
import { Button, Card, Badge, cn } from '../ui';
import { SubscriptionPlan } from '../../types';
import { getSubscriptionPlans } from '../../services/paymentService';
import { useLanguage } from '../../contexts/LanguageContext';

export default function LandingPricingSection() {
  const { language } = useLanguage();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const publicPlans = await getSubscriptionPlans(false);
      setPlans(publicPlans);
    } catch (err) {
      console.error('Error fetching landing page pricing plans:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <Tag size={14} className="text-emerald-600" />
            {language === 'fr' ? 'Tarification Transparente' : 'Transparent & Affordable Pricing'}
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            {language === 'fr' 
              ? 'Choisissez le Pass qui Correspond à Vos Ambitions' 
              : 'Invest in Your Academic Excellence'}
          </h2>
          <p className="text-slate-500 font-medium text-sm sm:text-base md:text-lg">
            {language === 'fr'
              ? 'Accédez à toutes les épreuves, examens blancs, corrections détaillées et au tuteur IA 24/7.'
              : 'Unlock complete past paper solutions, full mock exams, step-by-step answers, and unlimited AI tutoring.'}
          </p>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-slate-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          /* Empty / No Plans Placeholder */
          <Card className="max-w-2xl mx-auto p-6 sm:p-12 text-center space-y-4 border border-dashed border-slate-300 rounded-3xl shadow-xs bg-slate-50/50">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mx-auto">
              <Sparkles size={28} />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              {language === 'fr' ? 'Tarification Bientôt Disponible' : 'Pricing Will Be Available Soon'}
            </h3>
            <p className="text-slate-600 font-medium text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
              {language === 'fr'
                ? 'Nos formules d\'abonnement sont en cours de mise à jour. Veuillez revenir très bientôt ou contacter notre équipe d\'assistance.'
                : 'Our payment plans are currently being updated by the administration. Check back shortly or contact our support team.'}
            </p>
            <div className="pt-2">
              <Link to="/auth">
                <Button className="rounded-2xl font-bold px-6 py-2.5 text-xs sm:text-sm">
                  {language === 'fr' ? 'Créer un Compte Gratuit' : 'Create Free Student Account'}
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          /* Dynamic Pricing Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            {plans.map((plan) => {
              const isRecommended = Boolean(plan.isRecommended || plan.isDefault);
              const featuresList = language === 'fr' && plan.featuresFr?.length ? plan.featuresFr : plan.features;
              const planTitle = language === 'fr' && plan.nameFr ? plan.nameFr : plan.name;
              const planDesc = language === 'fr' && plan.descriptionFr ? plan.descriptionFr : plan.description;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="flex flex-col"
                >
                  <Card
                    className={cn(
                      'p-5 sm:p-8 border rounded-3xl sm:rounded-[2.5rem] flex flex-col justify-between h-full transition-all relative overflow-hidden group',
                      isRecommended
                        ? 'border-indigo-600 shadow-2xl ring-2 ring-indigo-500/20 bg-gradient-to-b from-indigo-50/40 via-white to-white md:-translate-y-2'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xl'
                    )}
                  >
                    {/* Active / Recommended Badge */}
                    {isRecommended && (
                      <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-bl-2xl shadow-sm flex items-center gap-1">
                        <Star size={12} className="fill-white" />
                        {language === 'fr' ? 'Formule Recommandée' : 'Most Popular Plan'}
                      </div>
                    )}

                    <div className="space-y-6">
                      {/* Header & Title */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black text-slate-900">{planTitle}</h3>
                          {plan.badge && (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-bold text-[10px]">
                              {plan.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          {planDesc}
                        </p>
                      </div>

                      {/* Price Tag */}
                      <div className="py-4 border-y border-slate-100 space-y-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                            {plan.price === 0 ? (language === 'fr' ? 'Gratuit' : 'Free') : plan.price.toLocaleString()}
                          </span>
                          {plan.price > 0 && (
                            <span className="text-sm font-bold text-slate-500 uppercase">
                              {plan.currency || 'XAF'} / {plan.billingCycle}
                            </span>
                          )}
                        </div>
                        {plan.duration && (
                          <p className="text-[11px] font-bold text-indigo-600">
                            {language === 'fr' ? `Accès pour ${plan.duration}` : `Valid for ${plan.duration}`}
                          </p>
                        )}
                      </div>

                      {/* Included Features */}
                      <div className="space-y-3">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                          {language === 'fr' ? 'Ce qui est inclus :' : 'What\'s included:'}
                        </span>
                        <ul className="space-y-2.5">
                          {featuresList?.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-xs text-slate-700 font-medium">
                              <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                                <Check size={12} strokeWidth={3} />
                              </div>
                              <span className="leading-snug">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-8">
                      <Link to="/payment">
                        <Button
                          size="lg"
                          className={cn(
                            'w-full rounded-2xl font-black text-sm py-6 shadow-md transition-all',
                            isRecommended
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          )}
                        >
                          {language === 'fr' ? 'Sélectionner ce Pass' : 'Get Started Now'}
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
