export type LanguageCode = 'en' | 'fr';

export interface TranslationDictionary {
  [key: string]: {
    en: string;
    fr: string;
  };
}

export const TRANSLATIONS: TranslationDictionary = {
  // --- Common UI & Buttons ---
  'app.title': { en: 'Edulpha', fr: 'Edulpha' },
  'common.welcome': { en: 'Welcome back', fr: 'Bienvenue' },
  'common.save': { en: 'Save Changes', fr: 'Enregistrer les modifications' },
  'common.cancel': { en: 'Cancel', fr: 'Annuler' },
  'common.delete': { en: 'Delete', fr: 'Supprimer' },
  'common.edit': { en: 'Edit', fr: 'Modifier' },
  'common.loading': { en: 'Loading...', fr: 'Chargement...' },
  'common.success': { en: 'Success', fr: 'Succès' },
  'common.error': { en: 'Error', fr: 'Erreur' },
  'common.back': { en: 'Back', fr: 'Retour' },
  'common.search': { en: 'Search...', fr: 'Rechercher...' },
  'common.filter': { en: 'Filter', fr: 'Filtrer' },
  'common.next': { en: 'Next', fr: 'Suivant' },
  'common.previous': { en: 'Previous', fr: 'Précédent' },
  'common.submit': { en: 'Submit', fr: 'Soumettre' },
  'common.close': { en: 'Close', fr: 'Fermer' },
  'common.confirm': { en: 'Confirm', fr: 'Confirmer' },
  'common.active': { en: 'Active', fr: 'Actif' },
  'common.archived': { en: 'Archived', fr: 'Archivé' },
  'common.language': { en: 'Language', fr: 'Langue' },
  'common.english': { en: 'English', fr: 'Anglais' },
  'common.french': { en: 'French', fr: 'Français' },

  // --- Navigation & Headers ---
  'nav.dashboard': { en: 'Dashboard', fr: 'Tableau de bord' },
  'nav.practice': { en: 'Practice Mode', fr: 'Mode Entraînement' },
  'nav.pastQuestions': { en: 'Past Questions', fr: 'Anciennes Épreuves' },
  'nav.aiTutor': { en: 'Edulpha AI', fr: 'Edulpha IA' },
  'nav.lms': { en: 'Learning Portal (LMS)', fr: 'Portail de Cours (LMS)' },
  'nav.dailyDrill': { en: 'Daily Drill', fr: 'Exercice Quotidien' },
  'nav.challenges': { en: 'Challenges & Duels', fr: 'Défis & Duels' },
  'nav.leaderboard': { en: 'Leaderboard', fr: 'Classement' },
  'nav.analytics': { en: 'Exam Analytics', fr: 'Analyses des Examens' },
  'nav.profile': { en: 'Profile & Settings', fr: 'Profil & Paramètres' },
  'nav.admin': { en: 'Admin Portal', fr: 'Portail Administrateur' },
  'nav.teacherStudio': { en: 'AI Teacher Studio', fr: 'Studio Enseignant IA' },
  'nav.logout': { en: 'Log Out', fr: 'Déconnexion' },

  // --- Authentication & Curriculum Selection ---
  'auth.login': { en: 'Log In', fr: 'Connexion' },
  'auth.register': { en: 'Register', fr: 'S\'inscrire' },
  'auth.email': { en: 'Email Address', fr: 'Adresse Email' },
  'auth.password': { en: 'Password', fr: 'Mot de passe' },
  'auth.fullName': { en: 'Full Name', fr: 'Nom Complet' },
  'auth.school': { en: 'School / Institution', fr: 'Établissement / École' },
  'auth.region': { en: 'Region / City', fr: 'Région / Ville' },
  'auth.selectCurriculum': { en: 'Select Educational Curriculum', fr: 'Sélectionner le Système Éducatif' },
  'auth.englishCurriculum': { en: 'English Curriculum (GCE)', fr: 'Système Anglophone (GCE)' },
  'auth.frenchCurriculum': { en: 'French Curriculum (Francophone)', fr: 'Système Francophone' },
  'auth.educationLevel': { en: 'Education Level', fr: 'Niveau d\'Études' },
  'auth.targetSubject': { en: 'Target Subject', fr: 'Matière Principale' },
  'auth.targetGrade': { en: 'Target Grade / Goal', fr: 'Objectif de Note' },
  'auth.alreadyHaveAccount': { en: 'Already have an account?', fr: 'Vous avez déjà un compte ?' },
  'auth.dontHaveAccount': { en: 'Don\'t have an account?', fr: 'Vous n\'avez pas encore de compte ?' },

  // --- Curriculum & Academic Titles ---
  'curriculum.gceOlevel': { en: 'Ordinary Level (O-Level)', fr: 'Ordinary Level (O-Level)' },
  'curriculum.gceAlevel': { en: 'Advanced Level (A-Level)', fr: 'Advanced Level (A-Level)' },
  'curriculum.frTroisieme': { en: 'Troisième (BEPC)', fr: 'Troisième (BEPC)' },
  'curriculum.frSeconde': { en: 'Seconde', fr: 'Seconde' },
  'curriculum.frPremiere': { en: 'Première', fr: 'Première' },
  'curriculum.frTerminale': { en: 'Terminale (Baccalauréat)', fr: 'Terminale (Baccalauréat)' },

  // --- Student Dashboard & LMS ---
  'dashboard.welcomeBack': { en: 'Welcome back to your study hub', fr: 'Bienvenue sur votre espace d\'étude' },
  'dashboard.readinessScore': { en: 'Exam Readiness Score', fr: 'Score de Préparation aux Examens' },
  'dashboard.studyStreak': { en: 'Study Streak', fr: 'Série d\'Études' },
  'dashboard.daysLeft': { en: 'Days until Examination', fr: 'Jours avant les examens' },
  'dashboard.recommendedLessons': { en: 'Recommended Lessons & Notes', fr: 'Leçons et Notes Recommandées' },
  'dashboard.recentActivity': { en: 'Recent Practice History', fr: 'Historique des Entraînements' },
  'dashboard.aiTipOfDay': { en: 'Edulpha AI Tip of the Day', fr: 'Conseil IA du Jour' },

  // --- Edulpha AI ---
  'ai.title': { en: 'Edulpha AI 24/7 Smart Tutor', fr: 'Tuteur Intelligent Edulpha IA' },
  'ai.subtitle': { en: 'Ask questions, solve step-by-step problems, and practice exam methodology', fr: 'Posez des questions, résolvez des problèmes étape par étape et révisez les méthodologies d\'examen' },
  'ai.inputPlaceholder': { en: 'Type your study question or paste a past paper problem...', fr: 'Posez votre question de cours ou collez une épreuve d\'examen...' },
  'ai.askAi': { en: 'Ask AI', fr: 'Demander à l\'IA' },
  'ai.modeOffline': { en: 'Offline AI Response', fr: 'Réponse IA Hors-Ligne' },
  'ai.examTip': { en: 'Exam Tip', fr: 'Conseil d\'Examen' },
  'ai.commonMistake': { en: 'Common Mistake', fr: 'Erreur Fréquente' },

  // --- Admin & Teacher Management ---
  'admin.curriculumTitle': { en: 'Multi-Curriculum Management', fr: 'Gestion Multi-Programmes Éducatifs' },
  'admin.translationTitle': { en: 'Multi-Language & Translation Studio', fr: 'Studio Multi-Langues & Traductions' },
  'admin.manageCurricula': { en: 'Manage Curricula & Levels', fr: 'Gérer les Programmes et Niveaux' },
  'admin.manageSubjects': { en: 'Manage Subjects & Papers', fr: 'Gérer les Matières et Épreuves' },
  'admin.manageUsers': { en: 'User Management & Access Control', fr: 'Gestion des Utilisateurs & Accès' },
  'admin.systemSettings': { en: 'System Settings & Branding', fr: 'Paramètres Système & Image de Marque' },

  // --- Profile Settings ---
  'profile.title': { en: 'Student Profile & Settings', fr: 'Profil Étudiant & Paramètres' },
  'profile.changeLanguage': { en: 'Interface Language', fr: 'Langue de l\'Interface' },
  'profile.changeCurriculum': { en: 'Change Curriculum System', fr: 'Changer de Système Éducatif' },
  'profile.personalDetails': { en: 'Personal Information', fr: 'Informations Personnelles' },
  'profile.savedSuccessfully': { en: 'Profile updated successfully!', fr: 'Profil mis à jour avec succès !' }
};

export const getTranslation = (key: string, lang: LanguageCode = 'en', fallback?: string): string => {
  if (TRANSLATIONS[key] && TRANSLATIONS[key][lang]) {
    return TRANSLATIONS[key][lang];
  }
  if (TRANSLATIONS[key] && TRANSLATIONS[key]['en']) {
    return TRANSLATIONS[key]['en'];
  }
  return fallback || key;
};
