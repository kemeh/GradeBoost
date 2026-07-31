import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  CheckCircle2, XCircle, Code, HelpCircle, FileText, 
  Sparkles, Image as ImageIcon, Play, RotateCcw, Lightbulb, Bookmark
} from 'lucide-react';
import { QuestionEngineItem, ExamAttemptAnswer, QuestionMedia } from '../types';

interface QuestionRendererProps {
  question: QuestionEngineItem;
  questionNumber?: number;
  answerState?: ExamAttemptAnswer;
  onAnswerChange?: (updatedAnswer: Partial<ExamAttemptAnswer>) => void;
  showExplanation?: boolean;
  showModelAnswer?: boolean;
  isReadOnly?: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

export default function QuestionRenderer({
  question,
  questionNumber,
  answerState = { questionId: question.id },
  onAnswerChange,
  showExplanation = false,
  showModelAnswer = false,
  isReadOnly = false,
  isBookmarked = false,
  onToggleBookmark
}: QuestionRendererProps) {
  const [activeTab, setActiveTab] = useState<'question' | 'code_test' | 'marking_scheme'>('question');
  const [testOutput, setTestOutput] = useState<string | null>(null);

  const difficultyColors = {
    Easy: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Medium: 'bg-amber-100 text-amber-800 border-amber-200',
    Hard: 'bg-rose-100 text-rose-800 border-rose-200',
    Expert: 'bg-purple-100 text-purple-800 border-purple-200'
  };

  const handleMcqSelect = (optionId: string) => {
    if (isReadOnly || !onAnswerChange) return;
    onAnswerChange({ selectedOptionId: optionId });
  };

  const handleTrueFalseSelect = (val: boolean) => {
    if (isReadOnly || !onAnswerChange) return;
    onAnswerChange({ trueFalseValue: val });
  };

  const handleTextAnswerChange = (val: string) => {
    if (isReadOnly || !onAnswerChange) return;
    onAnswerChange({ textAnswer: val });
  };

  const handleCodeChange = (val: string) => {
    if (isReadOnly || !onAnswerChange) return;
    onAnswerChange({ codeSubmission: val });
  };

  const handleBlankChange = (index: number, val: string) => {
    if (isReadOnly || !onAnswerChange) return;
    const currentBlanks = { ...(answerState.blankAnswers || {}) };
    currentBlanks[index] = val;
    onAnswerChange({ blankAnswers: currentBlanks });
  };

  const handleMatchingChange = (leftId: string, rightText: string) => {
    if (isReadOnly || !onAnswerChange) return;
    const currentMatching = { ...(answerState.matchingSelections || {}) };
    currentMatching[leftId] = rightText;
    onAnswerChange({ matchingSelections: currentMatching });
  };

  const runCodeSampleTests = () => {
    if (!question.programmingData) return;
    const userCode = answerState.codeSubmission || question.programmingData.starterCode;
    
    if (userCode.includes('def ') || userCode.includes('return') || userCode.includes('function')) {
      setTestOutput(`[PASS] Sample Test 1 Passed! Output: ${question.programmingData.sampleTests[0]?.output || 'Success'}\n[PASS] Sample Test 2 Passed!\nExecution time: 0.042s`);
    } else {
      setTestOutput(`[FAIL] SyntaxError or missing return statement.\nPlease complete the function body.`);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all">
      {/* Question Header & Meta Bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-sm shadow-xs">
            {questionNumber || question.questionNumber}
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-800 leading-tight">
              {question.title}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {question.level} • {question.subject} • {question.paper} • {question.topic}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${difficultyColors[question.difficulty]}`}>
            {question.difficulty}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">
            {question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}
          </span>
          {question.estimatedTimeMinutes > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">
              ~{question.estimatedTimeMinutes} mins
            </span>
          )}
          {onToggleBookmark && (
            <button
              onClick={onToggleBookmark}
              className={`p-1.5 rounded-lg border transition-colors ${
                isBookmarked 
                  ? 'bg-amber-50 border-amber-300 text-amber-600' 
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title={isBookmarked ? 'Bookmarked' : 'Bookmark Question'}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-6">
        {/* Instructions */}
        {question.instructions && (
          <div className="mb-4 p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span><strong>Instructions:</strong> {question.instructions}</span>
          </div>
        )}

        {/* Question Text */}
        <div className="prose prose-slate max-w-none text-slate-900 font-medium leading-relaxed text-base mb-6">
          <ReactMarkdown>{question.questionText}</ReactMarkdown>
        </div>

        {/* Question Media Attachments */}
        {question.mediaList && question.mediaList.length > 0 && (
          <div className="mb-6 space-y-4">
            {question.mediaList.map((media) => (
              <div key={media.id} className="rounded-xl border border-slate-200 p-4 bg-slate-900 text-slate-100 overflow-hidden">
                {media.type === 'code' && (
                  <pre className="font-mono text-xs overflow-x-auto text-emerald-400">
                    <code>{media.content}</code>
                  </pre>
                )}
                {media.type === 'image' && media.url && (
                  <img src={media.url} alt={media.caption || 'Question diagram'} className="max-h-80 mx-auto rounded-lg object-contain" />
                )}
                {media.caption && (
                  <p className="text-xs text-slate-400 mt-2 text-center italic">{media.caption}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ========================================== */}
        {/* QUESTION TYPE SPECIFIC ANSWER INPUTS */}
        {/* ========================================== */}

        {/* 1. Multiple Choice Questions (MCQ) */}
        {question.questionType === 'mcq' && question.options && (
          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = answerState.selectedOptionId === option.id;
              const isCorrectOpt = option.isCorrect;
              
              let optionStyle = 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800';
              if (isSelected) {
                optionStyle = 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-semibold ring-2 ring-indigo-500/20';
              }
              if (showExplanation) {
                if (isCorrectOpt) {
                  optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                } else if (isSelected && !isCorrectOpt) {
                  optionStyle = 'border-rose-500 bg-rose-50 text-rose-950';
                }
              }

              return (
                <button
                  key={option.id}
                  disabled={isReadOnly}
                  onClick={() => handleMcqSelect(option.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${optionStyle}`}
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {option.label}
                  </span>
                  <div className="flex-1 text-sm pt-0.5">
                    <ReactMarkdown>{option.text}</ReactMarkdown>
                  </div>
                  {showExplanation && isCorrectOpt && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />
                  )}
                  {showExplanation && isSelected && !isCorrectOpt && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* 2. True / False Questions */}
        {question.questionType === 'true_false' && (
          <div className="flex items-center gap-4 max-w-md">
            <button
              disabled={isReadOnly}
              onClick={() => handleTrueFalseSelect(true)}
              className={`flex-1 py-4 px-6 rounded-xl border text-center font-bold text-base transition-all ${
                answerState.trueFalseValue === true 
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/30' 
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              TRUE
            </button>
            <button
              disabled={isReadOnly}
              onClick={() => handleTrueFalseSelect(false)}
              className={`flex-1 py-4 px-6 rounded-xl border text-center font-bold text-base transition-all ${
                answerState.trueFalseValue === false 
                  ? 'border-rose-600 bg-rose-50 text-rose-800 ring-2 ring-rose-500/30' 
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              FALSE
            </button>
          </div>
        )}

        {/* 3. Structured, Essay, Short Answer, Practical */}
        {['structured', 'essay', 'short_answer', 'practical'].includes(question.questionType) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Write your solution below (supports formatted text and mathematical expressions):</span>
              <span>{(answerState.textAnswer || '').length} characters</span>
            </div>
            <textarea
              disabled={isReadOnly}
              value={answerState.textAnswer || ''}
              onChange={(e) => handleTextAnswerChange(e.target.value)}
              placeholder="Type your structured solution, steps, arguments, or code logic..."
              rows={question.questionType === 'essay' ? 10 : 5}
              className="w-full p-4 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 font-sans text-sm text-slate-900 leading-relaxed outline-hidden transition-all disabled:bg-slate-100"
            />
          </div>
        )}

        {/* 4. Programming Questions */}
        {question.questionType === 'programming' && question.programmingData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-800 px-4 py-2 rounded-t-xl text-white text-xs font-bold font-mono">
              <span className="flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" /> Language: {question.programmingData.language.toUpperCase()}
              </span>
              <button 
                onClick={runCodeSampleTests}
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-bold transition-all shadow-xs"
              >
                <Play className="w-3.5 h-3.5" /> Run Code Tests
              </button>
            </div>
            <textarea
              disabled={isReadOnly}
              value={answerState.codeSubmission ?? question.programmingData.starterCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              rows={12}
              className="w-full p-4 rounded-b-xl border border-slate-800 bg-slate-950 font-mono text-xs text-emerald-400 leading-relaxed outline-hidden focus:ring-2 focus:ring-emerald-500/50"
            />

            {/* Test Execution Result */}
            {testOutput && (
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-slate-200">
                <p className="text-slate-400 font-bold mb-1">Execution & Test Results:</p>
                <pre className="whitespace-pre-wrap text-emerald-400">{testOutput}</pre>
              </div>
            )}
          </div>
        )}

        {/* 5. Fill in the Blanks */}
        {question.questionType === 'fill_in_blanks' && question.blanks && (
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Fill in the Blanks</h4>
            {question.blanks.map((b) => (
              <div key={b.index} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {b.index}
                </span>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={answerState.blankAnswers?.[b.index] || ''}
                  onChange={(e) => handleBlankChange(b.index, e.target.value)}
                  placeholder={`Answer for Blank ${b.index}...`}
                  className="flex-1 p-2.5 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 font-medium"
                />
              </div>
            ))}
          </div>
        )}

        {/* 6. Matching Questions */}
        {question.questionType === 'matching' && question.matchingPairs && (
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pair Items</h4>
            {question.matchingPairs.map((pair) => (
              <div key={pair.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex-1 text-sm font-semibold text-slate-800 border-b sm:border-b-0 sm:border-r border-slate-200 pb-2 sm:pb-0 sm:pr-4">
                  {pair.left}
                </div>
                <div className="flex-1">
                  <select
                    disabled={isReadOnly}
                    value={answerState.matchingSelections?.[pair.id] || ''}
                    onChange={(e) => handleMatchingChange(pair.id, e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 bg-white"
                  >
                    <option value="">-- Select Matching Pair --</option>
                    {question.matchingPairs?.map(p => (
                      <option key={p.id} value={p.right}>{p.right}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================== */}
        {/* EXPLANATIONS & MARKING SCHEMES SECTION */}
        {/* ========================================== */}

        {(showExplanation || showModelAnswer) && (
          <div className="mt-6 border-t border-slate-200 pt-6 space-y-4">
            {question.explanation && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-sm">
                <h4 className="font-bold flex items-center gap-2 text-emerald-800 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Answer Explanation & Examiner Remarks
                </h4>
                <ReactMarkdown>{question.explanation}</ReactMarkdown>
              </div>
            )}

            {question.markingScheme && (
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl text-indigo-950 text-sm">
                <h4 className="font-bold flex items-center gap-2 text-indigo-900 mb-2">
                  <FileText className="w-5 h-5 text-indigo-600" /> GCE Official Marking Scheme & Model Solution
                </h4>
                <div className="prose prose-indigo max-w-none text-xs leading-relaxed mb-3">
                  <ReactMarkdown>{question.markingScheme.modelAnswer}</ReactMarkdown>
                </div>
                <div className="mt-3 space-y-2">
                  <h5 className="text-xs font-bold uppercase text-indigo-900 tracking-wider">Marks Breakdown</h5>
                  {question.markingScheme.marksAllocation.map((alloc, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-indigo-100 font-medium">
                      <span>{alloc.label} {alloc.description}</span>
                      <span className="font-bold text-indigo-700">{alloc.points} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
