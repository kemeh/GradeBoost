import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, BookOpen, Layers, CheckCircle2, ChevronRight, 
  ChevronLeft, Sparkles, Building2, Clock, Award, Check, AlertCircle, 
  X, Loader2, RefreshCw 
} from 'lucide-react';
import { 
  getHNDSchools, getHNDDepartments, getHNDProgrammes, getHNDCourses, 
  enrollStudentInHND 
} from '../services/hndService';
import { 
  HNDSchool, HNDDepartment, HNDProgramme, HNDCourse, 
  HNDAcademicLevel, HNDSemester 
} from '../types/hnd';
import { UserProfile } from '../types';
import { Button, Card, Badge, cn, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui';
import { toast } from 'react-hot-toast';

interface HNDEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onEnrollmentSuccess?: () => void;
}

export const HNDEnrollmentModal: React.FC<HNDEnrollmentModalProps> = ({
  isOpen,
  onClose,
  user,
  onEnrollmentSuccess
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Data Collections
  const [schools, setSchools] = useState<HNDSchool[]>([]);
  const [departments, setDepartments] = useState<HNDDepartment[]>([]);
  const [programmes, setProgrammes] = useState<HNDProgramme[]>([]);
  const [courses, setCourses] = useState<HNDCourse[]>([]);

  // Selection States
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(user?.hndSchoolId || '');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>(user?.hndDepartmentId || '');
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>(user?.hndProgrammeId || '');
  const [selectedLevel, setSelectedLevel] = useState<HNDAcademicLevel>((user?.hndLevel as HNDAcademicLevel) || 'HND Level 1');
  const [selectedSemester, setSelectedSemester] = useState<HNDSemester>((user?.hndSemester as HNDSemester) || 'Semester 1');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(user?.hndEnrolledCourseIds || []);

  useEffect(() => {
    if (isOpen) {
      loadHierarchyData();
    }
  }, [isOpen]);

  const loadHierarchyData = async () => {
    setLoading(true);
    try {
      const [sData, dData, pData, cData] = await Promise.all([
        getHNDSchools(),
        getHNDDepartments(),
        getHNDProgrammes(),
        getHNDCourses()
      ]);

      setSchools(sData.filter(s => s.isActive));
      setDepartments(dData.filter(d => d.isActive));
      setProgrammes(pData.filter(p => p.isActive));
      setCourses(cData.filter(c => c.isActive));

      // Auto-set initial selections if missing
      const initialSchool = user?.hndSchoolId || (sData.length > 0 ? sData[0].id : '');
      setSelectedSchoolId(initialSchool);

      const availableDepts = dData.filter(d => d.schoolId === initialSchool);
      const initialDept = user?.hndDepartmentId || (availableDepts.length > 0 ? availableDepts[0].id : '');
      setSelectedDepartmentId(initialDept);

      const availableProgs = pData.filter(p => p.departmentId === initialDept || (!initialDept && p.schoolId === initialSchool));
      const initialProg = user?.hndProgrammeId || (availableProgs.length > 0 ? availableProgs[0].id : '');
      setSelectedProgrammeId(initialProg);

      // Auto select initial courses
      if (initialProg) {
        const lvl = (user?.hndLevel as HNDAcademicLevel) || 'HND Level 1';
        const sem = (user?.hndSemester as HNDSemester) || 'Semester 1';
        const semesterCourses = cData.filter(c => c.programmeId === initialProg && c.level === lvl && c.semester === sem);
        if (user?.hndEnrolledCourseIds && user.hndEnrolledCourseIds.length > 0) {
          setSelectedCourseIds(user.hndEnrolledCourseIds);
        } else {
          setSelectedCourseIds(semesterCourses.map(c => c.id));
        }
      }
    } catch (err) {
      console.error('Failed to load HND hierarchy:', err);
      toast.error('Failed to load HND options.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered lists
  const filteredDepartments = departments.filter(d => !selectedSchoolId || d.schoolId === selectedSchoolId);
  const filteredProgrammes = programmes.filter(p => {
    if (selectedDepartmentId) return p.departmentId === selectedDepartmentId;
    if (selectedSchoolId) return p.schoolId === selectedSchoolId;
    return true;
  });

  const activeProgramme = programmes.find(p => p.id === selectedProgrammeId);
  const activeSchool = schools.find(s => s.id === selectedSchoolId);
  const activeDepartment = departments.find(d => d.id === selectedDepartmentId);

  // Available courses for active programme, level, and semester
  const availableCourses = courses.filter(c => 
    c.programmeId === selectedProgrammeId &&
    c.level === selectedLevel &&
    c.semester === selectedSemester
  );

  // When changing programme, level, or semester, update default courses
  const handleProgrammeChange = (progId: string) => {
    setSelectedProgrammeId(progId);
    const prog = programmes.find(p => p.id === progId);
    if (prog) {
      setSelectedSchoolId(prog.schoolId);
      setSelectedDepartmentId(prog.departmentId);
    }
    const semesterCourses = courses.filter(c => c.programmeId === progId && c.level === selectedLevel && c.semester === selectedSemester);
    setSelectedCourseIds(semesterCourses.map(c => c.id));
  };

  const handleLevelSemesterChange = (newLevel: HNDAcademicLevel, newSem: HNDSemester) => {
    setSelectedLevel(newLevel);
    setSelectedSemester(newSem);
    const semesterCourses = courses.filter(c => c.programmeId === selectedProgrammeId && c.level === newLevel && c.semester === newSem);
    setSelectedCourseIds(semesterCourses.map(c => c.id));
  };

  const toggleCourse = (courseId: string) => {
    setSelectedCourseIds(prev => 
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const handleSelectAllCourses = () => {
    setSelectedCourseIds(availableCourses.map(c => c.id));
  };

  const handleClearAllCourses = () => {
    setSelectedCourseIds([]);
  };

  const selectedCoursesList = availableCourses.filter(c => selectedCourseIds.includes(c.id));
  const totalCredits = selectedCoursesList.reduce((acc, c) => acc + (c.creditValue || 3), 0);

  const handleCompleteEnrollment = async () => {
    if (!user?.uid) {
      toast.error('You must be signed in to enroll.');
      return;
    }

    if (!selectedProgrammeId || !activeProgramme) {
      toast.error('Please select an HND Programme.');
      return;
    }

    if (selectedCourseIds.length === 0) {
      toast.error('Please select at least one course module for the semester.');
      return;
    }

    setSubmitting(true);
    try {
      await enrollStudentInHND(
        user.uid,
        {
          schoolId: selectedSchoolId,
          schoolName: activeSchool?.name || 'School of Engineering & Technology',
          departmentId: selectedDepartmentId,
          departmentName: activeDepartment?.name || 'Department of Technology',
          programmeId: selectedProgrammeId,
          programmeName: activeProgramme.name,
          programmeCode: activeProgramme.code,
          level: selectedLevel,
          semester: selectedSemester,
          enrolledCourseIds: selectedCourseIds,
          enrolledCourseCodes: selectedCoursesList.map(c => c.code),
          enrolledCourseNames: selectedCoursesList.map(c => c.name),
        },
        {
          name: user.name,
          email: user.email
        }
      );

      toast.success(`Successfully enrolled in ${activeProgramme.name} (${selectedLevel} - ${selectedSemester})!`);
      if (onEnrollmentSuccess) {
        onEnrollmentSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Enrollment failed:', err);
      toast.error('Enrollment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <GraduationCap size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-500/30 text-indigo-200 border-indigo-400/30 text-[10px] uppercase font-black px-2 py-0.5">
                  Academic Enrollment System
                </Badge>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                HND Programme & Semester Enrollment
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex items-center justify-between text-xs font-bold text-slate-500 shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setStep(1)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg transition",
                step === 1 ? "bg-indigo-600 text-white" : "hover:bg-slate-200 text-slate-600"
              )}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center">1</span>
              <span>Faculty & Programme</span>
            </button>
            <ChevronRight size={14} className="text-slate-300" />
            <button 
              onClick={() => activeProgramme && setStep(2)}
              disabled={!activeProgramme}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg transition",
                step === 2 ? "bg-indigo-600 text-white" : "hover:bg-slate-200 text-slate-600 disabled:opacity-40"
              )}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center">2</span>
              <span>Level & Semester</span>
            </button>
            <ChevronRight size={14} className="text-slate-300 hidden sm:block" />
            <button 
              onClick={() => activeProgramme && setStep(3)}
              disabled={!activeProgramme}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg transition hidden sm:flex",
                step === 3 ? "bg-indigo-600 text-white" : "hover:bg-slate-200 text-slate-600 disabled:opacity-40"
              )}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center">3</span>
              <span>Course Modules</span>
            </button>
          </div>

          <div className="text-[11px] font-bold text-indigo-600 hidden md:block">
            Step {step} of 3
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3 text-slate-400">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
              <p className="text-xs font-bold uppercase tracking-widest">Loading HND curriculum catalog...</p>
            </div>
          ) : (
            <>
              {/* STEP 1: Faculty & Programme Selection */}
              {step === 1 && (
                <div className="space-y-5 animate-in fade-in">
                  <div>
                    <h3 className="text-base font-black text-slate-900">Select School / Faculty & Specialty</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Choose your Higher National Diploma faculty and enrolled degree specialty.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* School / Faculty Selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Building2 size={13} className="text-indigo-600" />
                        HND School / Faculty
                      </label>
                      <select
                        value={selectedSchoolId}
                        onChange={e => {
                          const sId = e.target.value;
                          setSelectedSchoolId(sId);
                          const availDepts = departments.filter(d => d.schoolId === sId);
                          const newDeptId = availDepts.length > 0 ? availDepts[0].id : '';
                          setSelectedDepartmentId(newDeptId);
                          const availProgs = programmes.filter(p => p.departmentId === newDeptId || (!newDeptId && p.schoolId === sId));
                          if (availProgs.length > 0) {
                            handleProgrammeChange(availProgs[0].id);
                          }
                        }}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                      >
                        {schools.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                        ))}
                      </select>
                    </div>

                    {/* Department Selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Layers size={13} className="text-indigo-600" />
                        Academic Department
                      </label>
                      <select
                        value={selectedDepartmentId}
                        onChange={e => {
                          const dId = e.target.value;
                          setSelectedDepartmentId(dId);
                          const availProgs = programmes.filter(p => p.departmentId === dId);
                          if (availProgs.length > 0) {
                            handleProgrammeChange(availProgs[0].id);
                          }
                        }}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                      >
                        {filteredDepartments.map(d => (
                          <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Programmes Grid */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-slate-700">
                      Choose Degree Programme ({filteredProgrammes.length} available)
                    </label>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                      {filteredProgrammes.map(prog => {
                        const isSelected = selectedProgrammeId === prog.id;
                        return (
                          <button
                            key={prog.id}
                            type="button"
                            onClick={() => handleProgrammeChange(prog.id)}
                            className={cn(
                              "p-4 rounded-2xl border text-left transition relative flex flex-col justify-between",
                              isSelected 
                                ? "bg-indigo-50 border-indigo-600 text-indigo-950 shadow-xs ring-2 ring-indigo-600/20" 
                                : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                            )}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <Badge variant={isSelected ? "indigo" : "secondary"} className="text-[10px] font-black">
                                  {prog.code}
                                </Badge>
                                {isSelected && (
                                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                                    <Check size={12} />
                                  </div>
                                )}
                              </div>
                              <h4 className="text-sm font-black mt-1 leading-snug">{prog.name}</h4>
                              {prog.nameFr && (
                                <p className="text-[11px] text-slate-400 italic">{prog.nameFr}</p>
                              )}
                            </div>

                            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
                              <span>{prog.durationYears || 2} Years Duration</span>
                              <span className="text-indigo-600">{prog.levels?.join(' • ') || 'Level 1 & 2'}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Academic Level & Semester Selection */}
              {step === 2 && (
                <div className="space-y-5 animate-in fade-in">
                  <div>
                    <h3 className="text-base font-black text-slate-900">Select Academic Level & Semester</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Configure your current year of study and semester in <span className="font-bold text-indigo-600">{activeProgramme?.name}</span>.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Academic Level Card */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Award size={14} className="text-indigo-600" />
                        Academic Level / Year
                      </label>

                      <div className="grid grid-cols-1 gap-2">
                        {(['HND Level 1', 'HND Level 2'] as HNDAcademicLevel[]).map(lvl => {
                          const isSelected = selectedLevel === lvl;
                          return (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => handleLevelSemesterChange(lvl, selectedSemester)}
                              className={cn(
                                "p-3 rounded-xl border text-left flex items-center justify-between transition font-bold text-xs",
                                isSelected
                                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                              )}
                            >
                              <div>
                                <div>{lvl === 'HND Level 1' ? 'HND Level 1 (Year 1 Foundation)' : 'HND Level 2 (Year 2 / National Exam)'}</div>
                                <div className={cn("text-[10px] font-medium", isSelected ? "text-indigo-100" : "text-slate-400")}>
                                  {lvl === 'HND Level 1' ? 'Foundation modules & introductory practicals' : 'Specialized modules & National HND prep'}
                                </div>
                              </div>
                              {isSelected && <CheckCircle2 size={16} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Semester Card */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock size={14} className="text-indigo-600" />
                        Academic Semester
                      </label>

                      <div className="grid grid-cols-1 gap-2">
                        {(['Semester 1', 'Semester 2'] as HNDSemester[]).map(sem => {
                          const isSelected = selectedSemester === sem;
                          return (
                            <button
                              key={sem}
                              type="button"
                              onClick={() => handleLevelSemesterChange(selectedLevel, sem)}
                              className={cn(
                                "p-3 rounded-xl border text-left flex items-center justify-between transition font-bold text-xs",
                                isSelected
                                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                              )}
                            >
                              <div>
                                <div>{sem}</div>
                                <div className={cn("text-[10px] font-medium", isSelected ? "text-indigo-100" : "text-slate-400")}>
                                  {sem === 'Semester 1' ? 'October – February session' : 'March – July session & Nationals'}
                                </div>
                              </div>
                              {isSelected && <CheckCircle2 size={16} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Summary Banner */}
                  <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-200/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-black text-indigo-950">
                        Selected: {activeProgramme?.name}
                      </div>
                      <div className="text-[11px] text-indigo-700 font-semibold">
                        {selectedLevel} • {selectedSemester} ({availableCourses.length} syllabus modules available)
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => setStep(3)}
                      className="rounded-xl font-bold"
                    >
                      Configure Modules <ChevronRight size={14} className="ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: Course Module Selection & Verification */}
              {step === 3 && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-black text-slate-900">Enrolled Course Modules</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {activeProgramme?.name} • {selectedLevel} • {selectedSemester}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={handleSelectAllCourses}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 px-2.5 py-1 bg-indigo-50 rounded-lg"
                      >
                        Select All
                      </button>
                      <button 
                        type="button"
                        onClick={handleClearAllCourses}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-700 px-2.5 py-1 bg-slate-100 rounded-lg"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  {/* Course modules list */}
                  <div className="space-y-2.5 max-h-72 overflow-y-auto p-1">
                    {availableCourses.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                        <AlertCircle className="mx-auto text-slate-400 mb-2" size={24} />
                        <p className="text-xs font-bold text-slate-600">No course modules configured for this semester yet.</p>
                        <p className="text-[11px] text-slate-400">You will be registered with the core programme curriculum.</p>
                      </div>
                    ) : (
                      availableCourses.map(course => {
                        const isChecked = selectedCourseIds.includes(course.id);
                        return (
                          <div
                            key={course.id}
                            onClick={() => toggleCourse(course.id)}
                            className={cn(
                              "p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3",
                              isChecked
                                ? "bg-indigo-50/70 border-indigo-300 text-indigo-950"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            )}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={cn(
                                "w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition",
                                isChecked ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 bg-white"
                              )}>
                                {isChecked && <Check size={12} />}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <Badge variant={isChecked ? "indigo" : "secondary"} className="text-[10px] font-bold py-0">
                                    {course.code}
                                  </Badge>
                                  <span className="text-xs font-black truncate">{course.name}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                                  <span>{course.creditValue} Credits</span>
                                  <span>•</span>
                                  <span>{course.isPractical ? 'Practical & Lab' : 'Theory & Core'}</span>
                                  {course.lecturer && (
                                    <>
                                      <span>•</span>
                                      <span>Lecturer: {course.lecturer}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <Badge variant={isChecked ? "success" : "neutral"} className="text-[10px] shrink-0 font-bold">
                              {isChecked ? "Enrolled" : "Optional"}
                            </Badge>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Enrollment Summary Footer */}
                  <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-xs font-black text-indigo-300 uppercase tracking-widest">
                        Total Course Credits
                      </div>
                      <div className="text-sm font-bold text-white">
                        {selectedCourseIds.length} Modules Selected ({totalCredits} Credits)
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-300 font-medium">
                      Status: <span className="text-emerald-400 font-bold">Ready to persist to profile</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Controls */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <div>
            {step > 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(prev => Math.max(1, prev - 1) as any)}
                className="rounded-xl font-bold"
              >
                <ChevronLeft size={16} className="mr-1" /> Previous Step
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="rounded-xl font-bold text-slate-500"
              >
                Cancel
              </Button>
            )}
          </div>

          <div>
            {step < 3 ? (
              <Button
                size="sm"
                onClick={() => setStep(prev => Math.min(3, prev + 1) as any)}
                disabled={!activeProgramme}
                className="rounded-xl font-bold"
              >
                Continue <ChevronRight size={16} className="ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleCompleteEnrollment}
                loading={submitting}
                className="rounded-xl font-black bg-indigo-600 hover:bg-indigo-700 text-white px-6 shadow-md"
              >
                <CheckCircle2 size={16} className="mr-1.5" /> Save & Update Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
