import { EquipmentItem } from './types';

export const EQUIPMENT_CATALOG: EquipmentItem[] = [
  // ================= CHEMISTRY GLASSWARE & REAGENTS =================
  {
    id: 'chem_burette_50ml',
    name: '50 mL Glass Burette with PTFE Tap',
    nameFr: 'Burette graduée 50 mL avec robinet',
    subject: 'Chemistry',
    category: 'glassware',
    description: 'Precision volumetric glassware for dispensing accurately measured liquid titrants in volumetric analysis.',
    descriptionFr: 'Verrerie volumétrique de précision pour le dosage titrimétrique.',
    iconName: 'FlaskConical',
    modelType: 'burette',
    safetyWarning: 'Handle glass stem with care. Ensure tap is closed before pouring liquid.',
    safetyWarningFr: 'Manipuler avec soin. S\'assurer que le robinet est fermé.'
  },
  {
    id: 'chem_pipette_25ml',
    name: '25 mL Volumetric Pipette & Rubber Filler',
    nameFr: 'Pipette jaugée 25 mL et poire à pipeter',
    subject: 'Chemistry',
    category: 'glassware',
    description: 'Delivers exactly 25.0 cm³ of analyte solution into a titration conical flask.',
    descriptionFr: 'Prélève exactement 25,0 cm³ de solution d\'analyse.',
    iconName: 'Pipette',
    modelType: 'pipette',
    safetyWarning: 'Never mouth pipette! Always attach rubber filler bulb.',
    safetyWarningFr: 'Ne jamais pipeter à la bouche! Utiliser la poire.'
  },
  {
    id: 'chem_conical_flask_250ml',
    name: '250 mL Erlenmeyer Conical Flask',
    nameFr: 'Fiole Erlenmeyer 250 mL',
    subject: 'Chemistry',
    category: 'glassware',
    description: 'Flat-bottomed narrow-neck conical flask ideal for swirling reaction mixtures without splashing.',
    descriptionFr: 'Fiole à col étroit idéale pour agiter les mélanges réactionnels.',
    iconName: 'FlaskConical',
    modelType: 'conical_flask'
  },
  {
    id: 'chem_beaker_250ml',
    name: '250 mL Pyrex Glass Beaker',
    nameFr: 'Bécher en verre 250 mL',
    subject: 'Chemistry',
    category: 'glassware',
    description: 'Cylindrical glass container used for mixing, heating, and holding titrant liquids.',
    descriptionFr: 'Récipient cylindrique pour mélanger et chauffer les liquides.',
    iconName: 'CupSoda',
    modelType: 'beaker'
  },
  {
    id: 'chem_measuring_cylinder_100ml',
    name: '100 mL Graduated Cylinder',
    nameFr: 'Éprouvette graduée 100 mL',
    subject: 'Chemistry',
    category: 'glassware',
    description: 'Used for measuring moderate liquid volumes with reading meniscus level.',
    descriptionFr: 'Pour mesurer des volumes liquides moyens avec lecture du ménisque.',
    iconName: 'Ruler',
    modelType: 'measuring_cylinder'
  },
  {
    id: 'chem_test_tube_rack',
    name: 'Test Tube Rack & 6 Glass Test Tubes',
    nameFr: 'Support à tubes à essai et 6 tubes',
    subject: 'Chemistry',
    category: 'glassware',
    description: 'Wooden rack holding test tubes for qualitative ion analysis and small-scale reactions.',
    descriptionFr: 'Support en bois avec tubes à essai pour analyses qualitatives.',
    iconName: 'Boxes',
    modelType: 'test_tube_rack'
  },
  {
    id: 'chem_retort_stand',
    name: 'Heavy Iron Retort Stand & Bosshead Clamp',
    nameFr: 'Support statif lourd et pince de fixation',
    subject: 'Chemistry',
    category: 'support',
    description: 'Heavy metal base with vertical steel rod and clamp to securely hold burette upright.',
    descriptionFr: 'Base métallique lourde avec tige verticale et pince pour fixer la burette.',
    iconName: 'Anchor',
    modelType: 'retort_stand'
  },
  {
    id: 'chem_bunsen_burner',
    name: 'Bunsen Burner & Heat Mat',
    nameFr: 'Bec Bunsen et plaque réfractaire',
    subject: 'Chemistry',
    category: 'heating',
    description: 'Adjustable gas burner providing safety yellow flame and hot blue heating flame.',
    descriptionFr: 'Brûleur à gaz réglable avec flamme jaune de sécurité et bleu de chauffe.',
    iconName: 'Flame',
    modelType: 'bunsen_burner',
    safetyWarning: 'Light with striker or match on safety flame (air collar closed). Wear safety goggles.',
    safetyWarningFr: 'Allumer sur flamme de sécurité. Porter des lunettes de protection.'
  },
  {
    id: 'chem_tripod_gauze',
    name: 'Tripod Stand & Wire Gauze with Ceramic Center',
    nameFr: 'Trépied et toile métallique avec centre céramique',
    subject: 'Chemistry',
    category: 'heating',
    description: 'Three-legged metal support holding wire gauze to evenly distribute flame heat under beakers.',
    descriptionFr: 'Support à 3 pieds et toile métallique pour répartir la chaleur sous les béchers.',
    iconName: 'Triangle',
    modelType: 'tripod_stand'
  },
  {
    id: 'chem_thermometer',
    name: 'Digital & Alcohol Thermometer (-10°C to 110°C)',
    nameFr: 'Thermomètre numérique (-10°C à 110°C)',
    subject: 'Chemistry',
    category: 'measuring',
    description: 'Immersion glass thermometer for measuring reaction temperature changes.',
    descriptionFr: 'Thermomètre à immersion pour mesurer la température des réactions.',
    iconName: 'Thermometer',
    modelType: 'thermometer'
  },
  {
    id: 'chem_ph_meter',
    name: 'Digital Precision pH Probe & Meter',
    nameFr: 'pH-mètre numérique de précision',
    subject: 'Chemistry',
    category: 'measuring',
    description: 'Digital electronic probe displaying real-time pH values from 0.00 to 14.00.',
    descriptionFr: 'Sonde numérique affichant le pH en temps réel de 0,00 à 14,00.',
    iconName: 'Activity',
    modelType: 'ph_meter'
  },
  {
    id: 'chem_balance',
    name: 'Digital Analytical Electronic Balance (0.001g)',
    nameFr: 'Balance électronique d\'analyse (0,001 g)',
    subject: 'Chemistry',
    category: 'measuring',
    description: 'High precision digital scale for weighing solid chemical reagents and precipitates.',
    descriptionFr: 'Balance numérique haute précision pour peser les réactifs solides.',
    iconName: 'Scale',
    modelType: 'balance'
  },
  {
    id: 'chem_reagents_titration',
    name: 'Reagent Set: 0.1M HCl, 0.1M NaOH & Indicators',
    nameFr: 'Flacons de réactifs: 0,1M HCl, 0,1M NaOH et Indicateurs',
    subject: 'Chemistry',
    category: 'reagents',
    description: 'Standard volumetric solutions and pH indicator dropper bottles (Phenolphthalein & Methyl Orange).',
    descriptionFr: 'Solutions étalons et flacons d\'indicateurs colorés.',
    iconName: 'Droplet',
    modelType: 'reagent_bottle',
    safetyWarning: 'Corrosive acids & alkalis. In case of spill, wash immediately with water.',
    safetyWarningFr: 'Acides et bases corrosifs. En cas de projection, rincer immédiatement.'
  },

  // ================= PHYSICS EQUIPMENT =================
  {
    id: 'phys_ammeter',
    name: 'Analogue & Digital Multimeter (Ammeter 0-5A)',
    nameFr: 'Ampèremètre analogique et numérique (0-5A)',
    subject: 'Physics',
    category: 'electrical',
    description: 'Instrument used to measure electrical current flowing through a circuit branch in amperes.',
    descriptionFr: 'Instrument pour mesurer l\'intensité du courant électrique en ampères.',
    iconName: 'Gauge',
    modelType: 'ammeter',
    safetyWarning: 'Always connect Ammeter IN SERIES with the load. Never connect across power supply directly!',
    safetyWarningFr: 'Toujours brancher l\'ampèremètre EN SÉRIE. Ne jamais brancher en parallèle!'
  },
  {
    id: 'phys_voltmeter',
    name: 'Analogue & Digital Voltmeter (0-15V)',
    nameFr: 'Voltmètre analogique et numérique (0-15V)',
    subject: 'Physics',
    category: 'electrical',
    description: 'Measures potential difference (voltage) across any electrical component or circuit junction.',
    descriptionFr: 'Mesure la différence de potentiel (tension) aux bornes d\'un composant.',
    iconName: 'Zap',
    modelType: 'voltmeter'
  },
  {
    id: 'phys_power_supply',
    name: 'Variable Regulated DC Power Supply Unit (0-12V)',
    nameFr: 'Alimentation stabilisée CC variable (0-12V)',
    subject: 'Physics',
    category: 'electrical',
    description: 'Benchtop power source providing adjustable direct current (DC) voltage output.',
    descriptionFr: 'Source de tension continue réglable pour circuits de laboratoire.',
    iconName: 'BatteryCharging',
    modelType: 'power_supply'
  },
  {
    id: 'phys_bulb_holder',
    name: '6V 0.3A Filament Lamp & Socket Holder',
    nameFr: 'Lampe à incandescence 6V 0,3A et douille',
    subject: 'Physics',
    category: 'electrical',
    description: 'Filament light bulb that glows brightly when current flows, demonstrating electrical power conversion.',
    descriptionFr: 'Lampe à incandescence illustrant la conversion d\'énergie électrique en lumière.',
    iconName: 'Lightbulb',
    modelType: 'bulb'
  },
  {
    id: 'phys_resistors',
    name: 'Precision Carbon Film Resistors (10Ω, 50Ω, 100Ω)',
    nameFr: 'Résistances à film de carbone (10Ω, 50Ω, 100Ω)',
    subject: 'Physics',
    category: 'electrical',
    description: 'Standard fixed resistance components for testing Ohm\'s Law V = I × R.',
    descriptionFr: 'Composants à résistance fixe pour vérifier la loi d\'Ohm V = I × R.',
    iconName: 'Cpu',
    modelType: 'resistor'
  },
  {
    id: 'phys_rheostat',
    name: 'Sliding Wire Rheostat (Variable Resistor 0-50Ω)',
    nameFr: 'Rhéostat à curseur (Résistance variable 0-50Ω)',
    subject: 'Physics',
    category: 'electrical',
    description: 'Heavy wire-wound sliding rheostat for smoothly varying current in experimental circuits.',
    descriptionFr: 'Rhéostat bobiné à curseur pour faire varier l\'intensité du courant.',
    iconName: 'Sliders',
    modelType: 'rheostat'
  },
  {
    id: 'phys_switch',
    name: 'Single Pole Knife Switch',
    nameFr: 'Interrupteur à couteau unipolaire',
    subject: 'Physics',
    category: 'electrical',
    description: 'Mechanical switch lever used to safely open or close electrical circuit loops.',
    descriptionFr: 'Levier mécanique pour ouvrir ou fermer les circuits électriques.',
    iconName: 'ToggleRight',
    modelType: 'switch'
  },
  {
    id: 'phys_wires',
    name: 'Heavy Duty Banana Plug Connecting Lead Wires',
    nameFr: 'Câbles de connexion bananes renforcés',
    subject: 'Physics',
    category: 'electrical',
    description: 'Red (positive) and Black (negative) flexible copper wire leads with stackable banana plugs.',
    descriptionFr: 'Fils de cuivre rouge (positif) et noir (négatif) à fiches bananes.',
    iconName: 'Cable',
    modelType: 'connecting_wire'
  },
  {
    id: 'phys_pendulum',
    name: 'Simple Pendulum Rig & Brass Bob',
    nameFr: 'Dispositif de pendule simple et bille en laiton',
    subject: 'Physics',
    category: 'mechanics',
    description: 'Suspended brass mass on light string for measuring period of oscillation vs string length L.',
    descriptionFr: 'Masse suspendue pour mesurer la période d\'oscillation en fonction de la longueur L.',
    iconName: 'Orbit',
    modelType: 'pendulum'
  },
  {
    id: 'phys_stopwatch',
    name: 'Digital Precision Stopwatch (0.01s)',
    nameFr: 'Chronomètre numérique de précision (0,01 s)',
    subject: 'Physics',
    category: 'measuring',
    description: 'Electronic timer with lap time memory for timing oscillations and kinematic motions.',
    descriptionFr: 'Minuteur électronique pour mesurer le temps des oscillations.',
    iconName: 'Clock',
    modelType: 'stopwatch'
  },
  {
    id: 'phys_vernier_caliper',
    name: 'Stainless Steel Vernier Caliper (0.02 mm)',
    nameFr: 'Pied à coulisse au 1/50e en acier inoxyable',
    subject: 'Physics',
    category: 'measuring',
    description: 'Precision measuring tool with main scale and vernier thimble for internal/external diameters.',
    descriptionFr: 'Instrument de précision pour mesurer les diamètres intérieurs et extérieurs.',
    iconName: 'Minimize2',
    modelType: 'vernier_caliper'
  },
  {
    id: 'phys_micrometer',
    name: 'Micrometer Screw Gauge (0.01 mm)',
    nameFr: 'Palmer / Micromètre à vis (0,01 mm)',
    subject: 'Physics',
    category: 'measuring',
    description: 'Rotary ratchet gauge for measuring wire thickness, foil sheets, and small sphere diameters.',
    descriptionFr: 'Instrument à rochet pour mesurer l\'épaisseur des fils et petits objets.',
    iconName: 'Maximize2',
    modelType: 'micrometer'
  },
  {
    id: 'phys_prism_optics',
    name: 'Glass Equilateral Prism & Ray Box System',
    nameFr: 'Prisme équilatéral en verre et boîte à rayons',
    subject: 'Physics',
    category: 'optical',
    description: 'Optical glass prism with collimated ray light box for optics dispersion & refraction experiments.',
    descriptionFr: 'Prisme en verre avec boîte à lumière pour étudier la réfraction et la dispersion.',
    iconName: 'Sun',
    modelType: 'prism'
  },

  // ================= BIOLOGY EQUIPMENT =================
  {
    id: 'bio_microscope',
    name: 'Binocular Compound Student Microscope (40x-1000x)',
    nameFr: 'Microscope optique binoculaire d\'étude (40x-1000x)',
    subject: 'Biology',
    category: 'biological',
    description: 'High quality optical microscope with revolving nosepiece (4x, 10x, 40x, 100x oil), coaxial coarse & fine focus knobs.',
    descriptionFr: 'Microscope optique de précision avec objectifs rotatifs et mise au point micrométrique.',
    iconName: 'Search',
    modelType: 'microscope'
  },
  {
    id: 'bio_glass_slides',
    name: 'Glass Microscope Slides & Cover Slips Set',
    nameFr: 'Lames de verre et lamelles couvre-objet',
    subject: 'Biology',
    category: 'biological',
    description: 'Clear glass specimen mounting slides with ultra-thin square cover slips for wet mount preparation.',
    descriptionFr: 'Lames en verre dégraissé et lamelles pour préparations microscopiques.',
    iconName: 'Square',
    modelType: 'glass_slide'
  },
  {
    id: 'bio_staining_kit',
    name: 'Biological Staining Reagents (Iodine & Methylene Blue)',
    nameFr: 'Kit de coloration biologique (Iode et Bleu de Méthylène)',
    subject: 'Biology',
    category: 'reagents',
    description: 'Dropper bottles containing Lugol\'s Iodine (stains plant starch/cell wall) and Methylene Blue (stains cell nucleus).',
    descriptionFr: 'Flacons compte-gouttes d\'iode et bleu de méthylène pour mettre en évidence les structures cellulaires.',
    iconName: 'Eye',
    modelType: 'reagent_bottle'
  },
  {
    id: 'bio_dissection_kit',
    name: 'Dissecting Tray, Scalpel, Fine Forceps & Mounted Needle',
    nameFr: 'Cuvette à dissection, bistouri, pinces et aiguille montée',
    subject: 'Biology',
    category: 'dissection',
    description: 'Wax-lined dissection tray with stainless steel scalpel, dissecting scissors, and precision forceps.',
    descriptionFr: 'Matériel complet de dissection en acier inoxydable.',
    iconName: 'Scissors',
    modelType: 'dissection_tray'
  },
  {
    id: 'bio_petri_dish',
    name: 'Sterile Glass Petri Dishes (90mm)',
    nameFr: 'Boîtes de Pétri en verre stérile (90mm)',
    subject: 'Biology',
    category: 'biological',
    description: 'Shallow cylindrical glass dish with lid used to culture cells or hold plant leaf specimens.',
    descriptionFr: 'Boîtes cylindriques pour la culture de cellules et l\'observation de spécimens végétaux.',
    iconName: 'Circle',
    modelType: 'petri_dish'
  }
];
