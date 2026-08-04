import React, { useState } from 'react';
import { 
  Eye, Sparkles, CheckCircle2, RotateCcw, Info, 
  FlaskConical, Grid, ChevronRight, Layers, HelpCircle
} from 'lucide-react';
import { PracticalActivity } from '../../types';
import { toast } from 'react-hot-toast';

interface BiologyLabProps {
  practical: PracticalActivity;
  onSimulationUpdate?: (state: any) => void;
}

export const BiologyLab: React.FC<BiologyLabProps> = ({
  practical,
  onSimulationUpdate
}) => {
  const simType = practical.simulationConfig?.simulationType || 'biology_microscope';

  // State for Microscope Simulation
  const [selectedSlide, setSelectedSlide] = useState<'onion' | 'epithelial' | 'mitosis' | 'nerve'>('onion');
  const [magnification, setMagnification] = useState<4 | 10 | 40 | 100>(10);
  const [focusLevel, setFocusLevel] = useState<number>(45); // 0-100, 50 is sharp
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [stainApplied, setStainApplied] = useState<boolean>(true);

  // State for Biochemical Food Tests Simulation
  const [selectedFoodSample, setSelectedFoodSample] = useState<'sampleA' | 'sampleB' | 'sampleC'>('sampleA');
  const [selectedReagent, setSelectedReagent] = useState<'iodine' | 'biuret' | 'benedicts' | 'ethanol'>('iodine');
  const [heatApplied, setHeatApplied] = useState<boolean>(false);
  const [testResultColor, setTestResultColor] = useState<string>('transparent');
  const [testResultObs, setTestResultObs] = useState<string>('Select a food sample and reagent, then mix.');

  // State for Ecology Quadrat Sampling
  const [quadratCount, setQuadratCount] = useState<number>(5);
  const [sampledGrid, setSampledGrid] = useState<Array<{ id: number; plantA: number; plantB: number }>>([]);

  // Microscope sharpness computation
  const isFocused = Math.abs(focusLevel - 50) <= 8;
  const blurAmount = Math.abs(focusLevel - 50) / 4;

  const handleReagentTest = () => {
    let color = '#3b82f6';
    let obs = '';

    if (selectedReagent === 'iodine') {
      if (selectedFoodSample === 'sampleA') {
        color = '#0f172a'; // Blue-black
        obs = 'POSITIVE FOR STARCH: Iodine turned deep blue-black.';
      } else {
        color = '#f59e0b'; // Yellow-brown
        obs = 'NEGATIVE FOR STARCH: Iodine remained yellow-brown.';
      }
    } else if (selectedReagent === 'biuret') {
      if (selectedFoodSample === 'sampleB') {
        color = '#8b5cf6'; // Violet/purple
        obs = 'POSITIVE FOR PROTEIN: Biuret reagent turned violet-purple.';
      } else {
        color = '#60a5fa'; // Blue
        obs = 'NEGATIVE FOR PROTEIN: Solution remained light blue.';
      }
    } else if (selectedReagent === 'benedicts') {
      if (!heatApplied) {
        color = '#3b82f6';
        obs = 'Benedict\'s reagent added. Heat the mixture in a water bath to observe color transition!';
      } else {
        if (selectedFoodSample === 'sampleC' || selectedFoodSample === 'sampleA') {
          color = '#dc2626'; // Brick red
          obs = 'POSITIVE FOR REDUCING SUGAR: Turned brick-red precipitate after heating.';
        } else {
          color = '#3b82f6';
          obs = 'NEGATIVE FOR REDUCING SUGAR: Remained blue after heating.';
        }
      }
    } else if (selectedReagent === 'ethanol') {
      if (selectedFoodSample === 'sampleB') {
        color = '#f8fafc'; // Emulsion white
        obs = 'POSITIVE FOR LIPIDS: A cloudy white emulsion formed upon pouring into water.';
      } else {
        color = '#cbd5e1';
        obs = 'NEGATIVE FOR LIPIDS: Solution remained clear with no emulsion.';
      }
    }

    setTestResultColor(color);
    setTestResultObs(obs);
    toast.success('Reagent reaction processed!');

    if (onSimulationUpdate) {
      onSimulationUpdate({
        foodSample: selectedFoodSample,
        reagent: selectedReagent,
        observation: obs
      });
    }
  };

  const generateQuadratSample = () => {
    const grid = [];
    for (let i = 1; i <= quadratCount; i++) {
      grid.push({
        id: i,
        plantA: Math.floor(Math.random() * 12) + 2, // e.g. Dandelion
        plantB: Math.floor(Math.random() * 8) // e.g. Clover
      });
    }
    setSampledGrid(grid);
    toast.success(`Generated ${quadratCount} random 1m² quadrat throws.`);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl p-4 md:p-6 text-slate-100">
      {/* Simulation Selector Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-emerald-400" />
            Biology Virtual Practical Simulation
          </h3>
          <p className="text-xs text-slate-400">
            {simType === 'biology_microscope' && 'Interactive Compound Microscope Simulator'}
            {simType === 'biology_food_test' && 'Biochemical Food Tests & Reagents Simulator'}
            {simType === 'biology_quadrat' && 'Ecology Field Sampling & Quadrat Simulator'}
          </p>
        </div>
        <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold">
          GCE Biology Practical Mode
        </div>
      </div>

      {/* 1. MICROSCOPE SIMULATOR */}
      {simType === 'biology_microscope' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Microscope Field View Display */}
          <div className="lg:col-span-7 bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center relative">
            <div className="text-xs text-slate-400 mb-2 font-mono flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Ocular Lens View ({magnification}0x Total Magnification)</span>
            </div>

            {/* Circular Eyepiece Frame */}
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-8 border-slate-800 bg-slate-900 overflow-hidden relative shadow-2xl flex items-center justify-center transition-all duration-300">
              {/* Image Canvas Mockup */}
              <div 
                className="w-full h-full relative transition-all duration-300 flex items-center justify-center bg-emerald-950/30"
                style={{
                  filter: `blur(${blurAmount}px)`,
                  transform: `scale(${magnification === 4 ? 0.8 : magnification === 10 ? 1.2 : magnification === 40 ? 2.2 : 3.5})`
                }}
              >
                {/* Cell Graphics */}
                <div className="grid grid-cols-3 gap-2 p-4 w-full h-full">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div 
                      key={i} 
                      className={`border-2 border-emerald-500/70 rounded-lg p-2 bg-emerald-900/40 relative flex items-center justify-center text-[10px] text-emerald-200 font-mono`}
                    >
                      {/* Nucleus */}
                      <div className="w-3 h-3 bg-purple-500 rounded-full absolute shadow-lg" />
                      {/* Cell Label Overlay */}
                      {showLabels && isFocused && i === 2 && (
                        <div className="absolute -top-3 left-0 bg-slate-900/90 text-amber-300 px-1 text-[8px] rounded border border-amber-500/40 whitespace-nowrap z-10">
                          Cell Wall & Nucleus
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Focus Status Indicator Overlay */}
              {!isFocused && (
                <div className="absolute bottom-4 bg-red-950/90 border border-red-500/50 text-red-300 text-[11px] px-3 py-1 rounded-full font-mono animate-pulse">
                  Unfocused: Adjust Fine Focus Knob
                </div>
              )}
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-slate-300 font-semibold">
                Specimen: {selectedSlide === 'onion' ? 'Onion Epidermal Cells (Allium cepa)' : selectedSlide === 'epithelial' ? 'Human Cheek Epithelial Cells' : selectedSlide === 'mitosis' ? 'Root Tip Mitotic Cells' : 'Motor Neuron Tissue'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isFocused ? '✓ Image sharply in focus. Observe cell boundaries.' : 'Use fine focus dial below.'}
              </p>
            </div>
          </div>

          {/* Microscope Controls */}
          <div className="lg:col-span-5 space-y-5 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Microscope Controls
            </h4>

            {/* Slide Selector */}
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-semibold">Select Prepared Slide:</label>
              <select
                value={selectedSlide}
                onChange={(e: any) => setSelectedSlide(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg p-2.5 text-slate-200 outline-none focus:border-emerald-500"
              >
                <option value="onion">Onion Epidermal Tissue (Plant Cell)</option>
                <option value="epithelial">Human Cheek Epithelial (Animal Cell)</option>
                <option value="mitosis">Allium Root Tip (Mitosis Stages)</option>
                <option value="nerve">Mammalian Motor Neuron (Nerve Tissue)</option>
              </select>
            </div>

            {/* Objective Lens Magnification */}
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-semibold">Objective Lens Magnification:</label>
              <div className="grid grid-cols-4 gap-2">
                {[4, 10, 40, 100].map((mag) => (
                  <button
                    key={mag}
                    onClick={() => setMagnification(mag as any)}
                    className={`py-2 rounded-lg text-xs font-bold font-mono transition ${
                      magnification === mag
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {mag}X
                  </button>
                ))}
              </div>
            </div>

            {/* Fine Focus Knob */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-semibold">
                <span>Fine Focus Adjustment:</span>
                <span className="text-emerald-400 font-mono">{focusLevel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={focusLevel}
                onChange={(e) => setFocusLevel(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-900 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Toggles */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-300">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span>Show Organelle Labels</span>
              </label>

              <button
                onClick={() => setFocusLevel(50)}
                className="text-emerald-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Auto-Focus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. BIOCHEMICAL FOOD TESTS SIMULATOR */}
      {simType === 'biology_food_test' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
            {/* Virtual Test Tube Rack */}
            <div className="w-full max-w-sm bg-slate-900 p-6 rounded-xl border border-slate-800 text-center space-y-4">
              <div className="relative w-20 h-48 mx-auto border-4 border-slate-700 rounded-b-3xl bg-slate-950 overflow-hidden flex flex-col justify-end shadow-2xl">
                {/* Liquid Level */}
                <div 
                  className="w-full transition-all duration-700"
                  style={{
                    height: testResultColor === 'transparent' ? '20%' : '65%',
                    backgroundColor: testResultColor === 'transparent' ? '#64748b' : testResultColor
                  }}
                />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Test Tube Observation
                </p>
                <p className="text-xs text-emerald-400 font-mono mt-1 bg-slate-950 p-3 rounded border border-slate-800 min-h-[60px] flex items-center justify-center">
                  {testResultObs}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-5 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Reagent Testing Panel
            </h4>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-semibold">Select Unknown Food Extract:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'sampleA', label: 'Extract A (Starch)' },
                  { id: 'sampleB', label: 'Extract B (Protein/Lipid)' },
                  { id: 'sampleC', label: 'Extract C (Glucose)' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedFoodSample(s.id as any)}
                    className={`p-2.5 rounded-lg text-xs font-semibold text-center transition ${
                      selectedFoodSample === s.id
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-semibold">Select Chemical Reagent:</label>
              <select
                value={selectedReagent}
                onChange={(e: any) => setSelectedReagent(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg p-2.5 text-slate-200 outline-none"
              >
                <option value="iodine">Iodine Solution (Starch Test)</option>
                <option value="biuret">Biuret Reagent (Protein Test)</option>
                <option value="benedicts">Benedict's Solution (Reducing Sugar Test)</option>
                <option value="ethanol">Ethanol + Water (Lipid Emulsion Test)</option>
              </select>
            </div>

            {selectedReagent === 'benedicts' && (
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="heat"
                  checked={heatApplied}
                  onChange={(e) => setHeatApplied(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-amber-500"
                />
                <label htmlFor="heat" className="text-xs text-amber-300 font-semibold cursor-pointer">
                  Heat in Water Bath (80°C for 3 mins)
                </label>
              </div>
            )}

            <button
              onClick={handleReagentTest}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs uppercase tracking-wider shadow-lg transition"
            >
              Mix Reagent & Observe Color Change
            </button>
          </div>
        </div>
      )}

      {/* 3. ECOLOGY QUADRAT SIMULATOR */}
      {simType === 'biology_quadrat' && (
        <div className="space-y-6">
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Grid className="w-4 h-4 text-emerald-400" />
                Random Quadrat Field Sampling (1m² Grid)
              </h4>
              <p className="text-xs text-slate-400">Simulate field ecology sampling across a grassland ecosystem.</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={generateQuadratSample}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow transition"
              >
                Throw {quadratCount} Quadrats
              </button>
            </div>
          </div>

          {sampledGrid.length > 0 && (
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase">
                    <th className="p-2">Quadrat #</th>
                    <th className="p-2">Plant Species A (Dandelion)</th>
                    <th className="p-2">Plant Species B (Clover)</th>
                    <th className="p-2">Total Individuals</th>
                  </tr>
                </thead>
                <tbody>
                  {sampledGrid.map((row) => (
                    <tr key={row.id} className="border-b border-slate-800/50 font-mono">
                      <td className="p-2 text-emerald-400">Quadrat #{row.id}</td>
                      <td className="p-2">{row.plantA}</td>
                      <td className="p-2">{row.plantB}</td>
                      <td className="p-2 font-bold text-white">{row.plantA + row.plantB}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
