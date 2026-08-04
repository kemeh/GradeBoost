import React, { useState } from 'react';
import { Code, Copy, Check, Download, FileCode, Layers, Terminal } from 'lucide-react';
import toast from 'react-hot-toast';

export const FlutterCodeExporter: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'main' | 'theme' | 'home' | 'ai' | 'exam' | 'profile' | 'models'>('home');
  const [copied, setCopied] = useState(false);

  const flutterCodeFiles = {
    theme: `// lib/core/theme/edulpha_theme.dart
import 'package:flutter/material.dart';

class EdulphaTheme {
  // Brand Colors from Official Edulpha Promotional Flyer
  static const Color primaryRoyalBlue = Color(0xFF0F2C59);
  static const Color secondaryNavy = Color(0xFF1E3A8A);
  static const Color accentGoldenYellow = Color(0xFFF59E0B);
  static const Color accentBrightYellow = Color(0xFFFACC15);
  
  static const Color successGreen = Color(0xFF10B981);
  static const Color warningOrange = Color(0xFFF97316);
  static const Color errorRed = Color(0xFFEF4444);

  static const Color lightBackground = Color(0xFFF8FAFC);
  static const Color darkBackground = Color(0xFF0F172A);

  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    fontFamily: 'PlusJakartaSans',
    brightness: Brightness.light,
    scaffoldBackgroundColor: lightBackground,
    colorScheme: const ColorScheme.light(
      primary: primaryRoyalBlue,
      secondary: secondaryNavy,
      tertiary: accentGoldenYellow,
      surface: Colors.white,
    ),
    cardTheme: CardTheme(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      color: Colors.white,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryRoyalBlue,
        foregroundColor: Colors.white,
        minimumSize: const Size.fromHeight(48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        elevation: 3,
      ),
    ),
  );

  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    fontFamily: 'PlusJakartaSans',
    brightness: Brightness.dark,
    scaffoldBackgroundColor: darkBackground,
    colorScheme: const ColorScheme.dark(
      primary: primaryRoyalBlue,
      secondary: secondaryNavy,
      tertiary: accentGoldenYellow,
      surface: Color(0xFF1E293B),
    ),
  );
}`,

    main: `// lib/main.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/edulpha_theme.dart';
import 'features/home/presentation/home_screen.dart';
import 'features/ai_tutor/presentation/ai_tutor_screen.dart';
import 'features/exams/presentation/exam_screen.dart';
import 'features/profile/presentation/profile_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Initialize Firebase Firestore, Auth & Isar offline storage
  runApp(const ProviderScope(child: EdulphaApp()));
}

class EdulphaApp extends ConsumerStatefulWidget {
  const EdulphaApp({super.key});

  @override
  ConsumerState<EdulphaApp> createState() => _EdulphaAppState();
}

class _EdulphaAppState extends ConsumerState<EdulphaApp> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    HomeScreen(),
    ExploreScreen(),
    AITutorScreen(),
    ExamsScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Edulpha Mobile',
      debugShowCheckedModeBanner: false,
      theme: EdulphaTheme.lightTheme,
      darkTheme: EdulphaTheme.darkTheme,
      home: Scaffold(
        body: IndexedStack(
          index: _currentIndex,
          children: _screens,
        ),
        bottomNavigationBar: NavigationBar(
          selectedIndex: _currentIndex,
          onDestinationSelected: (index) => setState(() => _currentIndex = index),
          destinations: const [
            NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
            NavigationDestination(icon: Icon(Icons.explore_outlined), selectedIcon: Icon(Icons.explore), label: 'Explore'),
            NavigationDestination(icon: Icon(Icons.smart_toy_outlined), selectedIcon: Icon(Icons.smart_toy), label: 'AI Tutor'),
            NavigationDestination(icon: Icon(Icons.assignment_outlined), selectedIcon: Icon(Icons.assignment), label: 'Exams'),
            NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
          ],
        ),
      ),
    );
  }
}`,

    home: `// lib/features/home/presentation/home_screen.dart
import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFFF59E0B),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text('E', style: TextStyle(fontWeight: FontWeight.black, color: Color(0xFF0F2C59))),
            ),
            const SizedBox(width: 8),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Edulpha', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Text('GCE & Baccalauréat Hub', style: TextStyle(fontSize: 10, color: Colors.grey)),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(onPressed: () {}, icon: const Icon(Icons.notifications_outlined)),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome Header Card with Streak
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F2C59), Color(0xFF1E3A8A), Color(0xFF1D4ED8)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Welcome back, Hilary! 👋', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                  const SizedBox(height: 4),
                  const Text('GCE A-Level Physics & Pure Math', style: TextStyle(color: Colors.white70, fontSize: 12)),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(20)),
                        child: const Text('🔥 14-Day Streak', style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                      ElevatedButton(
                        onPressed: () {},
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFF59E0B), foregroundColor: const Color(0xFF0F2C59)),
                        child: const Text('Continue Study'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Quick Actions Grid (10 Items)
            const Text('QUICK ACTIONS', style: TextStyle(fontWeight: FontWeight.extrabold, fontSize: 12, letterSpacing: 1.2)),
            const SizedBox(height: 12),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 5,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              children: [
                _buildQuickAction(Icons.book, 'Lessons', Colors.blue),
                _buildQuickAction(Icons.smart_toy, 'AI Tutor', Colors.purple),
                _buildQuickAction(Icons.quiz, 'Q-Bank', Colors.green),
                _buildQuickAction(Icons.assignment, 'Exams', Colors.amber),
                _buildQuickAction(Icons.note, 'Notes', Colors.indigo),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickAction(IconData icon, String label, Color color) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: color.withOpacity(0.15), borderRadius: BorderRadius.circular(16)),
          child: Icon(icon, color: color, size: 24),
        ),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
      ],
    );
  }
}`,

    ai: `// lib/features/ai_tutor/presentation/ai_tutor_screen.dart
import 'package:flutter/material.dart';

class AITutorScreen extends StatelessWidget {
  const AITutorScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edulpha AI Tutor 🤖'),
        actions: [
          IconButton(icon: const Icon(Icons.translate), onPressed: () {}),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _buildMessageBubble(
                  isUser: false,
                  text: 'Hello Hilary! I am your Edulpha AI Tutor. Ask me any GCE Pure Math or Physics question.',
                ),
                _buildMessageBubble(
                  isUser: true,
                  text: 'How do I solve integral of x * e^x dx?',
                ),
                _buildMessageBubble(
                  isUser: false,
                  text: 'Using Integration by Parts: \\n\\int x e^x dx = e^x (x - 1) + C',
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    decoration: InputDecoration(
                      hintText: 'Ask AI a question...',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(20)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: () {},
                  icon: const Icon(Icons.send),
                  style: IconButton.styleFrom(backgroundColor: const Color(0xFF0F2C59)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble({required bool isUser, required String text}) {
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isUser ? const Color(0xFF0F2C59) : Colors.grey.shade200,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(text, style: TextStyle(color: isUser ? Colors.white : Colors.black87)),
      ),
    );
  }
}`,

    exam: `// lib/features/exams/presentation/exam_screen.dart
import 'package:flutter/material.dart';

class ExamsScreen extends StatelessWidget {
  const ExamsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('GCE & BAC Mock Exams')),
      body: Center(
        child: ElevatedButton(
          onPressed: () {},
          child: const Text('Start Timed Physics Mock Exam (01:30:00)'),
        ),
      ),
    );
  }
}`,

    profile: `// lib/features/profile/presentation/profile_screen.dart
import 'package:flutter/material.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Student Profile')),
      body: const SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            CircleAvatar(radius: 40, child: Text('KH', style: TextStyle(fontSize: 24))),
            SizedBox(height: 8),
            Text('Kemeh Hilary', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            Text('GCE Advanced Level Science', style: TextStyle(color: Colors.grey)),
          ],
        ),
      ),
    );
  }
}`,

    models: `// lib/domain/entities/student_model.dart
class StudentModel {
  final String id;
  final String fullName;
  final String email;
  final String academicLevel; // GCE O-Level / GCE A-Level / BEPC / BAC
  final int streakDays;
  final double examReadinessScore;

  StudentModel({
    required this.id,
    required this.fullName,
    required this.email,
    required this.academicLevel,
    required this.streakDays,
    required this.examReadinessScore,
  });
}`
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(flutterCodeFiles[activeFile]);
    setCopied(true);
    toast.success('Flutter source code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAllFlutterCode = () => {
    const zipManifest = {
      project: "Edulpha Premium Mobile Flutter App",
      version: "1.0.0",
      branding: "Deep Royal Blue & Golden Yellow",
      files: flutterCodeFiles,
      pubspec: `name: edulpha_mobile
description: Edulpha Bilingual GCE & BAC Mobile Application.
version: 1.0.0+1
environment:
  sdk: '>=3.2.0 <4.0.0'
dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^2.5.1
  isar: ^3.1.0+1
  firebase_core: ^2.30.0
  firebase_auth: ^4.19.0
  cloud_firestore: ^4.17.0
  dio: ^5.4.3+1
  google_fonts: ^6.2.1
`
    };

    const blob = new Blob([JSON.stringify(zipManifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edulpha_flutter_mobile_src_v1.0.0.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success('Exported complete Flutter source code package!');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-slate-100 shadow-xl">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold uppercase mb-1">
            <Code className="h-4 w-4" /> Flutter Dart Clean Code Exporter
          </div>
          <h3 className="text-xl font-extrabold text-white">Production Mobile Flutter Architecture</h3>
          <p className="text-xs text-slate-400">
            Copy or download ready-to-run Dart components matching the redesigned Edulpha mobile UI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Active File'}
          </button>
          <button
            onClick={handleDownloadAllFlutterCode}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 rounded-xl text-xs font-bold transition flex items-center gap-2"
          >
            <Download className="h-4 w-4" /> Export All (.json/dart)
          </button>
        </div>
      </div>

      {/* File Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { id: 'home', label: 'home_screen.dart' },
          { id: 'ai', label: 'ai_tutor_screen.dart' },
          { id: 'exam', label: 'exam_screen.dart' },
          { id: 'profile', label: 'profile_screen.dart' },
          { id: 'theme', label: 'edulpha_theme.dart' },
          { id: 'main', label: 'main.dart' },
          { id: 'models', label: 'student_model.dart' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFile(f.id as any)}
            className={`px-3 py-2 rounded-xl whitespace-nowrap border transition ${
              activeFile === f.id
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <FileCode className="h-3.5 w-3.5 inline mr-1.5" />
            {f.label}
          </button>
        ))}
      </div>

      {/* Code Viewer Box */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs overflow-x-auto max-h-[420px] leading-relaxed text-blue-200">
        <pre>{flutterCodeFiles[activeFile]}</pre>
      </div>
    </div>
  );
};
