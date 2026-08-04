import React, { useState } from 'react';
import { 
  Zap, Sliders, Activity, RotateCcw, LineChart, 
  HelpCircle, Compass, Layers, CheckCircle2
} from 'lucide-react';
import { ResponsiveContainer, LineChart as ReLineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { PracticalActivity } from '../../types';
import { toast } from 'react-hot-toast';

interface PhysicsLabProps {
  practical: PracticalActivity;
  onSimulationUpdate?: (state: any) => void;
}

export const PhysicsLab: React.FC<PhysicsLabProps> = ({
  practical,
  onSimulationUpdate
}) => {
  const simType = practical.simulationConfig?.simulationType || 'physics_ohms_law';

  // Ohm's Law Circuit State
  const [voltage, setVoltage] = useState<number>(6.0); // Volts
  const [resistorValue, setResistorValue] = useState<number>(50); // Ohms
  const [circuitOpen, setCircuitOpen] = useState<boolean>(true);
  const [recordedData, setRecordedData] = useState<Array<{ voltage: number; current: number }>>([
    { voltage: 2.0, current: 0.04 },
    { voltage: 4.0, current: 0.08 },
    { voltage: 6.0, current: 0.12 },
    { voltage: 8.0, current: 0.16 },
    { voltage: 10.0, current: 0.20 }
  ]);

  // Hooke's Law Mechanics State
  const [appliedMassGrams, setAppliedMassGrams] = useState<number>(200); // grams
  const [hookeData, setHookeData] = useState<Array<{ massGrams: number; forceN: number; extensionCm: number }>>([
    { massGrams: 100, forceN: 0.98, extensionCm: 2.0 },
    { massGrams: 200, forceN: 1.96, extensionCm: 4.1 },
    { massGrams: 300, forceN: 2.94, extensionCm: 6.0 },
    { massGrams: 400, forceN: 3.92, extensionCm: 8.2 }
  ]);

  // Refraction Optics State
  const [angleIncidence, setAngleIncidence] = useState<number>(30); // degrees
  const [glassIndex, setGlassIndex] = useState<number>(1.52); // glass refractive index

  // Ohm's Law Current Calculation: I = V / R
  const currentAmps = circuitOpen ? Number((voltage / resistorValue).toFixed(3)) : 0;

  // Snell's Law Refraction Angle: sin(r) = sin(i) / n -> r = asin(sin(i)/n)
  const sinI = Math.sin((angleIncidence * Math.PI) / 180);
  const sinR = sinI / glassIndex;
  const angleRefraction = Number(((Math.asin(sinR) * 180) / Math.PI).toFixed(1));

  const handleRecordCircuitPoint = () => {
    if (!circuitOpen) {
      toast.error('Switch on the circuit switch first!');
      return;
    }
    const newPoint = { voltage, current: currentAmps };
    setRecordedData(prev => [...prev.filter(p => p.voltage !== voltage), newPoint].sort((a, b) => a.voltage - b.voltage));
    toast.success(`Recorded V = ${voltage}V, I = ${currentAmps}A`);
    if (onSimulationUpdate) onSimulationUpdate({ recordedData });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl p-4 md:p-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Physics Virtual Laboratory
          </h3>
          <p className="text-xs text-slate-400">
            {simType === 'physics_ohms_law' && 'Ohm\'s Law Circuit & Resistance Measurement'}
            {simType === 'physics_optics' && 'Geometrical Optics & Refraction ray simulator'}
            {simType === 'physics_motion' && 'Mechanics & Hooke\'s Law Spring Stretching'}
          </p>
        </div>
        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-semibold">
          Interactive Physics Engine
        </span>
      </div>

      {/* 1. OHM'S LAW SIMULATOR */}
      {simType === 'physics_ohms_law' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Virtual Circuit Visualizer */}
          <div className="lg:col-span-6 bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div className="border-2 border-dashed border-amber-500/30 p-6 rounded-xl bg-slate-900/60 relative space-y-6">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="bg-slate-900 text-amber-400 px-3 py-1 rounded border border-amber-500/30 font-bold">
                  DC POWER SUPPLY: {voltage.toFixed(1)} V
                </span>
                <button
                  onClick={() => setCircuitOpen(!circuitOpen)}
                  className={`px-3 py-1 rounded font-bold transition ${
                    circuitOpen ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                  }`}
                >
                  SWITCH: {circuitOpen ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Circuit Meters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">DC Voltmeter</span>
                  <span className="text-xl font-mono font-bold text-amber-400">{circuitOpen ? voltage.toFixed(2) : '0.00'} V</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">DC Ammeter</span>
                  <span className="text-xl font-mono font-bold text-emerald-400">{currentAmps.toFixed(3)} A</span>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded text-center text-xs font-mono text-slate-300 border border-slate-800">
                Resistor Value (R): <span className="text-amber-300 font-bold">{resistorValue} Ω</span>
              </div>
            </div>

            {/* V vs I Real-Time Graph */}
            <div className="mt-6">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Characteristic V vs I Curve
              </h4>
              <div className="h-44 w-full bg-slate-950 p-2 rounded-lg border border-slate-800">
                <ResponsiveContainer width="100%" height="100%">
                  <ReLineChart data={recordedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="current" stroke="#94a3b8" fontSize={10} label={{ value: 'Current (A)', position: 'insideBottom', offset: -2 }} />
                    <YAxis stroke="#94a3b8" fontSize={10} label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="voltage" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
                  </ReLineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="lg:col-span-6 space-y-5 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Circuit Knob Settings
            </h4>

            {/* Voltage Adjustment Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-semibold">
                <span>DC Voltage Knob:</span>
                <span className="text-amber-400 font-mono">{voltage.toFixed(1)} V</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={voltage}
                onChange={(e) => setVoltage(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-900 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Resistor Value Selector */}
            <div>
              <label className="text-xs text-slate-300 block mb-1.5 font-semibold">Resistor Standard Rating:</label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 25, 50, 100].map((r) => (
                  <button
                    key={r}
                    onClick={() => setResistorValue(r)}
                    className={`py-2 rounded-lg text-xs font-bold font-mono transition ${
                      resistorValue === r
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {r} Ω
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRecordCircuitPoint}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider shadow-lg transition"
            >
              Record Data Point (V = {voltage}V, I = {currentAmps}A)
            </button>
          </div>
        </div>
      )}

      {/* 2. OPTICS / REFRACTION SIMULATOR */}
      {simType === 'physics_optics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center relative">
            <div className="w-full h-64 bg-slate-900 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center">
              {/* Rectangular Glass Block */}
              <div className="w-48 h-32 bg-blue-500/20 border-2 border-blue-400/50 rounded flex items-center justify-center text-xs font-mono text-blue-300">
                Glass Block (n = {glassIndex})
              </div>

              {/* Light Ray Simulation Lines */}
              <div 
                className="absolute h-0.5 bg-amber-400 shadow-[0_0_10px_#f59e0b] origin-right"
                style={{
                  width: '120px',
                  transform: `rotate(${angleIncidence}deg)`,
                  top: '50%',
                  left: '15%'
                }}
              />
            </div>

            <div className="mt-4 text-center text-xs font-mono text-slate-300">
              Angle of Incidence (i): <span className="text-amber-400 font-bold">{angleIncidence}°</span> | Angle of Refraction (r): <span className="text-emerald-400 font-bold">{angleRefraction}°</span>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Ray Box Angle Controls
            </h4>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-semibold">
                <span>Angle of Incidence (i):</span>
                <span className="text-amber-400 font-mono">{angleIncidence}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="85"
                value={angleIncidence}
                onChange={(e) => setAngleIncidence(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-900 rounded-lg cursor-pointer h-2"
              />
            </div>

            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2 text-xs font-mono">
              <p className="text-slate-400">Calculated Snell's Ratio:</p>
              <p className="text-emerald-400 font-bold">
                n = sin({angleIncidence}°) / sin({angleRefraction}°) = {glassIndex}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
