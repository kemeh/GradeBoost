import React, { useState } from 'react';
import {
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  Flag,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  BarChart3,
  Bot,
  Check,
  X,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

interface MobileExamsScreenProps {
  simLang: 'en' | 'fr';
  isDarkMode: boolean;
}

export const MobileExamsScreen: React.FC<MobileExamsScreenProps> = ({
  simLang,
  isDarkMode,
}) => {
  const isEn = simLang === 'en';
  const [examState, setExamState] = useState<'hub' | 'active' | 'results'>('hub');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(5385); // 01:29:45

  const questions = [
    {
      id: 1,
      text: isEn 
        ? 'A body of mass 2kg is projected vertically upwards with an initial velocity of 20 m/s. Taking g = 9.8 m/s², calculate the maximum height reached.'
        : 'Un corps de masse 2kg est lancé verticalement vers le haut avec une vitesse initiale de 20 m/s. En prenant g = 9.8 m/s², calculer la hauteur maximale.',
      options: [
        'A) 20.4 meters',
        'B) 40.8 meters',
        'C) 10.2 meters',
        'D) 15.6 meters'
      ],
      correctAnswer: 0,
      explanation: isEn
        ? 'Using kinematics formula v² = u² - 2gh at max height v = 0. Therefore 0 = 20² - 2(9.8)h => 400 = 19.6h => h = 20.41m.'
        : 'En utilisant v² = u² - 2gh avec v = 0 à la hauteur max: h = 20² / (2 * 9.8) = 20.41m.'
    },
    {
      id: 2,
      text: isEn
        ? 'Evaluate the integral \\int_0^1 (3x^2 + 2x + 1) dx.'
        : 'Évaluer l\'intégrale \\int_0^1 (3x^2 + 2x + 1) dx.',
      options: [
        'A) 2',
        'B) 3',
        'C) 4',
        'D) 5'
      ],
      correctAnswer: 1,
      explanation: isEn
        ? 'Antiderivative F(x) = x³ + x² + x. Evaluated from 0 to 1: F(1) - F(0) = (1 + 1 + 1) - 0 = 3.'
        : 'Primitive F(x) = x³ + x² + x. Évalué de 0 à 1: (1 + 1 + 1) - 0 = 3.'
    },
    {
      id: 3,
      text: isEn
        ? 'Which of the following organic functional groups contains a carbonyl group bonded to a hydroxyl group?'
        : 'Lequel des groupes fonctionnels suivants contient un groupe carbonyl lié à un groupe hydroxyle?',
      options: [
        'A) Ester',
        'B) Carboxylic Acid',
        'C) Ketone',
        'D) Aldehyde'
      ],
      correctAnswer: 1,
      explanation: isEn
        ? 'Carboxylic acids contain the -COOH functional group, where C=O is directly bonded to -OH.'
        : 'Les acides carboxyliques contiennent le groupe -COOH.'
    }
  ];

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optIdx: number) => {
    setUserAnswers((prev) => ({ ...prev, [currentQuestionIndex]: optIdx }));
  };

  const toggleFlagQuestion = () => {
    setFlaggedQuestions((prev) => {
      const exists = prev.includes(currentQuestionIndex);
      if (exists) {
        toast.success(`Unflagged question ${currentQuestionIndex + 1}`);
        return prev.filter((i) => i !== currentQuestionIndex);
      } else {
        toast.success(`Flagged question ${currentQuestionIndex + 1} for review`);
        return [...prev, currentQuestionIndex];
      }
    });
  };

  const handleFinishExam = () => {
    setExamState('results');
    toast.success('Mock Exam submitted! Calculating score & AI explanations...');
  };

  // Calculate score
  const scoreCount = Object.keys(userAnswers).reduce((acc, qIdxStr) => {
    const qIdx = parseInt(qIdxStr);
    return userAnswers[qIdx] === questions[qIdx]?.correctAnswer ? acc + 1 : acc;
  }, 0);

  return (
    <div className="space-y-4 pb-6 select-none">
      {/* 1. MOCK EXAM HUB VIEW */}
      {examState === 'hub' && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-emerald-600 via-teal-700 to-[#0F2C59] text-white rounded-2xl shadow-md space-y-2">
            <span className="px-2.5 py-0.5 bg-white/20 text-white rounded-full text-[9px] font-extrabold uppercase tracking-wider">
              {isEn ? 'OFFICIAL GCE & BAC MOCK ENGINE' : 'BANQUE D\'EXAMENS OFFICIELLE'}
            </span>
            <h3 className="font-extrabold text-base text-white">
              {isEn ? '2024 Physics & Math Mock Simulation' : 'Examen Blanc Physique & Math 2024'}
            </h3>
            <p className="text-[11px] text-teal-100">
              {isEn 
                ? '90-minute timed exam under real Cameroon examination conditions with instant marking & AI feedback.'
                : 'Épreuve chronométrée de 90 minutes avec correction automatique et explications IA.'}
            </p>

            <button
              onClick={() => {
                setExamState('active');
                toast.success('Mock Exam started! Good luck.');
              }}
              className="mt-2 w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-[#0F2C59] font-black rounded-xl text-xs transition shadow-sm active:scale-98"
            >
              🚀 {isEn ? 'Start Timed Exam Now' : 'Démarrer l\'Examen'}
            </button>
          </div>

          {/* Question Bank Selection */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white px-1">
              {isEn ? 'SELECT QUESTION BANK PAPER' : 'SÉLECTIONNER UNE ÉPREUVE'}
            </h4>

            {[
              { title: '2023 GCE A-Level Physics Paper 2', duration: '90 Mins', count: '50 Qs', difficulty: 'Advanced' },
              { title: '2023 Terminale C Mathématiques Baccalauréat', duration: '120 Mins', count: '40 Qs', difficulty: 'Difficile' },
              { title: '2022 GCE Ordinary Level Chemistry P1', duration: '60 Mins', count: '40 Qs', difficulty: 'Medium' }
            ].map((p, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex items-center justify-between gap-3`}
              >
                <div>
                  <h5 className="font-extrabold text-xs text-slate-900 dark:text-white">{p.title}</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    ⏱️ {p.duration} • 📝 {p.count} • Level: {p.difficulty}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setExamState('active');
                    toast.success(`Started ${p.title}`);
                  }}
                  className="px-3 py-1.5 bg-[#0F2C59] hover:bg-blue-900 text-white text-xs font-bold rounded-xl transition"
                >
                  {isEn ? 'Solve' : 'Traiter'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. ACTIVE TIMED EXAM INTERFACE */}
      {examState === 'active' && (
        <div className="space-y-3">
          {/* Active Header: Timer & Question Status */}
          <div className="p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between border border-slate-800 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400 animate-pulse" />
              <span className="font-mono font-black text-sm text-amber-300">
                {formatTimer(timerSeconds)}
              </span>
            </div>

            <span className="text-xs font-bold text-slate-300">
              Q {currentQuestionIndex + 1} / {questions.length}
            </span>

            <button
              onClick={toggleFlagQuestion}
              className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition ${
                flaggedQuestions.includes(currentQuestionIndex)
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Flag className="h-3.5 w-3.5" />
              {flaggedQuestions.includes(currentQuestionIndex) ? (isEn ? 'Flagged' : 'Marqué') : (isEn ? 'Flag' : 'Marquer')}
            </button>
          </div>

          {/* Question Navigator Grid */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {questions.map((_, idx) => {
              const isSelected = idx === currentQuestionIndex;
              const isAnswered = userAnswers[idx] !== undefined;
              const isFlagged = flaggedQuestions.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`h-8 w-8 rounded-xl font-extrabold text-xs transition relative flex items-center justify-center border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm ring-2 ring-blue-400/50'
                      : isAnswered
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {idx + 1}
                  {isFlagged && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-400 border border-slate-900"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Question Card */}
          <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm space-y-3`}>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded">
                Question {currentQuestionIndex + 1}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">1 Mark</span>
            </div>

            <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">
              {questions[currentQuestionIndex].text}
            </p>

            {/* Multiple Choice Options */}
            <div className="space-y-2 pt-1">
              {questions[currentQuestionIndex].options.map((opt, optIdx) => {
                const isSelected = userAnswers[currentQuestionIndex] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#0F2C59] text-white border-[#0F2C59] shadow-sm'
                        : isDarkMode
                        ? 'bg-slate-800/60 text-slate-200 border-slate-700 hover:bg-slate-800'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <CheckCircle className="h-4 w-4 text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 disabled:opacity-40 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> {isEn ? 'Previous' : 'Précédent'}
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleFinishExam}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition shadow-sm active:scale-95"
              >
                {isEn ? 'Submit Exam' : 'Soumettre'}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-4 py-2 bg-[#0F2C59] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                {isEn ? 'Next' : 'Suivant'} <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. RESULTS DASHBOARD & AI EXPLANATIONS */}
      {examState === 'results' && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-br from-[#0F2C59] via-indigo-900 to-purple-900 text-white rounded-2xl shadow-lg text-center space-y-2">
            <div className="h-16 w-16 mx-auto rounded-full bg-amber-400 text-[#0F2C59] flex items-center justify-center text-2xl font-black shadow-md">
              {Math.round((scoreCount / questions.length) * 100)}%
            </div>

            <h3 className="font-extrabold text-base text-white">
              {scoreCount === questions.length ? (isEn ? '🎉 Distinction Grade A!' : '🎉 Mention Très Bien!') : (isEn ? 'Pass Grade B' : 'Mention Bien')}
            </h3>

            <p className="text-[11px] text-blue-200">
              {isEn 
                ? `You correctly answered ${scoreCount} out of ${questions.length} questions.`
                : `Vous avez répondu correctement à ${scoreCount} sur ${questions.length} questions.`}
            </p>

            <button
              onClick={() => setExamState('hub')}
              className="mt-2 px-4 py-2 bg-white text-[#0F2C59] rounded-xl font-bold text-xs transition"
            >
              <RotateCcw className="h-3.5 w-3.5 inline mr-1" /> {isEn ? 'Back to Exam Hub' : 'Retour'}
            </button>
          </div>

          {/* AI Explanations */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white px-1 flex items-center gap-1.5">
              <Bot className="h-4 w-4 text-purple-500" />
              {isEn ? 'AI DETAILED EXPLANATIONS' : 'EXPLICATIONS DÉTAILLÉES IA'}
            </h4>

            {questions.map((q, idx) => {
              const isCorrect = userAnswers[idx] === q.correctAnswer;
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm space-y-2`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">Q{idx + 1}: {q.text}</span>
                    {isCorrect ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded flex items-center gap-1">
                        <Check className="h-3 w-3" /> Correct
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded flex items-center gap-1">
                        <X className="h-3 w-3" /> Missed
                      </span>
                    )}
                  </div>

                  <div className="p-2.5 bg-purple-950/40 border border-purple-800/50 rounded-xl text-[11px] text-purple-200 leading-relaxed">
                    <strong>AI Note:</strong> {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
