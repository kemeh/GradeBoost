import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  GraduationCap, 
  BookOpen, 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Loader2, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Check, 
  Sparkles, 
  SlidersHorizontal,
  ChevronRight,
  Database,
  ArrowUpDown,
  BookMarked,
  FileCheck,
  FolderPlus,
  Compass,
  ExternalLink
} from 'lucide-react';
import { 
  HNDSchool, 
  HNDDepartment, 
  HNDProgramme, 
  HNDCourse, 
  HNDAcademicLevel, 
  HNDSemester 
} from '../../types/hnd';
import { 
  getHNDSchools, 
  saveHNDSchool, 
  deleteHNDSchool,
  getHNDDepartments, 
  saveHNDDepartment, 
  deleteHNDDepartment,
  getHNDProgrammes, 
  saveHNDProgramme, 
  deleteHNDProgramme,
  getHNDCourses, 
  saveHNDCourse, 
  deleteHNDCourse,
  seedHNDDefaults
} from '../../services/hndService';
import { Card, Button, Badge, cn } from '../ui';
import { toast } from 'react-hot-toast';
import { handleFirestoreError, OperationType } from '../../utils/firestoreErrors';
import {
  getInstitutions,
  getProgrammes as getServiceProgrammes,
  saveInstitution,
  saveProgramme as saveServiceProgramme,
  runInstitutionSync,
  getSyncLogs,
  getInstitutionRequests,
  Institution,
  Programme as ServiceProgramme,
  InstitutionSyncLog
} from '../../services/institutionService';

export const AdminHNDManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'programmes' | 'departments' | 'schools' | 'courses' | 'levels' | 'institutions' | 'sync' | 'requests'>('programmes');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Core HND Data
  const [schools, setSchools] = useState<HNDSchool[]>([]);
  const [departments, setDepartments] = useState<HNDDepartment[]>([]);
  const [programmes, setProgrammes] = useState<HNDProgramme[]>([]);
  const [courses, setCourses] = useState<HNDCourse[]>([]);

  // Institution & Sync Data
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [serviceProgrammes, setServiceProgrammes] = useState<ServiceProgramme[]>([]);
  const [syncLogs, setSyncLogs] = useState<InstitutionSyncLog[]>([]);
  const [institutionRequests, setInstitutionRequests] = useState<any[]>([]);

  // Modals & Forms for institutions
  const [showInstitutionModal, setShowInstitutionModal] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Partial<Institution> | null>(null);
  const [institutionForm, setInstitutionForm] = useState<Partial<Institution>>({
    name: '',
    official_name: '',
    acronym: '',
    institution_type: 'Private Higher Institute',
    city: '',
    region: 'Center',
    country: 'Cameroon',
    website: '',
    hnd_available: true,
    bts_available: true,
    verification_status: 'verified',
    is_active: true
  });

  const [showInstitutionProgModal, setShowInstitutionProgModal] = useState(false);
  const [editingInstitutionProg, setEditingInstitutionProg] = useState<Partial<ServiceProgramme> | null>(null);
  const [institutionProgForm, setInstitutionProgForm] = useState<Partial<ServiceProgramme>>({
    institution_id: '',
    qualification_type: 'HND',
    programme_name: '',
    specialization: '',
    is_active: true,
    verification_status: 'verified'
  });

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>('all');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [selectedProgFilter, setSelectedProgFilter] = useState<string>('all');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('all');
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<string>('all');

  // Modal Dialog States
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<Partial<HNDSchool> | null>(null);

  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Partial<HNDDepartment> | null>(null);

  const [showProgModal, setShowProgModal] = useState(false);
  const [editingProg, setEditingProg] = useState<Partial<HNDProgramme> | null>(null);

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Partial<HNDCourse> | null>(null);

  // Form State Buffers
  const [schoolForm, setSchoolForm] = useState<Partial<HNDSchool>>({
    name: '',
    nameFr: '',
    code: '',
    description: '',
    descriptionFr: '',
    isActive: true,
    order: 1
  });

  const [deptForm, setDeptForm] = useState<Partial<HNDDepartment>>({
    name: '',
    nameFr: '',
    code: '',
    schoolId: '',
    description: '',
    isActive: true,
    order: 1
  });

  const [progForm, setProgForm] = useState<Partial<HNDProgramme>>({
    name: '',
    nameFr: '',
    code: '',
    schoolId: '',
    departmentId: '',
    durationYears: 2,
    levels: ['HND Level 1', 'HND Level 2'],
    semesters: ['Semester 1', 'Semester 2'],
    description: '',
    admissionRequirements: '',
    careerProspects: [],
    isActive: true,
    order: 1
  });

  const [courseForm, setCourseForm] = useState<Partial<HNDCourse>>({
    name: '',
    nameFr: '',
    code: '',
    programmeId: '',
    level: 'HND Level 1',
    semester: 'Semester 1',
    creditValue: 3,
    description: '',
    lecturer: '',
    isPractical: false,
    syllabus: [],
    recommendedBooks: [],
    isActive: true,
    order: 1
  });

  // Auxiliary syllabus/prospect line item state
  const [tempSyllabusItem, setTempSyllabusItem] = useState('');
  const [tempCareerItem, setTempCareerItem] = useState('');

  useEffect(() => {
    loadAllHNDData();
  }, []);

  const loadAllHNDData = async (force = false) => {
    setLoading(true);
    try {
      const [
        fetchedSchools,
        fetchedDepts,
        fetchedProgs,
        fetchedCourses,
        fetchedInsts,
        fetchedServiceProgs,
        fetchedLogs,
        fetchedReqs
      ] = await Promise.all([
        getHNDSchools(force),
        getHNDDepartments(undefined, force),
        getHNDProgrammes(undefined, force),
        getHNDCourses(undefined, force),
        getInstitutions(),
        getServiceProgrammes(),
        getSyncLogs(),
        getInstitutionRequests()
      ]);
      setSchools(fetchedSchools);
      setDepartments(fetchedDepts);
      setProgrammes(fetchedProgs);
      setCourses(fetchedCourses);
      setInstitutions(fetchedInsts);
      setServiceProgrammes(fetchedServiceProgs);
      setSyncLogs(fetchedLogs);
      setInstitutionRequests(fetchedReqs);
    } catch (err) {
      console.error('Error loading HND administration data:', err);
      toast.error('Failed to load HND configuration.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // SCHOOL HANDLERS
  // ==========================================
  const handleOpenSchoolModal = (school?: HNDSchool) => {
    if (school) {
      setEditingSchool(school);
      setSchoolForm({ ...school });
    } else {
      setEditingSchool(null);
      setSchoolForm({
        name: '',
        nameFr: '',
        code: '',
        description: '',
        descriptionFr: '',
        isActive: true,
        order: schools.length + 1
      });
    }
    setShowSchoolModal(true);
  };

  const handleSaveSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolForm.name || !schoolForm.code) {
      toast.error('Please provide school name and code.');
      return;
    }
    setActionLoading(true);
    try {
      await saveHNDSchool({
        ...schoolForm,
        id: editingSchool?.id
      });
      toast.success(editingSchool ? 'HND School updated successfully!' : 'HND School added!');
      setShowSchoolModal(false);
      await loadAllHNDData(true);
    } catch (err) {
      handleFirestoreError(err, editingSchool ? OperationType.UPDATE : OperationType.CREATE, 'hnd_schools');
      toast.error('Failed to save HND School.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSchool = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the school "${name}"? Associated departments and programmes may be affected.`)) {
      return;
    }
    setActionLoading(true);
    try {
      await deleteHNDSchool(id);
      toast.success('HND School removed.');
      await loadAllHNDData(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `hnd_schools/${id}`);
      toast.error('Failed to delete school.');
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // DEPARTMENT HANDLERS
  // ==========================================
  const handleOpenDeptModal = (dept?: HNDDepartment) => {
    if (dept) {
      setEditingDept(dept);
      setDeptForm({ ...dept });
    } else {
      setEditingDept(null);
      setDeptForm({
        name: '',
        nameFr: '',
        code: '',
        schoolId: schools[0]?.id || '',
        description: '',
        isActive: true,
        order: departments.length + 1
      });
    }
    setShowDeptModal(true);
  };

  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code || !deptForm.schoolId) {
      toast.error('Please provide department name, code, and select a parent school.');
      return;
    }
    setActionLoading(true);
    try {
      const parentSchool = schools.find(s => s.id === deptForm.schoolId);
      await saveHNDDepartment({
        ...deptForm,
        schoolName: parentSchool?.name,
        id: editingDept?.id
      });
      toast.success(editingDept ? 'HND Department updated!' : 'HND Department created!');
      setShowDeptModal(false);
      await loadAllHNDData(true);
    } catch (err) {
      handleFirestoreError(err, editingDept ? OperationType.UPDATE : OperationType.CREATE, 'hnd_departments');
      toast.error('Failed to save HND Department.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDepartment = async (id: string, name: string) => {
    if (!window.confirm(`Delete department "${name}"?`)) return;
    setActionLoading(true);
    try {
      await deleteHNDDepartment(id);
      toast.success('HND Department deleted.');
      await loadAllHNDData(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `hnd_departments/${id}`);
      toast.error('Failed to delete department.');
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // PROGRAMME HANDLERS
  // ==========================================
  const handleOpenProgModal = (prog?: HNDProgramme) => {
    if (prog) {
      setEditingProg(prog);
      setProgForm({ ...prog });
    } else {
      setEditingProg(null);
      const defaultDept = departments[0];
      setProgForm({
        name: '',
        nameFr: '',
        code: '',
        schoolId: defaultDept?.schoolId || schools[0]?.id || '',
        departmentId: defaultDept?.id || '',
        durationYears: 2,
        levels: ['HND Level 1', 'HND Level 2'],
        semesters: ['Semester 1', 'Semester 2'],
        description: '',
        admissionRequirements: 'Advanced Level (GCE A/L) with at least 2 papers, Baccalauréat, or equivalent diploma.',
        careerProspects: [],
        isActive: true,
        order: programmes.length + 1
      });
    }
    setShowProgModal(true);
  };

  const handleSaveProgramme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progForm.name || !progForm.code || !progForm.departmentId) {
      toast.error('Please enter programme title, code, and parent department.');
      return;
    }
    setActionLoading(true);
    try {
      const parentDept = departments.find(d => d.id === progForm.departmentId);
      const parentSchool = schools.find(s => s.id === (progForm.schoolId || parentDept?.schoolId));
      await saveHNDProgramme({
        ...progForm,
        schoolId: parentSchool?.id || progForm.schoolId,
        schoolName: parentSchool?.name,
        departmentName: parentDept?.name,
        id: editingProg?.id
      });
      toast.success(editingProg ? 'HND Programme updated!' : 'HND Programme created successfully!');
      setShowProgModal(false);
      await loadAllHNDData(true);
    } catch (err) {
      handleFirestoreError(err, editingProg ? OperationType.UPDATE : OperationType.CREATE, 'hnd_programmes');
      toast.error('Failed to save HND Programme.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProgramme = async (id: string, name: string) => {
    if (!window.confirm(`Delete programme "${name}" and all associated courses?`)) return;
    setActionLoading(true);
    try {
      await deleteHNDProgramme(id);
      toast.success('HND Programme deleted.');
      await loadAllHNDData(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `hnd_programmes/${id}`);
      toast.error('Failed to delete programme.');
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // COURSE HANDLERS
  // ==========================================
  const handleOpenCourseModal = (course?: HNDCourse) => {
    if (course) {
      setEditingCourse(course);
      setCourseForm({ ...course });
    } else {
      setEditingCourse(null);
      const defaultProg = programmes[0];
      setCourseForm({
        name: '',
        nameFr: '',
        code: '',
        programmeId: defaultProg?.id || '',
        level: 'HND Level 1',
        semester: 'Semester 1',
        creditValue: 3,
        description: '',
        lecturer: '',
        isPractical: false,
        syllabus: [],
        recommendedBooks: [],
        isActive: true,
        order: courses.length + 1
      });
    }
    setShowCourseModal(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.name || !courseForm.code || !courseForm.programmeId) {
      toast.error('Please fill in course title, code, and select an HND Programme.');
      return;
    }
    setActionLoading(true);
    try {
      const parentProg = programmes.find(p => p.id === courseForm.programmeId);
      await saveHNDCourse({
        ...courseForm,
        programmeName: parentProg?.name,
        programmeCode: parentProg?.code,
        schoolId: parentProg?.schoolId,
        departmentId: parentProg?.departmentId,
        id: editingCourse?.id
      });
      toast.success(editingCourse ? 'HND Course updated!' : 'HND Course created successfully!');
      setShowCourseModal(false);
      await loadAllHNDData(true);
    } catch (err) {
      handleFirestoreError(err, editingCourse ? OperationType.UPDATE : OperationType.CREATE, 'hnd_courses');
      toast.error('Failed to save HND Course.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCourse = async (id: string, name: string) => {
    if (!window.confirm(`Delete course "${name}"?`)) return;
    setActionLoading(true);
    try {
      await deleteHNDCourse(id);
      toast.success('HND Course removed.');
      await loadAllHNDData(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `hnd_courses/${id}`);
      toast.error('Failed to delete course.');
    } finally {
      setActionLoading(false);
    }
  };

  // Seed standard default hierarchy
  const handleSeedDefaults = async () => {
    if (!window.confirm('This will seed the comprehensive Higher National Diploma (HND) standard hierarchy into Firestore (Schools, Departments, Programmes, and Courses). Continue?')) {
      return;
    }
    setActionLoading(true);
    try {
      await seedHNDDefaults();
      toast.success('HND standard curriculum successfully seeded!');
      await loadAllHNDData(true);
    } catch (err) {
      console.error('Error seeding HND defaults:', err);
      toast.error('Failed to seed HND curriculum defaults.');
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // INSTITUTION DIRECTORY HANDLERS
  // ==========================================
  const handleOpenInstitutionModal = (inst?: Institution) => {
    if (inst) {
      setEditingInstitution(inst);
      setInstitutionForm({ ...inst });
    } else {
      setEditingInstitution(null);
      setInstitutionForm({
        name: '',
        official_name: '',
        acronym: '',
        institution_type: 'Private Higher Institute',
        city: '',
        region: 'Center',
        country: 'Cameroon',
        website: '',
        hnd_available: true,
        bts_available: true,
        verification_status: 'verified',
        is_active: true
      });
    }
    setShowInstitutionModal(true);
  };

  const handleSaveInstitutionForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionForm.name || !institutionForm.city || !institutionForm.region) {
      toast.error('Name, City, and Region are required.');
      return;
    }
    setActionLoading(true);
    try {
      await saveInstitution(institutionForm);
      toast.success(editingInstitution ? 'Institution updated!' : 'Institution added successfully!');
      setShowInstitutionModal(false);
      await loadAllHNDData();
    } catch (err) {
      console.error('Failed to save institution:', err);
      toast.error('Failed to save institution.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleInstitutionActive = async (inst: Institution) => {
    try {
      await saveInstitution({
        ...inst,
        is_active: !inst.is_active
      });
      toast.success(`Institution ${inst.is_active ? 'deactivated' : 'activated'}!`);
      await loadAllHNDData();
    } catch (err) {
      console.error('Failed to toggle status:', err);
      toast.error('Failed to toggle active status.');
    }
  };

  const handleOpenInstitutionProgModal = (instId: string, prog?: ServiceProgramme) => {
    if (prog) {
      setEditingInstitutionProg(prog);
      setInstitutionProgForm({ ...prog });
    } else {
      setEditingInstitutionProg(null);
      setInstitutionProgForm({
        institution_id: instId,
        qualification_type: 'HND',
        programme_name: '',
        specialization: '',
        is_active: true,
        verification_status: 'verified'
      });
    }
    setShowInstitutionProgModal(true);
  };

  const handleSaveInstitutionProgForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionProgForm.programme_name) {
      toast.error('Programme name is required.');
      return;
    }
    setActionLoading(true);
    try {
      await saveServiceProgramme(institutionProgForm);
      toast.success(editingInstitutionProg ? 'Accredited programme updated!' : 'Accredited programme added!');
      setShowInstitutionProgModal(false);
      await loadAllHNDData();
    } catch (err) {
      console.error('Failed to save programme:', err);
      toast.error('Failed to save programme.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSyncInstitutionsNow = async () => {
    setActionLoading(true);
    toast.loading('Starting Institution Registry Synchronization...', { id: 'sync-progress' });
    try {
      const log = await runInstitutionSync();
      if (log.status === 'success') {
        toast.success(`Sync complete! Added: ${log.records_added}, Updated: ${log.records_updated}`, { id: 'sync-progress' });
      } else {
        toast.error(`Sync failed: ${log.error_message}`, { id: 'sync-progress' });
      }
      await loadAllHNDData();
    } catch (err) {
      console.error('Sync failed:', err);
      toast.error('Failed to run sync.', { id: 'sync-progress' });
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered Lists
  const filteredProgrammes = useMemo(() => {
    return programmes.filter(prog => {
      if (selectedSchoolFilter !== 'all' && prog.schoolId !== selectedSchoolFilter) return false;
      if (selectedDeptFilter !== 'all' && prog.departmentId !== selectedDeptFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = prog.name?.toLowerCase().includes(term);
        const matchesCode = prog.code?.toLowerCase().includes(term);
        const matchesDept = prog.departmentName?.toLowerCase().includes(term);
        if (!matchesName && !matchesCode && !matchesDept) return false;
      }
      return true;
    });
  }, [programmes, selectedSchoolFilter, selectedDeptFilter, searchTerm]);

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      if (selectedProgFilter !== 'all' && course.programmeId !== selectedProgFilter) return false;
      if (selectedLevelFilter !== 'all' && course.level !== selectedLevelFilter) return false;
      if (selectedSemesterFilter !== 'all' && course.semester !== selectedSemesterFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = course.name?.toLowerCase().includes(term);
        const matchesCode = course.code?.toLowerCase().includes(term);
        const matchesLecturer = course.lecturer?.toLowerCase().includes(term);
        if (!matchesName && !matchesCode && !matchesLecturer) return false;
      }
      return true;
    });
  }, [courses, selectedProgFilter, selectedLevelFilter, selectedSemesterFilter, searchTerm]);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 min-h-[350px]">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 font-bold text-sm">Loading HND Academic Hierarchy...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* Top Banner / Metrics Overview */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-indigo-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-400/20">
              <GraduationCap size={14} /> Higher National Diploma (HND) Studio
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              HND Academic Architecture & Programmes
            </h2>
            <p className="text-sm text-indigo-200 max-w-2xl font-medium leading-relaxed">
              Dynamically configure HND Schools, Departments, Degree Programmes, Semesters, Academic Levels, and Course Modules with real-time Firestore persistence.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => loadAllHNDData(true)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold rounded-2xl h-11 px-4 flex items-center gap-2"
            >
              <RefreshCw size={15} />
              Refresh
            </Button>
            <Button
              onClick={handleSeedDefaults}
              disabled={actionLoading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-2xl h-11 px-5 flex items-center gap-2 shadow-md"
            >
              <Sparkles size={15} />
              Seed Standard Hierarchy
            </Button>
          </div>
        </div>

        {/* Quick Stat Pill Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-indigo-800/60">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-[11px] font-bold text-indigo-300 uppercase">Schools / Faculties</p>
            <p className="text-2xl font-black text-white mt-1">{schools.length}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-[11px] font-bold text-indigo-300 uppercase">Departments</p>
            <p className="text-2xl font-black text-white mt-1">{departments.length}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-[11px] font-bold text-indigo-300 uppercase">Programmes</p>
            <p className="text-2xl font-black text-white mt-1">{programmes.length}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-[11px] font-bold text-indigo-300 uppercase">Course Modules</p>
            <p className="text-2xl font-black text-white mt-1">{courses.length}</p>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'programmes', label: 'Programmes / Specialties', icon: GraduationCap, count: programmes.length },
            { id: 'courses', label: 'Course Modules', icon: BookOpen, count: courses.length },
            { id: 'departments', label: 'Departments', icon: Layers, count: departments.length },
            { id: 'schools', label: 'Schools / Faculties', icon: Building2, count: schools.length },
            { id: 'levels', label: 'Levels & Semesters', icon: SlidersHorizontal, count: 2 },
            { id: 'institutions', label: 'Institution Directory', icon: Database, count: institutions.length },
            { id: 'sync', label: 'Sync Center', icon: RefreshCw, count: syncLogs.length },
            { id: 'requests', label: 'Custom Requests', icon: AlertCircle, count: institutionRequests.length },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Global Action Button */}
        <div>
          {activeTab === 'programmes' && (
            <Button
              onClick={() => handleOpenProgModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl px-4 py-2.5 flex items-center gap-2"
            >
              <Plus size={16} /> Add HND Programme
            </Button>
          )}
          {activeTab === 'courses' && (
            <Button
              onClick={() => handleOpenCourseModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl px-4 py-2.5 flex items-center gap-2"
            >
              <Plus size={16} /> Add HND Course
            </Button>
          )}
          {activeTab === 'departments' && (
            <Button
              onClick={() => handleOpenDeptModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl px-4 py-2.5 flex items-center gap-2"
            >
              <Plus size={16} /> Add Department
            </Button>
          )}
          {activeTab === 'schools' && (
            <Button
              onClick={() => handleOpenSchoolModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl px-4 py-2.5 flex items-center gap-2"
            >
              <Plus size={16} /> Add School
            </Button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PROGRAMMES / SPECIALTIES */}
      {/* ========================================================================= */}
      {activeTab === 'programmes' && (
        <div className="space-y-4">
          {/* Filtering Bar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search programmes by title, code, or department..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedSchoolFilter}
                onChange={e => setSelectedSchoolFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
              >
                <option value="all">All Schools ({schools.length})</option>
                {schools.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>

              <select
                value={selectedDeptFilter}
                onChange={e => setSelectedDeptFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
              >
                <option value="all">All Departments ({departments.length})</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Programmes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProgrammes.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <GraduationCap className="mx-auto text-slate-300 mb-3" size={40} />
                <p className="text-sm font-bold text-slate-600">No HND programmes found.</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or click "Add HND Programme".</p>
              </div>
            ) : (
              filteredProgrammes.map(prog => {
                const progCourses = courses.filter(c => c.programmeId === prog.id);
                return (
                  <Card key={prog.id} className="p-5 flex flex-col justify-between hover:border-indigo-300 transition-all shadow-sm group">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="secondary" className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 border-indigo-100">
                          {prog.code}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenProgModal(prog)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title="Edit Programme"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteProgramme(prog.id, prog.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Programme"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition">
                          {prog.name}
                        </h4>
                        {prog.nameFr && (
                          <p className="text-xs text-slate-400 italic mt-0.5">{prog.nameFr}</p>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                        {prog.description || 'Comprehensive 2-year Higher National Diploma programme covering theoretical and industrial competencies.'}
                      </p>

                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-500">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-md">
                          {prog.departmentName || 'Department'}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                          {prog.durationYears || 2} Years
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
                          {progCourses.length} Modules
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                      <span>{prog.levels?.join(' & ') || 'Level 1 & 2'}</span>
                      <button
                        onClick={() => {
                          setSelectedProgFilter(prog.id);
                          setActiveTab('courses');
                        }}
                        className="hover:underline flex items-center gap-1"
                      >
                        View Modules <ChevronRight size={14} />
                      </button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COURSE MODULES */}
      {/* ========================================================================= */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          {/* Course Filter Bar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search course modules by title, code, lecturer..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedProgFilter}
                onChange={e => setSelectedProgFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none max-w-[200px] truncate"
              >
                <option value="all">All Programmes ({programmes.length})</option>
                {programmes.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>

              <select
                value={selectedLevelFilter}
                onChange={e => setSelectedLevelFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
              >
                <option value="all">All Levels</option>
                <option value="HND Level 1">HND Level 1</option>
                <option value="HND Level 2">HND Level 2</option>
              </select>

              <select
                value={selectedSemesterFilter}
                onChange={e => setSelectedSemesterFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
              >
                <option value="all">All Semesters</option>
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
              </select>
            </div>
          </div>

          {/* Courses Table / List */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Code & Title</th>
                    <th className="py-3.5 px-4">Programme</th>
                    <th className="py-3.5 px-4">Level & Semester</th>
                    <th className="py-3.5 px-4">Credits</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredCourses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                        No courses found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredCourses.map(course => (
                      <tr key={course.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 text-[11px]">
                              {course.code}
                            </span>
                            <span className="font-bold text-slate-900">{course.name}</span>
                          </div>
                          {course.lecturer && (
                            <p className="text-[10px] text-slate-400 mt-0.5">Lecturer: {course.lecturer}</p>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs font-semibold text-slate-600">
                            {course.programmeName || programmes.find(p => p.id === course.programmeId)?.name || 'General HND'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="secondary" className="text-[10px] font-bold">
                              {course.level}
                            </Badge>
                            <span className="text-slate-400">•</span>
                            <span className="text-xs text-slate-600 font-semibold">{course.semester}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 px-2 py-1 bg-slate-100 rounded-lg">
                            {course.creditValue || 3} Credits
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge className={cn("text-[10px] font-bold", course.isPractical ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-100")}>
                            {course.isPractical ? 'Practical Lab' : 'Theory & Core'}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenCourseModal(course)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                              title="Edit Course"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course.id, course.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Delete Course"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DEPARTMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map(dept => {
            const deptProgs = programmes.filter(p => p.departmentId === dept.id);
            const parentSchool = schools.find(s => s.id === dept.schoolId);
            return (
              <Card key={dept.id} className="p-5 flex flex-col justify-between hover:border-indigo-300 transition shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary" className="font-mono text-[10px] font-black uppercase">
                      {dept.code}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenDeptModal(dept)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 transition"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-slate-900">{dept.name}</h4>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      School: {parentSchool?.name || dept.schoolName || 'Main Faculty'}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {dept.description || 'Specialized academic department administering diploma tracks and vocational training.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>{deptProgs.length} Programmes Active</span>
                  <button
                    onClick={() => {
                      setSelectedDeptFilter(dept.id);
                      setActiveTab('programmes');
                    }}
                    className="text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    View <ChevronRight size={13} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SCHOOLS / FACULTIES */}
      {/* ========================================================================= */}
      {activeTab === 'schools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schools.map(school => {
            const schoolDepts = departments.filter(d => d.schoolId === school.id);
            const schoolProgs = programmes.filter(p => p.schoolId === school.id);
            return (
              <Card key={school.id} className="p-6 flex flex-col justify-between hover:border-indigo-300 transition shadow-sm bg-white">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black">
                      <Building2 size={20} />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenSchoolModal(school)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 transition"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteSchool(school.id, school.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <Badge variant="secondary" className="text-[10px] font-bold text-slate-600 mb-1">
                      Code: {school.code}
                    </Badge>
                    <h4 className="text-base font-black text-slate-900">{school.name}</h4>
                    {school.nameFr && (
                      <p className="text-xs text-slate-400 italic">{school.nameFr}</p>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {school.description || 'Academic school conferring national higher diplomas.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>{schoolDepts.length} Departments</span>
                  <span>{schoolProgs.length} Programmes</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: LEVELS & SEMESTERS CONFIG */}
      {/* ========================================================================= */}
      {activeTab === 'levels' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <SlidersHorizontal size={20} />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">Academic Progression Levels</h4>
                <p className="text-xs text-slate-500 font-medium">Standard 2-Year HND Structure</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-bold text-slate-900">HND Level 1 (Year 1)</h5>
                  <p className="text-xs text-slate-500">Foundational & Core Vocational Modules (Semester 1 & 2)</p>
                </div>
                <Badge variant="success" className="text-xs">Active</Badge>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-bold text-slate-900">HND Level 2 (Year 2)</h5>
                  <p className="text-xs text-slate-500">Advanced Specialization, Industrial Internship & National Exam</p>
                </div>
                <Badge variant="success" className="text-xs">Active</Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BookMarked size={20} />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">Academic Semesters</h4>
                <p className="text-xs text-slate-500 font-medium">Evaluation cycles per academic year</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-bold text-slate-900">Semester 1 (Fall / Term 1)</h5>
                  <p className="text-xs text-slate-500">Coursework, Continuous Assessments & Mid-terms</p>
                </div>
                <Badge variant="secondary" className="text-xs font-bold">Standard</Badge>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-bold text-slate-900">Semester 2 (Spring / Term 2)</h5>
                  <p className="text-xs text-slate-500">Comprehensive exams, Practical Defence & Projects</p>
                </div>
                <Badge variant="secondary" className="text-xs font-bold">Standard</Badge>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: INSTITUTION DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === 'institutions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-200">
            <div>
              <h4 className="text-lg font-black text-slate-900">Cameroon Higher Education Institutions</h4>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Manage accredited Private and State Higher Institutes offering HND & BTS qualifications.
              </p>
            </div>
            <Button
              onClick={() => handleOpenInstitutionModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-3 rounded-2xl flex items-center gap-2 shadow-md self-start sm:self-center"
            >
              <Plus size={16} />
              Add Institution
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by institution name, city, acronym or region..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Directory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {institutions
              .filter(inst => {
                const s = searchTerm.toLowerCase();
                return (
                  inst.name.toLowerCase().includes(s) ||
                  (inst.official_name && inst.official_name.toLowerCase().includes(s)) ||
                  inst.city.toLowerCase().includes(s) ||
                  inst.region.toLowerCase().includes(s) ||
                  (inst.acronym && inst.acronym.toLowerCase().includes(s))
                );
              })
              .map(inst => {
                const instProgs = serviceProgrammes.filter(p => p.institution_id === inst.id);
                return (
                  <Card key={inst.id} className={`p-6 flex flex-col justify-between hover:border-indigo-300 transition-all shadow-sm bg-white border ${!inst.is_active ? 'opacity-60 bg-slate-50/50' : 'border-slate-100'}`}>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg uppercase">
                              {inst.acronym || 'INST'}
                            </span>
                            <Badge variant={inst.institution_type === 'State University' ? 'success' : 'secondary'} className="text-[10px] font-bold">
                              {inst.institution_type}
                            </Badge>
                          </div>
                          <h5 className="text-base font-black text-slate-900 mt-2 leading-tight">
                            {inst.name}
                          </h5>
                          {inst.official_name && inst.official_name !== inst.name && (
                            <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1">
                              {inst.official_name}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleOpenInstitutionModal(inst)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition"
                            title="Edit Institution"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleToggleInstitutionActive(inst)}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition ${
                              inst.is_active
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                            }`}
                            title={inst.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {inst.is_active ? 'Active' : 'Muted'}
                          </button>
                        </div>
                      </div>

                      {/* Geographic Markers */}
                      <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs">
                        <Compass size={14} className="text-indigo-400" />
                        <span>{inst.city}</span>
                        <span className="text-slate-300">•</span>
                        <span>{inst.region} Region</span>
                      </div>

                      {/* Qualification Availability Pills */}
                      <div className="flex items-center gap-2 pt-1">
                        <Badge variant={inst.hnd_available ? 'success' : 'secondary'} className={`text-[10px] ${inst.hnd_available ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'opacity-40'}`}>
                          HND Accredited
                        </Badge>
                        <Badge variant={inst.bts_available ? 'success' : 'secondary'} className={`text-[10px] ${inst.bts_available ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'opacity-40'}`}>
                          BTS Accredited
                        </Badge>
                      </div>

                      {/* Accredited Program Sub-List */}
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">Accredited Specialties ({instProgs.length})</span>
                          <button
                            onClick={() => handleOpenInstitutionProgModal(inst.id)}
                            className="text-[10px] text-indigo-600 hover:text-indigo-800 font-extrabold flex items-center gap-0.5"
                          >
                            <Plus size={12} /> Add Specialty
                          </button>
                        </div>
                        {instProgs.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pt-1">
                            {instProgs.map(p => (
                              <div
                                key={p.id}
                                onClick={() => handleOpenInstitutionProgModal(inst.id, p)}
                                className="px-2 py-1 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg text-[10px] font-bold text-slate-600 hover:text-indigo-700 cursor-pointer transition flex items-center gap-1"
                              >
                                <span className="font-extrabold text-indigo-500 text-[9px]">{p.qualification_type}</span>
                                <span>{p.programme_name}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic font-medium pt-1">
                            No registered specialties found. Click "+ Add Specialty" to list programs.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                      <span>Accredited Hub</span>
                      {inst.website ? (
                        <a href={inst.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-0.5 font-bold">
                          Official Site <ExternalLink size={11} />
                        </a>
                      ) : (
                        <span>No website</span>
                      )}
                    </div>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: SYNC CENTER */}
      {/* ========================================================================= */}
      {activeTab === 'sync' && (
        <div className="space-y-6">
          <Card className="p-8 border border-slate-200 shadow-sm bg-gradient-to-br from-indigo-50/50 to-white">
            <div className="max-w-2xl space-y-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <RefreshCw size={24} className={actionLoading ? 'animate-spin' : ''} />
              </div>
              <h4 className="text-xl font-black text-slate-900">National Accreditation Registries Sync</h4>
              <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                Synchronize the local institutions and specialty records database dynamically with reliable Cameroonian state datasets (such as MINESUP IPES accredited registries). 
                The sync reconciles regions, official names, cities, and qualification types to prevent registration errors.
              </p>

              <div className="pt-4 flex flex-wrap gap-4">
                <Button
                  onClick={handleSyncInstitutionsNow}
                  disabled={actionLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-md flex items-center gap-2 text-xs"
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  Sync Registry Now
                </Button>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span>Last Checked: {syncLogs[0]?.sync_completed_at ? new Date(syncLogs[0].sync_completed_at).toLocaleString() : 'Never'}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Sync History Logs */}
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <h5 className="text-sm font-black text-slate-900">Synchronization Log History</h5>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Audit log of system synchronization events.</p>
            </div>

            {syncLogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {syncLogs.map(log => (
                  <Card key={log.id} className="p-5 border border-slate-150 shadow-sm bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400">
                          {new Date(log.sync_started_at).toLocaleString()}
                        </span>
                        <h6 className="text-xs font-extrabold text-slate-800 leading-snug">
                          {log.source}
                        </h6>
                      </div>
                      <Badge variant={log.status === 'success' ? 'success' : 'danger'} className="text-[10px] font-black">
                        {log.status === 'success' ? 'SUCCESS' : 'FAILED'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                      <div className="bg-slate-50 p-2 rounded-xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Found</p>
                        <p className="text-sm font-black text-slate-700 mt-0.5">{log.records_found}</p>
                      </div>
                      <div className="bg-emerald-50/50 p-2 rounded-xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Added</p>
                        <p className="text-sm font-black text-emerald-700 mt-0.5">{log.records_added}</p>
                      </div>
                      <div className="bg-blue-50/50 p-2 rounded-xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Updated</p>
                        <p className="text-sm font-black text-blue-700 mt-0.5">{log.records_updated}</p>
                      </div>
                      <div className="bg-rose-50/50 p-2 rounded-xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Rej</p>
                        <p className="text-sm font-black text-rose-700 mt-0.5">{log.records_rejected}</p>
                      </div>
                    </div>

                    {log.error_message && (
                      <div className="mt-3 p-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-xs font-semibold leading-relaxed">
                        <span className="font-extrabold">Failure Reason:</span> {log.error_message}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center text-slate-400 border border-slate-200">
                <p className="text-xs font-bold">No synchronization history has been logged yet.</p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: CUSTOM USER REQUESTS */}
      {/* ========================================================================= */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
            <h4 className="text-lg font-black text-slate-900">Custom Institution Nominations</h4>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Review and approve missing higher education institutes nominated by students during registration.
            </p>
          </div>

          {institutionRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {institutionRequests.map(req => (
                <Card key={req.id} className="p-5 border border-slate-200 bg-white space-y-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h6 className="text-sm font-black text-slate-900 leading-snug">{req.name}</h6>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">Submitted by: {req.userEmail}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-bold">
                      {req.qualification}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-600">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase block font-black">City</span>
                      <span>{req.city}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase block font-black">Region</span>
                      <span>{req.region}</span>
                    </div>
                    {req.programme && (
                      <div className="col-span-2 space-y-0.5 pt-1 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase block font-black">Nominated Programme / Specialty</span>
                        <span className="font-bold text-indigo-600">{req.programme}</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center text-slate-400 border border-slate-200">
              <p className="text-xs font-bold">There are no pending custom institution proposals.</p>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT PROGRAMME */}
      {/* ========================================================================= */}
      {showProgModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingProg ? 'Edit HND Programme' : 'Add New HND Programme'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Configure degree title, department, and parameters.</p>
                </div>
              </div>
              <button onClick={() => setShowProgModal(false)} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProgramme} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Programme Name (English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineering"
                    value={progForm.name || ''}
                    onChange={e => setProgForm({ ...progForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Nom du Programme (French)</label>
                  <input
                    type="text"
                    placeholder="e.g. Génie Logiciel"
                    value={progForm.nameFr || ''}
                    onChange={e => setProgForm({ ...progForm, nameFr: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Programme Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SWE, BNF, MLS"
                    value={progForm.code || ''}
                    onChange={e => setProgForm({ ...progForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Duration (Years)</label>
                  <input
                    type="number"
                    min={1}
                    max={4}
                    value={progForm.durationYears || 2}
                    onChange={e => setProgForm({ ...progForm, durationYears: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Parent Department *</label>
                  <select
                    required
                    value={progForm.departmentId || ''}
                    onChange={e => {
                      const dept = departments.find(d => d.id === e.target.value);
                      setProgForm({ 
                        ...progForm, 
                        departmentId: e.target.value,
                        schoolId: dept?.schoolId || progForm.schoolId
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="">Select a department...</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code}) - {schools.find(s => s.id === dept.schoolId)?.name || 'Faculty'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Description & Learning Outcomes</label>
                  <textarea
                    rows={3}
                    placeholder="Provide a comprehensive summary of this diploma programme..."
                    value={progForm.description || ''}
                    onChange={e => setProgForm({ ...progForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-indigo-500 focus:bg-white resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowProgModal(false)}
                  className="px-5 rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Programme
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT COURSE MODULE */}
      {/* ========================================================================= */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingCourse ? 'Edit Course Module' : 'Add New Course Module'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Define course syllabus, credit value, and programme linkage.</p>
                </div>
              </div>
              <button onClick={() => setShowCourseModal(false)} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Course Title (English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Data Structures and Algorithms"
                    value={courseForm.name || ''}
                    onChange={e => setCourseForm({ ...courseForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Associated HND Programme *</label>
                  <select
                    required
                    value={courseForm.programmeId || ''}
                    onChange={e => setCourseForm({ ...courseForm, programmeId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="">Select Programme...</option>
                    {programmes.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SWE-201, BNF-102"
                    value={courseForm.code || ''}
                    onChange={e => setCourseForm({ ...courseForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Credit Value (Credits)</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={courseForm.creditValue || 3}
                    onChange={e => setCourseForm({ ...courseForm, creditValue: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Academic Level</label>
                  <select
                    value={courseForm.level || 'HND Level 1'}
                    onChange={e => setCourseForm({ ...courseForm, level: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="HND Level 1">HND Level 1 (Year 1)</option>
                    <option value="HND Level 2">HND Level 2 (Year 2)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Academic Semester</label>
                  <select
                    value={courseForm.semester || 'Semester 1'}
                    onChange={e => setCourseForm({ ...courseForm, semester: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="Semester 1">Semester 1 (First Term)</option>
                    <option value="Semester 2">Semester 2 (Second Term)</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Lecturer / Instructor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Kemeh Hilary"
                    value={courseForm.lecturer || ''}
                    onChange={e => setCourseForm({ ...courseForm, lecturer: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={courseForm.isPractical || false}
                      onChange={e => setCourseForm({ ...courseForm, isPractical: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                    <span>This course includes Practical Lab Assessments & Defense</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCourseModal(false)}
                  className="px-5 rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Course Module
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT DEPARTMENT */}
      {/* ========================================================================= */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">
                {editingDept ? 'Edit Department' : 'Add Department'}
              </h3>
              <button onClick={() => setShowDeptModal(false)} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Department Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Engineering"
                  value={deptForm.name || ''}
                  onChange={e => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Department Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CE, ACC"
                    value={deptForm.code || ''}
                    onChange={e => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Parent School / Faculty *</label>
                  <select
                    required
                    value={deptForm.schoolId || ''}
                    onChange={e => setDeptForm({ ...deptForm, schoolId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="">Select Faculty...</option>
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeptModal(false)}
                  className="px-5 rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Department
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT SCHOOL */}
      {/* ========================================================================= */}
      {showSchoolModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">
                {editingSchool ? 'Edit School / Faculty' : 'Add School / Faculty'}
              </h3>
              <button onClick={() => setShowSchoolModal(false)} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSchool} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">School / Faculty Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. School of Engineering & Technology"
                  value={schoolForm.name || ''}
                  onChange={e => setSchoolForm({ ...schoolForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nom de la Faculté (French)</label>
                <input
                  type="text"
                  placeholder="e.g. Faculté d'Ingénierie et de Technologie"
                  value={schoolForm.nameFr || ''}
                  onChange={e => setSchoolForm({ ...schoolForm, nameFr: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Faculty Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SET, SBF, SHS"
                  value={schoolForm.code || ''}
                  onChange={e => setSchoolForm({ ...schoolForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSchoolModal(false)}
                  className="px-5 rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save School
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT INSTITUTION */}
      {/* ========================================================================= */}
      {showInstitutionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">
                {editingInstitution ? 'Edit Cameroon Institution' : 'Add Cameroon Institution'}
              </h3>
              <button onClick={() => setShowInstitutionModal(false)} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveInstitutionForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Institution Name (English/French Common Name) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. National Polytechnic Bamenda"
                    value={institutionForm.name || ''}
                    onChange={e => setInstitutionForm({ ...institutionForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Official Registered Name (Registry Reference)</label>
                  <input
                    type="text"
                    placeholder="e.g. National Polytechnic University Institute Bamenda"
                    value={institutionForm.official_name || ''}
                    onChange={e => setInstitutionForm({ ...institutionForm, official_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Registry Acronym *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NPB, IUC, ISS"
                    value={institutionForm.acronym || ''}
                    onChange={e => setInstitutionForm({ ...institutionForm, acronym: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Institution Classification *</label>
                  <select
                    value={institutionForm.institution_type || 'Private Higher Institute'}
                    onChange={e => setInstitutionForm({ ...institutionForm, institution_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="Private Higher Institute">Private Higher Institute (IPES)</option>
                    <option value="State University">State University</option>
                    <option value="Professional School">Professional / Trade School</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">City / Town *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bamenda, Yaoundé, Douala"
                    value={institutionForm.city || ''}
                    onChange={e => setInstitutionForm({ ...institutionForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Cameroon Region *</label>
                  <select
                    value={institutionForm.region || 'Center'}
                    onChange={e => setInstitutionForm({ ...institutionForm, region: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="Center">Center (Yaoundé)</option>
                    <option value="Littoral">Littoral (Douala)</option>
                    <option value="North West">North West (Bamenda)</option>
                    <option value="South West">South West (Buea)</option>
                    <option value="West">West (Bafoussam)</option>
                    <option value="Adamaoua">Adamaoua</option>
                    <option value="East">East</option>
                    <option value="Far North">Far North</option>
                    <option value="North">North</option>
                    <option value="South">South</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Official Website URL</label>
                  <input
                    type="url"
                    placeholder="https://example.edu.cm"
                    value={institutionForm.website || ''}
                    onChange={e => setInstitutionForm({ ...institutionForm, website: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 block">Accredited Qualifications</span>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={institutionForm.hnd_available || false}
                        onChange={e => setInstitutionForm({ ...institutionForm, hnd_available: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                      <span>Higher National Diploma (HND) Accredited</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={institutionForm.bts_available || false}
                        onChange={e => setInstitutionForm({ ...institutionForm, bts_available: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                      <span>Brevet de Technicien Supérieur (BTS) Accredited</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInstitutionModal(false)}
                  className="px-5 rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Institution
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT INSTITUTION ACCREDITED PROGRAMME */}
      {/* ========================================================================= */}
      {showInstitutionProgModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">
                {editingInstitutionProg ? 'Edit Specialty' : 'Add Accredited Specialty / Programme'}
              </h3>
              <button onClick={() => setShowInstitutionProgModal(false)} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveInstitutionProgForm} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Qualification Mode *</label>
                <select
                  value={institutionProgForm.qualification_type || 'HND'}
                  onChange={e => setInstitutionProgForm({ ...institutionProgForm, qualification_type: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="HND">HND (English System)</option>
                  <option value="BTS">BTS (French System)</option>
                  <option value="BOTH">Accredited for Both</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Programme / Specialty Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Engineering or Génie Logiciel"
                  value={institutionProgForm.programme_name || ''}
                  onChange={e => setInstitutionProgForm({ ...institutionProgForm, programme_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Domain / Department Specialty</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Engineering or Commerce"
                  value={institutionProgForm.specialization || ''}
                  onChange={e => setInstitutionProgForm({ ...institutionProgForm, specialization: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInstitutionProgModal(false)}
                  className="px-5 rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Specialty
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
