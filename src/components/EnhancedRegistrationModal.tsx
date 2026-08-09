import React, { useState } from 'react';
import { 
  User, Mail, Lock, Phone, MapPin, School, BookOpen, Sparkles, 
  CheckCircle2, ArrowRight, ArrowLeft, Shield, Award, Globe, Check, Eye, EyeOff, AlertCircle, Smartphone 
} from 'lucide-react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { logAuditEvent } from '../services/auditService';
import { INTERMEDIATE_LEVEL_COMMERCIAL_SPECIALTIES, ADVANCED_LEVEL_TVEE_COMMERCIAL_SPECIALTIES } from '../constants/commercialCurriculum';
import { sendPhoneOtp, formatPhoneNumber, detectCarrier, phoneToVirtualEmail } from '../services/phoneAuthService';
import { PhoneOtpVerificationModal } from './PhoneOtpVerificationModal';
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
  const [accountType, setAccountType] = useState<'student' | 'teacher'>('student');
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    curriculum: 'cameroon_gce' as 'cameroon_gce' | 'cameroon_francophone' | 'both',
    educationLevel: 'Advanced Level' as string, // e.g., 'Ordinary Level', 'Advanced Level', 'Troisième (BEPC)', 'Seconde', 'Première', 'Terminale'
    
    // Academic Details
    department: 'Science' as string, // Science, Arts, Commercial, Technical, General
    commercialSpecialtyId: '' as string,
    commercialSpecialtyName: '' as string,
    commercialSpecialtyCode: '' as string,
    commercialLevel: 'Advance level' as 'Intermediate level' | 'Advance level',
    selectedSubjects: ['Mathematics', 'Physics', 'Computer Science'] as string[],
    targetExam: 'GCE Advanced Level' as string,
    
    // Learning Goals
    goals: ['Prepare for exams', 'Improve grades', 'Use AI Tutor'] as string[],
    
    // Learning Preferences
    preferredLanguage: lang,
    studyMode: 'Both (Online & Offline)' as string,
    learningStyle: 'AI Explanations & Practice Questions' as string,

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

  const handleStartPhoneVerification = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleOtpVerifiedCompleteRegistration = async () => {
    setShowOtpModal(false);
    setLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(formData.phone);
      const carrier = detectCarrier(formattedPhone);
      
      // Use provided email or fallback to virtual email
      const authEmail = formData.email.trim() ? formData.email.trim() : phoneToVirtualEmail(formattedPhone);

      // 1. Authenticate user first
      const { user } = await createUserWithEmailAndPassword(auth, authEmail, formData.password);
      
      if (formData.email.trim()) {
        try {
          await sendEmailVerification(user);
        } catch (err) {
          console.error("Failed to send verification email:", err);
        }
      }

      const profileCompletion = accountType === 'student' ? 100 : 90;

      const userPayload = {
        uid: user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`,
        email: authEmail,
        userProvidedEmail: formData.email.trim() || null,
        phone: formattedPhone,
        phoneVerified: true,
        phoneProvider: carrier.carrier,
        country: formData.country,
        region: formData.region,
        city: formData.city,
        school: formData.school || formData.institutionName || 'Edulpha Academy',
        role: accountType,
        curriculumId: formData.curriculum,
        curriculumName: formData.curriculum === 'cameroon_gce' ? 'Cameroon GCE (English)' : formData.curriculum === 'cameroon_francophone' ? 'Système Francophone (MINESEC)' : 'Bilingual',
        educationLevel: formData.educationLevel,
        department: formData.department,
        commercialSpecialtyId: formData.commercialSpecialtyId || '',
        commercialSpecialtyName: formData.commercialSpecialtyName || '',
        commercialSpecialtyCode: formData.commercialSpecialtyCode || '',
        level: formData.department === 'Commercial' ? formData.commercialLevel : 'Advanced Level',
        subjects: formData.selectedSubjects,
        subject: formData.selectedSubjects[0] || 'General Studies',
        targetExam: formData.targetExam,
        goals: formData.goals,
        preferredLanguage: formData.preferredLanguage,
        studyMode: formData.studyMode,
        learningStyle: formData.learningStyle,
        profileCompletion,
        status: 'active',
        isPaid: false,
        paymentStatus: 'unpaid',
        points: 50, // Welcome bonus points
        streak: 1,
        badges: ['welcome_badge'],
        createdAt: serverTimestamp(),
      };

      // 2. Log API Insert details for debugging and audit
      console.log('[REGISTRATION AUDIT INSERT]', {
        authUserId: auth.currentUser?.uid || user.uid,
        table: 'users',
        documentId: user.uid,
        payloadSummary: {
          name: userPayload.name,
          email: userPayload.email,
          role: userPayload.role,
          phone: userPayload.phone,
        },
        timestamp: new Date().toISOString()
      });

      // 3. Insert profile into Firestore after Auth succeeds
      await setDoc(doc(db, 'users', user.uid), userPayload);

      await logAuditEvent({
        userId: user.uid,
        userEmail: authEmail,
        action: 'REGISTER_SUCCESS',
        details: `Successfully registered new ${accountType} account via phone ${formattedPhone} (${carrier.carrier}).`,
      });

      toast.success(lang === 'fr' ? 'Compte Edulpha créé et téléphone vérifié avec succès !' : 'Edulpha account created and phone verified successfully!');
      onSuccess();
    } catch (err: any) {
      console.error('[REGISTRATION API FAILURE]', {
        authUserId: auth.currentUser?.uid,
        table: 'users',
        error: err?.message || err,
        code: err?.code,
        fullErrorObject: err
      });
      const debugErrorMsg = `Registration Error (${err.code || 'permission-denied'}): ${err.message || 'Firestore access denied'}`;
      setError(debugErrorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-slate-200 p-4 sm:p-6 md:p-8 max-w-2xl w-full mx-auto space-y-4 sm:space-y-6 box-border overflow-hidden">
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
      <form onSubmit={currentStep === totalSteps ? handleStartPhoneVerification : (e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
        
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
              <label className="text-xs font-bold text-slate-600">Select Curriculum System</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, curriculum: 'cameroon_gce', educationLevel: 'Advanced Level' })}
                  className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 text-left font-bold transition min-h-[54px] ${
                    formData.curriculum === 'cameroon_gce'
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <div className="text-xs sm:text-sm">🇬🇧 English Curriculum</div>
                  <div className="text-[10px] sm:text-xs font-normal text-slate-500">Cameroon GCE (O & A Level)</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, curriculum: 'cameroon_francophone', educationLevel: 'Terminale' })}
                  className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 text-left font-bold transition min-h-[54px] ${
                    formData.curriculum === 'cameroon_francophone'
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <div className="text-xs sm:text-sm">🇫🇷 Système Francophone</div>
                  <div className="text-[10px] sm:text-xs font-normal text-slate-500">BEPC, Seconde, Première, Terminale</div>
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-600">Specific Education Level</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {formData.curriculum === 'cameroon_gce' ? (
                  <>
                    {['Ordinary Level', 'Advanced Level'].map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setFormData({ ...formData, educationLevel: lvl })}
                        className={`p-3 rounded-xl border font-bold text-xs transition min-h-[44px] ${
                          formData.educationLevel === lvl
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    {['Troisième (BEPC)', 'Seconde', 'Première', 'Terminale'].map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setFormData({ ...formData, educationLevel: lvl })}
                        className={`p-3 rounded-xl border font-bold text-xs transition min-h-[44px] ${
                          formData.educationLevel === lvl
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-600">School / Institution Name</label>
              <input
                type="text"
                value={formData.school}
                onChange={e => setFormData({ ...formData, school: e.target.value })}
                placeholder="e.g. GBHS Yaoundé, Saker Baptist College..."
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm font-semibold focus:bg-white focus:border-blue-600 outline-none box-border"
              />
            </div>
          </div>
        )}

        {/* STUDENT STEP 3: Academic Details */}
        {accountType === 'student' && currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="font-bold text-sm sm:text-base text-slate-900">3. Academic Department & Subject Selection</h3>
            
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
    </div>
  );
};
