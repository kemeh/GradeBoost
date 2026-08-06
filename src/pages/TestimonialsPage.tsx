import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, MessageSquare, Video, Filter, Plus, CheckCircle, ShieldCheck, 
  Search, Globe, School, GraduationCap, ThumbsUp, X, Play, RefreshCw, Send, Award
} from 'lucide-react';
import Navbar from '../components/navigation/Navbar';
import { DynamicFooter } from '../components/DynamicFooter';
import { SEO } from '../components/SEO';
import { Testimonial } from '../types/testimonial';
import { TestimonialService } from '../services/testimonialService';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button, Card, Badge, cn } from '../components/ui';
import toast from 'react-hot-toast';

export default function TestimonialsPage() {
  const { user, isAdmin } = useAuth();
  const { language } = useLanguage();
  
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<number | 'all'>('all');
  const [onlyVideos, setOnlyVideos] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'approved' | 'pending' | 'all'>('approved');

  // Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  // Form State
  const [formAuthorName, setFormAuthorName] = useState(user?.displayName || '');
  const [formEmail, setFormEmail] = useState(user?.email || '');
  const [formSchool, setFormSchool] = useState('');
  const [formSubsystem, setFormSubsystem] = useState('General');
  const [formLevel, setFormLevel] = useState('Advanced Level');
  const [formCountry, setFormCountry] = useState('Cameroon');
  const [formRegion, setFormRegion] = useState('Centre');
  const [formSubject, setFormSubject] = useState('');
  const [formQuoteEn, setFormQuoteEn] = useState('');
  const [formQuoteFr, setFormQuoteFr] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formAvatarUrl, setFormAvatarUrl] = useState(user?.photoURL || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await TestimonialService.getTestimonials(false);
      setTestimonials(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAuthorName.trim() || (!formQuoteEn.trim() && !formQuoteFr.trim())) {
      toast.error('Please enter your name and testimonial experience');
      return;
    }

    setIsSubmitting(true);
    try {
      await TestimonialService.submitStudentTestimonial({
        authorName: formAuthorName.trim(),
        roleEn: `${formLevel} Student`,
        roleFr: `Élève en ${formLevel}`,
        schoolOrOrg: formSchool.trim() || 'Independent Student',
        subsystem: formSubsystem,
        level: formLevel,
        country: formCountry,
        region: formRegion,
        subject: formSubject.trim() || 'General Revision',
        quoteEn: formQuoteEn.trim() || formQuoteFr.trim(),
        quoteFr: formQuoteFr.trim() || formQuoteEn.trim(),
        rating: formRating,
        avatarUrl: formAvatarUrl.trim() || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formAuthorName)}`,
        videoUrl: formVideoUrl.trim() || undefined,
        authorEmail: formEmail.trim(),
        isFeatured: false
      });

      toast.success(isAdmin ? 'Testimonial submitted!' : 'Testimonial submitted for admin review! Thank you.');
      setIsSubmitModalOpen(false);
      // Reset form
      setFormQuoteEn('');
      setFormQuoteFr('');
      setFormVideoUrl('');
      loadData();
    } catch (err) {
      toast.error('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModerate = async (id: string, status: 'approved' | 'pending' | 'rejected', isFeatured?: boolean) => {
    try {
      await TestimonialService.updateApprovalStatus(id, status, isFeatured);
      toast.success(`Testimonial status updated to ${status}`);
      loadData();
    } catch (e) {
      toast.error('Moderation update failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await TestimonialService.deleteTestimonial(id);
      toast.success('Testimonial removed');
      loadData();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const filteredTestimonials = testimonials.filter(t => {
    if (!isAdmin && activeTab === 'approved' && t.approvalStatus !== 'approved' && t.displayStatus !== 'active') {
      return false;
    }
    if (isAdmin && activeTab === 'approved' && t.approvalStatus !== 'approved') return false;
    if (isAdmin && activeTab === 'pending' && t.approvalStatus !== 'pending') return false;

    if (onlyVideos && !t.videoUrl) return false;
    if (selectedRating !== 'all' && t.rating !== selectedRating) return false;
    if (selectedSubsystem !== 'all' && t.subsystem !== selectedSubsystem) return false;
    if (selectedCountry !== 'all' && t.country !== selectedCountry) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.authorName.toLowerCase().includes(q);
      const matchSchool = t.schoolOrOrg.toLowerCase().includes(q);
      const matchQuote = (t.quoteEn + ' ' + t.quoteFr).toLowerCase().includes(q);
      const matchSubject = (t.subject || '').toLowerCase().includes(q);
      return matchName || matchSchool || matchQuote || matchSubject;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      <SEO 
        title="Student Testimonials & Reviews | Edulpha"
        description="Read authentic reviews, video testimonials, and success stories from GCE, TVEE, Probatoire and Baccalauréat students across Africa."
      />
      <Navbar />

      {/* Hero Header */}
      <section className="pt-28 pb-16 px-4 sm:px-6 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto text-center space-y-6 relative z-10">
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 px-3 py-1 text-xs uppercase font-black tracking-widest">
            AUTHENTIC STUDENT VOICES
          </Badge>
          
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight max-w-3xl mx-auto leading-tight">
            Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400">100,000+ Students</span> & Educators
          </h1>
          
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-medium">
            Discover how GradeBoost60/Edulpha is helping candidates achieve top grades in GCE O/A Levels, Baccalauréat, Probatoire, and TVEE technical sub-systems across Cameroon and Africa.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Button 
              onClick={() => setIsSubmitModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <Plus size={18} />
              <span>{language === 'fr' ? 'Soumettre votre témoignage' : 'Share Your Experience'}</span>
            </Button>
            
            <a 
              href="#testimonials-grid"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold border border-slate-700 transition-colors flex items-center gap-2 text-sm"
            >
              <Star size={16} className="text-amber-400 fill-amber-400" />
              <span>Read Student Reviews</span>
            </a>
          </div>
        </div>
      </section>

      {/* Main Content & Filter Bar */}
      <section id="testimonials-grid" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        
        {/* Admin Tabs */}
        {isAdmin && (
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mr-2 flex items-center gap-1">
              <ShieldCheck size={16} /> Admin Moderation:
            </span>
            <button
              onClick={() => setActiveTab('approved')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                activeTab === 'approved' ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              )}
            >
              Approved ({testimonials.filter(t => t.approvalStatus === 'approved').length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
                activeTab === 'pending' ? "bg-amber-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              )}
            >
              Pending Moderation
              {testimonials.filter(t => t.approvalStatus === 'pending').length > 0 && (
                <span className="px-1.5 py-0.2 bg-red-500 text-white text-[10px] rounded-full font-black">
                  {testimonials.filter(t => t.approvalStatus === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                activeTab === 'all' ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              )}
            >
              All Records ({testimonials.length})
            </button>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            
            {/* Search */}
            <div className="relative col-span-1 sm:col-span-2 lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder={language === 'fr' ? 'Rechercher par école, nom, sujet...' : 'Search by school, student name, subject...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Subsystem Filter */}
            <div>
              <select
                value={selectedSubsystem}
                onChange={(e) => setSelectedSubsystem(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">{language === 'fr' ? 'Tous Sous-Systèmes' : 'All Sub-systems'}</option>
                <option value="General">General Education</option>
                <option value="Technical">Technical Specialty</option>
                <option value="Commercial">Commercial Education</option>
                <option value="TVEE">TVEE Board</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
                <option value="4">4 Stars ⭐⭐⭐⭐</option>
                <option value="3">3 Stars ⭐⭐⭐</option>
              </select>
            </div>

            {/* Videos Toggle */}
            <div className="flex items-center justify-center">
              <button
                onClick={() => setOnlyVideos(!onlyVideos)}
                className={cn(
                  "w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors",
                  onlyVideos ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                )}
              >
                <Video size={14} />
                <span>{onlyVideos ? 'Showing Videos Only' : 'Filter Video Reviews'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        {loading ? (
          <div className="text-center py-16 font-bold text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="animate-spin" size={20} />
            Loading student reviews...
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 p-8">
            <MessageSquare size={40} className="mx-auto text-slate-400" />
            <h3 className="text-lg font-bold">No testimonials match your filters</h3>
            <p className="text-xs text-slate-500">Try adjusting your search criteria or submit the first review for your school!</p>
            <Button onClick={() => setIsSubmitModalOpen(true)} className="bg-indigo-600 text-white font-bold text-xs mt-2">
              Submit Review
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTestimonials.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all hover:shadow-md relative overflow-hidden",
                  t.isFeatured ? "border-amber-400/50 dark:border-amber-500/30 ring-1 ring-amber-400/20" : "border-slate-200 dark:border-slate-800"
                )}
              >
                {t.isFeatured && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-[9px] uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                    Featured Review
                  </div>
                )}

                <div className="space-y-4">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={cn(
                          i < t.rating ? "text-amber-400 fill-amber-400" : "text-slate-300 dark:text-slate-700"
                        )}
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-500 ml-1">({t.rating}.0)</span>
                  </div>

                  {/* Quote */}
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed italic">
                    "{language === 'fr' ? (t.quoteFr || t.quoteEn) : (t.quoteEn || t.quoteFr)}"
                  </p>

                  {/* Video Thumbnail Button if present */}
                  {t.videoUrl && (
                    <button
                      onClick={() => setActiveVideoUrl(t.videoUrl!)}
                      className="w-full py-2.5 px-4 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800/60 rounded-xl flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-colors group"
                    >
                      <Play size={14} className="fill-indigo-600 dark:fill-indigo-400 group-hover:scale-110 transition-transform" />
                      <span>Watch Student Video Review</span>
                    </button>
                  )}
                </div>

                {/* Author Info */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-3 mt-4">
                  <img
                    src={t.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(t.authorName)}`}
                    alt={t.authorName}
                    className="w-11 h-11 rounded-full object-cover border-2 border-indigo-500/20 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {t.authorName}
                    </h4>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium truncate">
                      {language === 'fr' ? t.roleFr : t.roleEn}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                      <School size={12} />
                      {t.schoolOrOrg} • {t.country || 'Cameroon'}
                    </p>
                  </div>
                </div>

                {/* Admin Moderation Actions */}
                {isAdmin && (
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                    <span className={cn(
                      "font-black uppercase text-[10px] px-2 py-0.5 rounded-md",
                      t.approvalStatus === 'approved' ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" :
                      t.approvalStatus === 'rejected' ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    )}>
                      {t.approvalStatus}
                    </span>
                    <div className="flex items-center gap-1">
                      {t.approvalStatus !== 'approved' && (
                        <button
                          onClick={() => handleModerate(t.id, 'approved')}
                          className="px-2 py-1 bg-emerald-600 text-white rounded-md text-[10px] font-bold"
                        >
                          Approve
                        </button>
                      )}
                      {t.approvalStatus !== 'rejected' && (
                        <button
                          onClick={() => handleModerate(t.id, 'rejected')}
                          className="px-2 py-1 bg-amber-600 text-white rounded-md text-[10px] font-bold"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {activeVideoUrl && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden max-w-3xl w-full relative">
              <button
                onClick={() => setActiveVideoUrl(null)}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700"
              >
                <X size={20} />
              </button>
              <div className="aspect-video w-full">
                <iframe
                  src={activeVideoUrl}
                  title="Student Testimonial Video"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Submit Testimonial Modal */}
      <AnimatePresence>
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full my-8 relative shadow-2xl space-y-6"
            >
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="space-y-1">
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-black uppercase">
                  SHARE YOUR STORY
                </Badge>
                <h2 className="text-2xl font-black">Submit Your Edulpha Experience</h2>
                <p className="text-xs text-slate-500">Help inspire fellow candidates across Africa. Submissions are moderated before publishing.</p>
              </div>

              <form onSubmit={handleCreateTestimonial} className="space-y-4 text-sm">
                
                {/* Rating Picker */}
                <div>
                  <label className="block text-xs font-bold mb-1">Your Overall Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormRating(star)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          size={28}
                          className={cn(
                            star <= formRating ? "text-amber-400 fill-amber-400" : "text-slate-300 dark:text-slate-700"
                          )}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-500 ml-2">{formRating} Out of 5 Stars</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formAuthorName}
                      onChange={(e) => setFormAuthorName(e.target.value)}
                      placeholder="e.g. Ngu Benedict"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">School / Institution *</label>
                    <input
                      type="text"
                      required
                      value={formSchool}
                      onChange={(e) => setFormSchool(e.target.value)}
                      placeholder="e.g. GBHS Bamenda"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">Subsystem</label>
                    <select
                      value={formSubsystem}
                      onChange={(e) => setFormSubsystem(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="General">General Education</option>
                      <option value="Technical">Technical Specialty</option>
                      <option value="Commercial">Commercial</option>
                      <option value="TVEE">TVEE Board</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Level</label>
                    <select
                      value={formLevel}
                      onChange={(e) => setFormLevel(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Advanced Level">Advanced Level</option>
                      <option value="Ordinary Level">Ordinary Level</option>
                      <option value="Baccalauréat">Baccalauréat</option>
                      <option value="Probatoire">Probatoire</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Country</label>
                    <select
                      value={formCountry}
                      onChange={(e) => setFormCountry(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Cameroon">Cameroon</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Ivory Coast">Ivory Coast</option>
                      <option value="Kenya">Kenya</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Your Testimonial Experience (English) *</label>
                  <textarea
                    rows={3}
                    value={formQuoteEn}
                    onChange={(e) => setFormQuoteEn(e.target.value)}
                    placeholder="Describe how Edulpha helped you improve your scores, practice past papers, or understand difficult subjects..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Votre expérience en Français (Optionnel)</label>
                  <textarea
                    rows={2}
                    value={formQuoteFr}
                    onChange={(e) => setFormQuoteFr(e.target.value)}
                    placeholder="Partagez votre avis en français..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Video Review Embed URL (YouTube/Vimeo - Optional)</label>
                  <input
                    type="url"
                    value={formVideoUrl}
                    onChange={(e) => setFormVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/embed/..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2"
                  >
                    <Send size={14} />
                    <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <DynamicFooter />
    </div>
  );
}
