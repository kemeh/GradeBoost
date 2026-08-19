import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Lock, Phone, MapPin, School, BookOpen, Sparkles, 
  CheckCircle2, ArrowRight, ArrowLeft, Shield, Award, Globe, Check, Eye, EyeOff, AlertCircle, Smartphone, GraduationCap,
  Search, Compass, Plus, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { logAuditEvent } from '../services/auditService';
import { INTERMEDIATE_LEVEL_COMMERCIAL_SPECIALTIES, ADVANCED_LEVEL_TVEE_COMMERCIAL_SPECIALTIES } from '../constants/commercialCurriculum';
import { DEFAULT_HND_SCHOOLS, DEFAULT_HND_PROGRAMMES, DEFAULT_HND_COURSES } from '../constants/hndCurriculum';
import { HNDAcademicLevel, HNDSemester } from '../types/hnd';
import { sendPhoneOtp, formatPhoneNumber, detectCarrier, phoneToVirtualEmail } from '../services/phoneAuthService';
import { PhoneOtpVerificationModal } from './PhoneOtpVerificationModal';
import { getInstitutions, getProgrammes, submitInstitutionRequest, Institution, Programme } from '../services/institutionService';
import toast from 'react-hot-toast';

interface EnhancedRegistrationProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
  lang?: 'en' | 'fr';
}

export const EnhancedRegistrationModal: React.FC<EnhancedRegistrationProps> = ({ 
  onSuccess, 
  onSwitchToLogin,
  lang = 'en'
}) => {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState<'student' | 'teacher'>('student');
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Searchable Dropdowns State for HND & BTS Learners
  const [academicCategory, setAcademicCategory] = useState<'GCE O/L' | 'GCE A/L' | 'HND' | 'BTS' | 'University' | 'Master\'s' | 'Other'>('GCE A/L');
  const [institutionsList, setInstitutionsList] = useState<Institution[]>([]);
  const [programmesList, setProgrammesList] = useState<Programme[]>([]);
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [showInstitutionDropdown, setShowInstitutionDropdown] = useState(false);
  const [programmeSearch, setProgrammeSearch] = useState('');
  const [showProgrammeDropdown, setShowProgrammeDropdown] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [isNominalRequestModalOpen, setIsNominalRequestModalOpen] = useState(false);
  const [nominalForm, setNominalForm] = useState({ name: '', city: 'Yaoundé', region: 'Center', programme: '' });

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const insts = await getInstitutions();
        const progs = await getProgrammes();
        // Filter out inactive institutions and specialties
        setInstitutionsList(insts.filter(i => i.is_active !== false));
        setProgrammesList(progs.filter(p => p.is_active !== false));
      } catch (err) {
        console.error('Error fetching dropdown registries:', err);
      }
    };
    fetchDropdownData();
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    country: 'Cameroon',
    region: 'Center',
    city: 'Yaoundé',
    school: '',
    
    // Education Info
    curriculum: 'cameroon_gce' as 'cameroon_gce' | 'cameroon_francophone' | 'hnd' | 'both',
    educationLevel: 'Advanced Level' as string, // e.g., 'Ordinary Level', 'Advanced Level', 'Troisième (BEPC)', 'Seconde', 'Première', 'Terminale', 'HND Level 1', 'HND Level 2'
    level: 'Advanced Level' as string,
    levelName: 'Advanced Level' as string,
    
    // Academic Details
    department: 'Science' as string, // Science, Arts, Commercial, Technical, General, or HND Department
    departmentName: 'Science' as string,
    commercialSpecialtyId: '' as string,
    commercialSpecialtyName: '' as string,
    commercialSpecialtyCode: '' as string,
    commercialLevel: 'Advance level' as 'Intermediate level' | 'Advance level',
    // HND Details
    hndSchoolId: 'school_eng_tech',
    hndSchoolName: 'School of Engineering & Technology',
    hndDepartmentId: 'dept_hnd_tech',
    hndProgrammeId: 'prog_hnd_swe',
    hndProgrammeName: 'Software Engineering',
    hndLevel: 'HND Level 1' as HNDAcademicLevel,
    hndSemester: 'Semester 1' as HNDSemester,
    selectedSubjects: ['Mathematics', 'Physics', 'Computer Science'] as string[],
    targetExam: 'GCE Advanced Level' as string,
    
    // Learning Goals
    goals: ['Prepare for exams', 'Improve grades', 'Use AI Tutor'] as string[],
    
    // Learning Preferences
    preferredLanguage: lang,
    studyMode: 'Both (Online & Offline)' as string,
    learningStyle: 'AI Explanations & Practice Questions' as string,

    // HND Dynamic Fields
    studentId: '',
    academicYear: '2025/2026',

    // Teacher Specific
    institutionName: '',
    teachingLevel: 'Secondary High School',
    subjectsTaught: ['Mathematics', 'Physics'],
    yearsExperience: '5+ Years',
  });

  // OTP Verification Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [initialSimulatedOtp, setInitialSimulatedOtp] = useState<string | undefined>();

  const totalSteps = accountType === 'student' ? 6 : 3;

  const handleNext = () => {
    setError('');
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.phone || !formData.password) {
        setError(lang === 'fr' ? 'Veuillez remplir le nom, le numéro de téléphone et le mot de passe.' : 'Please fill in First Name, Last Name, Phone Number, and Password.');
        return;
      }

      const formattedPhone = formatPhoneNumber(formData.phone);
      const carrier = detectCarrier(formattedPhone);
      if (!carrier.isValid) {
        setError(lang === 'fr' ? 'Veuillez saisir un numéro de téléphone mobile valide (ex: +237 670000000).' : 'Please enter a valid mobile phone number (e.g. +237 670000000).');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError(lang === 'fr' ? 'Les mots de passe ne correspondent pas.' : 'Passwords do not match.');
        return;
      }
      if (formData.password.length < 6) {
        setError(lang === 'fr' ? 'Le mot de passe doit contenir au moins 6 caractères.' : 'Password must be at least 6 characters.');
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleStartPhoneVerification = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    
    const formattedPhone = formatPhoneNumber(formData.phone);
    const carrier = detectCarrier(formattedPhone);

    if (!carrier.isValid) {
      setError(lang === 'fr' ? 'Numéro de téléphone invalide.' : 'Invalid phone number format.');
      return;
    }

    setLoading(true);

    try {
      const res = await sendPhoneOtp(formattedPhone, 'registration', lang);
      if (res.success) {
        setInitialSimulatedOtp(res.simulatedOtp);
        setShowOtpModal(true);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch verification SMS code');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterDirectly = async () => {
    setLoading(true);
    setError('');

    try {
      const authEmail = formData.email.trim();
      
      // 1. Authenticate user
      const { user } = await createUserWithEmailAndPassword(auth, authEmail, formData.password);
      
      // 2. Send verification email
      try {
        await sendEmailVerification(user);
      } catch (err) {
        console.error("Failed to send verification email:", err);
      }

      // 3. Complete profile creation
      await finishAccountCreation(user, 'email', false);
      
      onSuccess();
      navigate('/verify-email');
      toast.success(lang === 'fr' ? 'Compte créé ! Veuillez vérifier votre e-mail.' : 'Account created! Please verify your email.');
    } catch (err: any) {
      console.error("Registration Error:", err);
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.email.trim()) {
      // Rule: Has Email (or Email + Phone) -> Verify Email
      await handleRegisterDirectly();
    } else {
      // Rule: No Email -> Verify Phone
      await handleStartPhoneVerification();
    }
  };

  const handlePrev = () => {
    setError('');
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubjectToggle = (subj: string) => {
    setFormData((prev) => {
      const exists = prev.selectedSubjects.includes(subj);
      if (exists) {
        return { ...prev, selectedSubjects: prev.selectedSubjects.filter((s) => s !== subj) };
      }
      return { ...prev, selectedSubjects: [...prev.selectedSubjects, subj] };
    });
  };

  const handleGoalToggle = (goal: string) => {
    setFormData((prev) => {
      const exists = prev.goals.includes(goal);
      if (exists) {
        return { ...prev, goals: prev.goals.filter((g) => g !== goal) };
      }
      return { ...prev, goals: [...prev.goals, goal] };
    });
  };

  const finishAccountCreation = async (firebaseUser: any, method: 'email' | 'phone', phoneVerified: boolean) => {
    const formattedPhone = formatPhoneNumber(formData.phone);
    const carrier = detectCarrier(formattedPhone);
    const authEmail = firebaseUser.email;
    const profileCompletion = accountType === 'student' ? 100 : 90;

    const userPayload: any = {
      uid: firebaseUser.uid,
      firstName: formData.firstName,
      lastName: formData.lastName,
      name: `${formData.firstName} ${formData.lastName}`,
      email: authEmail,
      userProvidedEmail: formData.email.trim() || null,
      phone: formattedPhone,
      phoneVerified: phoneVerified,
      phoneProvider: carrier.carrier,
      verificationMethod: method,
      country: formData.country,
      region: formData.region,
      city: formData.city,
      school: formData.school || formData.institutionName || 'Edulpha Academy',
      role: accountType,
      curriculumId: formData.curriculum,
      curriculumName: formData.curriculum === 'cameroon_gce' 
        ? 'Cameroon GCE (English)' 
        : formData.curriculum === 'cameroon_francophone' 
          ? 'Système Francophone (MINESEC)' 
          : formData.curriculum === 'hnd'
            ? 'Higher National Diploma (HND)'
            : 'Bilingual',
      educationLevelId: formData.level,
      level: formData.curriculum === 'hnd' 
        ? formData.hndLevel 
        : (formData.department === 'Commercial' ? formData.commercialLevel : 'Advanced Level'),
      academicLevel: (formData.curriculum === 'hnd' ? 'HND_BTS' : (formData.educationLevel === 'Ordinary Level' ? 'O Level' : 'A Level')) as any,
      departmentId: formData.department,
      departmentName: formData.departmentName || (formData.curriculum === 'hnd' ? (formData.hndProgrammeName || 'Higher National Diploma') : formData.department),
      commercialSpecialtyId: formData.commercialSpecialtyId || '',
      commercialSpecialtyName: formData.commercialSpecialtyName || '',
      commercialSpecialtyCode: formData.commercialSpecialtyCode || '',
      selectedSubjects: formData.selectedSubjects,
      subject: formData.selectedSubjects[0] || (formData.curriculum === 'hnd' ? formData.hndProgrammeName : 'General Studies'),
      targetExam: formData.curriculum === 'hnd' ? `HND National Exam (${formData.hndProgrammeName})` : formData.targetExam,
      goals: formData.goals,
      preferredLanguage: formData.preferredLanguage,
      studyMode: formData.studyMode,
      learningStyle: formData.learningStyle,
      profileCompletion,
      status: 'active',
      isPaid: false,
      paymentStatus: 'unpaid',
      points: 50, // Welcome points
      streak: 1,
      badges: ['welcome_badge'],
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      verificationSentAt: serverTimestamp(),
    };

    // HND Specific Fields
    if (formData.curriculum === 'hnd') {
      userPayload.hndSchoolId = formData.hndSchoolId;
      userPayload.hndSchoolName = formData.hndSchoolName;
      userPayload.hndDepartmentId = formData.hndDepartmentId;
      userPayload.hndProgrammeId = formData.hndProgrammeId;
      userPayload.hndProgrammeName = formData.hndProgrammeName;
      userPayload.hndProgrammeCode = formData.commercialSpecialtyCode || 'HND';
      userPayload.hndLevel = formData.hndLevel;
      userPayload.hndSemester = formData.hndSemester;
      
      const hndEnrolledCourses = DEFAULT_HND_COURSES.filter(
        c => c.programmeId === formData.hndProgrammeId && c.level === formData.hndLevel && c.semester === formData.hndSemester
      );
      userPayload.hndEnrolledCourseIds = hndEnrolledCourses.map(c => c.id);
      userPayload.hndEnrolledCourseCodes = hndEnrolledCourses.map(c => c.code);
      userPayload.hndEnrolledCourseNames = hndEnrolledCourses.map(c => c.name);
    }

    await setDoc(doc(db, 'users', firebaseUser.uid), userPayload);
    
    // Write HND Enrollment if needed
    if (formData.curriculum === 'hnd') {
      const hndEnrolledCourses = DEFAULT_HND_COURSES.filter(
        c => c.programmeId === formData.hndProgrammeId && c.level === formData.hndLevel && c.semester === formData.hndSemester
      );
      const enrollmentDocRef = doc(db, 'hnd_enrollments', `${firebaseUser.uid}_${formData.hndLevel.replace(/\s+/g, '_')}_${formData.hndSemester.replace(/\s+/g, '_')}`);
      await setDoc(enrollmentDocRef, {
        studentId: firebaseUser.uid,
        studentName: userPayload.name,
        studentEmail: authEmail,
        schoolId: formData.hndSchoolId,
        schoolName: formData.hndSchoolName,
        departmentId: formData.hndDepartmentId,
        departmentName: formData.department,
        programmeId: formData.hndProgrammeId,
        programmeName: formData.hndProgrammeName,
        programmeCode: formData.commercialSpecialtyCode || 'HND',
        level: formData.hndLevel,
        semester: formData.hndSemester,
        enrolledCourseIds: hndEnrolledCourses.map(c => c.id),
        enrolledCourseCodes: hndEnrolledCourses.map(c => c.code),
        enrolledCourseNames: hndEnrolledCourses.map(c => c.name),
        status: 'active',
        enrolledAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    // Log Audit
    void logAuditEvent({
      userId: firebaseUser.uid,
      userEmail: authEmail,
      action: 'REGISTER_SUCCESS',
      details: `User registered via ${method} verification. Role: ${accountType}`,
    });
  };

  const handleOtpVerifiedCompleteRegistration = async () => {
    setShowOtpModal(false);
    setLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(formData.phone);
      // Use fallback to virtual email for phone-only
      const authEmail = phoneToVirtualEmail(formattedPhone);

      // 1. Authenticate user
      const { user } = await createUserWithEmailAndPassword(auth, authEmail, formData.password);
      
      // 2. Complete profile creation (phone is already verified by OTP)
      await finishAccountCreation(user, 'phone', true);
      
      onSuccess();
      navigate('/dashboard');
      toast.success(lang === 'fr' ? 'Compte vérifié et créé !' : 'Account verified and created!');
    } catch (err: any) {
      console.error("OTP Registration Error:", err);
      setError(err.message || "Failed to complete registration after OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNomination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nominalForm.name || !nominalForm.city) {
      toast.error('Institution name and city are required.');
      return;
    }
    setLoading(true);
    try {
      await submitInstitutionRequest({
        name: nominalForm.name,
        city: nominalForm.city,
        region: nominalForm.region,
        qualification: (academicCategory === 'HND' || academicCategory === 'BTS') ? academicCategory : 'BOTH',
        programme: nominalForm.programme,
        userEmail: formData.email || 'anonymous-register@edulpha.edu.cm'
      });
      toast.success('Thank you! Your custom institution suggestion has been logged.');
      
      // Auto-set suggestion to form school/institution field to avoid blocking them!
      setFormData({
        ...formData,
        school: nominalForm.name,
        city: nominalForm.city,
        region: nominalForm.region,
        hndSchoolName: nominalForm.name
      });
      setInstitutionSearch(nominalForm.name);
      setIsNominalRequestModalOpen(false);
    } catch (err) {
      console.error('Failed to log suggestion nomination:', err);
      toast.error('Failed to submit nomination request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-slate-200 p-4 sm:p-6 md:p-8 max-w-2xl w-full mx-auto space-y-4 sm:space-y-6 box-border overflow-y-auto max-h-[calc(100dvh-2rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3 sm:pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[11px] sm:text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 shrink-0" /> Edulpha Onboarding Ecosystem
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            {lang === 'fr' ? 'Créer un compte Edulpha' : 'Create Edulpha Account'}
          </h2>
        </div>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 py-1"
        >
          {lang === 'fr' ? 'Déjà un compte ? Connexion' : 'Already have an account? Login'}
        </button>
      </div>

      {/* Account Type Selector (Only on step 1) */}
      {currentStep === 1 && (
        <div className="space-y-2">
          <label className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider">
            {lang === 'fr' ? 'Type de Compte' : 'Select Account Type'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setAccountType('student')}
              className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 font-bold text-sm text-left flex items-center gap-3 transition min-h-[56px] ${
                accountType === 'student'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <User className={`w-5 h-5 shrink-0 ${accountType === 'student' ? 'text-blue-600' : 'text-slate-400'}`} />
              <div>
                <div className="text-xs sm:text-sm">{lang === 'fr' ? 'Étudiant / Élève' : 'Student Learner'}</div>
                <div className="text-[10px] sm:text-[11px] font-normal text-slate-500">GCE, BEPC, Baccalauréat</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setAccountType('teacher')}
              className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 font-bold text-sm text-left flex items-center gap-3 transition min-h-[56px] ${
                accountType === 'teacher'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <Shield className={`w-5 h-5 shrink-0 ${accountType === 'teacher' ? 'text-blue-600' : 'text-slate-400'}`} />
              <div>
                <div className="text-xs sm:text-sm">{lang === 'fr' ? 'Enseignant' : 'Teacher / Educator'}</div>
                <div className="text-[10px] sm:text-[11px] font-normal text-slate-500">LMS & Class Management</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs font-bold text-slate-500">
          <span>{lang === 'fr' ? `Étape ${currentStep} sur ${totalSteps}` : `Step ${currentStep} of ${totalSteps}`}</span>
          <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-blue-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* FORM WIZARD */}
      <form onSubmit={currentStep === totalSteps ? handleSubmitFinal : (e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
        
        {/* STUDENT STEP 1: Basic Information */}
        {accountType === 'student' && currentStep === 1 && (
          <div className="space-y-3 sm:space-y-4 animate-in fade-in">
            <h3 className="font-bold text-sm sm:text-base text-slate-900">1. Basic Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">First Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Kemeh"
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm font-semibold focus:bg-white focus:border-blue-600 outline-none box-border"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Last Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Hilary"
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm font-semibold focus:bg-white focus:border-blue-600 outline-none box-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 flex items-center justify-between">
                  <span>Mobile Phone Number <span className="text-rose-500">*</span></span>
                  {formData.phone && (() => {
                    const c = detectCarrier(formData.phone);
                    return c.isValid ? (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 uppercase">
                        {c.carrier}
                      </span>
                    ) : null;
                  })()}
                </label>
                <div className="relative w-full">
                  <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+237 670 00 00 00"
                    className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none box-border"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">
                  Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com (Optional)"
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm font-semibold focus:bg-white focus:border-blue-600 outline-none box-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Password</label>
                <div className="relative w-full">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-3.5 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm font-semibold focus:bg-white focus:border-blue-600 outline-none box-border"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm font-semibold focus:bg-white focus:border-blue-600 outline-none box-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={e => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold box-border"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Region</label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={e => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold box-border"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold box-border"
                />
              </div>
            </div>
          </div>
        )}

        {/* STUDENT STEP 2: Education Information */}
        {accountType === 'student' && currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="font-bold text-base text-slate-900">2. Education Curriculum & Level</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">Select Academic Level / Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'GCE O/L', label: '🇬🇧 GCE O/L', desc: 'Ordinary Level' },
                  { key: 'GCE A/L', label: '🇬🇧 GCE A/L', desc: 'Advanced Level' },
                  { key: 'HND', label: '🎓 HND', desc: 'Higher National Diploma' },
                  { key: 'BTS', label: '🎓 BTS', desc: 'Brevet de Technicien Sup' },
                  { key: 'University', label: '🏛️ University', desc: 'Undergraduate' },
                  { key: 'Master\'s', label: '📜 Master\'s', desc: 'Postgraduate' },
                  { key: 'Other', label: '✨ Other', desc: 'Professional' }
                ].map(item => {
                  const isSelected = academicCategory === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setAcademicCategory(item.key as any);
                        if (item.key === 'GCE O/L') {
                          setFormData({ ...formData, curriculum: 'cameroon_gce', educationLevel: 'Ordinary Level' });
                        } else if (item.key === 'GCE A/L') {
                          setFormData({ ...formData, curriculum: 'cameroon_gce', educationLevel: 'Advanced Level' });
                        } else if (item.key === 'HND' || item.key === 'BTS') {
                          setFormData({ 
                            ...formData, 
                            curriculum: 'hnd', 
                            educationLevel: item.key === 'HND' ? 'HND Level 1' : 'BTS Level 1',
                            hndLevel: 'HND Level 1'
                          });
                        } else {
                          setFormData({ ...formData, curriculum: 'both', educationLevel: item.key });
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-extrabold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 font-bold hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs">{item.label}</div>
                      <div className="text-[9px] font-medium text-slate-400 mt-0.5">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* If HND/BTS selection, show Cameroonian fields dynamically */}
            {(academicCategory === 'HND' || academicCategory === 'BTS') ? (
              <div className="space-y-3 pt-2 bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                <span className="text-xs font-black text-indigo-950 uppercase tracking-wider block">
                  {academicCategory} Enrollment Particulars
                </span>
                
                {/* Region & City */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Region *</label>
                    <select
                      value={formData.region}
                      onChange={e => setFormData({ ...formData, region: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
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

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">City *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Douala"
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Searchable dropdown: Institution Name */}
                <div className="space-y-1 relative">
                  <label className="text-[11px] font-bold text-slate-600 flex justify-between items-center">
                    <span>Search Higher Institution *</span>
                    <button
                      type="button"
                      onClick={() => {
                        setNominalForm({ name: institutionSearch, city: formData.city, region: formData.region, programme: '' });
                        setIsNominalRequestModalOpen(true);
                      }}
                      className="text-[10px] text-indigo-600 hover:underline font-extrabold"
                    >
                      + Nominate Institution
                    </button>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      value={institutionSearch}
                      onFocus={() => setShowInstitutionDropdown(true)}
                      onChange={e => {
                        setInstitutionSearch(e.target.value);
                        setShowInstitutionDropdown(true);
                      }}
                      placeholder="Type school name or acronym to search..."
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                    />
                  </div>

                  {showInstitutionDropdown && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto z-40 p-1 space-y-0.5">
                      {institutionsList
                        .filter(inst => {
                          const s = institutionSearch.toLowerCase();
                          const matchesQual = academicCategory === 'HND' ? inst.hnd_available : inst.bts_available;
                          return matchesQual && (
                            inst.name.toLowerCase().includes(s) ||
                            inst.city.toLowerCase().includes(s) ||
                            (inst.acronym && inst.acronym.toLowerCase().includes(s))
                          );
                        })
                        .map(inst => (
                          <div
                            key={inst.id}
                            onClick={() => {
                              setSelectedInstitution(inst);
                              setInstitutionSearch(`${inst.name} (${inst.acronym || 'IPES'})`);
                              setShowInstitutionDropdown(false);
                              setFormData({
                                ...formData,
                                school: inst.name,
                                city: inst.city,
                                region: inst.region,
                                hndSchoolId: inst.id,
                                hndSchoolName: inst.name,
                              });
                            }}
                            className="px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer text-xs font-bold text-slate-700 flex justify-between items-center"
                          >
                            <div>
                              <div>{inst.name}</div>
                              <div className="text-[10px] font-medium text-slate-400 mt-0.5">{inst.city}, {inst.region} Region</div>
                            </div>
                            <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-mono uppercase">{inst.acronym || 'IPES'}</span>
                          </div>
                        ))}
                      <div
                        onClick={() => {
                          setNominalForm({ name: institutionSearch, city: formData.city, region: formData.region, programme: '' });
                          setIsNominalRequestModalOpen(true);
                          setShowInstitutionDropdown(false);
                        }}
                        className="px-3 py-2 hover:bg-indigo-50 rounded-lg cursor-pointer text-xs font-black text-indigo-600 border-t border-slate-100 flex items-center justify-between"
                      >
                        <span>Can't find your institution? Suggest here...</span>
                        <Plus size={14} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Searchable dropdown: Specialty */}
                <div className="space-y-1 relative">
                  <label className="text-[11px] font-bold text-slate-600">Accredited Programme / Specialization *</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      value={programmeSearch}
                      onFocus={() => setShowProgrammeDropdown(true)}
                      onChange={e => {
                        setProgrammeSearch(e.target.value);
                        setShowProgrammeDropdown(true);
                      }}
                      placeholder="Type specialization (e.g. Software Engineering)..."
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                    />
                  </div>

                  {showProgrammeDropdown && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto z-40 p-1 space-y-0.5">
                      {(selectedInstitution 
                        ? programmesList.filter(p => p.institution_id === selectedInstitution.id)
                        : programmesList
                       )
                        .filter(p => {
                          const s = programmeSearch.toLowerCase();
                          const matchesType = p.qualification_type === 'BOTH' || p.qualification_type === academicCategory;
                          return matchesType && (
                            p.programme_name.toLowerCase().includes(s) ||
                            (p.specialization && p.specialization.toLowerCase().includes(s))
                          );
                        })
                        .map(p => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setProgrammeSearch(p.programme_name);
                              setShowProgrammeDropdown(false);
                              
                              const matchedCurriculumProg = DEFAULT_HND_PROGRAMMES.find(d => d.name.toLowerCase() === p.programme_name.toLowerCase());
                              const progId = matchedCurriculumProg?.id || 'prog_hnd_swe';
                              const progName = p.programme_name;
                              const initialCourses = DEFAULT_HND_COURSES
                                .filter(c => c.programmeId === progId && c.level === formData.hndLevel && c.semester === formData.hndSemester)
                                .map(c => c.name);

                              setFormData({
                                ...formData,
                                hndProgrammeId: progId,
                                hndProgrammeName: progName,
                                department: p.specialization || 'Commercial',
                                selectedSubjects: initialCourses,
                              });
                            }}
                            className="px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer text-xs font-bold text-slate-700 flex justify-between items-center"
                          >
                            <div>
                              <div>{p.programme_name}</div>
                              {p.specialization && <div className="text-[10px] font-medium text-slate-400 mt-0.5">{p.specialization}</div>}
                            </div>
                            <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-mono uppercase">{p.qualification_type}</span>
                          </div>
                        ))}
                      {/* Standard curriculum fallbacks */}
                      {DEFAULT_HND_PROGRAMMES
                        .filter(p => p.name.toLowerCase().includes(programmeSearch.toLowerCase()))
                        .map(p => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setProgrammeSearch(p.name);
                              setShowProgrammeDropdown(false);
                              const initialCourses = DEFAULT_HND_COURSES
                                .filter(c => c.programmeId === p.id && c.level === formData.hndLevel && c.semester === formData.hndSemester)
                                .map(c => c.name);

                              setFormData({
                                ...formData,
                                hndProgrammeId: p.id,
                                hndProgrammeName: p.name,
                                department: p.code,
                                selectedSubjects: initialCourses,
                              });
                            }}
                            className="px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer text-xs font-bold text-indigo-700 flex justify-between items-center"
                          >
                            <div>
                              <div>{p.name} (Curriculum Standard)</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Level and Academic Year */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Level *</label>
                    <div className="grid grid-cols-2 gap-1">
                      {['Level 1', 'Level 2'].map(lvl => {
                        const label = academicCategory === 'HND' ? `HND ${lvl}` : `BTS ${lvl}`;
                        const isSelected = formData.educationLevel === label || formData.hndLevel === label as any || formData.educationLevel.includes(lvl);
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => {
                              setFormData({ 
                                ...formData, 
                                educationLevel: label,
                                hndLevel: lvl === 'Level 1' ? 'HND Level 1' : 'HND Level 2'
                              });
                            }}
                            className={`py-2 px-1 rounded-xl border text-[10px] font-bold transition text-center ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Academic Year *</label>
                    <input
                      type="text"
                      value={formData.academicYear}
                      onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                      placeholder="e.g. 2025/2026"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Regular School Selection */
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-600 font-sans">School / College Name</label>
                <input
                  type="text"
                  value={formData.school}
                  onChange={e => setFormData({ ...formData, school: e.target.value })}
                  placeholder="e.g. GBHS Yaoundé, Saker Baptist College..."
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-blue-600 outline-none box-border"
                />
              </div>
            )}
          </div>
        )}

        {/* STUDENT STEP 3: Academic Details */}
        {accountType === 'student' && currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              {formData.curriculum === 'hnd' ? '3. HND School, Programme & Course Selection' : '3. Academic Department & Subject Selection'}
            </h3>
            
            {formData.curriculum === 'hnd' ? (
              /* HND Registration Flow */
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* School / Faculty */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">HND School / Faculty</label>
                    <select
                      value={formData.hndSchoolId}
                      onChange={e => {
                        const schoolId = e.target.value;
                        const school = DEFAULT_HND_SCHOOLS.find(s => s.id === schoolId);
                        const firstProg = DEFAULT_HND_PROGRAMMES.find(p => p.schoolId === schoolId);
                        const newProgId = firstProg?.id || '';
                        const newProgName = firstProg?.name || '';
                        const initialCourses = DEFAULT_HND_COURSES
                          .filter(c => c.programmeId === newProgId && c.level === formData.hndLevel && c.semester === formData.hndSemester)
                          .map(c => c.name);
                        
                        setFormData({
                          ...formData,
                          hndSchoolId: schoolId,
                          hndSchoolName: school?.name || '',
                          hndProgrammeId: newProgId,
                          hndProgrammeName: newProgName,
                          department: newProgName,
                          selectedSubjects: initialCourses
                        });
                      }}
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                    >
                      {DEFAULT_HND_SCHOOLS.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                      ))}
                    </select>
                  </div>

                  {/* Programme / Specialty */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">HND Programme / Specialty</label>
                    <select
                      value={formData.hndProgrammeId}
                      onChange={e => {
                        const progId = e.target.value;
                        const prog = DEFAULT_HND_PROGRAMMES.find(p => p.id === progId);
                        const initialCourses = DEFAULT_HND_COURSES
                          .filter(c => c.programmeId === progId && c.level === formData.hndLevel && c.semester === formData.hndSemester)
                          .map(c => c.name);

                        setFormData({
                          ...formData,
                          hndProgrammeId: progId,
                          hndProgrammeName: prog?.name || '',
                          department: prog?.name || '',
                          selectedSubjects: initialCourses
                        });
                      }}
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                    >
                      {DEFAULT_HND_PROGRAMMES
                        .filter(p => !formData.hndSchoolId || p.schoolId === formData.hndSchoolId)
                        .map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Academic Level */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Academic Year / Level</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['HND Level 1', 'HND Level 2'].map(lvl => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => {
                            const initialCourses = DEFAULT_HND_COURSES
                              .filter(c => c.programmeId === formData.hndProgrammeId && c.level === lvl && c.semester === formData.hndSemester)
                              .map(c => c.name);
                            setFormData({
                              ...formData,
                              hndLevel: lvl as HNDAcademicLevel,
                              educationLevel: lvl,
                              selectedSubjects: initialCourses
                            });
                          }}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                            formData.hndLevel === lvl
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {lvl === 'HND Level 1' ? 'Level 1 (Yr 1)' : 'Level 2 (Yr 2)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Semester */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Current Semester</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Semester 1', 'Semester 2'].map(sem => (
                        <button
                          key={sem}
                          type="button"
                          onClick={() => {
                            const initialCourses = DEFAULT_HND_COURSES
                              .filter(c => c.programmeId === formData.hndProgrammeId && c.level === formData.hndLevel && c.semester === sem)
                              .map(c => c.name);
                            setFormData({
                              ...formData,
                              hndSemester: sem as HNDSemester,
                              selectedSubjects: initialCourses
                            });
                          }}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                            formData.hndSemester === sem
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {sem}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dynamic HND/BTS Fields: Student ID & Academic Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Student ID / Matriculation Number</label>
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                      placeholder="e.g. HND2026-SWE01"
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Academic Year</label>
                    <input
                      type="text"
                      value={formData.academicYear}
                      onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                      placeholder="2025/2026"
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                    />
                  </div>
                </div>

                {/* HND Enrolled Course Modules */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Enrolled HND Course Modules ({formData.selectedSubjects.length} courses)
                    </label>
                    <span className="text-[11px] font-bold text-indigo-600">
                      {formData.hndLevel} • {formData.hndSemester}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
                    {DEFAULT_HND_COURSES
                      .filter(c => c.programmeId === formData.hndProgrammeId && c.level === formData.hndLevel && c.semester === formData.hndSemester)
                      .map(course => {
                        const isSelected = formData.selectedSubjects.includes(course.name);
                        return (
                          <button
                            key={course.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setFormData({
                                  ...formData,
                                  selectedSubjects: formData.selectedSubjects.filter(s => s !== course.name)
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  selectedSubjects: [...formData.selectedSubjects, course.name]
                                });
                              }
                            }}
                            className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition ${
                              isSelected
                                ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold truncate">[{course.code}] {course.name}</div>
                              <div className="text-[10px] text-slate-500 font-medium">{course.creditValue} Credits • {course.isPractical ? 'Practical Module' : 'Theory & Core'}</div>
                            </div>
                            <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-300'}`}>
                              {isSelected && <Check size={12} />}
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>
            ) : (
              /* Standard GCE & Francophone Selection */
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600">Department / Stream</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {['Science', 'Arts', 'Commercial', 'Technical', 'General Education'].map(dept => (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => {
                          setFormData({ 
                            ...formData, 
                            department: dept,
                            commercialSpecialtyId: '',
                            commercialSpecialtyName: '',
                            commercialSpecialtyCode: '',
                            selectedSubjects: dept === 'Commercial' ? [] : ['Mathematics', 'Physics', 'Computer Science']
                          });
                        }}
                        className={`p-2.5 sm:p-3 rounded-xl border font-bold text-xs transition text-center min-h-[44px] flex items-center justify-center ${
                          formData.department === dept
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>

            {formData.department === 'Commercial' ? (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Commercial Level</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: 'Intermediate level', name: 'Intermediate Level (TVE IL)' },
                      { id: 'Advance level', name: 'Advanced Level (TVEE)' }
                    ].map(lvl => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            commercialLevel: lvl.id as any,
                            commercialSpecialtyId: '',
                            commercialSpecialtyName: '',
                            commercialSpecialtyCode: '',
                            selectedSubjects: []
                          });
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition text-center min-h-[44px] flex items-center justify-center ${
                          formData.commercialLevel === lvl.id
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {lvl.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Select Commercial Specialty</label>
                  <select
                    value={formData.commercialSpecialtyId}
                    onChange={e => {
                      const specId = e.target.value;
                      const specs = formData.commercialLevel === 'Intermediate level' 
                        ? INTERMEDIATE_LEVEL_COMMERCIAL_SPECIALTIES 
                        : ADVANCED_LEVEL_TVEE_COMMERCIAL_SPECIALTIES;
                      const found = specs.find(s => s.id === specId);
                      if (found) {
                        setFormData({
                          ...found,
                          ...formData,
                          commercialSpecialtyId: found.id,
                          commercialSpecialtyName: found.name,
                          commercialSpecialtyCode: found.code,
                          selectedSubjects: [...found.professionalSubjects] // Auto-select compulsory professional subjects
                        });
                      } else {
                        setFormData({
                          ...formData,
                          commercialSpecialtyId: '',
                          commercialSpecialtyName: '',
                          commercialSpecialtyCode: '',
                          selectedSubjects: []
                        });
                      }
                    }}
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none box-border"
                  >
                    <option value="">-- Select Specialty --</option>
                    {(formData.commercialLevel === 'Intermediate level' 
                      ? INTERMEDIATE_LEVEL_COMMERCIAL_SPECIALTIES 
                      : ADVANCED_LEVEL_TVEE_COMMERCIAL_SPECIALTIES
                    ).map(spec => (
                      <option key={spec.id} value={spec.id}>
                        {spec.code} - {spec.name}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.commercialSpecialtyId && (() => {
                  const specs = formData.commercialLevel === 'Intermediate level' 
                    ? INTERMEDIATE_LEVEL_COMMERCIAL_SPECIALTIES 
                    : ADVANCED_LEVEL_TVEE_COMMERCIAL_SPECIALTIES;
                  const currentSpec = specs.find(s => s.id === formData.commercialSpecialtyId);
                  if (!currentSpec) return null;

                  return (
                    <div className="space-y-3 pt-2 bg-slate-50 p-3 rounded-xl border border-slate-200 box-border overflow-hidden">
                      <div>
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                          1. Professional Subjects (Compulsory - All 3)
                        </span>
                        <div className="space-y-1">
                          {currentSpec.professionalSubjects.map(sub => (
                            <div key={sub} className="text-xs font-semibold bg-white p-2 rounded-lg border border-emerald-200 text-emerald-900 flex items-center justify-between gap-1">
                              <span className="truncate">{sub}</span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold shrink-0">Compulsory</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block mb-1">
                          2. Related & Elective Subjects (Select at least 3)
                        </span>
                        <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto">
                          {[...currentSpec.relatedSubjects, ...currentSpec.generalOrPoolSubjects, ...(currentSpec.complementarySubjects || [])].map(sub => {
                            const isSelected = formData.selectedSubjects.includes(sub);
                            return (
                              <button
                                key={sub}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    if (currentSpec.professionalSubjects.includes(sub)) return;
                                    setFormData({
                                      ...formData,
                                      selectedSubjects: formData.selectedSubjects.filter(s => s !== sub)
                                    });
                                  } else {
                                    if (formData.selectedSubjects.length >= 8) {
                                      toast.error('Maximum 8 subjects allowed.');
                                      return;
                                    }
                                    setFormData({
                                      ...formData,
                                      selectedSubjects: [...formData.selectedSubjects, sub]
                                    });
                                  }
                                }}
                                className={`p-2 rounded-lg border text-xs font-semibold text-left flex items-center justify-between gap-1 transition ${
                                  isSelected ? 'bg-indigo-50 border-indigo-600 text-indigo-900' : 'bg-white border-slate-200 text-slate-700'
                                }`}
                              >
                                <span className="truncate">{sub}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="text-[11px] font-bold text-slate-600 pt-1 flex flex-wrap items-center justify-between gap-1">
                        <span>Selected Subjects: <span className="text-blue-600">{formData.selectedSubjects.length}</span> (Rule: 6–8 total)</span>
                        {formData.selectedSubjects.length >= 6 && formData.selectedSubjects.length <= 8 ? (
                          <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={12} /> Valid Selection</span>
                        ) : (
                          <span className="text-amber-600">Select {6 - formData.selectedSubjects.length > 0 ? 6 - formData.selectedSubjects.length : 0} more</span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <>
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-600">Select Your Main Subjects (Select multiple)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {[
                      'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
                      'English Language', 'French', 'Economics', 'Geography', 'History', 'Accounting', 'Mechanics'
                    ].map(subj => {
                      const isSelected = formData.selectedSubjects.includes(subj);
                      return (
                        <button
                          key={subj}
                          type="button"
                          onClick={() => handleSubjectToggle(subj)}
                          className={`p-2.5 rounded-xl border text-xs font-bold text-left flex items-center justify-between gap-1 transition ${
                            isSelected ? 'bg-blue-50 border-blue-600 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className="truncate">{subj}</span>
                          {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-600">Target Examination</label>
                  <select
                    value={formData.targetExam}
                    onChange={e => setFormData({ ...formData, targetExam: e.target.value })}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm font-semibold outline-none box-border"
                  >
                    <option value="GCE Advanced Level">GCE Advanced Level</option>
                    <option value="GCE Ordinary Level">GCE Ordinary Level</option>
                    <option value="BEPC">BEPC (Brevet d'Études du Premier Cycle)</option>
                    <option value="Baccalauréat C/D">Baccalauréat (Série C / D)</option>
                    <option value="Probatoire">Probatoire</option>
                  </select>
                </div>
              </>
            )}
            </>
            )}
          </div>
        )}

        {/* STUDENT STEP 4: Learning Goals */}
        {accountType === 'student' && currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="font-bold text-sm sm:text-base text-slate-900">4. What are your main learning goals?</h3>
            <div className="grid grid-cols-1 gap-2.5">
              {[
                'Prepare for exams (GCE / BEPC / BAC)',
                'Improve grades in difficult subjects',
                'Learn programming & computer science',
                'Master difficult past exam papers',
                'Get comprehensive revision materials & PDFs',
                'Use Edulpha AI Tutor for 24/7 step-by-step guidance'
              ].map(goal => {
                const isSelected = formData.goals.includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => handleGoalToggle(goal)}
                    className={`p-3 sm:p-3.5 rounded-xl border text-xs font-bold text-left flex items-center justify-between gap-2 transition ${
                      isSelected ? 'bg-blue-50 border-blue-600 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="leading-tight">{goal}</span>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STUDENT STEP 5: Learning Preferences */}
        {accountType === 'student' && currentStep === 5 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="font-bold text-sm sm:text-base text-slate-900">5. Learning Preferences & Language</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">Preferred Language</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, preferredLanguage: 'en' })}
                  className={`p-3 rounded-xl border font-bold text-xs transition min-h-[44px] ${
                    formData.preferredLanguage === 'en' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  🇬🇧 English (GCE Focused)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, preferredLanguage: 'fr' })}
                  className={`p-3 rounded-xl border font-bold text-xs transition min-h-[44px] ${
                    formData.preferredLanguage === 'fr' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  🇫🇷 Français (Système MINESEC)
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-600">Study Mode</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {['Online only', 'Offline downloads', 'Both (Recommended)'].map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFormData({ ...formData, studyMode: mode })}
                    className={`p-3 rounded-xl border font-bold text-xs transition text-center min-h-[44px] ${
                      formData.studyMode === mode ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STUDENT STEP 6: Confirmation */}
        {accountType === 'student' && currentStep === 6 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="font-bold text-sm sm:text-base text-slate-900">6. Account Summary & Confirmation</h3>
            <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
              <div className="flex flex-wrap justify-between border-b border-slate-200 pb-2 gap-1">
                <span className="text-slate-500">Full Name:</span>
                <span className="font-bold text-slate-900">{formData.firstName} {formData.lastName}</span>
              </div>
              <div className="flex flex-wrap justify-between border-b border-slate-200 pb-2 gap-1">
                <span className="text-slate-500">Email:</span>
                <span className="font-bold text-slate-900 truncate max-w-full">{formData.email || 'N/A'}</span>
              </div>
              <div className="flex flex-wrap justify-between border-b border-slate-200 pb-2 gap-1">
                <span className="text-slate-500">Curriculum & Level:</span>
                <span className="font-bold text-blue-600">{formData.educationLevel} ({formData.curriculum})</span>
              </div>
              <div className="flex flex-wrap justify-between border-b border-slate-200 pb-2 gap-1">
                <span className="text-slate-500">Selected Subjects:</span>
                <span className="font-bold text-slate-900">{formData.selectedSubjects.join(', ')}</span>
              </div>
              <div className="flex flex-wrap justify-between gap-1">
                <span className="text-slate-500">Target Exam:</span>
                <span className="font-bold text-emerald-600">{formData.targetExam}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              By clicking "Complete Registration", you agree to Edulpha's terms of service and privacy policy. Your AI Tutor will be instantly personalized to your GCE / Baccalauréat profile.
            </p>
          </div>
        )}

        {/* TEACHER FLOW (3 Steps) */}
        {accountType === 'teacher' && currentStep === 1 && (
          <div className="space-y-3 sm:space-y-4 animate-in fade-in">
            <h3 className="font-bold text-sm sm:text-base text-slate-900">1. Teacher Professional Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input
                type="text"
                placeholder="First Name"
                required
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm font-semibold outline-none box-border"
              />
              <input
                type="text"
                placeholder="Last Name"
                required
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm font-semibold outline-none box-border"
              />
            </div>
            <input
              type="email"
              placeholder="Email Address"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm font-semibold outline-none box-border"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input
                type="password"
                placeholder="Password"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm font-semibold outline-none box-border"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                required
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm font-semibold outline-none box-border"
              />
            </div>
          </div>
        )}

        {accountType === 'teacher' && currentStep === 2 && (
          <div className="space-y-3 sm:space-y-4 animate-in fade-in">
            <h3 className="font-bold text-sm sm:text-base text-slate-900">2. Institution & Teaching Experience</h3>
            <input
              type="text"
              placeholder="School / Institution Name"
              required
              value={formData.institutionName}
              onChange={e => setFormData({ ...formData, institutionName: e.target.value })}
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm font-semibold outline-none box-border"
            />
            <select
              value={formData.teachingLevel}
              onChange={e => setFormData({ ...formData, teachingLevel: e.target.value })}
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm font-semibold outline-none box-border"
            >
              <option value="Secondary High School (A-Level / Terminale)">Secondary High School (A-Level / Terminale)</option>
              <option value="Middle School (O-Level / BEPC)">Middle School (O-Level / BEPC)</option>
              <option value="University / College">University / College</option>
            </select>
            <input
              type="text"
              placeholder="Subjects Taught (comma separated)"
              value={formData.subjectsTaught.join(', ')}
              onChange={e => setFormData({ ...formData, subjectsTaught: e.target.value.split(',').map(s => s.trim()) })}
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm font-semibold outline-none box-border"
            />
          </div>
        )}

        {accountType === 'teacher' && currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="font-bold text-sm sm:text-base text-slate-900">3. Verification & Confirmation</h3>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 text-xs space-y-2">
              <p className="font-bold">Teacher Verification Notice:</p>
              <p>Teacher accounts receive instant access to LMS Studio, class analytics, and exam question builder. Administrator verification will be confirmed via email.</p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center gap-2 pt-4 border-t border-slate-100">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 sm:px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition min-h-[48px]"
            >
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 sm:px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-md transition min-h-[48px]"
            >
              Next Step <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-5 sm:px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-md transition min-h-[48px]"
            >
              {loading ? 'Creating Account...' : 'Complete Registration 🚀'}
            </button>
          )}
        </div>
      </form>

      {/* OTP Modal */}
      <PhoneOtpVerificationModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        phone={formatPhoneNumber(formData.phone)}
        onSuccess={handleOtpVerifiedCompleteRegistration}
        reason="registration"
        initialSimulatedOtp={initialSimulatedOtp}
        lang={lang}
      />

      {/* Suggest Custom Higher Institution Nomination Modal */}
      {isNominalRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-1">
              Suggest Custom {academicCategory} Institution
            </h4>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed font-medium">
              Edulpha is continuously updating Cameroonian IPES & accredited higher institutions. Suggest yours and we will activate it after verification.
            </p>
            
            <form onSubmit={handleSubmitNomination} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 block">Proposed Institution Name *</label>
                <input
                  type="text"
                  required
                  value={nominalForm.name}
                  onChange={e => setNominalForm({ ...nominalForm, name: e.target.value })}
                  placeholder="e.g. Higher Institute of Business Technology"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 block">City *</label>
                  <input
                    type="text"
                    required
                    value={nominalForm.city}
                    onChange={e => setNominalForm({ ...nominalForm, city: e.target.value })}
                    placeholder="e.g. Douala"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 block">Region *</label>
                  <select
                    value={nominalForm.region}
                    onChange={e => setNominalForm({ ...nominalForm, region: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="Center">Center</option>
                    <option value="Littoral">Littoral</option>
                    <option value="North West">North West</option>
                    <option value="South West">South West</option>
                    <option value="West">West</option>
                    <option value="Adamaoua">Adamaoua</option>
                    <option value="East">East</option>
                    <option value="Far North">Far North</option>
                    <option value="North">North</option>
                    <option value="South">South</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 block">Accredited Specialization / Programme</label>
                <input
                  type="text"
                  value={nominalForm.programme}
                  onChange={e => setNominalForm({ ...nominalForm, programme: e.target.value })}
                  placeholder="e.g. Software Engineering"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNominalRequestModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  {loading ? 'Submitting...' : 'Submit Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
