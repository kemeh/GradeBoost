export type LanguageCode = 'en' | 'fr' | 'es' | 'ar' | 'de' | 'pt' | string;

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
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', direction: 'ltr', enabled: true },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇦🇪', direction: 'rtl', enabled: true },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', direction: 'ltr', enabled: true },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', direction: 'ltr', enabled: true },
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
  'nav.aiTutor': { en: 'Edulpha AI', fr: 'Edulpha IA', es: 'Edulpha IA', ar: 'إيدولفا ذكاء اصطناعي', de: 'Edulpha KI', pt: 'Edulpha IA' },
  'nav.lms': { en: 'Learning Portal (LMS)', fr: 'Portail de Cours (LMS)', es: 'Portal de Aprendizaje', ar: 'بوابة التعلم', de: 'Lernportal', pt: 'Portal de Aprendizagem' },
  'nav.dailyDrill': { en: 'Daily Drill', fr: 'Exercice Quotidien', es: 'Ejercicio Diario', ar: 'التمرين اليومي', de: 'Tägliche Übung', pt: 'Treino Diário' },
  'nav.challenges': { en: 'Challenges & Duels', fr: 'Défis & Duels', es: 'Desafíos y Dueloss', ar: 'التحديات والمبارزات', de: 'Herausforderungen & Duelle', pt: 'Desafios e Duelos' },
  'nav.leaderboard': { en: 'Leaderboard', fr: 'Classement', es: 'Tabla de Clasificación', ar: 'قائمة المتصدرين', de: 'Bestenliste', pt: 'Classificação' },
  'nav.analytics': { en: 'Exam Analytics', fr: 'Analyses des Examens', es: 'Análisis de Exámenes', ar: 'تحليلات الامتحانات', de: 'Prüfungsanalysen', pt: 'Análise de Exames' },
  'nav.profile': { en: 'Profile & Settings', fr: 'Profil & Paramètres', es: 'Perfil y Configuración', ar: 'الملف الشخصي والإعدادات', de: 'Profil & Einstellungen', pt: 'Perfil e Configurações' },
  'nav.admin': { en: 'Admin Portal', fr: 'Portail Administrateur', es: 'Portal de Administración', ar: 'بوابة الإدارة', de: 'Admin-Portal', pt: 'Portal do Administrador' },
  'nav.teacherStudio': { en: 'AI Teacher Studio', fr: 'Studio Enseignant IA', es: 'Estudio de Profesores IA', ar: 'استوديو المعلم بالذكاء الاصطناعي', de: 'KI-Lehrerstudio', pt: 'Estúdio do Professor IA' },
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
  'nav.features': { en: 'Features', fr: 'Fonctionnalités', es: 'Características', ar: 'المميزات', de: 'Funktionen', pt: 'Recursos' },
  'nav.curriculum': { en: 'Curriculum', fr: 'Programmes', es: 'Planes de Estudio', ar: 'المناهج', de: 'Lehrplan', pt: 'Currículo' },
  'nav.subjects': { en: 'Subjects', fr: 'Matières', es: 'Materias', ar: 'المواد', de: 'Fächer', pt: 'Disciplinas' },
  'nav.pricing': { en: 'Pricing', fr: 'Tarifs', es: 'Precios', ar: 'الأسعار', de: 'Preise', pt: 'Preços' },
  'nav.partners': { en: 'Partners & Alliances', fr: 'Partenaires & Alliances', es: 'Socios y Alianzas', ar: 'الشركاء والتحالفات', de: 'Partner & Allianzen', pt: 'Parceiros e Alianças' },
  'nav.mobileApp': { en: 'Mobile App', fr: 'Application Mobile', es: 'Aplicación Móvil', ar: 'تطبيق الهاتف', de: 'Mobile App', pt: 'Aplicativo Móvel' },
  'nav.faq': { en: 'FAQ', fr: 'FAQ', es: 'Preguntas Frecuentes', ar: 'الأسئلة الشائعة', de: 'FAQ', pt: 'Perguntas Frequentes' },

  'hero.badge': { en: 'Cameroon GCE & French Curriculum Ecosystem', fr: 'Écosystème GCE Cameroun & Programme Francophone', es: 'Ecosistema de Currículo GCE y Francés', ar: 'منظومة المناهج التعليمية بالكاميرون', de: 'GCE & Französisches Lehrplansystem', pt: 'Ecossistema Educacional GCE e Francês' },
  'hero.title1': { en: 'Learn Smarter.', fr: 'Apprenez Plus Malin.', es: 'Aprende Más Inteligente.', ar: 'تعلم بذكاء أكبر.', de: 'Lerne cleverer.', pt: 'Aprenda Mais Inteligente.' },
  'hero.title2': { en: 'Achieve More with', fr: 'Réussissez Plus avec', es: 'Logra Más con', ar: 'وحقق المزيد مع', de: 'Erreiche mehr mit', pt: 'Conquiste Mais com' },
  'hero.subtitle': { en: 'A bilingual AI-powered learning platform helping students prepare for GCE Ordinary & Advanced Level, BEPC, Baccalauréat, and beyond.', fr: 'Une plateforme d\'apprentissage bilingue propulsée par l\'IA pour préparer le GCE O/A Levels, le BEPC, le Baccalauréat et bien plus.', es: 'Una plataforma de aprendizaje bilingüe impulsada por IA que ayuda a preparar exámenes oficiales.', ar: 'منصة تعليمية متعددة اللغات بالذكاء الاصطناعي لمساعدة الطلاب في التحضير للامتحانات الوطنية.', de: 'Eine mehrsprachige KI-Lernplattform zur Vorbereitung auf nationale Prüfungen.', pt: 'Uma plataforma de aprendizagem bilíngue com IA para preparar alunos para exames oficiais.' },
  'hero.startLearning': { en: 'Start Learning Free', fr: 'Commencer Gratuitement', es: 'Empezar Gratis', ar: 'ابدأ التعلم مجاناً', de: 'Kostenlos starten', pt: 'Começar Gratuitamente' },
  'hero.exploreCourses': { en: 'Explore Courses', fr: 'Explorer les Cours', es: 'Explorar Cursos', ar: 'استكشف الدروس', de: 'Kurse erkunden', pt: 'Explorar Cursos' },

  'pricing.badge': { en: 'Flexible Subscriptions', fr: 'Abonnements Flexibles', es: 'Suscripciones Flexibles', ar: 'اشتراكات مرنة', de: 'Flexible Abonnements', pt: 'Assinaturas Flexíveis' },
  'pricing.title': { en: 'Simple, Transparent Pricing', fr: 'Tarifs Simples et Transparents', es: 'Precios Simples y Transparentes', ar: 'أسعار بسيطة وشفافة', de: 'Einfache, transparente Preise', pt: 'Preços Simples e Transparentes' },
  'pricing.freeTitle': { en: 'Free Access', fr: 'Accès Gratuit', es: 'Acceso Gratuito', ar: 'وصول مجاني', de: 'Kostenloser Zugang', pt: 'Acesso Gratuito' },
  'pricing.premTitle': { en: 'Edulpha Premium', fr: 'Edulpha Premium', es: 'Edulpha Premium', ar: 'إيدولفا بريميوم', de: 'Edulpha Premium', pt: 'Edulpha Premium' },

  'footer.rights': { en: '© 2026 Edulpha AI Technologies. All rights reserved.', fr: '© 2026 Edulpha AI Technologies. Tous droits réservés.', es: '© 2026 Edulpha AI Technologies. Todos los derechos reservados.', ar: '© 2026 تقنيات إيدولفا للذكاء الاصطناعي. جميع الحقوق محفوظة.', de: '© 2026 Edulpha AI Technologies. Alle Rechte vorbehalten.', pt: '© 2026 Edulpha AI Technologies. Todos os direitos reservados.' }
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
  return fallback || key;
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
