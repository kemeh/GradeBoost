import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Mail, School, MapPin, ChevronRight, Save, TrendingUp, CheckCircle2, AlertCircle, Camera, Loader2, Trophy, Star, Zap, CreditCard, BookOpen, LayoutDashboard, ShieldCheck, KeyRound, RefreshCw, History, Sparkles, GraduationCap, Building2, Layers, Clock, Award, Check } from 'lucide-react';
import { ACHIEVEMENTS } from '../services/gamificationService';
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { db, storage, auth } from '../firebase';
import { Button, Card, Badge, cn } from '../components/ui';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';
import { formatDate } from '../utils/dateUtils';
import ModernDashboardLayout from '../components/layout/ModernDashboardLayout';
import FileUpload from '../components/FileUpload';
import { toast } from 'react-hot-toast';
import { fetchAuditLogs, AuditLogEntry } from '../services/auditService';
import AlumniAmbassadorSection from '../components/profile/AlumniAmbassadorSection';
import { HNDEnrollmentModal } from '../components/HNDEnrollmentModal';
import { 
  getHNDSchools, getHNDDepartments, getHNDProgrammes, getHNDCourses, 
  enrollStudentInHND 
} from '../services/hndService';
import { 
  HNDSchool, HNDDepartment, HNDProgramme, HNDCourse, 
  HNDAcademicLevel, HNDSemester 
} from '../types/hnd';

import { DEFAULT_GCE_SUBJECTS, getPapersForSubjectName } from '../data/defaultSubjects';

export default function Profile() {
  const { user, isEmailVerified, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [userLogs, setUserLogs] = useState<AuditLogEntry[]>([]);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [showHndEnrollmentModal, setShowHndEnrollmentModal] = useState(false);

  // HND Dynamic Catalog
  const [hndSchools, setHndSchools] = useState<HNDSchool[]>([]);
  const [hndDepartments, setHndDepartments] = useState<HNDDepartment[]>([]);
  const [hndProgrammes, setHndProgrammes] = useState<HNDProgramme[]>([]);
  const [hndCourses, setHndCourses] = useState<HNDCourse[]>([]);
  const [loadingHndCatalog, setLoadingHndCatalog] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    school: user?.school || '',
    region: user?.region || '',
    subject: user?.subject || '',
    curriculumId: user?.curriculumId || 'cameroon_gce',
    curriculumName: user?.curriculumName || 'English Curriculum (Cameroon GCE)',
    educationLevelName: user?.educationLevelName || user?.level || 'Ordinary level',
    level: user?.level || 'Ordinary level',
    // HND Fields
    hndSchoolId: user?.hndSchoolId || '',
    hndSchoolName: user?.hndSchoolName || '',
    hndDepartmentId: user?.hndDepartmentId || '',
    hndDepartmentName: user?.hndDepartmentName || '',
    hndProgrammeId: user?.hndProgrammeId || '',
    hndProgrammeName: user?.hndProgrammeName || '',
    hndProgrammeCode: user?.hndProgrammeCode || '',
    hndLevel: (user?.hndLevel as HNDAcademicLevel) || 'HND Level 1',
    hndSemester: (user?.hndSemester as HNDSemester) || 'Semester 1',
    hndEnrolledCourseIds: user?.hndEnrolledCourseIds || [] as string[],
    selectedSubjects: user?.selectedSubjects || [] as string[],
    studentId: user?.studentId || user?.student_id || '',
    academicYear: user?.academicYear || user?.academic_year || '2025/2026',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        school: user.school || '',
        region: user.region || '',
        subject: user.subject || '',
        curriculumId: user.curriculumId || 'cameroon_gce',
        curriculumName: user.curriculumName || 'English Curriculum (Cameroon GCE)',
        educationLevelName: user.educationLevelName || user.level || 'Ordinary level',
        level: user.level || 'Ordinary level',
        hndSchoolId: user.hndSchoolId || '',
        hndSchoolName: user.hndSchoolName || '',
        hndDepartmentId: user.hndDepartmentId || '',
        hndDepartmentName: user.hndDepartmentName || '',
        hndProgrammeId: user.hndProgrammeId || '',
        hndProgrammeName: user.hndProgrammeName || '',
        hndProgrammeCode: user.hndProgrammeCode || '',
        hndLevel: (user.hndLevel as HNDAcademicLevel) || 'HND Level 1',
        hndSemester: (user.hndSemester as HNDSemester) || 'Semester 1',
        hndEnrolledCourseIds: user.hndEnrolledCourseIds || [],
        selectedSubjects: user.selectedSubjects || [],
        studentId: user.studentId || user.student_id || '',
        academicYear: user.academicYear || user.academic_year || '2025/2026',
      });
    }
  }, [user]);

  useEffect(() => {
    if (user?.email) {
      fetchAuditLogs(10, user.email).then(setUserLogs).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const q = query(collection(db, 'subjects'), where('isActive', '==', true));
        const snapshot = await getDocs(q);
        setSubjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch HND Hierarchy Catalog
  useEffect(() => {
    const fetchHndData = async () => {
      setLoadingHndCatalog(true);
      try {
        const [schoolsData, deptsData, progsData, coursesData] = await Promise.all([
          getHNDSchools(),
          getHNDDepartments(),
          getHNDProgrammes(),
          getHNDCourses()
        ]);
        setHndSchools(schoolsData.filter(s => s.isActive));
        setHndDepartments(deptsData.filter(d => d.isActive));
        setHndProgrammes(progsData.filter(p => p.isActive));
        setHndCourses(coursesData.filter(c => c.isActive));

        // Auto-assign default HND values if empty and curriculum is HND
        if (formData.curriculumId === 'hnd' && !formData.hndProgrammeId && progsData.length > 0) {
          const firstProg = progsData[0];
          setFormData(prev => ({
            ...prev,
            hndSchoolId: firstProg.schoolId,
            hndDepartmentId: firstProg.departmentId,
            hndProgrammeId: firstProg.id,
            hndProgrammeName: firstProg.name,
            hndProgrammeCode: firstProg.code,
            subject: firstProg.name,
          }));
        }
      } catch (err) {
        console.error('Error fetching HND catalog for profile:', err);
      } finally {
        setLoadingHndCatalog(false);
      }
    };

    fetchHndData();
  }, [formData.curriculumId]);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'payments'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        setPaymentHistory(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching payment history:", err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchPaymentHistory();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setSuccess(false);
    const path = `users/${user.uid}`;

    try {
      if (formData.curriculumId === 'hnd') {
        const activeProg = hndProgrammes.find(p => p.id === formData.hndProgrammeId);
        const activeSchool = hndSchools.find(s => s.id === formData.hndSchoolId);
        const activeDept = hndDepartments.find(d => d.id === formData.hndDepartmentId);

        const currentSemesterCourses = hndCourses.filter(c => 
          c.programmeId === formData.hndProgrammeId && 
          c.level === formData.hndLevel && 
          c.semester === formData.hndSemester
        );

        let enrolledCourseIds = formData.hndEnrolledCourseIds;
        if (!enrolledCourseIds || enrolledCourseIds.length === 0) {
          enrolledCourseIds = currentSemesterCourses.map(c => c.id);
        }

        const enrolledCourses = hndCourses.filter(c => enrolledCourseIds.includes(c.id));
        const courseNames = enrolledCourses.map(c => c.name);
        const courseCodes = enrolledCourses.map(c => c.code);

        await enrollStudentInHND(
          user.uid,
          {
            schoolId: formData.hndSchoolId || activeProg?.schoolId || '',
            schoolName: activeSchool?.name || formData.hndSchoolName || 'School of Engineering & Technology',
            departmentId: formData.hndDepartmentId || activeProg?.departmentId || '',
            departmentName: activeDept?.name || formData.hndDepartmentName || 'Department of Technology',
            programmeId: formData.hndProgrammeId,
            programmeName: activeProg?.name || formData.hndProgrammeName || 'Software Engineering',
            programmeCode: activeProg?.code || formData.hndProgrammeCode || 'SWE',
            level: formData.hndLevel,
            semester: formData.hndSemester,
            enrolledCourseIds,
            enrolledCourseCodes: courseCodes,
            enrolledCourseNames: courseNames,
          },
          {
            name: formData.name,
            email: user.email
          }
        );

        // Also update name, school, region, and HND dynamic fields
        await updateDoc(doc(db, 'users', user.uid), {
          name: formData.name,
          school: formData.school,
          region: formData.region,
          academicLevel: 'HND_BTS',
          programme: formData.hndProgrammeName,
          student_id: formData.studentId || '',
          studentId: formData.studentId || '',
          institution: formData.hndSchoolName || formData.school || '',
          institutionName: formData.hndSchoolName || formData.school || '',
          academic_year: formData.academicYear || '2025/2026',
          academicYear: formData.academicYear || '2025/2026',
          updatedAt: serverTimestamp()
        });

      } else {
        const currName = formData.curriculumId === 'cameroon_gce'
          ? 'English Curriculum (Cameroon GCE)'
          : 'French Curriculum (Cameroon Francophone)';

        const matchedPapers = getPapersForSubjectName(formData.subject, formData.level, subjects);
        const assignedPaperIds = matchedPapers.map(p => p.id);

        await updateDoc(doc(db, 'users', user.uid), {
          name: formData.name,
          school: formData.school,
          region: formData.region,
          curriculumId: formData.curriculumId,
          curriculumName: currName,
          educationLevelName: formData.educationLevelName || formData.level,
          level: formData.level,
          academicLevel: (formData.level === 'Ordinary level' ? 'Ordinary Level' : 'Advanced Level'),
          subject: formData.subject.trim(),
          assignedPapers: assignedPaperIds.length > 0 ? assignedPaperIds : ['paper1', 'paper2'],
          updatedAt: serverTimestamp(),
        });
      }

      setSuccess(true);
      toast.success('Profile updated successfully!');
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      handleFirestoreError(error, OperationType.UPDATE, path);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCourseSelection = (courseId: string) => {
    setFormData(prev => {
      const exists = prev.hndEnrolledCourseIds.includes(courseId);
      const newIds = exists 
        ? prev.hndEnrolledCourseIds.filter(id => id !== courseId)
        : [...prev.hndEnrolledCourseIds, courseId];
      return { ...prev, hndEnrolledCourseIds: newIds };
    });
  };

  if (!user) return null;

  const role = user?.role === 'admin' ? 'admin' : user?.role === 'teacher' ? 'teacher' : 'student';

  return (
    <ModernDashboardLayout role={role} activeTab="profile">
      <div className="space-y-6 max-w-4xl mx-auto w-full min-w-0">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/dashboard')}
                  className="rounded-xl border-slate-200 hover:bg-slate-50"
                  title="Go to Dashboard"
                >
                  <LayoutDashboard size={18} className="text-slate-600" />
                </Button>
                <div className="flex items-center gap-2 text-indigo-600">
                  <TrendingUp size={20} />
                  <span className="text-sm font-black uppercase tracking-widest">Profile Settings</span>
                </div>
              </div>
              <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none">
                Your <span className="text-indigo-600 italic">Account</span>
              </h1>
              <p className="text-slate-500 font-medium max-w-md">
                Manage your personal information and track your progress across the platform.
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm group relative">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black overflow-hidden relative">
                {avatarUploading ? (
                  <div className="absolute inset-0 bg-indigo-600/80 flex flex-col items-center justify-center p-2">
                    <Loader2 className="animate-spin text-white" size={24} />
                  </div>
                ) : user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  user.name?.charAt(0) || 'U'
                )}
                {!avatarUploading && (
                  <div 
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    <Camera size={20} />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col">
                  <span className="text-lg font-black text-slate-900 leading-tight">{user.name}</span>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{user.role}</span>
                </div>
                <FileUpload
                  onUploadStart={() => setAvatarUploading(true)}
                  onUploadComplete={async (url) => {
                    try {
                      await updateDoc(doc(db, 'users', user.uid), {
                        photoURL: url,
                        updatedAt: serverTimestamp()
                      });
                      setAvatarUploading(false);
                      toast.success('Profile picture updated!');
                    } catch (error) {
                      console.error('Error updating profile with new photoURL:', error);
                      toast.error('Failed to update profile picture');
                      setAvatarUploading(false);
                    }
                  }}
                  onUploadError={() => setAvatarUploading(false)}
                  onDelete={async () => {
                    try {
                      await updateDoc(doc(db, 'users', user.uid), {
                        photoURL: '',
                        updatedAt: serverTimestamp()
                      });
                      toast.success('Profile picture removed');
                    } catch (error) {
                      console.error('Error removing photoURL:', error);
                      toast.error('Failed to remove profile picture');
                    }
                  }}
                  initialUrl={user.photoURL}
                  folder="avatars"
                  accept="image/*"
                  label={user.photoURL ? 'Change Photo' : 'Upload Photo'}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="p-8 lg:p-12">
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <User size={12} /> Full Name
                      </label>
                      <input 
                        type="text"
                        required
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-3 opacity-60">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Mail size={12} /> Email Address
                      </label>
                      <input 
                        type="email"
                        disabled
                        className="w-full p-4 bg-slate-100 border border-slate-100 rounded-2xl font-bold text-slate-500 cursor-not-allowed"
                        value={user.email}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <School size={12} /> School Name
                      </label>
                      <input 
                        type="text"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                        value={formData.school}
                        onChange={e => setFormData({ ...formData, school: e.target.value })}
                        placeholder="Enter your school"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <MapPin size={12} /> Region
                      </label>
                      <input 
                        type="text"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                        value={formData.region}
                        onChange={e => setFormData({ ...formData, region: e.target.value })}
                        placeholder="Enter your region"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        Platform Interface Language
                      </label>
                      <LanguageSwitcher variant="compact" className="w-fit" />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <BookOpen size={12} /> Curriculum System
                      </label>
                      <select 
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all appearance-none"
                        value={formData.curriculumId}
                        onChange={e => {
                          const currId = e.target.value;
                          if (currId === 'hnd') {
                            const firstProg = hndProgrammes[0];
                            setFormData({
                              ...formData,
                              curriculumId: 'hnd',
                              curriculumName: 'Higher National Diploma (HND)',
                              level: 'HND Level 1',
                              hndLevel: 'HND Level 1',
                              hndSemester: 'Semester 1',
                              hndProgrammeId: firstProg?.id || 'prog_hnd_swe',
                              hndProgrammeName: firstProg?.name || 'Software Engineering',
                              hndProgrammeCode: firstProg?.code || 'SWE',
                              hndSchoolId: firstProg?.schoolId || 'sch_eng_tech',
                              hndDepartmentId: firstProg?.departmentId || 'dept_comp_eng',
                              subject: firstProg?.name || 'Software Engineering',
                            });
                          } else {
                            setFormData({ 
                              ...formData, 
                              curriculumId: currId,
                              level: currId === 'cameroon_francophone' ? 'Terminale' : 'Ordinary level',
                              subject: currId === 'cameroon_francophone' ? 'Mathématiques' : 'Computer Science'
                            });
                          }
                        }}
                      >
                        <option value="cameroon_gce">English Curriculum (Cameroon GCE)</option>
                        <option value="cameroon_francophone">French Curriculum (Système Francophone)</option>
                        <option value="hnd">Higher National Diploma (HND) - MINESUP</option>
                      </select>
                    </div>

                    {formData.curriculumId === 'hnd' ? (
                      /* HND Academic Configuration Fields */
                      <>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Building2 size={12} /> HND School / Faculty
                          </label>
                          <select
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all appearance-none text-xs"
                            value={formData.hndSchoolId}
                            onChange={e => {
                              const sId = e.target.value;
                              const s = hndSchools.find(item => item.id === sId);
                              const availableProgs = hndProgrammes.filter(p => p.schoolId === sId);
                              const firstProg = availableProgs[0];
                              setFormData({
                                ...formData,
                                hndSchoolId: sId,
                                hndSchoolName: s?.name || '',
                                hndProgrammeId: firstProg?.id || formData.hndProgrammeId,
                                hndProgrammeName: firstProg?.name || formData.hndProgrammeName,
                                hndProgrammeCode: firstProg?.code || formData.hndProgrammeCode,
                                subject: firstProg?.name || formData.subject
                              });
                            }}
                          >
                            {hndSchools.map(s => (
                              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <GraduationCap size={12} /> HND Programme / Specialty
                          </label>
                          <select
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all appearance-none text-xs"
                            value={formData.hndProgrammeId}
                            onChange={e => {
                              const pId = e.target.value;
                              const p = hndProgrammes.find(item => item.id === pId);
                              setFormData({
                                ...formData,
                                hndProgrammeId: pId,
                                hndProgrammeName: p?.name || '',
                                hndProgrammeCode: p?.code || '',
                                subject: p?.name || '',
                              });
                            }}
                          >
                            {hndProgrammes
                              .filter(p => !formData.hndSchoolId || p.schoolId === formData.hndSchoolId)
                              .map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                              ))}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Award size={12} /> Academic Level / Year
                          </label>
                          <select
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all appearance-none text-xs"
                            value={formData.hndLevel}
                            onChange={e => {
                              const lvl = e.target.value as HNDAcademicLevel;
                              setFormData({ ...formData, hndLevel: lvl, level: lvl, educationLevelName: lvl });
                            }}
                          >
                            <option value="HND Level 1">HND Level 1 (Year 1 Foundation)</option>
                            <option value="HND Level 2">HND Level 2 (Year 2 / National Exam)</option>
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Clock size={12} /> Academic Semester
                          </label>
                          <select
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all appearance-none text-xs"
                            value={formData.hndSemester}
                            onChange={e => {
                              const sem = e.target.value as HNDSemester;
                              setFormData({ ...formData, hndSemester: sem });
                            }}
                          >
                            <option value="Semester 1">Semester 1 (October - February)</option>
                            <option value="Semester 2">Semester 2 (March - July)</option>
                          </select>
                        </div>

                        {/* Dynamic HND/BTS Fields: Student ID & Academic Year */}
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <CreditCard size={12} /> Student ID / Matriculation Number
                          </label>
                          <input
                            type="text"
                            value={formData.studentId}
                            onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                            placeholder="e.g. HND2026-SWE01"
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none text-xs"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Clock size={12} /> Academic Year
                          </label>
                          <input
                            type="text"
                            value={formData.academicYear}
                            onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                            placeholder="2025/2026"
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none text-xs"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <BookOpen size={12} /> Education Level
                          </label>
                          <select 
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all appearance-none"
                            value={formData.level}
                            onChange={e => setFormData({ ...formData, level: e.target.value })}
                          >
                            {formData.curriculumId === 'cameroon_gce' ? (
                              <>
                                <option value="Ordinary level">Ordinary Level (O-Level)</option>
                                <option value="Advance level">Advanced Level (A-Level)</option>
                              </>
                            ) : (
                              <>
                                <option value="Troisième (BEPC)">Troisième (BEPC)</option>
                                <option value="Seconde">Seconde</option>
                                <option value="Première">Première</option>
                                <option value="Terminale">Terminale</option>
                              </>
                            )}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <BookOpen size={12} /> Target Subject
                          </label>
                          <select 
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all appearance-none"
                            value={formData.subject}
                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                            required
                          >
                            <option value="">Select a Subject</option>
                            {formData.curriculumId === 'cameroon_francophone' ? (
                              <>
                                <option value="Mathématiques">Mathématiques</option>
                                <option value="Langue Française">Langue Française</option>
                                <option value="English Language">English Language</option>
                                <option value="Histoire">Histoire</option>
                                <option value="Géographie">Géographie</option>
                                <option value="Économie">Économie</option>
                                <option value="Philosophie">Philosophie</option>
                                <option value="Physique">Physique</option>
                                <option value="Chimie">Chimie</option>
                                <option value="Sciences de la Vie et de la Terre (SVT)">Sciences de la Vie et de la Terre (SVT)</option>
                                <option value="Informatique">Informatique</option>
                                <option value="Éducation à la Citoyenneté">Éducation à la Citoyenneté</option>
                              </>
                            ) : (
                              subjects.map(s => (
                                <option key={s.id} value={s.name}>{s.name}</option>
                              ))
                            )}
                          </select>
                        </div>
                      </>
                    )}
                  </div>

                  {/* If HND curriculum is selected, show enrolled semester courses */}
                  {formData.curriculumId === 'hnd' && (
                    <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <GraduationCap size={16} className="text-indigo-600" />
                            <h4 className="text-sm font-black text-indigo-950">
                              Enrolled HND Course Modules ({formData.hndLevel} • {formData.hndSemester})
                            </h4>
                          </div>
                          <p className="text-[11px] text-indigo-700/80 font-medium mt-0.5">
                            Select active course modules to personalize your LMS materials and quizzes.
                          </p>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowHndEnrollmentModal(true)}
                          className="rounded-xl font-bold bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50 shrink-0"
                        >
                          <Sparkles size={14} className="mr-1.5" /> Full Enrollment Wizard
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1">
                        {hndCourses
                          .filter(c => 
                            c.programmeId === formData.hndProgrammeId && 
                            c.level === formData.hndLevel && 
                            c.semester === formData.hndSemester
                          )
                          .map(course => {
                            const isEnrolled = formData.hndEnrolledCourseIds.includes(course.id);
                            return (
                              <div
                                key={course.id}
                                onClick={() => handleToggleCourseSelection(course.id)}
                                className={cn(
                                  "p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-2",
                                  isEnrolled 
                                    ? "bg-white border-indigo-600 text-indigo-950 shadow-xs" 
                                    : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
                                )}
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                                      {course.code}
                                    </span>
                                    <span className="text-xs font-bold truncate">{course.name}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    {course.creditValue} Credits • {course.isPractical ? 'Practical' : 'Core Theory'}
                                  </div>
                                </div>
                                <div className={cn(
                                  "w-5 h-5 rounded-lg border flex items-center justify-center shrink-0",
                                  isEnrolled ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 bg-white"
                                )}>
                                  {isEnrolled && <Check size={12} />}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      {success && (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 text-emerald-600"
                        >
                          <CheckCircle2 size={18} />
                          <span className="text-xs font-black uppercase tracking-widest">Saved Successfully</span>
                        </motion.div>
                      )}
                    </div>
                    <Button type="submit" loading={loading} className="px-8">
                      <Save className="mr-2" size={18} /> Save Changes
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Alumni & Ambassador Programs Section */}
              <div id="alumni-ambassador-section">
                <AlumniAmbassadorSection userProfile={formData} />
              </div>

              {/* Payment History Section */}
              <Card className="p-8 lg:p-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <CreditCard size={20} />
                    <span className="text-sm font-black uppercase tracking-widest">Payment History</span>
                  </div>
                  
                  {loadingHistory ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="animate-spin text-slate-400" size={24} />
                    </div>
                  ) : paymentHistory.length > 0 ? (
                    <div className="space-y-4">
                      {paymentHistory.map((payment) => (
                        <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 gap-4">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{payment.amount} FCFA</p>
                            <p className="text-xs text-slate-500 font-medium">Ref: {payment.transactionId}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{payment.createdAt?.toDate ? formatDate(payment.createdAt.toDate().toISOString()) : 'N/A'}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="default">{payment.network}</Badge>
                            <Badge variant={payment.status === 'approved' ? 'success' : payment.status === 'rejected' ? 'danger' : 'warning'}>
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-sm text-slate-500 font-medium">No payment history found.</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Badges Section */}
              <Card className="p-8 lg:p-12">
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-amber-600">
                      <Trophy size={20} />
                      <span className="text-sm font-black uppercase tracking-widest">Achievements & Badges</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100 w-fit">
                      <Zap className="text-amber-500" size={16} />
                      <span className="text-sm font-black text-amber-700">{user.streak || 0} Day Streak</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {ACHIEVEMENTS.map((achievement) => {
                      const isEarned = user.badges?.includes(achievement.id);
                      
                      return (
                        <div 
                          key={achievement.id}
                          className={cn(
                            "flex flex-col items-center text-center p-4 rounded-3xl border transition-all duration-500",
                            isEarned 
                              ? "bg-amber-50 border-amber-200 shadow-sm scale-105" 
                              : "bg-slate-50 border-slate-100 opacity-40 grayscale"
                          )}
                        >
                          <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center mb-3 overflow-hidden",
                            isEarned ? "bg-white shadow-lg shadow-amber-200" : "bg-slate-200 text-slate-400"
                          )}>
                            {achievement.imageUrl ? (
                              <img src={achievement.imageUrl} alt={achievement.title} className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-2xl">{achievement.icon}</span>
                            )}
                          </div>
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-wider mb-1",
                            isEarned ? "text-amber-700" : "text-slate-500"
                          )}>
                            {achievement.title}
                          </span>
                          <p className="text-[8px] font-bold text-slate-400 leading-tight">
                            {achievement.description}
                          </p>
                          {isEarned && (
                            <div className="mt-2 px-2 py-0.5 bg-amber-200 rounded-full">
                              <span className="text-[8px] font-black text-amber-800">+{achievement.points} PTS</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>

              {/* Security Section */}
              <Card className="p-8 lg:p-12 border-slate-200">
                <div className="space-y-8">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <ShieldCheck size={20} />
                    <span className="text-sm font-black uppercase tracking-widest">Security & Authentication</span>
                  </div>

                  {/* Email Verification Status */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900">Email Verification</span>
                        <Badge variant={isEmailVerified ? "success" : "warning"}>
                          {isEmailVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        {isEmailVerified 
                          ? "Your primary email is verified and secure." 
                          : "Please verify your email address to ensure full account access."}
                      </p>
                    </div>
                    {!isEmailVerified && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        loading={resendingEmail}
                        onClick={async () => {
                          setResendingEmail(true);
                          await resendVerificationEmail();
                          setResendingEmail(false);
                        }}
                        className="rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 shrink-0"
                      >
                        Resend Email
                      </Button>
                    )}
                  </div>

                  {/* Password Reset */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-slate-900">Password Management</h3>
                      <p className="text-xs text-slate-500 font-medium">Receive a secure link to update your password.</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={async () => {
                        try {
                          await sendPasswordResetEmail(auth, user.email);
                          toast.success(`Password reset email sent to ${user.email}`);
                        } catch (err: any) {
                          toast.error(err.message || 'Failed to send password reset link');
                        }
                      }}
                      className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
                    >
                      <KeyRound size={16} className="mr-2" /> Change Password
                    </Button>
                  </div>

                  {/* Recent Activity Logs */}
                  {userLogs.length > 0 && (
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Recent Security Activity</h4>
                      <div className="space-y-2">
                        {userLogs.slice(0, 4).map(log => (
                          <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700">{log.action}</span>
                            <span className="text-slate-400 font-medium">{log.details}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-8">
              <Card className="p-8 space-y-6 bg-slate-900 text-white border-none">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscription Status</span>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black">{user.paymentStatus === 'paid' ? 'Premium Plan' : 'Free Plan'}</h3>
                    <Badge 
                      variant={
                        user.paymentStatus === 'paid' ? 'success' : 
                        user.paymentStatus === 'pending' ? 'warning' : 
                        user.paymentStatus === 'rejected' ? 'danger' : 
                        'secondary'
                      }
                    >
                      {
                        user.paymentStatus === 'paid' ? 'Active' : 
                        user.paymentStatus === 'pending' ? 'Pending Verification' : 
                        user.paymentStatus === 'rejected' ? 'Payment Rejected' : 
                        'Limited'
                      }
                    </Badge>
                  </div>
                </div>
                
                {user.paymentStatus !== 'paid' && (
                  <Button className="w-full bg-white text-slate-900 hover:bg-slate-100" onClick={() => navigate('/payment')}>
                    {user.paymentStatus === 'pending' ? 'View Payment Status' : 
                     user.paymentStatus === 'rejected' ? 'Submit New Payment' : 
                     'Upgrade Now'}
                  </Button>
                )}

                <div className="pt-6 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 font-medium">Member Since</span>
                    <span className="font-bold">
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 font-medium">Diagnostic Status</span>
                    <span className="font-bold text-emerald-400">Completed</span>
                  </div>
                </div>
              </Card>

              <Card className="p-8 space-y-6">
                <h3 className="text-lg font-black text-slate-900">Quick Actions</h3>
                <div className="space-y-3">
                  {[
                    { label: 'View Progress', icon: TrendingUp, onClick: () => navigate('/dashboard') },
                    { label: 'Practice History', icon: ChevronRight, onClick: () => navigate('/practice') },
                    { 
                      label: 'HND Programme Enrollment', 
                      icon: GraduationCap, 
                      onClick: () => setShowHndEnrollmentModal(true)
                    },
                    { 
                      label: 'Ambassador & Alumni', 
                      icon: Sparkles, 
                      onClick: () => {
                        const el = document.getElementById('alumni-ambassador-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      } 
                    },
                  ].map((action, i) => (
                    <button 
                      key={i}
                      onClick={action.onClick}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 group transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <action.icon size={18} className="text-slate-400 group-hover:text-indigo-600" />
                        <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600">{action.label}</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600" />
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>

      {/* HND Enrollment Modal */}
      <HNDEnrollmentModal
        isOpen={showHndEnrollmentModal}
        onClose={() => setShowHndEnrollmentModal(false)}
        user={user}
      />
      </div>
    </ModernDashboardLayout>
  );
}
