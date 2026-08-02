import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe, Share2, Users, Play, MessageSquare, Send, Instagram, Video, 
  Mail, Phone, MapPin, Clock, ShieldCheck, CheckCircle2, ArrowRight, FileText
} from 'lucide-react';
import { getFooterConfig, FooterConfig, DEFAULT_FOOTER_CONFIG } from '../services/footerService';
import { toast } from 'react-hot-toast';

interface DynamicFooterProps {
  overrideConfig?: FooterConfig;
  className?: string;
  theme?: 'dark' | 'light';
}

export const DynamicFooter: React.FC<DynamicFooterProps> = ({ 
  overrideConfig, 
  className = '',
  theme = 'dark'
}) => {
  const [config, setConfig] = useState<FooterConfig>(overrideConfig || DEFAULT_FOOTER_CONFIG);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (overrideConfig) {
      setConfig(overrideConfig);
    } else {
      getFooterConfig().then(data => setConfig(data));
    }
  }, [overrideConfig]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setSubscribing(true);
    setTimeout(() => {
      setSubscribing(false);
      setNewsletterEmail('');
      toast.success('Thank you! You are now subscribed to Edulpha updates.');
    }, 600);
  };

  const getSocialIcon = (iconName: string, platformName: string) => {
    switch (iconName) {
      case 'Globe': return <Globe size={16} />;
      case 'Instagram': return <Instagram size={16} />;
      case 'Share2': return <Share2 size={16} />;
      case 'Users': return <Users size={16} />;
      case 'Video': return <Video size={16} />;
      case 'Play': return <Play size={16} />;
      case 'MessageSquare': return <MessageSquare size={16} />;
      case 'Send': return <Send size={16} />;
      default: return <Globe size={16} />;
    }
  };

  const isLight = theme === 'light';

  const sortedQuickLinks = [...(config.quickLinks || [])].filter(l => l.enabled).sort((a, b) => a.order - b.order);
  const sortedLegalDocs = [...(config.legalDocuments || [])].filter(l => l.enabled).sort((a, b) => a.order - b.order);
  const sortedResources = [...(config.resources || [])].filter(l => l.enabled).sort((a, b) => a.order - b.order);
  const sortedSocial = [...(config.socialLinks || [])].filter(l => l.enabled).sort((a, b) => a.order - b.order);

  return (
    <footer className={`${isLight ? 'bg-slate-50 text-slate-900 border-t border-slate-200' : 'bg-slate-950 text-white border-t border-slate-800'} py-16 px-6 relative overflow-hidden ${className}`}>
      
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Newsletter Banner */}
        {config.newsletter?.enabled && (
          <div className={`p-8 md:p-10 rounded-3xl ${isLight ? 'bg-gradient-to-r from-indigo-900 to-slate-900 text-white' : 'bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/20'} shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6`}>
            <div className="space-y-2 max-w-2xl text-center lg:text-left">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center justify-center lg:justify-start gap-2">
                <span>{config.newsletter.heading}</span>
              </h3>
              <p className="text-sm text-indigo-200/80 font-medium">
                {config.newsletter.description}
              </p>
            </div>
            
            <form onSubmit={handleNewsletterSubmit} className="w-full lg:w-auto flex flex-col sm:flex-row gap-3 min-w-[320px]">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder={config.newsletter.placeholderText || 'Enter your email address...'}
                className="px-5 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-indigo-200 text-sm font-medium focus:bg-white/20 outline-none w-full"
                required
              />
              <button
                type="submit"
                disabled={subscribing}
                className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg hover:shadow-amber-500/20 transition-all shrink-0 flex items-center justify-center gap-2"
              >
                <span>{subscribing ? 'Subscribing...' : (config.newsletter.buttonText || 'Subscribe')}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        )}

        {/* 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Column 1: Brand Information & Social Links */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-3">
              <img 
                src={config.brand.logoUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80"} 
                alt={`${config.brand.name} Logo`} 
                className="h-9 w-auto rounded-lg object-contain"
              />
              <span className={`text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {config.brand.name}
              </span>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'} font-medium leading-relaxed`}>
              {config.brand.description}
            </p>
            {config.brand.slogan && (
              <p className="text-[11px] font-bold text-indigo-400 italic">
                "{config.brand.slogan}"
              </p>
            )}

            {/* Social Media Links */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              {sortedSocial.map((item) => (
                <a 
                  key={item.id}
                  href={item.url}
                  target="_blank" 
                  rel="noreferrer" 
                  className={`p-2.5 ${isLight ? 'bg-slate-200 text-slate-700 hover:bg-indigo-600 hover:text-white' : 'bg-slate-900 text-slate-400 hover:bg-indigo-600 hover:text-white'} rounded-xl transition-all shadow-sm`}
                  title={item.platform}
                >
                  {getSocialIcon(item.iconName, item.platform)}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick / Platform Links */}
          <div className="space-y-3">
            <h4 className="font-black text-xs text-indigo-400 uppercase tracking-widest">Platform Navigation</h4>
            <ul className={`space-y-2 text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {sortedQuickLinks.map((link) => (
                <li key={link.id}>
                  {link.url.startsWith('/') ? (
                    <Link to={link.url} className={`hover:${isLight ? 'text-indigo-600' : 'text-white'} transition flex items-center gap-1.5`}>
                      <span>{link.label}</span>
                    </Link>
                  ) : (
                    <a href={link.url} className={`hover:${isLight ? 'text-indigo-600' : 'text-white'} transition flex items-center gap-1.5`}>
                      <span>{link.label}</span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal Documents */}
          <div className="space-y-3">
            <h4 className="font-black text-xs text-indigo-400 uppercase tracking-widest">Legal & Governance</h4>
            <ul className={`space-y-2 text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {sortedLegalDocs.map((docItem) => (
                <li key={docItem.id}>
                  {docItem.url.startsWith('/') ? (
                    <Link to={docItem.url} className={`hover:${isLight ? 'text-indigo-600' : 'text-white'} transition`}>
                      {docItem.label}
                    </Link>
                  ) : (
                    <a href={docItem.url} className={`hover:${isLight ? 'text-indigo-600' : 'text-white'} transition`}>
                      {docItem.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Resources */}
          <div className="space-y-3">
            <h4 className="font-black text-xs text-indigo-400 uppercase tracking-widest">Resources & Manuals</h4>
            <ul className={`space-y-2 text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {sortedResources.map((res) => (
                <li key={res.id}>
                  {res.url.startsWith('/') ? (
                    <Link to={res.url} className={`hover:${isLight ? 'text-indigo-600' : 'text-emerald-400'} transition flex items-center gap-1.5`}>
                      <FileText size={13} className="shrink-0 text-indigo-400" />
                      <span>{res.label}</span>
                    </Link>
                  ) : (
                    <a href={res.url} className={`hover:${isLight ? 'text-indigo-600' : 'text-white'} transition flex items-center gap-1.5`}>
                      <span>{res.label}</span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Contact Information */}
          <div className="space-y-3">
            <h4 className="font-black text-xs text-indigo-400 uppercase tracking-widest">Contact & Offices</h4>
            <div className={`space-y-3 text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {config.contactInfo?.email && (
                <div className="flex items-start gap-2.5">
                  <Mail size={15} className="text-indigo-400 shrink-0 mt-0.5" />
                  <span>
                    {config.contactInfo.email}
                    {config.contactInfo.secondaryEmail && <><br />{config.contactInfo.secondaryEmail}</>}
                  </span>
                </div>
              )}
              {config.contactInfo?.phone && (
                <div className="flex items-start gap-2.5">
                  <Phone size={15} className="text-indigo-400 shrink-0 mt-0.5" />
                  <span>
                    {config.contactInfo.phone}
                    {config.contactInfo.secondaryPhone && <><br />{config.contactInfo.secondaryPhone}</>}
                  </span>
                </div>
              )}
              {config.contactInfo?.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin size={15} className="text-indigo-400 shrink-0 mt-0.5" />
                  <span>{config.contactInfo.address}</span>
                </div>
              )}
              {config.contactInfo?.businessHours && (
                <div className="flex items-start gap-2.5">
                  <Clock size={15} className="text-indigo-400 shrink-0 mt-0.5" />
                  <span>{config.contactInfo.businessHours}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Rights & Badges */}
        <div className={`pt-8 ${isLight ? 'border-t border-slate-200 text-slate-500' : 'border-t border-slate-900 text-slate-400'} flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold`}>
          <div>{config.brand.copyright}</div>
          <div className="flex flex-wrap items-center gap-6">
            {config.brand.showEncryptedBadge && (
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-400" /> AES-256 Encrypted Platform
              </span>
            )}
            {config.brand.showBilingualBadge && (
              <span className="flex items-center gap-1.5">
                <Globe size={16} className="text-indigo-400" /> Bilingual Support (EN/FR)
              </span>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
};
