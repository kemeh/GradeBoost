import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, Play, Pause, RotateCcw, Activity, 
  HelpCircle, CheckCircle2, Droplets
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { PracticalActivity } from '../../types';
import { toast } from 'react-hot-toast';

interface ChemistryLabProps {
  practical: PracticalActivity;
  onSimulationUpdate?: (state: any) => void;
}

export const ChemistryLab: React.FC<ChemistryLabProps> = ({
  practical,
  onSimulationUpdate
}) => {
  const simType = practical.simulationConfig?.simulationType || 'chemistry_titration';

  // Titration State
  const [buretteVolume, setBuretteVolume] = useState<number>(0.0); // mL added
  const [isDripping, setIsDripping] = useState<boolean>(false);
  const [dripRate, setDripRate] = useState<number>(0.5); // mL per second
  const [indicator, setIndicator] = useState<'phenolphthalein' | 'methyl_orange'>('phenolphthalein');
  const [titrationCurve, setTitrationCurve] = useState<Array<{ volume: number; ph: number }>>([
    { volume: 0.0, ph: 13.0 },
    { volume: 5.0, ph: 12.8 },
    { volume: 10.0, ph: 12.5 },
    { volume: 15.0, ph: 12.1 },
    { volume: 20.0, ph: 11.2 },
    { volume: 24.0, ph: 9.8 },
    { volume: 25.0, ph: 7.0 }, // Equivalence Point
    { volume: 26.0, ph: 3.2 },
    { volume: 30.0, ph: 1.8 }
  ]);

  // Automatic dripping timer
  useEffect(() => {
    let interval: any;
    if (isDripping && buretteVolume < 50.0) {
      interval = setInterval(() => {
        setBuretteVolume(prev => {
          const next = Number((prev + dripRate).toFixed(2));
          if (next >= 50.0) {
            setIsDripping(false);
            toast.success('Burette reached maximum volume limit.');
          }
          return next;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isDripping, buretteVolume, dripRate]);

  // pH calculation relative to equivalence point (25.0 mL)
  const computePH = (v: number) => {
    if (v < 24.0) return Number((13.0 - (v * 0.1)).toFixed(2));
    if (v >= 24.0 && v < 25.0) return Number((11.2 - ((v - 24) * 4.2)).toFixed(2));
    if (Math.abs(v - 25.0) < 0.2) return 7.0;
    if (v > 25.0 && v <= 26.0) return Number((7.0 - ((v - 25) * 3.8)).toFixed(2));
    return Number((3.2 - Math.min((v - 26) * 0.1, 1.8)).toFixed(2));
  };

  const currentPH = computePH(buretteVolume);

  // Flask Solution Color
  let solutionColor = '#ffffff';
  if (indicator === 'phenolphthalein') {
    if (currentPH >= 8.2) solutionColor = '#ec4899'; // Bright pink
    else solutionColor = '#f8fafc'; // Colorless
  } else {
    if (currentPH <= 3.1) solutionColor = '#ef4444'; // Red
    else if (currentPH >= 4.4) solutionColor = '#f59e0b'; // Yellow
    else solutionColor = '#f97316'; // Orange
  }

  const handleResetTitration = () => {
    setIsDripping(false);
    setBuretteVolume(0.0);
    toast.success('Titration reset to 0.0 mL.');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl p-4 md:p-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-purple-400" />
            Chemistry Volumetric Titration Laboratory
          </h3>
          <p className="text-xs text-slate-400">
            Standardized Acid-Base Titration (0.10M HCl into 25.0 cm³ NaOH)
          </p>
        </div>
        <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-xs font-semibold">
          Quantitative Chemical Analysis
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Titration Visualizer Apparatus */}
        <div className="lg:col-span-6 bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-between min-h-[420px]">
          <div className="w-full flex justify-between items-center text-xs font-mono mb-4">
            <span className="bg-slate-900 text-purple-300 px-3 py-1 rounded border border-slate-800">
              Burette Volume Added: <strong className="text-white">{buretteVolume.toFixed(2)} mL</strong>
            </span>
            <span className="bg-slate-900 text-emerald-400 px-3 py-1 rounded border border-slate-800 font-bold">
              pH: {currentPH.toFixed(1)}
            </span>
          </div>

          {/* Apparatus Graphic */}
          <div className="relative w-48 flex flex-col items-center my-4">
            {/* Burette Tube */}
            <div className="w-6 h-36 bg-slate-800 border-2 border-slate-600 rounded-t relative overflow-hidden flex flex-col justify-end">
              <div 
                className="w-full bg-blue-500/50 transition-all duration-300"
                style={{ height: `${Math.max(0, 100 - (buretteVolume / 50) * 100)}%` }}
              />
            </div>

            {/* Drip Animation */}
            {isDripping && (
              <div className="my-1 animate-bounce">
                <Droplets className="w-4 h-4 text-blue-400 fill-current" />
              </div>
            )}

            {/* Conical Flask */}
            <div className="w-32 h-28 border-2 border-slate-600 rounded-b-full bg-slate-950 relative overflow-hidden flex flex-col justify-end shadow-2xl mt-2">
              <div 
                className="w-full transition-colors duration-500 flex items-center justify-center text-[10px] font-mono text-slate-950 font-bold"
                style={{
                  height: '60%',
                  backgroundColor: solutionColor
                }}
              >
                {currentPH === 7.0 && 'Endpoint!'}
              </div>
            </div>
          </div>

          {/* pH Titration Curve Chart */}
          <div className="w-full h-36 bg-slate-900 p-2 rounded-lg border border-slate-800 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={titrationCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="volume" stroke="#94a3b8" fontSize={9} label={{ value: 'Titre Volume (mL)', position: 'insideBottom', offset: -2 }} />
                <YAxis stroke="#94a3b8" fontSize={9} domain={[0, 14]} label={{ value: 'pH', angle: -90, position: 'insideLeft' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontSize: '11px' }} />
                <Line type="monotone" dataKey="ph" stroke="#c084fc" strokeWidth={2} dot={{ fill: '#c084fc' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Titration Control Panel */}
        <div className="lg:col-span-6 space-y-5 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
            Stopcock & Indicator Controls
          </h4>

          <div>
            <label className="text-xs text-slate-300 block mb-1.5 font-semibold">Choose Indicator:</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'phenolphthalein', label: 'Phenolphthalein (pH 8.2-10.0)' },
                { id: 'methyl_orange', label: 'Methyl Orange (pH 3.1-4.4)' }
              ].map((ind) => (
                <button
                  key={ind.id}
                  onClick={() => setIndicator(ind.id as any)}
                  className={`p-2.5 rounded-lg text-xs font-semibold transition text-left ${
                    indicator === ind.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {ind.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1.5 font-semibold">Stopcock Flow Rate (mL / sec):</label>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={dripRate}
              onChange={(e) => setDripRate(Number(e.target.value))}
              className="w-full accent-purple-500 bg-slate-900 rounded-lg cursor-pointer h-2"
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              onClick={() => setIsDripping(!isDripping)}
              className={`flex-1 py-3 font-bold rounded-lg text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2 ${
                isDripping ? 'bg-amber-600 hover:bg-amber-500 text-slate-950' : 'bg-purple-600 hover:bg-purple-500 text-white'
              }`}
            >
              {isDripping ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isDripping ? 'Stop Stopcock Drip' : 'Start Stopcock Drip'}</span>
            </button>

            <button
              onClick={handleResetTitration}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              title="Reset Titration"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
