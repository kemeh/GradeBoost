export type LanguageCode = 'en' | 'fr';

export interface LanguageMeta {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  enabled: boolean;
}

export const DEFAULT_LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', direction: 'ltr', enabled: true },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', direction: 'ltr', enabled: true },
];

export interface TranslationDictionary {
  [key: string]: {
    [lang: string]: string;
  };
}

export const TRANSLATIONS: TranslationDictionary = {
  // --- Common UI & Buttons ---
  'app.title': { en: 'Edulpha', fr: 'Edulpha', es: 'Edulpha', ar: 'إيدولفا', de: 'Edulpha', pt: 'Edulpha' },
  'common.welcome': { en: 'Welcome back', fr: 'Bienvenue', es: 'Bienvenido de nuevo', ar: 'مرحبا بعودتك', de: 'Willkommen zurück', pt: 'Bem-vindo de volta' },
  'common.save': { en: 'Save Changes', fr: 'Enregistrer les modifications', es: 'Guardar cambios', ar: 'حفظ التغييرات', de: 'Änderungen speichern', pt: 'Salvar alterações' },
  'common.cancel': { en: 'Cancel', fr: 'Annuler', es: 'Cancelar', ar: 'إلغاء', de: 'Abbrechen', pt: 'Cancelar' },
  'common.delete': { en: 'Delete', fr: 'Supprimer', es: 'Eliminar', ar: 'حذف', de: 'Löschen', pt: 'Excluir' },
  'common.edit': { en: 'Edit', fr: 'Modifier', es: 'Editar', ar: 'تعديل', de: 'Bearbeiten', pt: 'Editar' },
  'common.loading': { en: 'Loading...', fr: 'Chargement...', es: 'Cargando...', ar: 'جاري التحميل...', de: 'Laden...', pt: 'Carregando...' },
  'common.success': { en: 'Success', fr: 'Succès', es: 'Éxito', ar: 'نجاح', de: 'Erfolg', pt: 'Sucesso' },
  'common.error': { en: 'Error', fr: 'Erreur', es: 'Error', ar: 'خطأ', de: 'Fehler', pt: 'Erro' },
  'common.back': { en: 'Back', fr: 'Retour', es: 'Volver', ar: 'رجوع', de: 'Zurück', pt: 'Voltar' },
  'common.search': { en: 'Search...', fr: 'Rechercher...', es: 'Buscar...', ar: 'بحث...', de: 'Suchen...', pt: 'Buscar...' },
  'common.filter': { en: 'Filter', fr: 'Filtrer', es: 'Filtrar', ar: 'تصفية', de: 'Filtern', pt: 'Filtrar' },
  'common.next': { en: 'Next', fr: 'Suivant', es: 'Siguiente', ar: 'التالي', de: 'Weiter', pt: 'Próximo' },
  'common.previous': { en: 'Previous', fr: 'Précédent', es: 'Anterior', ar: 'السابق', de: 'Zurück', pt: 'Anterior' },
  'common.submit': { en: 'Submit', fr: 'Soumettre', es: 'Enviar', ar: 'إرسال', de: 'Absenden', pt: 'Enviar' },
  'common.close': { en: 'Close', fr: 'Fermer', es: 'Cerrar', ar: 'إغلاق', de: 'Schließen', pt: 'Fechar' },
  'common.confirm': { en: 'Confirm', fr: 'Confirmer', es: 'Confirmar', ar: 'تأكيد', de: 'Bestätigen', pt: 'Confirmar' },
  'common.active': { en: 'Active', fr: 'Actif', es: 'Activo', ar: 'نشط', de: 'Aktiv', pt: 'Ativo' },
  'common.archived': { en: 'Archived', fr: 'Archivé', es: 'Archivado', ar: 'مؤرشف', de: 'Archiviert', pt: 'Arquivado' },
  'common.language': { en: 'Language', fr: 'Langue', es: 'Idioma', ar: 'اللغة', de: 'Sprache', pt: 'Idioma' },
  'common.english': { en: 'English', fr: 'Anglais', es: 'Inglés', ar: 'الإنجليزية', de: 'Englisch', pt: 'Inglês' },
  'common.french': { en: 'French', fr: 'Français', es: 'Francés', ar: 'الفرنسية', de: 'Französisch', pt: 'Francês' },
  'common.spanish': { en: 'Spanish', fr: 'Espagnol', es: 'Español', ar: 'الإسبانية', de: 'Spanisch', pt: 'Espanhol' },
  'common.arabic': { en: 'Arabic', fr: 'Arabe', es: 'Árabe', ar: 'العربية', de: 'Arabisch', pt: 'Árabe' },
  'common.german': { en: 'German', fr: 'Allemand', es: 'Alemán', ar: 'الألمانية', de: 'Deutsch', pt: 'Alemão' },
  'common.portuguese': { en: 'Portuguese', fr: 'Portugais', es: 'Portugués', ar: 'البرتغالية', de: 'Portugiesisch', pt: 'Português' },

  // --- Navigation & Headers ---
  'nav.dashboard': { en: 'Dashboard', fr: 'Tableau de bord', es: 'Panel', ar: 'لوحة التحكم', de: 'Dashboard', pt: 'Painel' },
  'nav.practice': { en: 'Practice Mode', fr: 'Mode Entraînement', es: 'Modo Práctica', ar: 'وضع التمرين', de: 'Übungsmodus', pt: 'Modo Prática' },
  'nav.pastQuestions': { en: 'Past Questions', fr: 'Anciennes Épreuves', es: 'Exámenes Anteriores', ar: 'الأسئلة السابقة', de: 'Frühere Prüfungen', pt: 'Provas Anteriores' },
  'nav.aiTutor': { en: 'AI Tutor', fr: 'Tuteur IA', es: 'Tutor IA', ar: 'المعلم الذكي', de: 'KI-Tutor', pt: 'Tutor IA' },
  'nav.lms': { en: 'Learning Portal (LMS)', fr: 'Portail de Cours (LMS)', es: 'Portal de Aprendizaje', ar: 'بوابة التعلم', de: 'Lernportal', pt: 'Portal de Aprendizagem' },
  'nav.dailyDrill': { en: 'Daily Drill', fr: 'Exercice Quotidien', es: 'Ejercicio Diario', ar: 'التمرين اليومي', de: 'Tägliche Übung', pt: 'Treino Diário' },
  'nav.challenges': { en: 'Challenges & Duels', fr: 'Défis & Duels', es: 'Desafíos y Dueloss', ar: 'التحديات والمبارزات', de: 'Herausforderungen & Duelle', pt: 'Desafios e Duelos' },
  'nav.leaderboard': { en: 'Leaderboard', fr: 'Classement', es: 'Tabla de Clasificación', ar: 'قائمة المتصدرين', de: 'Bestenliste', pt: 'Classificação' },
  'nav.analytics': { en: 'Exam Analytics', fr: 'Analyses des Examens', es: 'Análisis de Exámenes', ar: 'تحليلات الامتحانات', de: 'Prüfungsanalysen', pt: 'Análise de Exames' },
  'nav.profile': { en: 'Profile & Settings', fr: 'Profil & Paramètres', es: 'Perfil y Configuración', ar: 'الملف الشخصي والإعدادات', de: 'Profil & Einstellungen', pt: 'Perfil e Configurações' },
  'nav.admin': { en: 'Admin Portal', fr: 'Portail Administrateur', es: 'Portal de Administración', ar: 'بوابة الإدارة', de: 'Admin-Portal', pt: 'Portal do Administrador' },
  'nav.teacherStudio': { en: 'AI Teacher Studio', fr: 'Studio Enseignant IA', es: 'Estudio de Profesores IA', ar: 'استوديو المعلم بالذكاء الاصطناعي', de: 'KI-Lehrerstudio', pt: 'Estúdio do Professor IA' },
  'nav.features': { en: 'Features', fr: 'Fonctionnalités', es: 'Características', ar: 'المميزات', de: 'Funktionen', pt: 'Recursos' },
  'nav.curriculum': { en: 'Curriculum', fr: 'Programmes', es: 'Planes de Estudio', ar: 'المناهج', de: 'Lehrplan', pt: 'Currículo' },
  'nav.subjects': { en: 'Subjects', fr: 'Matières', es: 'Materias', ar: 'المواد', de: 'Fächer', pt: 'Disciplinas' },
  'nav.pricing': { en: 'Pricing', fr: 'Tarifs', es: 'Precios', ar: 'الأسعار', de: 'Preise', pt: 'Preços' },
  'nav.partners': { en: 'Partners & Alliances', fr: 'Partenaires & Alliances', es: 'Socios y Alianzas', ar: 'الشركاء والتحالفات', de: 'Partner & Allianzen', pt: 'Parceiros e Alianças' },
  'nav.mobileApp': { en: 'Mobile App', fr: 'Application Mobile', es: 'Aplicación Móvil', ar: 'تطبيق الهاتف', de: 'Mobile App', pt: 'Aplicativo Móvel' },
  'nav.faq': { en: 'FAQ', fr: 'FAQ', es: 'Preguntas Frecuentes', ar: 'الأسئلة الشائعة', de: 'FAQ', pt: 'Perguntas Frequentes' },
  'nav.logout': { en: 'Log Out', fr: 'Déconnexion', es: 'Cerrar Sesión', ar: 'تسجيل الخروج', de: 'Abmelden', pt: 'Sair' },

  // --- Authentication & Curriculum Selection ---
  'auth.login': { en: 'Log In', fr: 'Connexion', es: 'Iniciar Sesión', ar: 'تسجيل الدخول', de: 'Anmelden', pt: 'Entrar' },
  'auth.register': { en: 'Register', fr: 'S\'inscrire', es: 'Registrarse', ar: 'إنشاء حساب', de: 'Registrieren', pt: 'Cadastrar-se' },
  'auth.email': { en: 'Email Address', fr: 'Adresse Email', es: 'Correo Electrónico', ar: 'البريد الإلكتروني', de: 'E-Mail-Adresse', pt: 'Endereço de E-mail' },
  'auth.password': { en: 'Password', fr: 'Mot de passe', es: 'Contraseña', ar: 'كلمة المرور', de: 'Passwort', pt: 'Senha' },
  'auth.fullName': { en: 'Full Name', fr: 'Nom Complet', es: 'Nombre Completo', ar: 'الاسم الكامل', de: 'Vollständiger Name', pt: 'Nome Completo' },
  'auth.school': { en: 'School / Institution', fr: 'Établissement / École', es: 'Escuela / Institución', ar: 'المدرسة / المؤسسة', de: 'Schule / Institution', pt: 'Escola / Instituição' },
  'auth.region': { en: 'Region / City', fr: 'Région / Ville', es: 'Región / Ciudad', ar: 'المنطقة / المدينة', de: 'Region / Stadt', pt: 'Região / Cidade' },
  'auth.selectCurriculum': { en: 'Select Educational Curriculum', fr: 'Sélectionner le Système Éducatif', es: 'Seleccionar Plan de Estudios', ar: 'اختر المنهاج التعليمي', de: 'Lehrplan auswählen', pt: 'Selecionar Currículo' },
  'auth.englishCurriculum': { en: 'English Curriculum (GCE)', fr: 'Système Anglophone (GCE)', es: 'Currículo en Inglés (GCE)', ar: 'المنهاج الإنجليزي (GCE)', de: 'Englisches System (GCE)', pt: 'Currículo em Inglês (GCE)' },
  'auth.frenchCurriculum': { en: 'French Curriculum (Francophone)', fr: 'Système Francophone', es: 'Currículo Francés', ar: 'المنهاج الفرنسي', de: 'Französisches System', pt: 'Currículo Francês' },
  'auth.educationLevel': { en: 'Education Level', fr: 'Niveau d\'Études', es: 'Nivel Educativo', ar: 'المستوى التعليمي', de: 'Bildungsstufe', pt: 'Nível de Ensino' },
  'auth.targetSubject': { en: 'Target Subject', fr: 'Matière Principale', es: 'Materia Objetivo', ar: 'المادة المستهدفة', de: 'Ziel-Fach', pt: 'Matéria Alvo' },
  'auth.targetGrade': { en: 'Target Grade / Goal', fr: 'Objectif de Note', es: 'Nota Objetivo', ar: 'الدرجة المستهدفة', de: 'Ziel-Note', pt: 'Nota Alvo' },
  'auth.alreadyHaveAccount': { en: 'Already have an account?', fr: 'Vous avez déjà un compte ?', es: '¿Ya tienes una cuenta?', ar: 'هل لديك حساب بالفعل؟', de: 'Bereits ein Konto?', pt: 'Já tem uma conta?' },
  'auth.dontHaveAccount': { en: 'Don\'t have an account?', fr: 'Vous n\'avez pas encore de compte ?', es: '¿No tienes una cuenta?', ar: 'ليس لديك حساب؟', de: 'Noch kein Konto?', pt: 'Não tem uma conta?' },

  // --- Curriculum & Academic Titles ---
  'curriculum.gceOlevel': { en: 'Ordinary Level (O-Level)', fr: 'Ordinary Level (O-Level)', es: 'Nivel Ordinario (O-Level)', ar: 'المستوى العادي (O-Level)', de: 'Ordinary Level', pt: 'Nível Ordinário (O-Level)' },
  'curriculum.gceAlevel': { en: 'Advanced Level (A-Level)', fr: 'Advanced Level (A-Level)', es: 'Nivel Avanzado (A-Level)', ar: 'المستوى المتقدم (A-Level)', de: 'Advanced Level', pt: 'Nível Avançado (A-Level)' },
  'curriculum.frTroisieme': { en: 'Troisième (BEPC)', fr: 'Troisième (BEPC)', es: 'Tercero (BEPC)', ar: 'الثالثة (BEPC)', de: 'Klasse 9 (BEPC)', pt: 'Terceiro Ano (BEPC)' },
  'curriculum.frSeconde': { en: 'Seconde', fr: 'Seconde', es: 'Segundo Año', ar: 'الثانية ثانوية', de: 'Klasse 10', pt: 'Segundo Ano' },
  'curriculum.frPremiere': { en: 'Première', fr: 'Première', es: 'Primer Año', ar: 'الأولى ثانوية', de: 'Klasse 11', pt: 'Primeiro Ano' },
  'curriculum.frTerminale': { en: 'Terminale (Baccalauréat)', fr: 'Terminale (Baccalauréat)', es: 'Terminale (Bachillerato)', ar: 'السامية (البكالوريا)', de: 'Abschlussklasse (Abitur)', pt: 'Ano Final (Baccalauréat)' },

  // --- Student Dashboard & LMS ---
  'dashboard.welcomeBack': { en: 'Welcome back to your study hub', fr: 'Bienvenue sur votre espace d\'étude', es: 'Bienvenido de nuevo a tu centro de estudios', ar: 'مرحبا بك مجدداً في مركز دراستك', de: 'Willkommen zurück in deinem Lernzentrum', pt: 'Bem-vindo de volta ao seu centro de estudos' },
  'dashboard.readinessScore': { en: 'Exam Readiness Score', fr: 'Score de Préparation aux Examens', es: 'Puntuación de Preparación', ar: 'درجة الجاهزية للامتحان', de: 'Prüfungsbereitschaft', pt: 'Pontuação de Preparação para o Exame' },
  'dashboard.studyStreak': { en: 'Study Streak', fr: 'Série d\'Études', es: 'Racha de Estudio', ar: 'سلسلة الدراسة اليومية', de: 'Lernserie', pt: 'Sequência de Estudos' },
  'dashboard.daysLeft': { en: 'Days until Examination', fr: 'Jours avant les examens', es: 'Días hasta los exámenes', ar: 'أيام متبقية للامتحانات', de: 'Tage bis zur Prüfung', pt: 'Dias até o Exame' },
  'dashboard.recommendedLessons': { en: 'Recommended Lessons & Notes', fr: 'Leçons et Notes Recommandées', es: 'Lecciones y Notas Recomendadas', ar: 'الدروس والملاحظات الموصى بها', de: 'Empfohlene Lektionen & Notizen', pt: 'Lições e Notas Recomendadas' },
  'dashboard.recentActivity': { en: 'Recent Practice History', fr: 'Historique des Entraînements', es: 'Historial de Práctica Reciente', ar: 'سجل التمرين الأخير', de: 'Verlauf der letzten Übungen', pt: 'Histórico de Prática Recente' },
  'dashboard.aiTipOfDay': { en: 'Edulpha AI Tip of the Day', fr: 'Conseil IA du Jour', es: 'Consejo de IA del Día', ar: 'نصيحة الذكاء الاصطناعي اليومية', de: 'KI-Tipp des Tages', pt: 'Dica do Dia da IA' },

  // --- Edulpha AI ---
  'ai.title': { en: 'Edulpha AI 24/7 Smart Tutor', fr: 'Tuteur Intelligent Edulpha IA', es: 'Tutor Inteligente 24/7', ar: 'المعلم الذكي 24/7', de: 'Intelligenter 24/7 KI-Tutor', pt: 'Tutor Inteligente 24/7' },
  'ai.subtitle': { en: 'Ask questions, solve step-by-step problems, and practice exam methodology', fr: 'Posez des questions, résolvez des problèmes étape par étape et révisez les méthodologies d\'examen', es: 'Haz preguntas, resuelve problemas paso a paso y practica metodologías de examen', ar: 'اطرح الأسئلة وحل المشكلات خطوة بخطوة وتدرب على منهجية الامتحانات', de: 'Fragen stellen, Aufgaben Schritt für Schritt lösen und Prüfungsmethoden üben', pt: 'Faça perguntas, resolva problemas passo a passo e pratique a metodologia do exame' },
  'ai.inputPlaceholder': { en: 'Type your study question or paste a past paper problem...', fr: 'Posez votre question de cours ou collez une épreuve d\'examen...', es: 'Escribe tu duda o pega un problema de examen...', ar: 'اكتب سؤالك أو ألصق مسألة من امتحان سابق...', de: 'Stelle deine Frage oder füge eine Prüfungsaufgabe ein...', pt: 'Digite sua dúvida de estudo ou cole uma questão de exame...' },
  'ai.askAi': { en: 'Ask AI', fr: 'Demander à l\'IA', es: 'Preguntar a la IA', ar: 'اسأل الذكاء الاصطناعي', de: 'KI fragen', pt: 'Perguntar à IA' },
  'ai.modeOffline': { en: 'Offline AI Response', fr: 'Réponse IA Hors-Ligne', es: 'Respuesta de IA fuera de línea', ar: 'إجابة الذكاء الاصطناعي بدون إنترنت', de: 'Offline KI-Antwort', pt: 'Resposta da IA Offline' },
  'ai.examTip': { en: 'Exam Tip', fr: 'Conseil d\'Examen', es: 'Consejo de Examen', ar: 'نصيحة للامتحان', de: 'Prüfungstipp', pt: 'Dica de Exame' },
  'ai.commonMistake': { en: 'Common Mistake', fr: 'Erreur Fréquente', es: 'Error Común', ar: 'خطأ شائع', de: 'Häufiger Fehler', pt: 'Erro Comum' },

  // --- Admin & Translation Studio ---
  'admin.curriculumTitle': { en: 'Multi-Curriculum Management', fr: 'Gestion Multi-Programmes Éducatifs', es: 'Gestión Multicurricular', ar: 'إدارة المناهج المتعددة', de: 'Multi-Lehrplan-Verwaltung', pt: 'Gestão Multicurrículo' },
  'admin.translationTitle': { en: 'Multi-Language & Translation Studio', fr: 'Studio Multi-Langues & Traductions', es: 'Estudio Multilingüe y Traducciones', ar: 'استوديو اللغات والترجمة', de: 'Multi-Sprachen & Übersetzungsstudio', pt: 'Estúdio Multilíngue e de Tradução' },
  'admin.manageCurricula': { en: 'Manage Curricula & Levels', fr: 'Gérer les Programmes et Niveaux', es: 'Gestionar Planes de Estudio y Niveles', ar: 'إدارة المناهج والمستويات', de: 'Lehrpläne & Stufen verwalten', pt: 'Gerenciar Currículos e Níveis' },
  'admin.manageSubjects': { en: 'Manage Subjects & Papers', fr: 'Gérer les Matières et Épreuves', es: 'Gestionar Materias y Exámenes', ar: 'إدارة المواد والورقات الامتحانية', de: 'Fächer & Prüfungen verwalten', pt: 'Gerenciar Matérias e Provas' },
  'admin.manageUsers': { en: 'User Management & Access Control', fr: 'Gestion des Utilisateurs & Accès', es: 'Gestión de Usuarios y Accesos', ar: 'إدارة المستخدمين وصلاحيات الوصول', de: 'Benutzerverwaltung & Zugriffskontrolle', pt: 'Gestão de Usuários e Controle de Acesso' },
  'admin.systemSettings': { en: 'System Settings & Branding', fr: 'Paramètres Système & Image de Marque', es: 'Configuración del Sistema', ar: 'إعدادات النظام والعلامة التجارية', de: 'Systemeinstellungen & Branding', pt: 'Configurações do Sistema' },

  // --- Profile Settings ---
  'profile.title': { en: 'Student Profile & Settings', fr: 'Profil Étudiant & Paramètres', es: 'Perfil de Estudiante y Configuración', ar: 'ملف الطالب والإعدادات', de: 'Schülerprofil & Einstellungen', pt: 'Perfil do Estudante e Configurações' },
  'profile.changeLanguage': { en: 'Interface Language', fr: 'Langue de l\'Interface', es: 'Idioma de la Interfaz', ar: 'لغة الواجهة', de: 'Schnittstellensprache', pt: 'Idioma da Interface' },
  'profile.changeCurriculum': { en: 'Change Curriculum System', fr: 'Changer de Système Éducatif', es: 'Cambiar Sistema de Estudio', ar: 'تغيير المنهاج التعليمي', de: 'Lehrplansystem ändern', pt: 'Alterar Sistema de Currículo' },
  'profile.personalDetails': { en: 'Personal Information', fr: 'Informations Personnelles', es: 'Información Personal', ar: 'المعلومات الشخصية', de: 'Persönliche Informationen', pt: 'Informações Pessoais' },
  'profile.savedSuccessfully': { en: 'Profile updated successfully!', fr: 'Profil mis à jour avec succès !', es: '¡Perfil actualizado con éxito!', ar: 'تم تحديث الملف الشخصي بنجاح!', de: 'Profil erfolgreich aktualisiert!', pt: 'Perfil atualizado com sucesso!' },

  // --- Landing Page Translations ---
  'hero.badge': { en: 'Cameroon GCE & French Curriculum Ecosystem', fr: 'Écosystème GCE Cameroun & Programme Francophone', es: 'Ecosistema de Currículo GCE y Francés', ar: 'منظومة المناهج التعليمية بالكاميرون', de: 'GCE & Französisches Lehrplansystem', pt: 'Ecossistema Educacional GCE e Francês' },
  'hero.title1': { en: 'Learn Smarter.', fr: 'Apprenez Plus Malin.', es: 'Aprende Más Inteligente.', ar: 'تعلم بذكاء أكبر.', de: 'Lerne cleverer.', pt: 'Aprenda Mais Inteligente.' },
  'hero.title2': { en: 'Achieve More with', fr: 'Réussissez Plus avec', es: 'Logra Más con', ar: 'وحقق المزيد مع', de: 'Erreiche mehr mit', pt: 'Conquiste Mais com' },
  'hero.subtitle': { en: 'A bilingual AI-powered learning platform helping students prepare for GCE Ordinary & Advanced Level, BEPC, Baccalauréat, and beyond.', fr: 'Une plateforme d\'apprentissage bilingue propulsée par l\'IA pour préparer le GCE O/A Levels, le BEPC, le Baccalauréat et bien plus.', es: 'Una plataforma de aprendizaje bilingüe impulsada por IA que ayuda a preparar exámenes oficiales.', ar: 'منصة تعليمية متعددة اللغات بالذكاء الاصطناعي لمساعدة الطلاب في التحضير للامتحانات الوطنية.', de: 'Eine mehrsprachige KI-Lernplattform zur Vorbereitung auf nationale Prüfungen.', pt: 'Uma plataforma de aprendizagem bilíngue com IA para preparar alunos para exames oficiais.' },
  'hero.startLearning': { en: 'Start Learning Free', fr: 'Commencer Gratuitement', es: 'Empezar Gratis', ar: 'ابدأ التعلم مجاناً', de: 'Kostenlos starten', pt: 'Começar Gratuitamente' },
  'hero.exploreCourses': { en: 'Explore Courses', fr: 'Explorer les Cours', es: 'Explorar Cursos', ar: 'استكشف الدروس', de: 'Kurse erkunden', pt: 'Explorar Cursos' },
  'hero.downloadApp': { en: 'Download Mobile App', fr: 'Télécharger l\'Application', es: 'Descargar Aplicación', ar: 'تحميل التطبيق', de: 'App herunterladen', pt: 'Baixar Aplicativo' },
  'hero.previewMath': { en: 'Cameroon GCE O-Level Mathematics', fr: 'Mathématiques GCE O-Level Cameroun' },
  'hero.previewMathSub': { en: 'Algebra, Geometry & Calculus', fr: 'Algèbre, Géométrie & Calcul' },
  'hero.masteryScore': { en: '94% Mastery Score', fr: 'Score de Maîtrise 94%' },
  'hero.gradeProjected': { en: 'Projected: Grade A', fr: 'Note Projetée : A' },
  'hero.previewAiTitle': { en: 'Edulpha AI Step-by-Step Solver', fr: 'Résolveur IA Étape par Étape' },
  'hero.previewAiSub': { en: '24/7 instant homework & past paper assistance', fr: 'Assistance 24/7 pour devoirs et épreuves' },
  'hero.statusInProgress': { en: 'Active Revision', fr: 'Révision Active' },
  'hero.daily15min': { en: '15 mins/day target', fr: 'Objectif 15 min/jour' },
  'hero.previewMockTitle': { en: 'National Mock Competition', fr: 'Concours National de Mocks' },
  'hero.previewMockSub': { en: 'Live timed exam simulation with leaderboard', fr: 'Simulation d\'examen chronométrée avec classement' },
  'hero.nextExam': { en: 'Next Session: Saturday', fr: 'Prochaine Session : Samedi' },
  'hero.freeRegistration': { en: 'Free Entry', fr: 'Inscription Gratuite' },

  // --- Stats Section ---
  'stats.students': { en: 'Active Students', fr: 'Élèves Actifs', es: 'Estudiantes Activos', ar: 'الطلاب النشطون', de: 'Aktive Schüler', pt: 'Alunos Ativos' },
  'stats.lessons': { en: 'Curriculum Lessons', fr: 'Leçons du Programme', es: 'Lecciones', ar: 'الدروس', de: 'Lektionen', pt: 'Lições' },
  'stats.questions': { en: 'Solved Past Questions', fr: 'Épreuves Corrigées', es: 'Preguntas Resueltas', ar: 'أسئلة محلولة', de: 'Gelöste Aufgaben', pt: 'Questões Resolvidas' },
  'stats.mocks': { en: 'National Mocks', fr: 'Examens Blancs', es: 'Exámenes de Práctica', ar: 'امتحانات تجريبية', de: 'Probe-Prüfungen', pt: 'Simulados' },
  'stats.aiChats': { en: 'AI Explanations', fr: 'Explications IA', es: 'Explicaciones de IA', ar: 'تفسيرات الذكاء الاصطناعي', de: 'KI-Erklärungen', pt: 'Explicações de IA' },
  'stats.teachers': { en: 'Certified Educators', fr: 'Enseignants Certifiés', es: 'Educadores Certificados', ar: 'معلمون معتمدون', de: 'Zertifizierte Lehrkräfte', pt: 'Educadores Certificados' },
  'stats.schools': { en: 'Partner Institutions', fr: 'Établissements Partenaires', es: 'Instituciones Socias', ar: 'مؤسسات شريكة', de: 'Partnerschulen', pt: 'Instituições Parceiras' },

  // --- Features Section ---
  'features.badge': { en: 'Platform Capabilities', fr: 'Fonctionnalités Clés', es: 'Capacidades de la Plataforma', ar: 'ميزات المنصة', de: 'Plattform-Funktionen', pt: 'Recursos da Plataforma' },
  'features.title': { en: 'Powerful Features Built For Examination Success', fr: 'Fonctionnalités Conçues pour Réussir vos Examens', es: 'Funcionalidades Diseñadas para el Éxito', ar: 'ميزات قوية مصممة للنجاح في الامتحانات', de: 'Funktionen für deinen Prüfungserfolg', pt: 'Recursos Construídos para o Sucesso' },
  'features.subtitle': { en: 'Everything you need to master your syllabus, test your readiness, and score top grades in national examinations.', fr: 'Tout ce dont vous avez besoin pour maîtriser votre programme et obtenir les meilleures notes aux examens nationaux.', es: 'Todo lo que necesitas para dominar tu programa educativo y obtener las mejores notas.', ar: 'كل ما تحتاجه لإتقان منهجك الدراسي واجتياز الامتحانات بنجاح.', de: 'Alles, was du brauchst, um deinen Lehrplan zu meistern.', pt: 'Tudo o que você precisa para dominar seu currículo escolar.' },
  'features.f1Title': { en: 'Gemini AI 24/7 Tutor', fr: 'Tuteur IA 24h/24' },
  'features.f1Desc': { en: 'Instant step-by-step problem solving, past paper breakdowns, and conceptual explanations tuned to Cameroon curricula.', fr: 'Résolution étape par étape des problèmes et explications adaptées aux programmes d\'examen.' },
  'features.f2Title': { en: '15,000+ Past Papers Bank', fr: 'Banque de 15 000+ Sujets' },
  'features.f2Desc': { en: 'Comprehensive library of past questions from GCE O/A Level, BEPC, Probatoire, and Baccalauréat with official marking schemes.', fr: 'Bibliothèque complète d\'anciennes épreuves GCE, BEPC, Probatoire et Baccalauréat avec corrigés officiels.' },
  'features.f3Title': { en: 'Adaptive Diagnostic Engine', fr: 'Moteur de Diagnostic Adaptatif' },
  'features.f3Desc': { en: 'Identify individual weak spots and receive custom study pathways tailored to your target exam grade goals.', fr: 'Identifiez vos points faibles et recevez un parcours de révision personnalisé.' },
  'features.f4Title': { en: 'Live Performance Analytics', fr: 'Analyses de Performance en Direct' },
  'features.f4Desc': { en: 'Track study streak, accuracy rates, chapter mastery, and predicted exam grades in real-time dashboards.', fr: 'Suivez votre série d\'études, votre précision et vos notes prédites sur un tableau de bord en temps réel.' },
  'features.f5Title': { en: 'Teacher & School LMS Studio', fr: 'Studio Enseignant & LMS' },
  'features.f5Desc': { en: 'Educators can build custom quizzes, track student progress, publish study material, and manage virtual classrooms.', fr: 'Les enseignants peuvent créer des quiz sur mesure, suivre les progrès et gérer leurs classes.' },
  'features.f6Title': { en: 'Offline Mobile Access', fr: 'Accès Mobile Hors-Ligne' },
  'features.f6Desc': { en: 'Download revision packages, past papers, and practice quizzes for seamless study without internet access.', fr: 'Téléchargez les fiches de révision et épreuves pour étudier même sans connexion internet.' },
  'features.f7Title': { en: 'Timed Exam Simulations', fr: 'Simulations d\'Examens Chronométrées' },
  'features.f7Desc': { en: 'Practice under real exam conditions with automated countdown timers, anti-cheat controls, and instant scoring.', fr: 'S\'entraîner dans les conditions réelles avec chronomètre et correction automatique.' },
  'features.f8Title': { en: 'Bilingual English & French', fr: 'Bilingue Anglais & Français' },
  'features.f8Desc': { en: 'Seamlessly switch between English and French curricula, interface labels, and AI response languages.', fr: 'Passez facilement d\'un système éducatif à l\'autre avec une interface bilingue complète.' },
  'features.f9Title': { en: 'Peer Duels & Leaderboards', fr: 'Duels & Classements Nationaux' },
  'features.f9Desc': { en: 'Challenge classmates to timed 1v1 quiz battles and climb national regional leaderboards.', fr: 'Défiez vos camarades dans des duels de connaissances et gravissez les classements nationaux.' },

  // --- Curriculum Section ---
  'cur.badge': { en: 'Academic Programs', fr: 'Programmes Éducatifs' },
  'cur.title': { en: 'Tailored For Both Anglophone & Francophone Sub-systems', fr: 'Conçu pour les Systèmes Anglophone et Francophone' },
  'cur.subtitle': { en: 'Aligned strictly with MINESEC, GCE Board, and regional examination board standards.', fr: 'Strictement aligné sur les exigences du MINESEC et du GCE Board.' },
  'cur.engTitle': { en: 'Anglophone GCE System', fr: 'Système Anglophone (GCE)' },
  'cur.engSub': { en: 'MINESEC & Cameroon GCE Board Aligned', fr: 'Conforme aux Normes du GCE Board' },
  'cur.engBadge': { en: 'Anglophone GCE', fr: 'GCE Anglophone' },
  'cur.oLevelTitle': { en: 'GCE Ordinary Level (O-Level)', fr: 'GCE Ordinary Level (O-Level)' },
  'cur.oLevelDesc': { en: 'Form 1 to Form 5 comprehensive coverage in Mathematics, Physics, Chemistry, Biology, Computer Science, Economics, and English.', fr: 'Couverture complète du programme secondaire anglophone de la Form 1 à la Form 5.' },
  'cur.aLevelTitle': { en: 'GCE Advanced Level (A-Level)', fr: 'GCE Advanced Level (A-Level)' },
  'cur.aLevelDesc': { en: 'Lower & Upper Sixth deep revision for Pure Math with Mechanics, Further Math, Physics, ICT, Literature, and Accounting.', fr: 'Révision approfondie pour les classes de Lower et Upper Sixth.' },
  'cur.exploreOa': { en: 'Explore GCE Materials', fr: 'Explorer les Sujets GCE' },
  'cur.frTitle': { en: 'Système Francophone', fr: 'Système Francophone (MINESEC)' },
  'cur.frSub': { en: 'Conforme au Programme National MINESEC', fr: 'Conforme au Programme Officiel MINESEC' },
  'cur.frBadge': { en: 'Système Francophone', fr: 'Système Francophone' },
  'cur.collegeTitle': { en: 'Collège & BEPC (6ème à 3ème)', fr: 'Collège & BEPC (6ème à 3ème)' },
  'cur.collegeDesc': { en: 'Préparation complète au BEPC : Mathématiques, Physique-Chimie, SVTEEHB, Informatique et Français.', fr: 'Préparation complète au BEPC : Mathématiques, Physique-Chimie, SVTEEHB, Informatique et Français.' },
  'cur.lyceeTitle': { en: 'Lycée, Probatoire & Baccalauréat', fr: 'Lycée, Probatoire & Baccalauréat' },
  'cur.lyceeDesc': { en: 'Séries C, D, A, TI, ESG et ESTP : Épreuves corrigées du Probatoire et du Baccalauréat avec conseils méthodologiques.', fr: 'Séries C, D, A, TI, ESG et ESTP : Épreuves corrigées du Probatoire et du Baccalauréat.' },
  'cur.exploreLycee': { en: 'Explorer les Sujets Bac', fr: 'Explorer les Sujets Bac' },

  // --- Subjects Showcase ---
  'subjects.badge': { en: 'Subject Catalog', fr: 'Catalogue de Matières' },
  'subjects.title': { en: 'Master Every Subject In Your Syllabus', fr: 'Maîtrisez Toutes les Matières de Votre Programme' },
  'subjects.subtitle': { en: 'Rich lesson notes, topic quizzes, and past paper question banks organized by subject.', fr: 'Notes de cours détaillées, quiz thématiques et banques de sujets d\'examens.' },
  'sub.lessonsCount': { en: 'Lessons', fr: 'Leçons' },
  'sub.math': { en: 'Algebra, Geometry, Trigonometry, Vectors & Calculus', fr: 'Algèbre, Géométrie, Trigonométrie & Calcul' },
  'sub.comp': { en: 'Data Representation, Algorithms, Programming & Networking', fr: 'Représentation des Données, Algorithmes & Programmation' },
  'sub.ict': { en: 'Information Systems, Databases, Web & Digital Literacy', fr: 'Systèmes d\'Information, Bases de Données & Web' },
  'sub.phys': { en: 'Mechanics, Electricity, Magnetism, Waves & Atomic Physics', fr: 'Mécanique, Électricité, Magnétisme & Ondes' },
  'sub.chem': { en: 'Organic, Inorganic, Physical Chemistry & Stoichiometry', fr: 'Chimie Organique, Minérale & Physique' },
  'sub.bio': { en: 'Cell Biology, Genetics, Physiology, Ecology & Human Health', fr: 'Biologie Cellulaire, Génétique, Physiologie & Écologie' },
  'sub.eng': { en: 'Grammar, Essay Writing, Summary Skills & Comprehension', fr: 'Grammaire, Rédaction & Compréhension' },
  'sub.fr': { en: 'Langue Française, Expression Écrite, Orthographe & Littérature', fr: 'Langue Française, Expression Écrite & Littérature' },
  'sub.geo': { en: 'Physical, Human & Economic Geography of Cameroon & World', fr: 'Géographie Physique, Humaine & Économique' },
  'sub.hist': { en: 'Cameroon History, African History & World Revolutions', fr: 'Histoire du Cameroun, d\'Afrique & Mondiale' },
  'sub.econ': { en: 'Microeconomics, Macroeconomics & International Trade', fr: 'Microéconomie, Macroéconomie & Commerce International' },
  'sub.acc': { en: 'Financial Accounting, Principles of Commerce & Business', fr: 'Comptabilité Financière & Commerce' },
  'sub.start': { en: 'Practice Now', fr: 'S\'entraîner' },

  // --- AI Tutor Showcase ---
  'ai.badge': { en: 'AI-Powered Learning', fr: 'Apprentissage par IA' },
  'ai.titleSec': { en: 'Meet Your 24/7 Personal Exam Tutor', fr: 'Rencontrez Votre Tuteur Personnel IA 24h/24' },
  'ai.subtitleSec': { en: 'Ask questions, solve step-by-step problems, and practice exam methodology in real time.', fr: 'Posez vos questions, résolvez des problèmes complexes et révisez les méthodologies d\'examen.' },
  'ai.assistantTitle': { en: 'Edulpha AI Assistant', fr: 'Assistant IA Edulpha' },
  'ai.assistantSub': { en: 'Powered by Edulpha AI Engine', fr: 'Propulsé par le Moteur Edulpha AI' },
  'ai.langBadge': { en: 'Bilingual English / Français', fr: 'Bilingue Anglais / Français' },
  'ai.btnQuad': { en: '📐 Quadratic Equations', fr: '📐 Équations du Second Degré' },
  'ai.btnPython': { en: '💻 Python Binary Search', fr: '💻 Recherche Binaire Python' },
  'ai.btnDiff': { en: '🧪 Équations Différentielles', fr: '🧪 Équations Différentielles' },
  'ai.youLabel': { en: 'You', fr: 'Vous' },
  'ai.aiLabel': { en: 'AI', fr: 'IA' },
  'ai.analyzing': { en: 'Analyzing problem using GCE syllabus...', fr: 'Analyse du problème selon le programme...' },
  'ai.tryFullBtn': { en: 'Try Interactive AI Tutor', fr: 'Tester le Tuteur IA Interactif' },

  // --- Roadmap Section ---
  'roadmap.badge': { en: 'Structured Pathway', fr: 'Parcours Structuré' },
  'roadmap.title': { en: 'Your 7-Step Roadmap To Exam Excellence', fr: 'Votre Parcours en 7 Étapes vers la Réussite' },
  'roadmap.subtitle': { en: 'Follow our proven study blueprint designed to take you from foundational understanding to top exam scores.', fr: 'Suivez notre méthode d\'étude éprouvée pour passer des révisions à la mention aux examens.' },
  'roadmap.step1Title': { en: '1. Account Setup', fr: '1. Inscription' },
  'roadmap.step1Desc': { en: 'Select your exact curriculum system, exam level, and target grade goals.', fr: 'Sélectionnez votre système éducatif, votre niveau d\'examen et vos objectifs.' },
  'roadmap.step2Title': { en: '2. Diagnostic Assessment', fr: '2. Test de Diagnostic' },
  'roadmap.step2Desc': { en: 'Take a quick diagnostic test to uncover subject strengths and topic gaps.', fr: 'Effectuez un test rapide pour identifier vos forces et vos lacunes.' },
  'roadmap.step3Title': { en: '3. AI Personal Study Plan', fr: '3. Plan d\'Études IA' },
  'roadmap.step3Desc': { en: 'Receive a personalized daily revision schedule crafted by Edulpha AI.', fr: 'Recevez un programme de révision quotidien personnalisé conçu par l\'IA.' },
  'roadmap.step4Title': { en: '4. Interactive Learning', fr: '4. Cours Interactifs' },
  'roadmap.step4Desc': { en: 'Study structured lesson notes, summary sheets, and interactive diagrams.', fr: 'Consultez des cours structurés, des fiches de synthèse et des schémas.' },
  'roadmap.step5Title': { en: '5. Past Paper Practice', fr: '5. Entraînement sur Sujets' },
  'roadmap.step5Desc': { en: 'Solve 15,000+ past questions with step-by-step marking scheme answers.', fr: 'Résolvez plus de 15 000 anciens sujets avec les corrigés officiels.' },
  'roadmap.step6Title': { en: '6. Mock Simulations', fr: '6. Examens Blancs' },
  'roadmap.step6Desc': { en: 'Take timed national mock exams with automated instant scoring and feedback.', fr: 'Passez des examens blancs chronométrés avec correction instantanée.' },
  'roadmap.step7Title': { en: '7. Exam Mastery', fr: '7. Réussite aux Examens' },
  'roadmap.step7Desc': { en: 'Enter the exam hall with maximum confidence, readiness, and speed.', fr: 'Abordez les épreuves officielles avec une confiance et une préparation maximales.' },

  // --- Mobile Section ---
  'mobile.badge': { en: 'Study Anywhere', fr: 'Étudiez Partout' },
  'mobile.title': { en: 'Download Edulpha Android App For Offline Study', fr: 'Téléchargez l\'Application Android Edulpha Hors-Ligne' },
  'mobile.desc': { en: 'Take your revision on the go. Download past papers, quiz sets, and lesson notes for offline access without internet.', fr: 'Emmenez vos révisions partout. Téléchargez les épreuves et leçons pour réviser sans connexion.' },
  'mobile.feat1': { en: '100% Offline Mode for past papers and topic quizzes', fr: 'Mode 100% Hors-Ligne pour les anciens sujets et quiz' },
  'mobile.feat2': { en: 'Fast, lightweight performance optimized for mobile devices', fr: 'Application rapide et légère optimisée pour smartphones' },
  'mobile.feat3': { en: 'Push notifications for daily study streak reminders', fr: 'Rappels quotidiens pour maintenir votre rythme de révision' },
  'mobile.feat4': { en: 'Automatic background syncing when connected to Wi-Fi', fr: 'Synchronisation automatique dès le retour d\'une connexion Wi-Fi' },
  'mobile.androidLabel': { en: 'Android APK', fr: 'APK Android' },
  'mobile.cardTitle': { en: 'Scan To Download App', fr: 'Scannez pour Télécharger' },
  'mobile.cardDesc': { en: 'Point your smartphone camera at the QR code to install Edulpha Mobile directly.', fr: 'Scannez le code QR pour installer l\'application Edulpha directement.' },
  'mobile.version': { en: 'Official Release v1.0.4 • verified security', fr: 'Version Officielle v1.0.4 • Sécurisée' },

  // --- Pricing Section ---
  'pricing.badge': { en: 'Flexible Subscriptions', fr: 'Abonnements Flexibles', es: 'Suscripciones Flexibles', ar: 'اشتراكات مرنة', de: 'Flexible Abonnements', pt: 'Assinaturas Flexíveis' },
  'pricing.title': { en: 'Simple, Transparent Pricing', fr: 'Tarifs Simples et Transparents', es: 'Precios Simples y Transparentes', ar: 'أسعار بسيطة وشفافة', de: 'Einfache, transparente Preise', pt: 'Preços Simples e Transparentes' },
  'pricing.subtitle': { en: 'Choose the ideal plan for your study goals with no hidden fees.', fr: 'Choisissez le forfait adapté à vos objectifs sans aucun frais caché.' },
  'pricing.freeBadge': { en: 'Starter Tier', fr: 'Formule Découverte', es: 'Nivel Inicial', ar: 'مستوى البداية', de: 'Einsteiger-Tarif', pt: 'Nível Inicial' },
  'pricing.freeTitle': { en: 'Free Access', fr: 'Accès Gratuit', es: 'Acceso Gratuito', ar: 'وصول مجاني', de: 'Kostenloser Zugang', pt: 'Acesso Gratuito' },
  'pricing.freeDesc': { en: 'Perfect for trying out past questions and basic revision.', fr: 'Idéal pour découvrir les sujets d\'examen et s\'entraîner.' },
  'pricing.freePrice': { en: '0 FCFA', fr: '0 FCFA' },
  'pricing.freeDuration': { en: '/ forever', fr: '/ pour toujours' },
  'pricing.freeFeat1': { en: 'Access to 500+ sample past questions', fr: 'Accès à 500+ exemples d\'épreuves' },
  'pricing.freeFeat2': { en: 'Basic diagnostic score test', fr: 'Test de diagnostic initial' },
  'pricing.freeFeat3': { en: '5 AI Tutor queries per day', fr: '5 questions IA par jour' },
  'pricing.freeBtn': { en: 'Get Started Free', fr: 'Démarrer Gratuitement' },
  'pricing.mostPopular': { en: 'Most Popular', fr: 'Le Plus Populaire' },
  'pricing.premBadge': { en: 'Full Student Pass', fr: 'Pass Étudiant Complet' },
  'pricing.premTitle': { en: 'Edulpha Premium', fr: 'Edulpha Premium', es: 'Edulpha Premium', ar: 'إيدولفا بريميوم', de: 'Edulpha Premium', pt: 'Edulpha Premium' },
  'pricing.premDesc': { en: 'Complete exam preparation package for students aiming for top grades.', fr: 'Pack de préparation complet pour réussir avec mention.' },
  'pricing.premPrice': { en: '2,500 FCFA', fr: '2 500 FCFA' },
  'pricing.premDuration': { en: '/ term', fr: '/ trimestre' },
  'pricing.premFeat1': { en: 'Unlimited access to 15,000+ past papers & solutions', fr: 'Accès illimité à 15 000+ sujets et corrigés' },
  'pricing.premFeat2': { en: 'Unlimited 24/7 Edulpha AI tutor queries', fr: 'Questions illimitées 24/7 au tuteur IA Edulpha' },
  'pricing.premFeat3': { en: 'Timed mock exam simulations & analytics', fr: 'Examens blancs chronométrés et analyses' },
  'pricing.premFeat4': { en: '1v1 challenge duels & leaderboard ranking', fr: 'Duels de connaissances et classements' },
  'pricing.premFeat5': { en: 'Full offline mobile download package', fr: 'Téléchargement complet hors-ligne' },
  'pricing.premBtn': { en: 'Upgrade to Premium', fr: 'Passer à Premium' },
  'pricing.instBadge': { en: 'Schools & Teachers', fr: 'Écoles & Enseignants' },
  'pricing.instTitle': { en: 'Institutional Pass', fr: 'Offre Établissements' },
  'pricing.instDesc': { en: 'Tailored solutions for schools, tutoring centers, and educator studios.', fr: 'Solution sur mesure pour écoles, collèges, lycées et centres de cours.' },
  'pricing.instPrice': { en: 'Custom', fr: 'Sur Devis' },
  'pricing.instDuration': { en: '/ school year', fr: '/ année scolaire' },
  'pricing.instFeat1': { en: 'Teacher LMS studio & question generator', fr: 'Studio enseignant et générateur de quiz' },
  'pricing.instFeat2': { en: 'Bulk student access & class progress dashboards', fr: 'Gestion de classes et suivi global des élèves' },
  'pricing.instFeat3': { en: 'Custom school branding & mock paper creation', fr: 'Création d\'épreuves aux couleurs de l\'école' },
  'pricing.instFeat4': { en: 'Dedicated priority technical support', fr: 'Support technique dédié et prioritaire' },
  'pricing.instBtn': { en: 'Contact School Sales', fr: 'Contacter l\'Équipe Commerciale' },

  // --- Testimonials Section ---
  'test.badge': { en: 'Student Success Stories', fr: 'Témoignages de Réussite' },
  'test.title': { en: 'Trusted By High Performing Students', fr: 'Adopté par les Meilleurs Élèves' },
  'test.subtitle': { en: 'Hear from students across Cameroon who transformed their exam results with Edulpha.', fr: 'Découvrez comment nos étudiants réussissent leurs examens avec Edulpha.' },
  'test.quote1': { en: 'Edulpha AI helped me solve difficult Further Math past papers step-by-step. I got 5 A grades in A-Level!', fr: 'Grâce à l\'IA Edulpha, j\'ai pu comprendre les sujets de Mathématiques complexes. J\'ai obtenu 5 mentions A au GCE A-Level !' },
  'test.author1': { en: 'Brenda T.', fr: 'Brenda T.' },
  'test.role1': { en: 'GCE A-Level Student, Bamenda', fr: 'Élève en GCE A-Level, Bamenda' },
  'test.quote2': { en: 'Grâce aux sujets corrigés du Baccalauréat C et au tuteur IA, j’ai obtenu la mention Très Bien.', fr: 'Grâce aux sujets corrigés du Baccalauréat C et au tuteur IA, j’ai obtenu la mention Très Bien.' },
  'test.author2': { en: 'Jean-Pierre M.', fr: 'Jean-Pierre M.' },
  'test.role2': { en: 'Élève en Terminale C, Douala', fr: 'Élève en Terminale C, Douala' },
  'test.quote3': { en: 'The offline mobile app is incredible. I practiced past papers on my phone even without internet in my town.', fr: 'L\'application mobile hors-ligne est fantastique. J\'ai pu réviser les anciens sujets sur mon téléphone même sans connexion.' },
  'test.author3': { en: 'Emmanuel K.', fr: 'Emmanuel K.' },
  'test.role3': { en: 'GCE O-Level Student, Buea', fr: 'Élève en GCE O-Level, Buea' },

  // --- FAQ Section ---
  'faq.badge': { en: 'Got Questions?', fr: 'Questions Fréquentes' },
  'faq.title': { en: 'Frequently Asked Questions', fr: 'Foire Aux Questions' },
  'faq.subtitle': { en: 'Everything you need to know about Edulpha, curricula, and subscriptions.', fr: 'Tout ce que vous devez savoir sur la plateforme et les abonnements.' },
  'faq.q1': { en: 'What educational systems does Edulpha cover?', fr: 'Quels systèmes éducatifs sont pris en charge par Edulpha ?' },
  'faq.a1': { en: 'Edulpha fully supports both the Anglophone GCE system (O-Level and A-Level) and the Francophone system (BEPC, Probatoire, and Baccalauréat) aligned with MINESEC requirements.', fr: 'Edulpha prend en charge le système anglophone GCE (O-Level et A-Level) et le système francophone (BEPC, Probatoire et Baccalauréat) conformes aux exigences du MINESEC.' },
  'faq.q2': { en: 'Can I use Edulpha offline without internet?', fr: 'Puis-je utiliser Edulpha hors-ligne sans connexion internet ?' },
  'faq.a2': { en: 'Yes! The Edulpha Android App allows you to download past questions, solutions, and lesson notes for offline study anytime.', fr: 'Oui ! L\'application Android Edulpha vous permet de télécharger les anciennes épreuves, corrigés et fiches de cours pour réviser hors-ligne.' },
  'faq.q3': { en: 'How does the Edulpha AI Tutor work?', fr: 'Comment fonctionne le tuteur Edulpha AI ?' },
  'faq.a3': { en: 'Edulpha AI uses advanced intelligent learning models trained on official curriculum standards to provide step-by-step solutions, explanations, and exam methodology tips 24/7.', fr: 'L\'IA Edulpha utilise des modèles intelligents adaptés aux programmes officiels pour vous fournir des solutions détaillées et conseils méthodologiques 24h/24.' },
  'faq.q4': { en: 'How do I pay for Edulpha Premium in Cameroon?', fr: 'Comment payer mon abonnement Edulpha Premium au Cameroun ?' },
  'faq.a4': { en: 'We support Mobile Money (MTN Mobile Money & Orange Money) via secure instant payment gateways.', fr: 'Nous acceptons les paiements Mobile Money (MTN Mobile Money & Orange Money) en toute sécurité.' },
  'faq.q5': { en: 'Can teachers and schools create custom exams on Edulpha?', fr: 'Les enseignants et écoles peuvent-ils créer leurs propres examens ?' },
  'faq.a5': { en: 'Yes, educators can use the Teacher Studio to generate custom quizzes, publish LMS lessons, and monitor student class performance.', fr: 'Oui, le Studio Enseignant permet de générer des quiz personnalisés, publier des cours et suivre la progression des élèves.' },
  'faq.q6': { en: 'Is there a free trial or free tier available?', fr: 'Existe-t-il un accès gratuit ?' },
  'faq.a6': { en: 'Yes! You can register for free and immediately access 500+ past questions, diagnostic tests, and daily free AI queries.', fr: 'Oui ! L\'inscription est gratuite et vous donne accès à 500+ sujets exemple, tests de diagnostic et questions IA quotidiennes.' },

  // --- CTA & Footer Section ---
  'cta.title': { en: 'Ready To Master Your Exams?', fr: 'Prêt à Réussir vos Examens avec Mention ?' },
  'cta.desc': { en: 'Join over 50,000 students preparing for Cameroon GCE and Baccalauréat exams today.', fr: 'Rejoignez plus de 50 000 élèves qui préparent le GCE et le Baccalauréat dès aujourd\'hui.' },
  'cta.createAccount': { en: 'Create Free Account', fr: 'Créer un Compte Gratuit' },
  'footer.desc': { en: 'Edulpha is a bilingual AI-powered exam preparation platform empowering students and educators across Cameroon and Africa.', fr: 'Edulpha est une plateforme bilingue de préparation aux examens propulsée par l\'IA pour les étudiants et enseignants.' },
  'footer.excellence': { en: 'MINESEC & GCE BOARD ALIGNED', fr: 'CONFORME AUX NORMES MINESEC & GCE BOARD' },
  'footer.resources': { en: 'Resources', fr: 'Ressources' },
  'footer.catalog': { en: 'Subject Catalog', fr: 'Catalogue de Matières' },
  'footer.support': { en: 'Support', fr: 'Support' },
  'footer.whatsapp': { en: 'WhatsApp Support', fr: 'Support WhatsApp' },
  'footer.community': { en: 'Join Student Community', fr: 'Communauté d\'Élèves' },
  'footer.help': { en: 'Help & FAQ', fr: 'Aide & FAQ' },
  'footer.legal': { en: 'Legal & Policy', fr: 'Légal & Confidentialité' },
  'footer.terms': { en: 'Terms of Service', fr: 'Conditions d\'Utilisation' },
  'footer.privacy': { en: 'Privacy Policy', fr: 'Politique de Confidentialité' },
  'footer.data': { en: 'Data Protection', fr: 'Protection des Données' },
  'footer.rights': { en: '© 2026 Edulpha AI Technologies. All rights reserved.', fr: '© 2026 Edulpha AI Technologies. Tous droits réservés.', es: '© 2026 Edulpha AI Technologies. Todos los derechos reservados.', ar: '© 2026 تقنيات إيدولفا للذكاء الاصطناعي. جميع الحقوق محفوظة.', de: '© 2026 Edulpha AI Technologies. Alle Rechte vorbehalten.', pt: '© 2026 Edulpha AI Technologies. Todos os direitos reservados.' },
  'footer.secure': { en: '256-Bit SSL Encrypted', fr: 'Cryptage SSL 256-bit' },
  'footer.bilingual': { en: 'Bilingual Platform', fr: 'Plateforme Bilingue' },

  // --- Sidebar & Navigation Items ---
  'sidebar.mobileApp': { en: 'Edulpha Mobile App', fr: 'Application Mobile Edulpha' },
  'sidebar.analytics': { en: 'Learning Analytics', fr: 'Analyses d\'Apprentissage' },
  'sidebar.notifications': { en: 'Notifications & Alerts', fr: 'Notifications & Alertes' },
  'sidebar.forum': { en: 'Discussion Forum', fr: 'Forum de Discussion' },
  'sidebar.gceExamEngine': { en: 'GCE Exam Engine', fr: 'Moteur d\'Examens GCE' },
  'sidebar.duelBattle': { en: 'Duel Battle', fr: 'Moteur de Duels' },
  'sidebar.randomPractice': { en: 'Random Practice', fr: 'Entraînement Aléatoire' },
  'sidebar.diagnostic': { en: 'Diagnostic Test', fr: 'Test de Diagnostic' },
  'sidebar.teacherDashboard': { en: 'Teacher Dashboard', fr: 'Tableau Enseignant' },
  'sidebar.classAnalytics': { en: 'Class Analytics', fr: 'Analyses de Classe' },
  'sidebar.lmsStudio': { en: 'LMS Content Studio', fr: 'Studio de Contenu LMS' },
  'sidebar.questionBank': { en: 'Master Question Bank', fr: 'Banque Principale de Questions' },
  'sidebar.mockExamBuilder': { en: 'Mock Exam Builder', fr: 'Générateur d\'Examens Blancs' },
  'sidebar.studyChallenges': { en: 'Study Challenges', fr: 'Défis d\'Études' },
  'sidebar.dailyDrills': { en: 'Daily Drills', fr: 'Exercices Quotidiens' },
  'sidebar.resourcesAssignments': { en: 'Resources & Assignments', fr: 'Ressources & Devoirs' },
  'sidebar.studentView': { en: 'Student View', fr: 'Aperçu Élève' },
  'sidebar.usersSystemAdmin': { en: 'Users & System Admin', fr: 'Utilisateurs & Admin Système' },
  'sidebar.securityPerformance': { en: 'Security & Performance', fr: 'Sécurité & Performance' },
  'sidebar.executiveAnalytics': { en: 'Executive Analytics & Reports', fr: 'Rapports & Analyses Exécutifs' },
  'sidebar.payments': { en: 'Payments & Revenue', fr: 'Paiements & Revenus' },
  'sidebar.managePapers': { en: 'Manage Past Papers', fr: 'Gérer les Épreuves' },
  'sidebar.paper2Generator': { en: 'Paper 2 Generator', fr: 'Générateur d\'Épreuve 2' },
  'sidebar.systemSettings': { en: 'System Settings', fr: 'Paramètres du Système' },

  // --- Extended Auth Translations ---
  'auth.forgotPassword': { en: 'Forgot Password?', fr: 'Mot de passe oublié ?' },
  'auth.resetPassword': { en: 'Reset Password', fr: 'Réinitialiser le mot de passe' },
  'auth.sendResetLink': { en: 'Send Reset Link', fr: 'Envoyer le lien de réinitialisation' },
  'auth.backToLogin': { en: 'Back to Login', fr: 'Retour à la connexion' },
  'auth.emailVerification': { en: 'Email Verification', fr: 'Vérification de l\'Email' },
  'auth.otpVerification': { en: 'OTP Verification Code', fr: 'Code de vérification OTP' },
  'auth.twoFactor': { en: 'Two-Factor Authentication', fr: 'Authentification à deux facteurs' },
  'auth.accountActivation': { en: 'Account Activation', fr: 'Activation du compte' },
  'auth.lockoutWarning': { en: 'Account locked due to multiple failed login attempts.', fr: 'Compte verrouillé après plusieurs tentatives échouées.' },
  'auth.checkEmailReset': { en: 'A password reset link has been sent to your email address.', fr: 'Un lien de réinitialisation a été envoyé à votre adresse email.' },

  // --- Extended Student Dashboard Tabs ---
  'dashboard.myCourses': { en: 'My Courses', fr: 'Mes Cours' },
  'dashboard.continueLearning': { en: 'Continue Learning', fr: 'Continuer l\'Apprentissage' },
  'dashboard.studyPlans': { en: 'AI Study Plans', fr: 'Plans d\'Études IA' },
  'dashboard.lessons': { en: 'Lessons & Modules', fr: 'Leçons & Modules' },
  'dashboard.videos': { en: 'Video Lectures', fr: 'Cours Vidéo' },
  'dashboard.notes': { en: 'Revision Notes', fr: 'Fiches de Révision' },
  'dashboard.downloads': { en: 'Offline Downloads', fr: 'Téléchargements Hors-Ligne' },
  'dashboard.practice': { en: 'Practice Mode', fr: 'Mode Entraînement' },
  'dashboard.mockExams': { en: 'Mock Exam Simulations', fr: 'Simulations d\'Examens Blancs' },
  'dashboard.pastQuestions': { en: 'Past Question Papers', fr: 'Sujets d\'Examens Précédents' },
  'dashboard.progress': { en: 'Progress & Grades', fr: 'Progrès & Notes' },
  'dashboard.achievements': { en: 'Achievements & Badges', fr: 'Succès & Badges' },
  'dashboard.certificates': { en: 'Certificates of Completion', fr: 'Certificats de Réussite' },
  'dashboard.forum': { en: 'Student Forum', fr: 'Forum des Élèves' },

  // --- Extended Teacher & Admin Sections ---
  'teacher.title': { en: 'AI Teacher Studio & LMS Management', fr: 'Studio Enseignant IA & Gestion LMS' },
  'teacher.createLesson': { en: 'Create New Lesson', fr: 'Créer une Nouvelle Leçon' },
  'teacher.manageStudents': { en: 'Manage Student Classes', fr: 'Gérer les Classes d\'Élèves' },
  'teacher.quizBuilder': { en: 'Interactive Quiz Builder', fr: 'Générateur de Quiz Interactifs' },
  'teacher.publishMaterial': { en: 'Publish Study Material', fr: 'Publier du Matériel d\'Étude' },
  'admin.users': { en: 'User Management', fr: 'Gestion des Utilisateurs' },
  'admin.teachers': { en: 'Educator Directory', fr: 'Répertoire des Enseignants' },
  'admin.students': { en: 'Student Directory', fr: 'Répertoire des Élèves' },
  'admin.curriculum': { en: 'Curriculum Builder', fr: 'Gestionnaire de Programmes' },
  'admin.subjects': { en: 'Subject Management', fr: 'Gestion des Matières' },
  'admin.questionBank': { en: 'Question Bank Hub', fr: 'Gestion de la Banque de Questions' },
  'admin.mockExams': { en: 'Mock Exams Engine', fr: 'Moteur d\'Examens Blancs' },
  'admin.aiSettings': { en: 'AI Model & Moderation Config', fr: 'Configuration IA & Modération' },
  'admin.reports': { en: 'Reports & Audits', fr: 'Rapports & Audits' },
  'admin.payments': { en: 'Payment Transactions', fr: 'Transactions de Paiement' },
  'admin.subscriptions': { en: 'Subscription Plans', fr: 'Formules d\'Abonnement' },
  'admin.partners': { en: 'Institutional Partners', fr: 'Partenaires Institutionnels' },
  'admin.appDistribution': { en: 'Mobile App Distribution', fr: 'Distribution de l\'Application Mobile' },
  'admin.navigationBuilder': { en: 'Navigation Builder', fr: 'Constructeur de Navigation' },

  // --- Examination Engine & Questions ---
  'exam.instructions': { en: 'Exam Instructions', fr: 'Consignes de l\'Examen' },
  'exam.timer': { en: 'Time Remaining', fr: 'Temps Restant' },
  'exam.submitExam': { en: 'Submit Examination', fr: 'Soumettre l\'Épreuve' },
  'exam.results': { en: 'Exam Results & Analysis', fr: 'Résultats & Analyses d\'Examen' },
  'exam.explanation': { en: 'Step-by-Step Solution & Marking Scheme', fr: 'Solution Détaillée & Barème de Correction' },
  'exam.difficulty': { en: 'Difficulty Level', fr: 'Niveau de Difficulté' },
  'exam.score': { en: 'Final Score', fr: 'Note Finale' },
  'exam.passed': { en: 'PASSED - Outstanding Performance', fr: 'RÉUSSI - Performance Excellente' },
  'exam.failed': { en: 'Needs Improvement', fr: 'À Améliorer' },
  'exam.confirmSubmit': { en: 'Are you sure you want to submit your exam now?', fr: 'Êtes-vous sûr de vouloir soumettre votre épreuve maintenant ?' },

  // --- Forum & Discussion ---
  'forum.title': { en: 'Community Discussion Forum', fr: 'Forum de Discussion de la Communauté' },
  'forum.newPost': { en: 'New Discussion Thread', fr: 'Nouvelle Discussion' },
  'forum.reply': { en: 'Reply to Thread', fr: 'Répondre au Sujet' },
  'forum.replies': { en: 'Replies', fr: 'Réponses' },
  'forum.upvote': { en: 'Upvote', fr: 'Voter Pour' },
  'forum.topics': { en: 'Discussion Topics', fr: 'Sujets de Discussion' },
  'forum.noPosts': { en: 'No discussions found. Be the first to start a conversation!', fr: 'Aucune discussion. Soyez le premier à lancer un sujet !' },

  // --- Notifications & Modals ---
  'notifications.title': { en: 'Notifications & System Alerts', fr: 'Notifications & Alertes Système' },
  'notifications.markAllRead': { en: 'Mark All as Read', fr: 'Tout Marquer comme Lu' },
  'notifications.noNotifications': { en: 'No unread notifications at this time.', fr: 'Aucune notification non lue pour le moment.' },
  'notifications.preferences': { en: 'Notification Preferences', fr: 'Préférences de Notification' },

  // --- Mobile App Sync ---
  'mobile.syncTitle': { en: 'Mobile Offline Sync Engine', fr: 'Moteur de Mises à Jour et Synchronisation' },
  'mobile.offlineStatus': { en: 'Offline Revision Package Ready', fr: 'Pack de Révision Hors-Ligne Prêt' },
  'mobile.downloadCompleted': { en: 'Download completed successfully!', fr: 'Téléchargement terminé avec succès !' },

  // --- Extended Sidebar ---
  'sidebar.practicalLab': { en: 'Virtual Practical Lab', fr: 'Laboratoire Pratique Virtuel' },
  'sidebar.practicalStudio': { en: 'Practical Studio', fr: 'Studio de Travaux Pratiques' },
  'sidebar.systemData': { en: 'System Data Management', fr: 'Gestion des Données Système' },
  'sidebar.auditLog': { en: 'Admin Audit Log', fr: 'Journal d\'Audit Administrateur' },
  'sidebar.ambassadorAdmin': { en: 'Student Ambassador Admin', fr: 'Gestion des Ambassadeurs' },
  'sidebar.alumniAdmin': { en: 'Alumni Management', fr: 'Gestion des Anciens Élèves' },
  'sidebar.clearDemoData': { en: 'Clear Demo Data', fr: 'Purger les Données Démo' },
  'sidebar.feedback': { en: 'Send Feedback', fr: 'Envoyer un Commentaire' },

  // --- Virtual Practical Lab ---
  'practicals.title': { en: 'Virtual Practical Science & Tech Labs', fr: 'Laboratoires Virtuels de Sciences & Technologies' },
  'practicals.subtitle': { en: 'Interactive simulations, apparatus manipulation, and experimental data recording for GCE & Baccalauréat sciences.', fr: 'Simulations interactives, manipulation d\'appareils et relevés expérimentaux pour les épreuves pratiques.' },
  'practicals.startLab': { en: 'Launch Simulation', fr: 'Lancer la Simulation' },
  'practicals.resetLab': { en: 'Reset Experiment', fr: 'Réinitialiser l\'Expérience' },
  'practicals.apparatus': { en: 'Apparatus & Equipment', fr: 'Appareils & Matériel' },
  'practicals.chemicals': { en: 'Reagents & Chemicals', fr: 'Réactifs & Produits Chimiques' },
  'practicals.procedure': { en: 'Standard Operating Procedure', fr: 'Protocole Expérimental' },
  'practicals.safetyManual': { en: 'Lab Safety Protocol', fr: 'Consignes de Sécurité du Laboratoire' },
  'practicals.observations': { en: 'Observation & Data Log', fr: 'Relevé d\'Observations & Données' },
  'practicals.logData': { en: 'Record Observation', fr: 'Enregistrer une Mesure' },
  'practicals.completeLab': { en: 'Submit Lab Report', fr: 'Soumettre le Compte-Rendu' },
  'practicals.physics': { en: 'Physics Mechanics & Electricity', fr: 'Physique : Mécanique & Électricité' },
  'practicals.chemistry': { en: 'Titration & Qualitative Analysis', fr: 'Dosage Volumétrique & Chimie Analytique' },
  'practicals.biology': { en: 'Microscopy & Enzyme Kinetics', fr: 'Microscopie & Cinétique Enzymatique' },
  'practicals.computerScience': { en: 'Digital Logic & Circuit Design', fr: 'Logique Numérique & Circuits' },

  // --- LMS & Courses ---
  'lms.title': { en: 'Digital Learning Portal (LMS)', fr: 'Portail d\'Apprentissage Numérique (LMS)' },
  'lms.subtitle': { en: 'Master syllabus topics with structured lessons, video lectures, summary notes, and downloadable revision materials.', fr: 'Maîtrisez votre programme avec des cours structurés, vidéos, fiches de révision et ressources téléchargeables.' },
  'lms.modules': { en: 'Course Modules', fr: 'Modules du Cours' },
  'lms.lessons': { en: 'Lessons & Topics', fr: 'Leçons & Thèmes' },
  'lms.videoLectures': { en: 'Video Lectures', fr: 'Vidéos de Cours' },
  'lms.notes': { en: 'My Revision Notes', fr: 'Mes Notes de Révision' },
  'lms.downloads': { en: 'Downloadable Resources', fr: 'Ressources Téléchargeables' },
  'lms.markComplete': { en: 'Mark as Completed', fr: 'Marquer comme Terminé' },
  'lms.completed': { en: 'Completed', fr: 'Terminé' },
  'lms.inProgress': { en: 'In Progress', fr: 'En Cours' },
  'lms.notStarted': { en: 'Not Started', fr: 'Non Commencé' },
  'lms.addNote': { en: 'Create New Note', fr: 'Ajouter une Note' },
  'lms.noteTitle': { en: 'Note Title', fr: 'Titre de la Note' },
  'lms.noteContent': { en: 'Write your revision summary or key formulas...', fr: 'Rédigez votre résumé ou formules clés...' },
  'lms.saveNote': { en: 'Save Note', fr: 'Enregistrer la Note' },
  'lms.noNotes': { en: 'No notes created yet. Take notes while studying to boost retention!', fr: 'Aucune note pour le moment. Prenez des notes pendant vos révisions !' },
  'lms.certificateTitle': { en: 'Academic Certificate of Completion', fr: 'Certificat de Réussite Académique' },
  'lms.downloadCertificate': { en: 'Download Certificate (PDF)', fr: 'Télécharger le Certificat (PDF)' },
  'lms.overallMastery': { en: 'Overall Course Mastery', fr: 'Maîtrise Globale du Cours' },

  // --- Question Paper Management & Editor ---
  'questions.title': { en: 'Master Question Bank', fr: 'Banque Principale de Questions' },
  'questions.uploadPaper': { en: 'Upload Past Question Paper', fr: 'Téléverser une Ancienne Épreuve' },
  'questions.createQuestion': { en: 'Create New Question', fr: 'Créer une Nouvelle Question' },
  'questions.editQuestion': { en: 'Edit Question', fr: 'Modifier la Question' },
  'questions.questionText': { en: 'Question Text / Statement', fr: 'Énoncé de la Question' },
  'questions.questionType': { en: 'Question Format', fr: 'Type de Question' },
  'questions.mcq': { en: 'Multiple Choice (MCQ)', fr: 'Choix Multiple (QCM)' },
  'questions.structural': { en: 'Structural / Essay', fr: 'Épreuve Structurée / Dissertation' },
  'questions.practical': { en: 'Practical / Lab', fr: 'Épreuve Pratique / Laboratoire' },
  'questions.options': { en: 'Answer Options', fr: 'Options de Réponse' },
  'questions.correctOption': { en: 'Correct Option', fr: 'Option Correcte' },
  'questions.markingGuide': { en: 'Marking Guide / Explanation', fr: 'Corrigé / Explication' },
  'questions.marks': { en: 'Marks Allocated', fr: 'Points Attribués' },
  'questions.year': { en: 'Examination Year', fr: 'Année de l\'Examen' },
  'questions.session': { en: 'Exam Session', fr: 'Session de l\'Examen' },
  'questions.paperType': { en: 'Paper Number', fr: 'Numéro d\'Épreuve' },
  'questions.filterBySubject': { en: 'Filter by Subject', fr: 'Filtrer par Matière' },
  'questions.filterByLevel': { en: 'Filter by Level', fr: 'Filtrer par Niveau' },
  'questions.filterByYear': { en: 'Filter by Year', fr: 'Filtrer par Année' },
  'questions.aiGenerate': { en: 'Generate Questions with AI', fr: 'Générer des Questions avec l\'IA' },
  'questions.aiGenerateDesc': { en: 'Automatically generate high-yield GCE and Baccalauréat questions with detailed marking schemes using Edulpha AI.', fr: 'Générez automatiquement des questions conformes aux examens nationaux avec corrigés détaillés.' },
  'questions.numberOfQuestions': { en: 'Number of Questions', fr: 'Nombre de Questions' },
  'questions.generating': { en: 'AI Generating Questions...', fr: 'Génération IA en cours...' },
  'questions.saveToBank': { en: 'Save to Question Bank', fr: 'Enregistrer dans la Banque' },

  // --- Student Ambassador & Referral ---
  'ambassador.title': { en: 'Edulpha Student Ambassador Program', fr: 'Programme Ambassadeurs Élèves Edulpha' },
  'ambassador.subtitle': { en: 'Represent Edulpha in your school, lead study clubs, share your unique referral code, and earn rewards.', fr: 'Représentez Edulpha dans votre établissement, animez des groupes d\'étude et gagnez des récompenses.' },
  'ambassador.applyNow': { en: 'Apply as Student Ambassador', fr: 'Devenir Ambassadeur' },
  'ambassador.yourReferralCode': { en: 'Your Referral Code', fr: 'Votre Code de Parrainage' },
  'ambassador.copyCode': { en: 'Copy Code', fr: 'Copier le Code' },
  'ambassador.codeCopied': { en: 'Referral code copied to clipboard!', fr: 'Code de parrainage copié !' },
  'ambassador.totalReferrals': { en: 'Active Referrals', fr: 'Filleuls Actifs' },
  'ambassador.totalEarned': { en: 'Total Commission Earned', fr: 'Commissions Gagnées' },
  'ambassador.payoutMethod': { en: 'Preferred Payout (MTN / Orange Money)', fr: 'Mode de Paiement Préféré' },
  'ambassador.terms': { en: 'Ambassador Terms & Code of Conduct', fr: 'Conditions & Charte de l\'Ambassadeur' },

  // --- Alumni & Career Network ---
  'alumni.title': { en: 'Edulpha Alumni & Mentorship Network', fr: 'Réseau des Anciens Élèves & Mentorat' },
  'alumni.subtitle': { en: 'Connect with top university scholars, scholarship recipients, and professionals who aced national exams with Edulpha.', fr: 'Échangez avec les anciens lauréats, boursiers et professionnels ayant réussi leurs examens avec Edulpha.' },
  'alumni.joinNetwork': { en: 'Join Alumni Community', fr: 'Rejoindre la Communauté des Anciens' },
  'alumni.mentorStudent': { en: 'Become a Peer Mentor', fr: 'Devenir Mentor Bénévole' },
  'alumni.hallOfFame': { en: 'National Hall of Fame', fr: 'Tableau d\'Honneur National' },
  'alumni.story': { en: 'Success Story', fr: 'Témoignage de Réussite' },
  'alumni.university': { en: 'University / Institution', fr: 'Université / École Supérieure' },
  'alumni.fieldOfStudy': { en: 'Specialization / Field', fr: 'Filière / Spécialisation' },

  // --- Payments, MoMo & Orange Money ---
  'payment.title': { en: 'Secure Subscription Checkout', fr: 'Paiement Sécurisé de l\'Abonnement' },
  'payment.subtitle': { en: 'Fast, secure instant mobile payments via MTN MoMo and Orange Money Cameroon.', fr: 'Paiement instantané et sécurisé via MTN Mobile Money et Orange Money Cameroun.' },
  'payment.selectMethod': { en: 'Select Payment Method', fr: 'Sélectionner le Mode de Paiement' },
  'payment.mtnMomo': { en: 'MTN Mobile Money', fr: 'MTN Mobile Money' },
  'payment.orangeMoney': { en: 'Orange Money', fr: 'Orange Money' },
  'payment.phoneNumber': { en: 'Mobile Money Phone Number', fr: 'Numéro Mobile Money' },
  'payment.phonePlaceholder': { en: 'e.g. 677 123 456 or 699 123 456', fr: 'ex. 677 123 456 ou 699 123 456' },
  'payment.accountName': { en: 'Registered Account Name', fr: 'Nom du Titulaire du Compte' },
  'payment.amount': { en: 'Amount Payable', fr: 'Montant à Payer' },
  'payment.payNow': { en: 'Confirm & Pay', fr: 'Confirmer et Payer' },
  'payment.processing': { en: 'Processing Transaction...', fr: 'Traitement de la Transaction...' },
  'payment.success': { en: 'Payment Confirmed! Your Premium access is now active.', fr: 'Paiement Confirmé ! Votre accès Premium est maintenant actif.' },
  'payment.viewReceipt': { en: 'View Payment Receipt', fr: 'Voir le Reçu de Paiement' },
  'payment.downloadReceipt': { en: 'Download Official Receipt (PDF)', fr: 'Télécharger le Reçu Officiel (PDF)' },
  'payment.transactionId': { en: 'Transaction ID', fr: 'Identifiant de Transaction' },
  'payment.status': { en: 'Payment Status', fr: 'Statut du Paiement' },

  // --- Daily Drills & Challenges ---
  'drill.title': { en: 'Daily Exam Drill', fr: 'Exercice Quotidien d\'Examen' },
  'drill.subtitle': { en: 'Solve 5 quick questions every day to build long-term memory and maintain your study streak.', fr: 'Résolvez 5 questions rapides par jour pour consolider vos acquis et maintenir votre série.' },
  'drill.streak': { en: 'Daily Streak', fr: 'Série Quotidienne' },
  'drill.points': { en: 'XP Points Earned', fr: 'Points d\'Expérience (XP)' },
  'drill.startDrill': { en: 'Start Today\'s Drill', fr: 'Démarrer l\'Exercice du Jour' },
  'drill.completed': { en: 'You completed today\'s drill! Come back tomorrow to continue your streak.', fr: 'Exercice du jour terminé ! Revenez demain pour prolonger votre série.' },
  'duel.title': { en: 'Live 1v1 Knowledge Duel', fr: 'Duel de Connaissances 1v1 en Direct' },
  'duel.findOpponent': { en: 'Find Opponent', fr: 'Trouver un Adversaire' },
  'duel.round': { en: 'Round', fr: 'Manche' },
  'duel.youWon': { en: 'VICTORY! You won the duel!', fr: 'VICTOIRE ! Vous avez remporté le duel !' },
  'duel.youLost': { en: 'Good effort! Review mistakes and try again.', fr: 'Bien joué ! Révisez vos erreurs et réessayez.' },

  // --- System Data & Admin Audit ---
  'sysdata.title': { en: 'System Data & Clean-up Studio', fr: 'Gestion & Purge des Données Système' },
  'sysdata.clearDemo': { en: 'Purge All Demo Data', fr: 'Purger Toutes les Données Démo' },
  'sysdata.clearDemoConfirm': { en: 'Are you sure you want to permanently delete all demo records? Real user accounts will be unaffected.', fr: 'Êtes-vous sûr de vouloir supprimer tous les enregistrements de démonstration ? Les vrais comptes utilisateurs seront préservés.' },
  'sysdata.clearedSuccess': { en: 'Demo data cleared successfully!', fr: 'Données de démonstration purgées avec succès !' },
  'audit.title': { en: 'System Security & Administrative Audit Log', fr: 'Journal d\'Audit & Sécurité du Système' },
  'audit.action': { en: 'Action Executed', fr: 'Action Exécutée' },
  'audit.performedBy': { en: 'Performed By', fr: 'Exécuté Par' },
  'audit.timestamp': { en: 'Timestamp', fr: 'Date & Heure' },
  'audit.details': { en: 'Audit Details', fr: 'Détails de l\'Audit' },

  // --- Search & Modals ---
  'search.global': { en: 'Global Search', fr: 'Recherche Globale' },
  'search.placeholder': { en: 'Search subjects, past papers, lessons, exams, or formulas...', fr: 'Rechercher matières, épreuves, leçons, examens ou formules...' },
  'search.noResults': { en: 'No results matching your query.', fr: 'Aucun résultat trouvé pour votre recherche.' },
  'search.quickNav': { en: 'Quick Navigation', fr: 'Navigation Rapide' },
  'feedback.title': { en: 'Send Platform Feedback', fr: 'Donnez votre Avis sur Edulpha' },
  'feedback.placeholder': { en: 'Tell us how we can make your study experience better...', fr: 'Expliquez-nous comment nous pouvons améliorer votre expérience d\'étude...' },
  'feedback.send': { en: 'Submit Feedback', fr: 'Envoyer l\'Avis' },
  'feedback.thankYou': { en: 'Thank you for your valuable feedback!', fr: 'Merci pour votre retour précieux !' }
};

export const getTranslation = (
  key: string,
  lang: LanguageCode = 'en',
  customDict?: TranslationDictionary,
  fallback?: string
): string => {
  // Check custom dynamic Firestore dictionary first if provided
  if (customDict && customDict[key] && customDict[key][lang]) {
    return customDict[key][lang];
  }
  // Check core built-in translations
  if (TRANSLATIONS[key] && TRANSLATIONS[key][lang]) {
    return TRANSLATIONS[key][lang];
  }
  // Fall back to English in core or custom
  if (customDict && customDict[key] && customDict[key]['en']) {
    return customDict[key]['en'];
  }
  if (TRANSLATIONS[key] && TRANSLATIONS[key]['en']) {
    return TRANSLATIONS[key]['en'];
  }
  if (fallback) {
    return fallback;
  }
  // Safely return formatted string if key looks like 'features.title' or '.subtitle' instead of exposing raw code dot syntax
  if (typeof key === 'string' && key.includes('.')) {
    const parts = key.split('.');
    const lastPart = parts[parts.length - 1];
    if (['title', 'subtitle', 'description', 'label', 'text'].includes(lastPart)) {
      return '';
    }
    return lastPart.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }
  return key;
};

/**
 * Helper to fetch localized field from database models dynamically.
 * Resolves properties like name_fr, nameFr, description_ar, etc.
 */
export const getLocalizedField = <T extends Record<string, any>>(
  item: T | null | undefined,
  field: string,
  language: LanguageCode = 'en',
  fallback: string = ''
): string => {
  if (!item) return fallback;

  // 1. Direct translation object (e.g. item.translations?.[lang]?.[field])
  if (item.translations && item.translations[language] && item.translations[language][field]) {
    return item.translations[language][field];
  }

  // 2. Language snake_case property (e.g. name_fr, description_es)
  const snakeKey = `${field}_${language}`;
  if (item[snakeKey] && typeof item[snakeKey] === 'string') {
    return item[snakeKey];
  }

  // 3. Language camelCase property (e.g. nameFr, descriptionEs, nameAr)
  const langSuffix = language.charAt(0).toUpperCase() + language.slice(1).toLowerCase();
  const camelKey = `${field}${langSuffix}`;
  if (item[camelKey] && typeof item[camelKey] === 'string') {
    return item[camelKey];
  }

  // 4. Default primary field (e.g. item.name, item.description)
  if (item[field] && typeof item[field] === 'string') {
    return item[field];
  }

  return fallback;
};
