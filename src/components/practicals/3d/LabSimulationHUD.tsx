import React, { useState } from 'react';
import { 
  Activity, Thermometer, Droplets, Zap, Gauge, Clock, 
  BarChart2, AlertCircle, ChevronDown, ChevronUp 
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ChemistryState, PhysicsState, BiologyState, LabSubject } from './types';

interface LabSimulationHUDProps {
  subject: LabSubject;
  chemistryState: ChemistryState;
  physicsState: PhysicsState;
  biologyState: BiologyState;
  titrationHistory: Array<{ volume: number; ph: number }>;
  circuitHistory: Array<{ voltage: number; current: number }>;
  lang: 'en' | 'fr';
}

export const LabSimulationHUD: React.FC<LabSimulationHUDProps> = ({
  subject,
  chemistryState,
  physicsState,
  biologyState,
  titrationHistory,
  circuitHistory,
  lang
}) => {
  const [showChartModal, setShowChartModal] = useState(false);

  return (
    <div className="space-y-3">
      {/* HUD Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {subject === 'Chemistry' && (
          <>
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Burette Dispensed</span>
                <Droplets className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-black font-mono text-white">
                  {chemistryState.buretteAddedVolume.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-slate-400">cm³ (mL)</span>
              </div>
            </div>

            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Analyte pH</span>
                <Activity className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-black font-mono text-purple-300">
                  {chemistryState.ph.toFixed(2)}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  chemistryState.ph < 7 ? 'bg-rose-500/20 text-rose-300' : chemistryState.ph > 7 ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {chemistryState.ph < 7 ? 'Acidic' : chemistryState.ph > 7 ? 'Alkaline' : 'Neutral'}
                </span>
              </div>
            </div>

            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Temperature</span>
                <Thermometer className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-black font-mono text-rose-300">
                  {chemistryState.temperature.toFixed(1)}
                </span>
                <span className="text-xs font-bold text-slate-400">°C</span>
              </div>
            </div>

            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Indicator</span>
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs font-bold text-white capitalize truncate">
                  {chemistryState.indicator}
                </span>
                <button
                  onClick={() => setShowChartModal(!showChartModal)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <BarChart2 className="w-4 h-4 text-indigo-400" />
                </button>
              </div>
            </div>
          </>
        )}

        {subject === 'Physics' && (
          <>
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">DC Voltage</span>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-black font-mono text-amber-300">
                  {(physicsState.isSwitchClosed ? physicsState.voltageInput : 0).toFixed(2)}
                </span>
                <span className="text-xs font-bold text-slate-400">V</span>
              </div>
            </div>

            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Current (Ammeter)</span>
                <Gauge className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-black font-mono text-sky-300">
                  {(physicsState.isSwitchClosed ? physicsState.currentCalculated : 0).toFixed(3)}
                </span>
                <span className="text-xs font-bold text-slate-400">A</span>
              </div>
            </div>

            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Resistance</span>
                <span className="text-[11px] font-bold text-slate-400">Ω</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-black font-mono text-emerald-300">
                  {physicsState.resistanceValue}
                </span>
                <span className="text-xs font-bold text-slate-400">Ohms</span>
              </div>
            </div>

            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Circuit Status</span>
                <button onClick={() => setShowChartModal(!showChartModal)} className="text-indigo-400 hover:text-white">
                  <BarChart2 className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  physicsState.isSwitchClosed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {physicsState.isSwitchClosed ? 'Closed (ON)' : 'Open (OFF)'}
                </span>
              </div>
            </div>
          </>
        )}

        {subject === 'Biology' && (
          <>
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Objective Turret</span>
              <span className="text-xl font-black font-mono text-emerald-400">
                {biologyState.objectivePower}x
              </span>
            </div>

            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Zoom</span>
              <span className="text-xl font-black font-mono text-teal-300">
                {biologyState.objectivePower * 10}x
              </span>
            </div>

            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Coarse Focus</span>
              <span className="text-xl font-black font-mono text-sky-300">
                {biologyState.coarseFocus}%
              </span>
            </div>

            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Stain Applied</span>
              <span className="text-xs font-bold text-amber-300 capitalize truncate">
                {biologyState.stainApplied}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Dynamic Graph Chart Drawer */}
      {showChartModal && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              <span>
                {subject === 'Chemistry'
                  ? (lang === 'fr' ? 'Courbe de Titrage pH' : 'Live Titration Curve (pH vs Volume)')
                  : (lang === 'fr' ? 'Caractéristique Tension-Courant (V-I)' : 'Live V-I Circuit Curve')}
              </span>
            </h4>
            <button
              onClick={() => setShowChartModal(false)}
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              Close
            </button>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {subject === 'Chemistry' ? (
                <LineChart data={titrationHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="volume" stroke="#94a3b8" label={{ value: 'Volume (mL)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis domain={[0, 14]} stroke="#94a3b8" label={{ value: 'pH', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                  <Line type="monotone" dataKey="ph" stroke="#c084fc" strokeWidth={3} dot={false} />
                </LineChart>
              ) : (
                <LineChart data={circuitHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="voltage" stroke="#94a3b8" label={{ value: 'Voltage (V)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" label={{ value: 'Current (A)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                  <Line type="monotone" dataKey="current" stroke="#38bdf8" strokeWidth={3} dot={false} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
