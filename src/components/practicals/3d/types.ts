export type LabSubject = 'Chemistry' | 'Physics' | 'Biology';

export type EquipmentCategory = 
  | 'glassware' 
  | 'reagents' 
  | 'measuring' 
  | 'heating' 
  | 'support' 
  | 'electrical' 
  | 'optical' 
  | 'mechanics' 
  | 'biological' 
  | 'dissection';

export interface EquipmentItem {
  id: string;
  name: string;
  nameFr?: string;
  subject: LabSubject;
  category: EquipmentCategory;
  description: string;
  descriptionFr?: string;
  iconName: string;
  defaultPosition?: [number, number, number];
  modelType: 
    | 'burette'
    | 'pipette'
    | 'conical_flask'
    | 'beaker'
    | 'measuring_cylinder'
    | 'test_tube'
    | 'test_tube_rack'
    | 'retort_stand'
    | 'bunsen_burner'
    | 'tripod_stand'
    | 'thermometer'
    | 'ph_meter'
    | 'reagent_bottle'
    | 'balance'
    | 'ammeter'
    | 'voltmeter'
    | 'power_supply'
    | 'bulb'
    | 'resistor'
    | 'rheostat'
    | 'switch'
    | 'connecting_wire'
    | 'pendulum'
    | 'stopwatch'
    | 'meter_rule'
    | 'vernier_caliper'
    | 'micrometer'
    | 'lens_convex'
    | 'mirror_concave'
    | 'prism'
    | 'ray_box'
    | 'microscope'
    | 'glass_slide'
    | 'petri_dish'
    | 'dissection_tray'
    | 'scalpel_forceps';
  safetyWarning?: string;
  safetyWarningFr?: string;
}

export interface AssembledItem {
  instanceId: string;
  equipmentId: string;
  position: [number, number, number];
  rotation: [number, number, number]; // pitch, yaw, roll in radians
  isClamped?: boolean;
  clampedToId?: string;
  connectedToIds?: string[];
  stateData: Record<string, any>;
}

export interface ChemistryState {
  buretteVolume: number; // mL remaining (0 to 50)
  buretteAddedVolume: number; // mL dispensed (0 to 50)
  isTapOpen: boolean;
  dripRate: number; // mL per second
  flaskAnalyte: 'NaOH' | 'HCl' | 'CH3COOH' | 'Water';
  flaskVolume: number; // mL
  flaskConcentration: number; // Molarity (e.g. 0.1M)
  buretteTitrant: 'HCl' | 'NaOH' | 'KMnO4';
  buretteConcentration: number; // Molarity
  indicator: 'none' | 'phenolphthalein' | 'methyl_orange' | 'litmus' | 'universal';
  ph: number;
  temperature: number; // °C
  isBunsenLit: boolean;
  bunsenFlameType: 'safety' | 'heating';
  precipitateColor?: string | null;
  gasEvolution?: boolean;
}

export interface PhysicsState {
  voltageInput: number; // Volts (0-12V)
  isSwitchClosed: boolean;
  resistanceValue: number; // Ohms
  rheostatPosition: number; // 0 to 100%
  currentCalculated: number; // Amperes
  bulbGlowing: boolean;
  bulbBrightness: number; // 0 to 1
  isBulbBurntOut: boolean;
  // Pendulum
  pendulumLength: number; // Meters (0.2 to 1.5m)
  pendulumAngle: number; // Degrees
  isPendulumSwinging: boolean;
  gravity: number; // m/s² (9.8 Earth, 1.6 Moon)
  // Optics
  laserOn: boolean;
  prismAngle: number;
  refractiveIndex: number;
}

export interface BiologyState {
  selectedSpecimen: 'onion_epidermis' | 'leaf_stomata' | 'human_blood' | 'amoeba' | 'xylem_stem';
  objectivePower: 4 | 10 | 40 | 100;
  coarseFocus: number; // 0 to 100
  fineFocus: number; // 0 to 100
  stainApplied: 'none' | 'iodine' | 'methylene_blue';
  lightIntensity: number; // 0 to 100
  diaphragmAperture: number; // 0 to 100
  slideMounted: boolean;
}

export interface ExperimentNotebook {
  aim: string;
  apparatus: string[];
  procedure: string;
  dataObservations: Array<{ step: string; timestamp: string; value: string; notes: string }>;
  calculations: string;
  conclusion: string;
}

export interface ActionLog {
  timestamp: string;
  action: string;
  details: string;
  isError?: boolean;
}
