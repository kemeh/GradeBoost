import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Award, 
  RotateCcw, 
  Lightbulb,
  FileQuestion,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { AIQuiz, AIQuizQuestion } from '../../types';
import { generateAIQuiz, explainAnswerWithAI } from '../../services/aiService';

interface AIQuizGeneratorProps {
  userId: string;
  defaultSubject?: string;
  onSaveScore?: (score: number) => void;
}

export const AIQuizGenerator: React.FC<AIQuizGeneratorProps> = ({ 
  userId, 
  defaultSubject = 'Computer Science',
  onSaveScore 
}) => {
  const [subject, setSubject] = useState(defaultSubject);
  const [topic, setTopic] = useState('Data Structures & Algorithms');
  const [subtopic, setSubtopic] = useState('Binary Search Trees');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [questionType, setQuestionType] = useState<'MCQ' | 'Essay' | 'Programming' | 'Practical' | 'TrueFalse' | 'Matching'>('MCQ');
  const [count, setCount] = useState<number>(5);

  const [isGenerating, setIsGenerating] = useState(false);
  const [quiz, setQuiz] = useState<AIQuiz | null>(null);

  // Active quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [loadingExpl, setLoadingExpl] = useState<Record<string, boolean>>({});

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setQuiz(null);
    setSelectedAnswers({});
    setShowResults(false);
    setExplanations({});

    try {
      const newQuiz = await generateAIQuiz(
        userId,
        subject,
        topic,
        subtopic,
        difficulty,
        questionType,
        count
      );
      setQuiz(newQuiz);
    } catch (err) {
      console.error("Generate quiz error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (qId: string, option: string) => {
    if (showResults) return;
    setSelectedAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleSubmitQuiz = () => {
    if (!quiz) return;
    setShowResults(true);

    let correctCount = 0;
    quiz.questions.forEach(q => {
      const chosen = selectedAnswers[q.id];
      // Normalize answer matching
      if (chosen && (chosen.charAt(0) === q.correctAnswer || chosen === q.correctAnswer)) {
        correctCount++;
      }
    });

    const scorePct = Math.round((correctCount / quiz.questions.length) * 100);
    if (onSaveScore) onSaveScore(scorePct);
  };

  const handleExplainAnswer = async (q: AIQuizQuestion) => {
    setLoadingExpl(prev => ({ ...prev, [q.id]: true }));
    const result = await explainAnswerWithAI(
      q.questionText,
      q.options,
      selectedAnswers[q.id],
      q.correctAnswer,
      q.explanation
    );
    setExplanations(prev => ({ ...prev, [q.id]: result }));
    setLoadingExpl(prev => ({ ...prev, [q.id]: false }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-xl text-amber-400">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI Quiz & Exam Generator</h2>
            <p className="text-xs text-indigo-200">
              Generate custom MCQs, Essays, Programming & Practical GCE practice questions
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {!quiz && (
          <form onSubmit={handleGenerate} className="space-y-6 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Subject</label>
                <select 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="ICT">ICT</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Economics">Economics</option>
                  <option value="History">History</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Topic</label>
                <input 
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Databases, Operating Systems"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Subtopic (Optional)</label>
                <input 
                  type="text"
                  value={subtopic}
                  onChange={(e) => setSubtopic(e.target.value)}
                  placeholder="e.g. Normalization (3NF)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Difficulty</label>
                <select 
                  value={difficulty} 
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate (Standard GCE)</option>
                  <option value="Advanced">Advanced (A-Level Distinction)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Question Type</label>
                <select 
                  value={questionType} 
                  onChange={(e) => setQuestionType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="MCQ">Multiple Choice Questions (MCQ)</option>
                  <option value="Essay">Structured Essay Questions</option>
                  <option value="Programming">Programming & Code Problems</option>
                  <option value="Practical">Practical ICT Tasks</option>
                  <option value="TrueFalse">True or False</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Number of Questions</label>
                <select 
                  value={count} 
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value={3}>3 Questions (Quick Drill)</option>
                  <option value={5}>5 Questions (Standard)</option>
                  <option value={10}>10 Questions (Full Test)</option>
                  <option value={15}>15 Questions (Exam Practice)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Generating AI Practice Quiz...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate AI Quiz</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Active Quiz View */}
        {quiz && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{quiz.subject} • {quiz.difficulty}</span>
                <h3 className="text-lg font-bold text-slate-900">{quiz.topic} ({quiz.questionType})</h3>
              </div>
              <button 
                onClick={() => setQuiz(null)}
                className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 font-medium"
              >
                <RotateCcw size={14} /> New Quiz
              </button>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {quiz.questions.map((q, idx) => {
                const userChosen = selectedAnswers[q.id];
                const isCorrect = userChosen && (userChosen.charAt(0) === q.correctAnswer || userChosen === q.correctAnswer);

                return (
                  <div key={q.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 bg-indigo-100 text-indigo-700 font-bold rounded-lg flex items-center justify-center text-xs shrink-0">
                        Q{idx + 1}
                      </span>
                      <p className="font-semibold text-slate-800 text-sm leading-relaxed">{q.questionText}</p>
                    </div>

                    {/* Options if MCQ or True/False */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 gap-2 pl-10">
                        {q.options.map((opt, optIdx) => {
                          const letter = opt.charAt(0);
                          const isSelected = userChosen === opt || userChosen === letter;

                          let btnStyle = "bg-white border-slate-200 hover:border-indigo-300 text-slate-700";
                          if (isSelected) {
                            btnStyle = "bg-indigo-50 border-indigo-500 text-indigo-900 font-medium";
                          }
                          if (showResults) {
                            if (letter === q.correctAnswer || opt.startsWith(q.correctAnswer)) {
                              btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold";
                            } else if (isSelected && !isCorrect) {
                              btnStyle = "bg-rose-50 border-rose-500 text-rose-900";
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={showResults}
                              onClick={() => handleSelectOption(q.id, opt)}
                              className={`w-full text-left p-3 border rounded-xl text-xs transition-all flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {showResults && (letter === q.correctAnswer || opt.startsWith(q.correctAnswer)) && (
                                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                              )}
                              {showResults && isSelected && !isCorrect && (
                                <XCircle size={16} className="text-rose-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Answer Explanation Button */}
                    <div className="pl-10 flex items-center justify-between pt-2">
                      <button
                        onClick={() => handleExplainAnswer(q)}
                        disabled={loadingExpl[q.id]}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {loadingExpl[q.id] ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Lightbulb size={14} />
                        )}
                        <span>Explain Answer with AI</span>
                      </button>

                      {q.examTip && (
                        <span className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                          💡 Exam Tip: {q.examTip}
                        </span>
                      )}
                    </div>

                    {/* Render AI Explanation details */}
                    {explanations[q.id] && (
                      <div className="ml-10 p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl text-xs text-slate-800 space-y-2">
                        <h5 className="font-bold text-indigo-900 flex items-center gap-1">
                          <Sparkles size={14} className="text-amber-500" /> Edulpha AI Answer Breakdown:
                        </h5>
                        <div className="whitespace-pre-line leading-relaxed">
                          {explanations[q.id]}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            {!showResults ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(selectedAnswers).length === 0}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} />
                <span>Submit Quiz & View Grade</span>
              </button>
            ) : (
              <div className="p-6 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Award size={32} className="text-amber-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-base">Quiz Completed!</h4>
                    <p className="text-xs text-slate-300">Review answer explanations above to boost your understanding.</p>
                  </div>
                </div>
                <button
                  onClick={() => setQuiz(null)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition-all"
                >
                  Generate Another Quiz
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIQuizGenerator;
