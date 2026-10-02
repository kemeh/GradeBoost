import React, { useState } from 'react';
import { SyllabusTopicModel, StudentTopicProgress } from '../../types/academicSyllabus';
import { Card, Button, Badge } from '../ui';
import { X, BookOpen, Sparkles, Lightbulb, AlertTriangle, CheckCircle2, Award, Clock, ArrowRight, Printer, Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TopicRevisionNoteModalProps {
  topic: SyllabusTopicModel;
  progress?: StudentTopicProgress;
  onClose: () => void;
  onStartPractice?: (topic: SyllabusTopicModel) => void;
}

export default function TopicRevisionNoteModal({
  topic,
  progress,
  onClose,
  onStartPractice
}: TopicRevisionNoteModalProps) {
  const [activeTab, setActiveTab] = useState<'notes' | 'objectives' | 'past_questions' | 'exam_tips'>('notes');

  const printNote = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-linear-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white relative">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                {topic.moduleTitle}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                {topic.subjectName}
              </span>
              {topic.isOfficialSyllabus ? (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Official Syllabus
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Edulpha AI Suggested
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={printNote}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition"
                title="Print Revision Note"
              >
                <Printer size={18} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-400 shrink-0" />
            {topic.topicName}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {topic.description}
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 pt-3 border-t border-indigo-800/40 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Exam Priority:</span>
              <span className={`font-black px-2 py-0.5 rounded-full text-[10px] uppercase ${
                topic.priority === 'CRITICAL' ? 'bg-rose-500 text-white' :
                topic.priority === 'HIGH' ? 'bg-amber-500 text-slate-900' :
                topic.priority === 'MEDIUM' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-200'
              }`}>
                {topic.priority} ({topic.priorityScore}/100)
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock size={14} className="text-indigo-400" />
              <span>Est. Study: {topic.estimatedStudyTimeMinutes} mins</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-300">
              <Award size={14} className="text-amber-400" />
              <span>Past GCE Questions: {topic.pastQuestionCount}</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-300">
              <span>Papers:</span>
              <span className="font-bold text-white">{topic.paperRelevance.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 sm:px-6">
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sparkles size={15} /> Revision Master Note
          </button>
          <button
            onClick={() => setActiveTab('objectives')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'objectives'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 size={15} /> Learning Objectives ({topic.learningObjectives.length})
          </button>
          <button
            onClick={() => setActiveTab('past_questions')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'past_questions'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Award size={15} /> Past GCE Questions ({topic.pastQuestionsList.length})
          </button>
          <button
            onClick={() => setActiveTab('exam_tips')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'exam_tips'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Lightbulb size={15} /> Common Mistakes & Tips
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-slate-900 dark:text-slate-100 text-sm leading-relaxed">
          {activeTab === 'notes' && (
            <div className="space-y-6">
              {/* Definition Box */}
              <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 rounded-2xl space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                  <BookOpen size={16} className="text-indigo-600 dark:text-indigo-400" />
                  Definition & Core Statement
                </h4>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {topic.topicName} is a foundational component of the {topic.subjectName} syllabus. In the context of Cameroon GCE examinations, mastery of this topic requires understanding the theoretical definitions, mathematical or logical operations, and applied problem-solving contexts.
                </p>
              </div>

              {/* Subtopics Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Subtopics & Essential Knowledge Units
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {topic.subtopics.map((sub, sIdx) => (
                    <div 
                      key={sub.id || sIdx}
                      className="p-3 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1 hover:border-indigo-400 transition shadow-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-black flex items-center justify-center shrink-0">
                          {sIdx + 1}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                          {sub.name}
                        </span>
                      </div>
                      {sub.nameFr && (
                        <p className="text-[11px] text-slate-500 italic pl-7">{sub.nameFr}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Important Concepts */}
              {topic.importantConcepts && topic.importantConcepts.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles size={15} className="text-amber-500" />
                    Key Concepts & Terminology to Remember
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {topic.importantConcepts.map((concept, cIdx) => (
                      <span 
                        key={cIdx}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Prerequisites */}
              {topic.prerequisites && topic.prerequisites.length > 0 && (
                <div className="p-3 bg-slate-100/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Prerequisites:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {topic.prerequisites.map((pre, pIdx) => (
                      <span key={pIdx} className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold border border-slate-200 dark:border-slate-700">
                        {pre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'objectives' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-xs text-amber-900 dark:text-amber-300">
                <span className="font-bold">GCE Assessment Standard:</span> Candidates are evaluated directly against these learning objectives. To achieve maximum marks, ensure you can perform each objective independently without notes.
              </div>

              <div className="space-y-2.5">
                {topic.learningObjectives.map((obj, oIdx) => (
                  <div 
                    key={oIdx}
                    className="p-3 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start gap-3"
                  >
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {obj}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'past_questions' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 rounded-2xl text-xs text-indigo-900 dark:text-indigo-300">
                <span className="font-bold">Verified Past Examination Records:</span> These questions appeared in past official Cameroon GCE examinations and reflect the exact examiners' expectations.
              </div>

              {topic.pastQuestionsList.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs">
                  No past paper questions currently cataloged for this topic. Use the Practice Questions feature to test your understanding.
                </div>
              ) : (
                <div className="space-y-3">
                  {topic.pastQuestionsList.map((pq, pqIdx) => (
                    <div 
                      key={pqIdx}
                      className="p-4 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 hover:border-indigo-300 transition"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-black text-xs text-indigo-600 dark:text-indigo-400">
                          {topic.subjectName} {pq.year} • {pq.paper} • {pq.questionNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          {pq.marks} Marks
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 italic">
                        "{pq.questionSnippet}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'exam_tips' && (
            <div className="space-y-6">
              {/* Common Mistakes */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle size={16} />
                  Frequent Candidate Mistakes (Avoid in Exam)
                </h4>
                <div className="space-y-2">
                  {(topic.commonMistakes && topic.commonMistakes.length > 0 ? topic.commonMistakes : [
                    'Overlooking step-by-step intermediate calculations and jumping straight to final numbers.',
                    'Failing to specify accurate measurement units in scientific answers.',
                    'Vague explanations that repeat the question statement rather than explaining the underlying mechanism.'
                  ]).map((mistake, mIdx) => (
                    <div 
                      key={mIdx}
                      className="p-3 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl flex items-start gap-2.5 text-xs text-rose-900 dark:text-rose-200"
                    >
                      <span className="text-rose-500 font-bold shrink-0">✕</span>
                      <span>{mistake}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Examiner Tips */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Lightbulb size={16} />
                  Chief Examiner Success Strategies
                </h4>
                <div className="space-y-2">
                  {(topic.examTips && topic.examTips.length > 0 ? topic.examTips : [
                    'Read the command word carefully: "State" requires brief facts, whereas "Discuss" or "Evaluate" demands balanced reasoning.',
                    'Underline key terms and primary keys in structured schemas and diagrams.',
                    'Allocate your time strictly proportional to the marks allocated for each sub-question.'
                  ]).map((tip, tIdx) => (
                    <div 
                      key={tIdx}
                      className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-200"
                    >
                      <span className="text-emerald-500 font-bold shrink-0">✓</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {topic.priorityReason}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close Note
            </Button>
            {onStartPractice && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onStartPractice(topic);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
              >
                <span>Practice Topic Questions</span>
                <ArrowRight size={15} />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
