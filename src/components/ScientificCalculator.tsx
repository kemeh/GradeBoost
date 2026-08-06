import React, { useState } from 'react';
import { X, Delete, RotateCcw, Calculator as CalcIcon } from 'lucide-react';
import { evaluateMathExpression } from '../utils/mathParser';

interface ScientificCalculatorProps {
  onClose: () => void;
}

export default function ScientificCalculator({ onClose }: ScientificCalculatorProps) {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState<number>(0);
  const [isScientific, setIsScientific] = useState(true);

  const handleNum = (val: string) => {
    setDisplay(prev => (prev === '0' ? val : prev + val));
  };

  const handleOp = (op: string) => {
    setDisplay(prev => prev + ' ' + op + ' ');
  };

  const handleClear = () => {
    setDisplay('0');
  };

  const handleBackspace = () => {
    setDisplay(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const handleCalculate = () => {
    try {
      const result = evaluateMathExpression(display);
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        // Format decimal places nicely
        const formatted = Number.isInteger(result) ? String(result) : String(Number(result.toFixed(8)));
        setDisplay(formatted);
      } else {
        setDisplay('Error');
      }
    } catch {
      setDisplay('Error');
    }
  };

  const handleScientificFunc = (funcName: string) => {
    setDisplay(prev => (prev === '0' ? `${funcName}(` : `${prev}${funcName}(`));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700">
          <div className="flex items-center gap-2 font-bold text-slate-200">
            <CalcIcon className="w-5 h-5 text-indigo-400" />
            <span>GCE Scientific Calculator</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsScientific(!isScientific)} 
              className="text-xs font-bold px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-indigo-300"
            >
              {isScientific ? 'Standard' : 'Scientific'}
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Screen Display */}
        <div className="p-4 bg-slate-950 text-right border-b border-slate-800">
          <div className="text-xs text-slate-500 font-mono h-4">
            {memory !== 0 ? `M = ${memory}` : ''}
          </div>
          <div className="text-3xl font-mono font-bold tracking-wider text-emerald-400 truncate mt-1">
            {display}
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="p-4 grid grid-cols-4 gap-2 bg-slate-900">
          {/* Scientific Extras Row */}
          {isScientific && (
            <>
              <button onClick={() => handleScientificFunc('sin')} className="calc-btn-sci">sin</button>
              <button onClick={() => handleScientificFunc('cos')} className="calc-btn-sci">cos</button>
              <button onClick={() => handleScientificFunc('tan')} className="calc-btn-sci">tan</button>
              <button onClick={() => handleScientificFunc('sqrt')} className="calc-btn-sci">√</button>

              <button onClick={() => handleScientificFunc('log')} className="calc-btn-sci">log</button>
              <button onClick={() => handleScientificFunc('ln')} className="calc-btn-sci">ln</button>
              <button onClick={() => handleOp('^')} className="calc-btn-sci">x^y</button>
              <button onClick={() => handleNum('π')} className="calc-btn-sci">π</button>
            </>
          )}

          {/* Action Row */}
          <button onClick={handleClear} className="calc-btn-action bg-rose-600/30 text-rose-300 hover:bg-rose-600/50">C</button>
          <button onClick={handleBackspace} className="calc-btn-action bg-slate-700 text-slate-200 hover:bg-slate-600">
            <Delete className="w-4 h-4 mx-auto" />
          </button>
          <button onClick={() => handleOp('%')} className="calc-btn-action bg-slate-700 text-slate-200">%</button>
          <button onClick={() => handleOp('÷')} className="calc-btn-op">÷</button>

          {/* Numbers & Ops */}
          <button onClick={() => handleNum('7')} className="calc-btn-num">7</button>
          <button onClick={() => handleNum('8')} className="calc-btn-num">8</button>
          <button onClick={() => handleNum('9')} className="calc-btn-num">9</button>
          <button onClick={() => handleOp('×')} className="calc-btn-op">×</button>

          <button onClick={() => handleNum('4')} className="calc-btn-num">4</button>
          <button onClick={() => handleNum('5')} className="calc-btn-num">5</button>
          <button onClick={() => handleNum('6')} className="calc-btn-num">6</button>
          <button onClick={() => handleOp('-')} className="calc-btn-op">-</button>

          <button onClick={() => handleNum('1')} className="calc-btn-num">1</button>
          <button onClick={() => handleNum('2')} className="calc-btn-num">2</button>
          <button onClick={() => handleNum('3')} className="calc-btn-num">3</button>
          <button onClick={() => handleOp('+')} className="calc-btn-op">+</button>

          <button onClick={() => handleNum('0')} className="calc-btn-num col-span-2">0</button>
          <button onClick={() => handleNum('.')} className="calc-btn-num">.</button>
          <button onClick={handleCalculate} className="calc-btn-op bg-indigo-600 hover:bg-indigo-500 text-white">=</button>
        </div>
      </div>
    </div>
  );
}
