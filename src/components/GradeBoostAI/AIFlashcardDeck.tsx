import React, { useState } from 'react';
import { 
  RotateCw, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  Layers 
} from 'lucide-react';
import { AIFlashcard } from '../../types';

interface AIFlashcardDeckProps {
  flashcards: AIFlashcard[];
  onToggleMastered?: (id: string, currentStatus: boolean) => void;
}

export const AIFlashcardDeck: React.FC<AIFlashcardDeckProps> = ({ 
  flashcards,
  onToggleMastered 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 border border-slate-200 rounded-xl">
        No flashcards available.
      </div>
    );
  }

  const card = flashcards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Flashcard Box */}
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className={`min-h-[220px] p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md select-none ${
          isFlipped 
            ? 'bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-indigo-700' 
            : 'bg-white text-slate-900 border-indigo-200 hover:border-indigo-400'
        }`}
      >
        <div className="flex items-center justify-between text-xs font-semibold opacity-70">
          <span>Card {currentIndex + 1} of {flashcards.length}</span>
          <span className="flex items-center gap-1">
            <RotateCw size={12} /> {isFlipped ? 'ANSWER (Back)' : 'QUESTION (Front - Click to Flip)'}
          </span>
        </div>

        <div className="my-auto text-center px-4">
          <p className={`font-semibold leading-relaxed ${isFlipped ? 'text-base text-indigo-100' : 'text-lg text-slate-800'}`}>
            {isFlipped ? card.backText : card.frontText}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs pt-4 border-t border-slate-200/20">
          <span className="text-[11px] opacity-70">{card.subject || 'GCE Study Deck'}</span>
          <span className="text-[11px] text-amber-400 font-medium">Click card to flip ↺</span>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between px-2">
        <button
          onClick={handlePrev}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors"
        >
          <ChevronLeft size={16} /> Previous
        </button>

        <span className="text-xs font-bold text-slate-500">
          {currentIndex + 1} / {flashcards.length}
        </span>

        <button
          onClick={handleNext}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium flex items-center gap-1 transition-colors shadow-xs"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
