import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, Zap, Search, Eye, BookOpen, Bot, Award, RotateCcw, 
  Maximize2, Camera, HelpCircle, ChevronRight, Layers, Sliders, Play, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { 
  AssembledItem, 
  ChemistryState, 
  PhysicsState, 
  BiologyState, 
  ExperimentNotebook, 
  LabSubject 
} from './types';
import { EQUIPMENT_CATALOG } from './equipmentCatalog';
import { Lab3DCanvas } from './Lab3DCanvas';
import { EquipmentLibraryPanel } from './EquipmentLibraryPanel';
import { InteractiveWorkbenchControls } from './InteractiveWorkbenchControls';
import { LabSimulationHUD } from './LabSimulationHUD';
import { VirtualMicroscopeModal } from './VirtualMicroscopeModal';
import { LabNotebookDrawer } from './LabNotebookDrawer';
import { EdulphaAITutor3D } from './EdulphaAITutor3D';
import { ExperimentScoringModal } from './ExperimentScoringModal';
import { PracticalActivity, PracticalAttempt } from '../../../types';
import { Button } from '../../ui';
import { toast } from 'react-hot-toast';

interface VirtualLab3DContainerProps {
  practical?: PracticalActivity | null;
  onSubmitAttempt?: (reportData: any) => Promise<void>;
  lang?: 'en' | 'fr';
}

export const VirtualLab3DContainer: React.FC<VirtualLab3DContainerProps> = ({
  practical,
  onSubmitAttempt,
  lang = 'en'
}) => {
  // Determine Subject from practical prop or default to Chemistry
  const initialSubject: LabSubject = 
    practical?.subject === 'Physics' ? 'Physics' :
    practical?.subject === 'Biology' ? 'Biology' : 'Chemistry';

  const [activeSubject, setActiveSubject] = useState<LabSubject>(initialSubject);
  const [cameraPreset, setCameraPreset] = useState<'workbench' | 'room' | 'closeup' | 'topdown'>('workbench');

  // Assembled 3D Workbench Items
  const [assembledItems, setAssembledItems] = useState<AssembledItem[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);

  // Subject States
  const [chemistryState, setChemistryState] = useState<ChemistryState>({
    buretteVolume: 50.0,
    buretteAddedVolume: 0.0,
    isTapOpen: false,
    dripRate: 0.5,
    flaskAnalyte: 'NaOH',
    flaskVolume: 25.0,
    flaskConcentration: 0.1,
    buretteTitrant: 'HCl',
    buretteConcentration: 0.1,
    indicator: 'phenolphthalein',
    ph: 13.0,
    temperature: 24.5,
    isBunsenLit: false,
    bunsenFlameType: 'safety'
  });

  const [physicsState, setPhysicsState] = useState<PhysicsState>({
    voltageInput: 6.0,
    isSwitchClosed: false,
    resistanceValue: 50,
    rheostatPosition: 50,
    currentCalculated: 0.12,
    bulbGlowing: true,
    bulbBrightness: 0.6,
    isBulbBurntOut: false,
    pendulumLength: 0.8,
    pendulumAngle: 15,
    isPendulumSwinging: false,
    gravity: 9.8,
    laserOn: true,
    prismAngle: 60,
    refractiveIndex: 1.52
  });

  const [biologyState, setBiologyState] = useState<BiologyState>({
    selectedSpecimen: 'onion_epidermis',
    objectivePower: 10,
    coarseFocus: 50,
    fineFocus: 50,
    stainApplied: 'iodine',
    lightIntensity: 80,
    diaphragmAperture: 80,
    slideMounted: true
  });

  // History for Dynamic Charts
  const [titrationHistory, setTitrationHistory] = useState<Array<{ volume: number; ph: number }>>([
    { volume: 0.0, ph: 13.0 }
  ]);
  const [circuitHistory, setCircuitHistory] = useState<Array<{ voltage: number; current: number }>>([
    { voltage: 0.0, current: 0.0 }
  ]);

  // Notebook State
  const [notebook, setNotebook] = useState<ExperimentNotebook>({
    aim: practical?.title || `Volumetric Analysis & Scientific Investigation (${activeSubject})`,
    apparatus: [],
    procedure: practical?.instructions || 'Standard GCE practical assembly & observation.',
    dataObservations: [],
    calculations: '',
    conclusion: ''
  });

  // Modals & Drawers
  const [showMicroscopeModal, setShowMicroscopeModal] = useState(false);
  const [showNotebookDrawer, setShowNotebookDrawer] = useState(false);
  const [showAITutor, setShowAITutor] = useState(false);
  const [showScoringModal, setShowScoringModal] = useState(false);

  // Initialize Default Initial 3D Apparatus on Workbench based on active subject
  useEffect(() => {
    if (activeSubject === 'Chemistry') {
      setAssembledItems([
        {
          instanceId: 'inst_retort_stand',
          equipmentId: 'chem_retort_stand',
          position: [0.12, 0, -0.1],
          rotation: [0, 0, 0],
          stateData: {}
        },
        {
          instanceId: 'inst_burette',
          equipmentId: 'chem_burette_50ml',
          position: [0.08, 0.45, -0.1],
          rotation: [0, 0, 0],
          isClamped: true,
          clampedToId: 'inst_retort_stand',
          stateData: {}
        },
        {
          instanceId: 'inst_conical_flask',
          equipmentId: 'chem_conical_flask_250ml',
          position: [0.08, 0, -0.1],
          rotation: [0, 0, 0],
          stateData: {}
        },
        {
          instanceId: 'inst_bunsen',
          equipmentId: 'chem_bunsen_burner',
          position: [-0.6, 0, 0.2],
          rotation: [0, 0, 0],
          stateData: {}
        }
      ]);
    } else if (activeSubject === 'Physics') {
      setAssembledItems([
        {
          instanceId: 'inst_power_supply',
          equipmentId: 'phys_power_supply',
          position: [-0.6, 0, -0.2],
          rotation: [0, 0, 0],
          stateData: {}
        },
        {
          instanceId: 'inst_ammeter',
          equipmentId: 'phys_ammeter',
          position: [-0.1, 0, -0.2],
          rotation: [0, 0, 0],
          stateData: {}
        },
        {
          instanceId: 'inst_voltmeter',
          equipmentId: 'phys_voltmeter',
          position: [0.4, 0, -0.2],
          rotation: [0, 0, 0],
          stateData: {}
        },
        {
          instanceId: 'inst_bulb',
          equipmentId: 'phys_bulb_holder',
          position: [0, 0, 0.2],
          rotation: [0, 0, 0],
          stateData: {}
        },
        {
          instanceId: 'inst_pendulum',
          equipmentId: 'phys_pendulum',
          position: [0.8, 0, 0.1],
          rotation: [0, 0, 0],
          stateData: {}
        }
      ]);
    } else {
      setAssembledItems([
        {
          instanceId: 'inst_microscope',
          equipmentId: 'bio_microscope',
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          stateData: {}
        },
        {
          instanceId: 'inst_slides',
          equipmentId: 'bio_glass_slides',
          position: [0.5, 0, 0.2],
          rotation: [0, 0, 0],
          stateData: {}
        },
        {
          instanceId: 'inst_stains',
          equipmentId: 'bio_staining_kit',
          position: [-0.5, 0, 0.2],
          rotation: [0, 0, 0],
          stateData: {}
        }
      ]);
    }
  }, [activeSubject]);

  // Titration Drip Timer & Reaction Calculation
  useEffect(() => {
    let interval: any;
    if (activeSubject === 'Chemistry' && chemistryState.isTapOpen && chemistryState.buretteAddedVolume < 50.0) {
      interval = setInterval(() => {
        setChemistryState((prev) => {
          const nextAdded = Number((prev.buretteAddedVolume + prev.dripRate).toFixed(2));
          const nextRem = Number((50.0 - nextAdded).toFixed(2));

          // Compute pH curve around equivalence point (25.0 cm³)
          let computedPH = 13.0;
          if (nextAdded < 24.0) computedPH = Number((13.0 - nextAdded * 0.1).toFixed(2));
          else if (nextAdded >= 24.0 && nextAdded < 25.0) computedPH = Number((11.2 - (nextAdded - 24) * 4.2).toFixed(2));
          else if (Math.abs(nextAdded - 25.0) < 0.2) computedPH = 7.0;
          else if (nextAdded > 25.0 && nextAdded <= 26.0) computedPH = Number((7.0 - (nextAdded - 25) * 3.8).toFixed(2));
          else computedPH = Number((3.2 - Math.min((nextAdded - 26) * 0.1, 1.8)).toFixed(2));

          setTitrationHistory((h) => [...h, { volume: nextAdded, ph: computedPH }]);

          if (nextAdded >= 50.0) {
            toast.success('Burette reached 50.0 cm³ limit.');
            return { ...prev, buretteAddedVolume: 50.0, buretteVolume: 0, isTapOpen: false, ph: computedPH };
          }
          return { ...prev, buretteAddedVolume: nextAdded, buretteVolume: nextRem, ph: computedPH };
        });
      }, 400);
    }
    return () => clearInterval(interval);
  }, [activeSubject, chemistryState.isTapOpen, chemistryState.buretteAddedVolume]);

  // Add Equipment from Panel to 3D Scene
  const handleAddEquipment = (itemDef: any) => {
    const newId = `inst_${itemDef.modelType}_${Date.now()}`;
    const newItem: AssembledItem = {
      instanceId: newId,
      equipmentId: itemDef.id,
      position: [(Math.random() - 0.5) * 1.2, 0, (Math.random() - 0.5) * 0.6],
      rotation: [0, 0, 0],
      stateData: {}
    };
    setAssembledItems((prev) => [...prev, newItem]);
    setSelectedInstanceId(newId);
    toast.success(`Added ${itemDef.name} to 3D Workbench.`);
  };

  // Remove Equipment
  const handleRemoveInstance = (id: string) => {
    setAssembledItems((prev) => prev.filter((i) => i.instanceId !== id));
    if (selectedInstanceId === id) setSelectedInstanceId(null);
  };

  // Update Position
  const handleUpdatePosition = (id: string, newPos: [number, number, number]) => {
    setAssembledItems((prev) =>
      prev.map((i) => (i.instanceId === id ? { ...i, position: newPos } : i))
    );
  };

  // Update Rotation
  const handleUpdateRotation = (id: string, newRot: [number, number, number]) => {
    setAssembledItems((prev) =>
      prev.map((i) => (i.instanceId === id ? { ...i, rotation: newRot } : i))
    );
  };

  // Log Measurement into Lab Notebook
  const handleLogCurrentMeasurement = () => {
    let valStr = '';
    if (activeSubject === 'Chemistry') {
      valStr = `Volume: ${chemistryState.buretteAddedVolume.toFixed(2)} cm³, pH: ${chemistryState.ph.toFixed(2)}, Temp: ${chemistryState.temperature}°C`;
    } else if (activeSubject === 'Physics') {
      valStr = `Voltage: ${physicsState.voltageInput} V, Current: ${physicsState.currentCalculated} A, Resistance: ${physicsState.resistanceValue} Ω`;
    } else {
      valStr = `Specimen: ${biologyState.selectedSpecimen}, Power: ${biologyState.objectivePower * 10}x, Stain: ${biologyState.stainApplied}`;
    }

    const newObs = {
      step: `Measurement #${notebook.dataObservations.length + 1}`,
      timestamp: new Date().toLocaleTimeString(),
      value: valStr,
      notes: `${activeSubject} 3D Workbench observation`
    };

    setNotebook((prev) => ({
      ...prev,
      dataObservations: [...prev.dataObservations, newObs]
    }));
    toast.success('Logged measurement into Lab Notebook!');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden p-4 md:p-6 space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        {/* Subject Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
            {(['Chemistry', 'Physics', 'Biology'] as LabSubject[]).map((subj) => (
              <button
                key={subj}
                onClick={() => setActiveSubject(subj)}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeSubject === subj
                    ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {subj === 'Chemistry' ? <FlaskConical className="w-4 h-4 text-purple-300" /> : subj === 'Physics' ? <Zap className="w-4 h-4 text-amber-300" /> : <Eye className="w-4 h-4 text-emerald-300" />}
                <span>{subj} 3D Lab</span>
              </button>
            ))}
          </div>
        </div>

        {/* Camera Angles & Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Camera Presets */}
          <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
            <button
              onClick={() => setCameraPreset('workbench')}
              className={`px-2.5 py-1 rounded-lg transition-all ${cameraPreset === 'workbench' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
            >
              Workbench
            </button>
            <button
              onClick={() => setCameraPreset('room')}
              className={`px-2.5 py-1 rounded-lg transition-all ${cameraPreset === 'room' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
            >
              Full Room
            </button>
            <button
              onClick={() => setCameraPreset('closeup')}
              className={`px-2.5 py-1 rounded-lg transition-all ${cameraPreset === 'closeup' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
            >
              Close-up
            </button>
          </div>

          {/* Action Drawers */}
          <button
            onClick={() => setShowNotebookDrawer(true)}
            className="p-2 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span>{lang === 'fr' ? 'Cahier' : 'Lab Notebook'}</span>
          </button>

          <button
            onClick={() => setShowAITutor(true)}
            className="p-2 bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white border border-purple-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Bot className="w-4 h-4" />
            <span>Edulpha AI Assistant</span>
          </button>

          <button
            onClick={() => setShowScoringModal(true)}
            className="p-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg"
          >
            <Award className="w-4 h-4" />
            <span>{lang === 'fr' ? 'Évaluer & Soumettre' : 'Evaluate & Submit'}</span>
          </button>
        </div>
      </div>

      {/* Main 3D Lab Area: Grid of Canvas & Sidebars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[580px] flex-1">
        {/* Left: Apparatus Library Panel (3 cols) */}
        <div className="lg:col-span-3 h-full">
          <EquipmentLibraryPanel
            subject={activeSubject}
            onAddEquipment={handleAddEquipment}
            lang={lang}
          />
        </div>

        {/* Center: Interactive 3D WebGL Canvas & Live HUD (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-3 h-full">
          {/* Live Readout HUD */}
          <LabSimulationHUD
            subject={activeSubject}
            chemistryState={chemistryState}
            physicsState={physicsState}
            biologyState={biologyState}
            titrationHistory={titrationHistory}
            circuitHistory={circuitHistory}
            lang={lang}
          />

          {/* 3D WebGL Viewport */}
          <div className="flex-1 min-h-[420px] relative">
            <Lab3DCanvas
              subject={activeSubject}
              assembledItems={assembledItems}
              selectedInstanceId={selectedInstanceId}
              onSelectInstance={(id) => setSelectedInstanceId(id)}
              onUpdatePosition={handleUpdatePosition}
              chemistryState={chemistryState}
              physicsState={physicsState}
              biologyState={biologyState}
              cameraPreset={cameraPreset}
              onOpenMicroscopeModal={() => setShowMicroscopeModal(true)}
            />
          </div>
        </div>

        {/* Right: Interactive Workbench Controls (3 cols) */}
        <div className="lg:col-span-3 h-full">
          <InteractiveWorkbenchControls
            subject={activeSubject}
            assembledItems={assembledItems}
            selectedInstanceId={selectedInstanceId}
            onRemoveInstance={handleRemoveInstance}
            onUpdatePosition={handleUpdatePosition}
            onUpdateRotation={handleUpdateRotation}
            chemistryState={chemistryState}
            setChemistryState={setChemistryState}
            physicsState={physicsState}
            setPhysicsState={setPhysicsState}
            biologyState={biologyState}
            setBiologyState={setBiologyState}
            onOpenMicroscopeModal={() => setShowMicroscopeModal(true)}
            lang={lang}
          />
        </div>
      </div>

      {/* MODALS & DRAWERS */}
      <VirtualMicroscopeModal
        isOpen={showMicroscopeModal}
        onClose={() => setShowMicroscopeModal(false)}
        biologyState={biologyState}
        setBiologyState={setBiologyState}
        lang={lang}
      />

      <LabNotebookDrawer
        isOpen={showNotebookDrawer}
        onClose={() => setShowNotebookDrawer(false)}
        subject={activeSubject}
        notebook={notebook}
        setNotebook={setNotebook}
        onLogCurrentMeasurement={handleLogCurrentMeasurement}
        lang={lang}
      />

      <EdulphaAITutor3D
        isOpen={showAITutor}
        onClose={() => setShowAITutor(false)}
        subject={activeSubject}
        assembledItems={assembledItems}
        chemistryState={chemistryState}
        physicsState={physicsState}
        biologyState={biologyState}
        lang={lang}
      />

      <ExperimentScoringModal
        isOpen={showScoringModal}
        onClose={() => setShowScoringModal(false)}
        onSubmitReport={async () => {
          setShowScoringModal(false);
          if (onSubmitAttempt) {
            await onSubmitAttempt({
              aim: notebook.aim,
              apparatus: notebook.apparatus.join(', '),
              procedure: notebook.procedure,
              observations: notebook.dataObservations.map((o) => `${o.step}: ${o.value}`).join('\n'),
              results: `Titration / Circuit final state verified`,
              analysis: notebook.calculations || 'Standard GCE scientific analysis',
              conclusion: notebook.conclusion || 'Practical objectives successfully accomplished.'
            });
          }
        }}
        subject={activeSubject}
        scoreBreakdown={{
          apparatusSelection: Math.min(25, assembledItems.length * 6),
          workbenchAssembly: 24,
          proceduralPrecision: 23,
          notebookAccuracy: notebook.dataObservations.length > 0 ? 25 : 15
        }}
        lang={lang}
      />
    </div>
  );
};
