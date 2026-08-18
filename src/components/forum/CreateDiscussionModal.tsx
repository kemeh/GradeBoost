import React, { useState } from 'react';
import { X, Sparkles, Code, FileText, Upload, Plus, Tag, HelpCircle, MessageSquare, BookOpen, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ForumCurriculum, ForumDiscussionType, ForumDiscussion, ForumAttachment } from '../../types';
import { createDiscussion } from '../../services/forumService';
import { uploadFilePipeline } from '../../utils/uploadPipeline';
import toast from 'react-hot-toast';

interface CreateDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialCurriculum?: ForumCurriculum;
}

export default function CreateDiscussionModal({
  isOpen,
  onClose,
  onSuccess,
  initialCurriculum = 'English'
}: CreateDiscussionModalProps) {
  const { user, isTeacher, isAdmin } = useAuth();
  const { language } = useLanguage();
  const isFr = language === 'fr';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [curriculum, setCurriculum] = useState<ForumCurriculum>(initialCurriculum);
  const [educationLevel, setEducationLevel] = useState(initialCurriculum === 'French' ? 'Terminale' : 'Advanced Level');
  const [department, setDepartment] = useState('Science & Tech');
  const [subject, setSubject] = useState(initialCurriculum === 'French' ? 'Mathématiques' : 'Computer Science');
  const [paper, setPaper] = useState('Paper 2');
  const [topic, setTopic] = useState('');
  const [type, setType] = useState<ForumDiscussionType>('question');
  const [postLanguage, setPostLanguage] = useState<'en' | 'fr'>(isFr ? 'fr' : 'en');

  // Tags state
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Revision']);

  // Code Snippet state
  const [showCodeBuilder, setShowCodeBuilder] = useState(false);
  const [codeLang, setCodeLang] = useState('python');
  const [codeBody, setCodeBody] = useState('');

  // Math Formula state
  const [showMathBuilder, setShowMathBuilder] = useState(false);
  const [mathFormula, setMathFormula] = useState('');

  // Attachments state
  const [attachments, setAttachments] = useState<ForumAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const formatted = tagInput.trim().replace(/^#/, '');
    if (!tags.includes(formatted) && tags.length < 5) {
      setTags([...tags, formatted]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter(tag => tag !== t));
  };

  const handleAddSampleMath = (snippet: string) => {
    setMathFormula(prev => prev ? `${prev} ${snippet}` : snippet);
  };

  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const fileType = file.name.endsWith('.pdf') ? 'pdf' 
      : file.name.endsWith('.png') || file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') || file.name.endsWith('.webp') ? 'image'
      : file.name.endsWith('.doc') || file.name.endsWith('.docx') ? 'doc'
      : 'code';

    setUploadingAttachment(true);
    const toastId = toast.loading(isFr ? 'Téléversement de la pièce jointe...' : 'Uploading attachment...');

    try {
      const uploadResult = await uploadFilePipeline(file, {
        folder: 'edulpha/forum_attachments',
        maxSizeMB: 25
      });

      const newAttachment: ForumAttachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        url: uploadResult.url,
        type: fileType,
        size: uploadResult.fileSize
      };

      setAttachments(prev => [...prev, newAttachment]);
      toast.success(isFr ? 'Fichier joint avec succès!' : 'Attachment added!', { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Upload failed', { id: toastId });
    } finally {
      setUploadingAttachment(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error(isFr ? 'Veuillez remplir le titre et le contenu.' : 'Please enter title and content.');
      return;
    }

    if (!user) {
      toast.error(isFr ? 'Vous devez être connecté.' : 'You must be logged in.');
      return;
    }

    setIsSubmitting(true);
    try {
      const userRole = isAdmin ? 'admin' : isTeacher ? 'teacher' : 'student';

      await createDiscussion({
        title: title.trim(),
        content: content.trim(),
        curriculum,
        educationLevel,
        department,
        subject,
        paper: paper || undefined,
        topic: topic.trim() || undefined,
        type,
        tags,
        language: postLanguage,
        authorId: user.uid,
        authorName: user.name || user.email?.split('@')[0] || 'Student',
        authorRole: userRole,
        authorAvatar: user.photoURL || undefined,
        codeSnippet: showCodeBuilder && codeBody.trim() ? { language: codeLang, code: codeBody } : undefined,
        mathFormula: showMathBuilder && mathFormula.trim() ? mathFormula : undefined,
        attachments: attachments.length > 0 ? attachments : undefined
      });

      toast.success(isFr ? 'Discussion publiée avec succès !' : 'Discussion posted successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating discussion:', err);
      toast.error(isFr ? 'Échec de la création de la discussion.' : 'Failed to post discussion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
              <MessageSquare size={22} className="text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">
                {isFr ? 'Créer une Nouvelle Discussion Académique' : 'Create New Academic Discussion'}
              </h2>
              <p className="text-xs text-emerald-100/90 font-medium">
                {isFr ? 'Posez une question, partagez vos révisions ou collaborez avec la communauté.' : 'Ask questions, share revision guides, or collaborate with peers & teachers.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Post Type & Language Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {isFr ? 'Type de Publication' : 'Post Category / Type'}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ForumDiscussionType)}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="question">❓ {isFr ? 'Question Académique' : 'Academic Question'}</option>
                <option value="discussion">💬 {isFr ? 'Discussion Générale' : 'General Discussion'}</option>
                <option value="revision_tips">💡 {isFr ? 'Conseils de Révision' : 'Revision Tips & Guide'}</option>
                <option value="assignment_help">📝 {isFr ? 'Aide Devoir / DM' : 'Assignment Help'}</option>
                <option value="programming_help">💻 {isFr ? 'Aide Programmation / Code' : 'Programming Help'}</option>
                <option value="exam_prep">🎯 {isFr ? 'Préparation aux Examens' : 'Exam Preparation'}</option>
                { (isTeacher || isAdmin) && (
                  <>
                    <option value="teacher_post">⭐ {isFr ? 'Publication Enseignant Vérifiée' : 'Verified Teacher Guide'}</option>
                    <option value="announcement">📢 {isFr ? 'Annonce Officielle' : 'Official Announcement'}</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {isFr ? 'Programme Éducatif' : 'Curriculum & Subsystem'}
              </label>
              <select
                value={curriculum}
                onChange={(e) => {
                  const val = e.target.value as ForumCurriculum;
                  setCurriculum(val);
                  if (val === 'French') {
                    setEducationLevel('Terminale');
                    setSubject('Mathématiques');
                  } else {
                    setEducationLevel('Advanced Level');
                    setSubject('Computer Science');
                  }
                }}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="English">🇨🇲 Anglophone Subsystem (GCE O/A Level)</option>
                <option value="French">🇨🇲 Sous-système Francophone (Baccalauréat)</option>
                <option value="Both">🌍 General / Bilingual (Toutes filières)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {isFr ? 'Langue du Message' : 'Post Language'}
              </label>
              <select
                value={postLanguage}
                onChange={(e) => setPostLanguage(e.target.value as 'en' | 'fr')}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="en">🇬🇧 English</option>
                <option value="fr">🇫🇷 Français</option>
              </select>
            </div>
          </div>

          {/* Title Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {isFr ? 'Titre de la discussion *' : 'Discussion Title *'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isFr ? "Ex: Comment résoudre une équation différentielle du 2nd ordre ?" : "Ex: Explain Binary Search vs Linear Search Complexity in Python"}
              className="w-full text-sm font-semibold bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
            />
          </div>

          {/* Academic Scope (Level, Subject, Paper, Topic) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                {isFr ? 'Niveau / Classe' : 'Education Level'}
              </label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              >
                <option value="Advanced Level">Advanced Level (A-Level)</option>
                <option value="Ordinary Level">Ordinary Level (O-Level)</option>
                <option value="Terminale">Terminale (BAC)</option>
                <option value="Première">Première</option>
                <option value="Seconde">Seconde</option>
                <option value="Technical / TVET">Technical / TVET</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                {isFr ? 'Matière / Subject' : 'Subject'}
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="ICT">ICT & Information Tech</option>
                <option value="Mathématiques">Mathématiques / Pure Maths</option>
                <option value="Physics">Physics / Physique</option>
                <option value="Chemistry">Chemistry / Chimie</option>
                <option value="Economics">Economics / Économie</option>
                <option value="Biology">Biology / SVTEEHB</option>
                <option value="History">History / Histoire</option>
                <option value="Geography">Geography / Géographie</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                {isFr ? 'Épreuve / Paper' : 'Paper / Exam'}
              </label>
              <select
                value={paper}
                onChange={(e) => setPaper(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              >
                <option value="Paper 1">Paper 1 (MCQ)</option>
                <option value="Paper 2">Paper 2 (Theory & Code)</option>
                <option value="Paper 3">Paper 3 (Practical)</option>
                <option value="Épreuve Obligatoire">Épreuve Obligatoire</option>
                <option value="General">General / General Knowledge</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                {isFr ? 'Chapitre / Topic' : 'Topic / Chapter'}
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={isFr ? "Ex: Algorithmes" : "Ex: Data Structures"}
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              />
            </div>
          </div>

          {/* Main Description Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {isFr ? 'Explication Détaillée (Markdown supporté) *' : 'Detailed Content & Questions (Markdown supported) *'}
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCodeBuilder(!showCodeBuilder)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all flex items-center gap-1 ${
                    showCodeBuilder ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Code size={13} /> {isFr ? 'Bloc Code' : 'Add Code Snippet'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMathBuilder(!showMathBuilder)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all flex items-center gap-1 ${
                    showMathBuilder ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Sparkles size={13} /> {isFr ? 'Formule LaTeX' : 'Add Math Formula'}
                </button>
              </div>
            </div>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isFr ? "Décrivez votre problème ou votre question en détail. Vous pouvez utiliser du texte enrichi ou du Markdown..." : "Explain your problem, scenario, or revision guide clearly..."}
              className="w-full text-sm font-medium bg-white border border-slate-200 rounded-xl p-3.5 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
            />
          </div>

          {/* Code Snippet Builder (Collapsible) */}
          {showCodeBuilder && (
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Code size={14} /> {isFr ? 'Extrait de Code Source' : 'Syntax-Highlighted Code Block'}
                </span>
                <select
                  value={codeLang}
                  onChange={(e) => setCodeLang(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1 text-slate-200"
                >
                  <option value="python">Python</option>
                  <option value="c">C</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="javascript">JavaScript</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="sql">SQL</option>
                </select>
              </div>
              <textarea
                rows={4}
                value={codeBody}
                onChange={(e) => setCodeBody(e.target.value)}
                placeholder="// Paste code snippet here..."
                className="w-full font-mono text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-emerald-300 placeholder-slate-600 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
          )}

          {/* LaTeX Math Builder (Collapsible) */}
          {showMathBuilder && (
            <div className="p-4 bg-purple-950/40 rounded-2xl border border-purple-800/60 text-purple-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} /> {isFr ? 'Équation Mathématique (LaTeX)' : 'LaTeX Mathematical Formula'}
                </span>
                <span className="text-[10px] text-purple-300/70 font-mono">Rendered with MathJax</span>
              </div>
              
              <input
                type="text"
                value={mathFormula}
                onChange={(e) => setMathFormula(e.target.value)}
                placeholder="Ex: \frac{d^2y}{dx^2} + 4y = 0"
                className="w-full font-mono text-xs bg-purple-950 border border-purple-800 rounded-xl px-3 py-2 text-purple-200 placeholder-purple-400/50 focus:ring-1 focus:ring-purple-400 outline-none"
              />

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-purple-300 font-bold mr-1">Quick Templates:</span>
                <button type="button" onClick={() => handleAddSampleMath('\\frac{a}{b}')} className="px-2 py-0.5 text-[10px] bg-purple-900/60 hover:bg-purple-800 rounded-md font-mono text-purple-200 border border-purple-700">Fraction</button>
                <button type="button" onClick={() => handleAddSampleMath('\\sqrt{x}')} className="px-2 py-0.5 text-[10px] bg-purple-900/60 hover:bg-purple-800 rounded-md font-mono text-purple-200 border border-purple-700">Square Root</button>
                <button type="button" onClick={() => handleAddSampleMath('e^{-2x}')} className="px-2 py-0.5 text-[10px] bg-purple-900/60 hover:bg-purple-800 rounded-md font-mono text-purple-200 border border-purple-700">Exponential</button>
                <button type="button" onClick={() => handleAddSampleMath('\\int_{0}^{\\infty} f(x)dx')} className="px-2 py-0.5 text-[10px] bg-purple-900/60 hover:bg-purple-800 rounded-md font-mono text-purple-200 border border-purple-700">Integral</button>
                <button type="button" onClick={() => handleAddSampleMath('\\sum_{i=1}^{n}')} className="px-2 py-0.5 text-[10px] bg-purple-900/60 hover:bg-purple-800 rounded-md font-mono text-purple-200 border border-purple-700">Summation</button>
              </div>
            </div>
          )}

          {/* Tags & Attachments Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tags Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isFr ? 'Mots-clés / Tags (max 5)' : 'Topic Tags (max 5)'}
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                  placeholder={isFr ? "Ajouter un tag..." : "e.g., Algorithms"}
                  className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-lg text-xs font-bold">
                    <Tag size={12} /> #{t}
                    <button type="button" onClick={() => handleRemoveTag(t)} className="hover:text-emerald-900">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* File Attachments */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {isFr ? 'Pièces Jointes (Images, PDF, Doc)' : 'File Attachments (Images, PDF, Doc)'}
              </label>
              <label className="w-full flex items-center justify-center gap-2 p-2.5 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl cursor-pointer bg-slate-50 transition-all text-xs font-bold text-slate-600">
                <Upload size={14} className="text-slate-400" />
                <span>{isFr ? 'Téléverser un document' : 'Upload File Attachment'}</span>
                <input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt,.zip" />
              </label>
              {attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {attachments.map(att => (
                    <div key={att.id} className="flex items-center justify-between text-xs bg-slate-100 p-2 rounded-lg font-medium">
                      <span className="truncate max-w-[200px]">{att.name} ({att.size})</span>
                      <button type="button" onClick={() => setAttachments(attachments.filter(a => a.id !== att.id))} className="text-rose-500">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all"
            >
              {isFr ? 'Annuler' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploadingAttachment}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isFr ? 'Publication...' : 'Posting...'}
                </>
              ) : (
                <>
                  <MessageSquare size={16} />
                  {isFr ? 'Publier la Discussion' : 'Post Academic Discussion'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
