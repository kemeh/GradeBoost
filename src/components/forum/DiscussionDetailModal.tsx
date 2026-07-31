import React, { useState, useEffect } from 'react';
import { 
  X, Heart, Bookmark, Flag, Share2, MessageSquare, CheckCircle2, 
  Award, Pin, Lock, Send, Sparkles, Code, FileText, CornerDownRight, 
  Bot, Trash2, Edit3, Shield, UserCheck, Paperclip, Download, Eye, ThumbsUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ForumDiscussion, ForumReply } from '../../types';
import { 
  fetchDiscussionReplies, createReply, toggleLikeDiscussion, 
  toggleBookmarkDiscussion, markVerifiedOrAcceptedReply, 
  togglePinDiscussion, toggleLockDiscussion, reportContent 
} from '../../services/forumService';
import ForumAIDrawer from './ForumAIDrawer';
import toast from 'react-hot-toast';

interface DiscussionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  discussion: ForumDiscussion | null;
  onRefreshDiscussion?: () => void;
}

export default function DiscussionDetailModal({
  isOpen,
  onClose,
  discussion,
  onRefreshDiscussion
}: DiscussionDetailModalProps) {
  const { user, isTeacher, isAdmin } = useAuth();
  const { language } = useLanguage();
  const isFr = language === 'fr';

  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Parent reply state for nested replying
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  // Code & Math in Reply
  const [showReplyCode, setShowReplyCode] = useState(false);
  const [replyCodeLang, setReplyCodeLang] = useState('python');
  const [replyCodeText, setReplyCodeText] = useState('');

  // Local likes & bookmarks state
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // AI Drawer state
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);

  // Copy status
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (discussion) {
      setLikeCount(discussion.likeCount || 0);
      loadReplies();
    }
  }, [discussion]);

  const loadReplies = async () => {
    if (!discussion) return;
    setLoadingReplies(true);
    try {
      const data = await fetchDiscussionReplies(discussion.id);
      setReplies(data);
    } catch (err) {
      console.error('Error loading replies:', err);
    } finally {
      setLoadingReplies(false);
    }
  };

  if (!isOpen || !discussion) return null;

  const handleToggleLike = async () => {
    if (!user) {
      toast.error(isFr ? 'Connectez-vous pour aimer.' : 'Log in to like posts.');
      return;
    }
    const likedNow = await toggleLikeDiscussion(user.uid, discussion.id);
    setIsLiked(likedNow);
    setLikeCount(prev => likedNow ? prev + 1 : Math.max(0, prev - 1));
    toast.success(likedNow ? (isFr ? 'Aimé!' : 'Liked!') : (isFr ? 'J\'aime retiré' : 'Unliked'));
  };

  const handleToggleBookmark = async () => {
    if (!user) {
      toast.error(isFr ? 'Connectez-vous pour sauvegarder.' : 'Log in to bookmark.');
      return;
    }
    const bookmarkedNow = await toggleBookmarkDiscussion(user.uid, discussion.id);
    setIsBookmarked(bookmarkedNow);
    toast.success(bookmarkedNow ? (isFr ? 'Sauvegardé!' : 'Bookmarked!') : (isFr ? 'Retiré des signets' : 'Removed from bookmarks'));
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    if (!user) {
      toast.error(isFr ? 'Connectez-vous pour répondre.' : 'Log in to reply.');
      return;
    }
    if (discussion.isLocked) {
      toast.error(isFr ? 'Cette discussion est verrouillée.' : 'This discussion is locked.');
      return;
    }

    setIsSubmittingReply(true);
    try {
      const userRole = isAdmin ? 'admin' : isTeacher ? 'teacher' : 'student';

      await createReply({
        discussionId: discussion.id,
        parentId: replyingToId,
        content: replyText.trim(),
        authorId: user.uid,
        authorName: user.name || user.email?.split('@')[0] || 'Student',
        authorRole: userRole,
        authorAvatar: user.photoURL || undefined,
        codeSnippet: showReplyCode && replyCodeText.trim() ? { language: replyCodeLang, code: replyCodeText } : undefined
      });

      setReplyText('');
      setReplyingToId(null);
      setShowReplyCode(false);
      setReplyCodeText('');
      toast.success(isFr ? 'Réponse publiée!' : 'Reply posted!');
      loadReplies();
      if (onRefreshDiscussion) onRefreshDiscussion();
    } catch (err) {
      console.error('Error replying:', err);
      toast.error(isFr ? 'Échec de l\'envoi.' : 'Failed to post reply.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleVerifyReply = async (replyId: string, isAccepted: boolean) => {
    if (!isTeacher && !isAdmin) return;
    try {
      await markVerifiedOrAcceptedReply(replyId, discussion.id, isAccepted, true);
      toast.success(isFr ? 'Réponse vérifiée par l\'enseignant!' : 'Reply marked as verified answer!');
      loadReplies();
      if (onRefreshDiscussion) onRefreshDiscussion();
    } catch (err) {
      toast.error('Failed to verify answer');
    }
  };

  const handleTogglePin = async () => {
    if (!isTeacher && !isAdmin) return;
    const newPinned = !discussion.isPinned;
    await togglePinDiscussion(discussion.id, newPinned);
    toast.success(newPinned ? (isFr ? 'Discussion épinglée' : 'Discussion pinned') : (isFr ? 'Discussion désépinglée' : 'Discussion unpinned'));
    if (onRefreshDiscussion) onRefreshDiscussion();
  };

  const handleToggleLock = async () => {
    if (!isTeacher && !isAdmin) return;
    const newLocked = !discussion.isLocked;
    await toggleLockDiscussion(discussion.id, newLocked);
    toast.success(newLocked ? (isFr ? 'Discussion verrouillée' : 'Discussion locked') : (isFr ? 'Discussion déverrouillée' : 'Discussion unlocked'));
    if (onRefreshDiscussion) onRefreshDiscussion();
  };

  const handleReport = async () => {
    if (!user) return;
    const reason = prompt(isFr ? 'Motif du signalement :' : 'Reason for reporting content:');
    if (reason) {
      await reportContent({
        reporterId: user.uid,
        reporterName: user.name || user.email || 'User',
        targetType: 'discussion',
        targetId: discussion.id,
        targetTitle: discussion.title,
        reason
      });
      toast.success(isFr ? 'Signalement transmis aux modérateurs.' : 'Report submitted to moderators.');
    }
  };

  const handleCopyCode = (codeStr: string) => {
    navigator.clipboard.writeText(codeStr);
    setCopiedCode(true);
    toast.success(isFr ? 'Code copié!' : 'Code copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30">
              {discussion.subject}
            </span>
            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-semibold">
              {discussion.educationLevel}
            </span>
            {discussion.paper && (
              <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-semibold">
                {discussion.paper}
              </span>
            )}
            {discussion.isPinned && (
              <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold border border-amber-500/30 flex items-center gap-1">
                <Pin size={12} /> {isFr ? 'Épinglé' : 'Pinned'}
              </span>
            )}
            {discussion.isLocked && (
              <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 rounded-full text-xs font-bold border border-rose-500/30 flex items-center gap-1">
                <Lock size={12} /> {isFr ? 'Verrouillé' : 'Locked'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* GradeBoost AI Companion Quick Trigger */}
            <button
              onClick={() => setIsAIDrawerOpen(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <Sparkles size={14} className="animate-pulse" />
              <span>{isFr ? 'IA Aide Pédagogique' : 'GradeBoost AI Support'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {/* Main Discussion Post Card */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-5">
            {/* Author Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-black text-sm flex items-center justify-center shadow-md overflow-hidden">
                  {discussion.authorAvatar ? (
                    <img src={discussion.authorAvatar} alt={discussion.authorName} className="w-full h-full object-cover" />
                  ) : (
                    discussion.authorName.charAt(0)
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{discussion.authorName}</span>
                    {discussion.authorRole === 'teacher' && (
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-md flex items-center gap-1">
                        <Award size={12} /> Verified Teacher
                      </span>
                    )}
                    {discussion.authorRole === 'admin' && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded-md flex items-center gap-1">
                        <Shield size={12} /> Admin
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="uppercase tracking-wider">{discussion.language === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}</span>
                    {discussion.topic && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">{discussion.topic}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Teacher/Admin Control Buttons */}
              {(isTeacher || isAdmin) && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleTogglePin}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
                      discussion.isPinned ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                    title="Pin Discussion"
                  >
                    <Pin size={14} />
                  </button>
                  <button
                    onClick={handleToggleLock}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
                      discussion.isLocked ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                    title="Lock Discussion"
                  >
                    <Lock size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Title & Body */}
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-snug mb-3">
                {discussion.title}
              </h1>
              <div className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                {discussion.content}
              </div>
            </div>

            {/* Code Block if present */}
            {discussion.codeSnippet && (
              <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-lg">
                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="text-emerald-400 font-bold uppercase">{discussion.codeSnippet.language} Code Snippet</span>
                  <button
                    onClick={() => handleCopyCode(discussion.codeSnippet!.code)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-sans font-semibold transition-all"
                  >
                    {copiedCode ? (isFr ? 'Copié!' : 'Copied!') : (isFr ? 'Copier Code' : 'Copy Code')}
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto text-xs font-mono text-emerald-300 leading-relaxed">
                  <code>{discussion.codeSnippet.code}</code>
                </pre>
              </div>
            )}

            {/* LaTeX Math Formula if present */}
            {discussion.mathFormula && (
              <div className="p-4 bg-purple-50/80 rounded-2xl border border-purple-200/80 text-purple-950 space-y-1">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Mathematical Formula</span>
                <div className="font-mono text-sm font-semibold text-purple-900 bg-white p-3 rounded-xl border border-purple-200 shadow-sm overflow-x-auto">
                  ${discussion.mathFormula}$
                </div>
              </div>
            )}

            {/* Attachments if present */}
            {discussion.attachments && discussion.attachments.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                  <Paperclip size={14} /> {isFr ? 'Pièces jointes' : 'Attached Learning Resources'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {discussion.attachments.map(att => (
                    <a
                      key={att.id}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between transition-all"
                    >
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[200px]">{att.name}</span>
                      <Download size={14} className="text-emerald-600" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Tags Bar */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              {discussion.tags.map((t, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg">
                  #{t}
                </span>
              ))}
            </div>

            {/* Social Action Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleToggleLike}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    isLiked ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Heart size={16} className={isLiked ? 'fill-rose-600' : ''} />
                  <span>{likeCount}</span>
                </button>

                <button
                  onClick={handleToggleBookmark}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    isBookmarked ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Bookmark size={16} className={isBookmarked ? 'fill-amber-600' : ''} />
                  <span>{isFr ? 'Sauvegarder' : 'Bookmark'}</span>
                </button>

                <button
                  onClick={handleReport}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-rose-600 text-xs font-semibold transition-all"
                >
                  <Flag size={14} />
                  <span>{isFr ? 'Signaler' : 'Report'}</span>
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <MessageSquare size={14} /> {discussion.replyCount || 0} {isFr ? 'réponses' : 'replies'}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={14} /> {discussion.viewCount || 1} {isFr ? 'vues' : 'views'}
                </span>
              </div>
            </div>
          </div>

          {/* Discussion Replies Section */}
          <div className="space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center justify-between">
              <span>{isFr ? 'Réponses & Collaboration' : 'Replies & Teacher Answers'} ({replies.length})</span>
              {discussion.hasVerifiedAnswer && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1">
                  <CheckCircle2 size={14} /> {isFr ? 'Réponse Vérifiée' : 'Teacher Verified Answer'}
                </span>
              )}
            </h3>

            {loadingReplies ? (
              <div className="p-8 text-center text-slate-400 font-semibold text-xs">
                {isFr ? 'Chargement des réponses...' : 'Loading replies...'}
              </div>
            ) : replies.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                <MessageSquare size={32} className="mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-700">
                  {isFr ? 'Aucune réponse pour le moment. Soyez le premier à répondre !' : 'No replies yet. Be the first student or teacher to answer!'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`p-5 rounded-2xl border transition-all space-y-3 ${
                      reply.isAcceptedAnswer
                        ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20'
                        : reply.isTeacherVerified
                        ? 'bg-indigo-50/60 border-indigo-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    {/* Reply Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                          {reply.authorName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{reply.authorName}</span>
                            {reply.authorRole === 'teacher' && (
                              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-md flex items-center gap-0.5">
                                <Award size={10} /> Verified Teacher
                              </span>
                            )}
                            {reply.isAcceptedAnswer && (
                              <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-md flex items-center gap-0.5 shadow-sm">
                                <CheckCircle2 size={10} /> Best Answer
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Verify / Accept Action for Teacher/Admin */}
                      {(isTeacher || isAdmin) && !reply.isAcceptedAnswer && (
                        <button
                          onClick={() => handleVerifyReply(reply.id, true)}
                          className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all"
                        >
                          <CheckCircle2 size={12} /> {isFr ? 'Marquer Réponse Officielle' : 'Mark as Best Answer'}
                        </button>
                      )}
                    </div>

                    {/* Reply Body */}
                    <div className="text-xs text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
                      {reply.content}
                    </div>

                    {/* Reply Code Snippet */}
                    {reply.codeSnippet && (
                      <div className="rounded-xl bg-slate-950 p-3 text-emerald-300 font-mono text-xs overflow-x-auto">
                        <code>{reply.codeSnippet.code}</code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Reply Input Form */}
            {!discussion.isLocked ? (
              <form onSubmit={handleSendReply} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {isFr ? 'Votre Réponse Académique' : 'Your Academic Answer / Reply'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowReplyCode(!showReplyCode)}
                    className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <Code size={12} /> {showReplyCode ? 'Hide Code' : 'Attach Code Snippet'}
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={isFr ? "Rédigez votre explication, votre solution ou votre question de suivi..." : "Write your step-by-step solution, clarification, or guidance..."}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none"
                />

                {showReplyCode && (
                  <div className="p-3 bg-slate-900 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-400">Code Snippet</span>
                      <select
                        value={replyCodeLang}
                        onChange={(e) => setReplyCodeLang(e.target.value)}
                        className="bg-slate-800 text-slate-200 text-[10px] rounded px-2 py-0.5"
                      >
                        <option value="python">Python</option>
                        <option value="c">C / C++</option>
                        <option value="java">Java</option>
                        <option value="javascript">JavaScript</option>
                        <option value="sql">SQL</option>
                      </select>
                    </div>
                    <textarea
                      rows={3}
                      value={replyCodeText}
                      onChange={(e) => setReplyCodeText(e.target.value)}
                      placeholder="// Code here..."
                      className="w-full font-mono text-xs bg-slate-950 text-emerald-300 p-2.5 rounded-lg border border-slate-800 outline-none"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingReply}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send size={14} />
                    {isSubmittingReply ? (isFr ? 'Envoi...' : 'Posting...') : (isFr ? 'Publier la Réponse' : 'Post Reply')}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold text-center">
                🔒 {isFr ? 'Cette discussion est verrouillée par un enseignant. Réponses désactivées.' : 'This thread is locked by a teacher. New replies are disabled.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* GradeBoost AI Companion Drawer */}
      <ForumAIDrawer
        isOpen={isAIDrawerOpen}
        onClose={() => setIsAIDrawerOpen(false)}
        discussion={discussion}
      />
    </div>
  );
}
