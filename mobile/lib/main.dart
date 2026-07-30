import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'models/user_profile.dart';
import 'services/auth_service.dart';
import 'services/firestore_service.dart';
import 'screens/splash_screen.dart';
import 'screens/auth_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/daily_drill_screen.dart';
import 'screens/practice_screen.dart';
import 'screens/leaderboard_screen.dart';
import 'screens/payment_screen.dart';
import 'screens/profile_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint("Firebase init note: $e");
  }
  runApp(const GradeBoostApp());
}

class GradeBoostApp extends StatelessWidget {
  const GradeBoostApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GradeBoost60 GCE Exam Prep',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        primaryColor: const Color(0xFF4F46E5),
        fontFamily: 'Roboto',
      ),
      home: const MainWrapper(),
    );
  }
}

class MainWrapper extends StatefulWidget {
  const MainWrapper({Key? key}) : super(key: key);

  @override
  State<MainWrapper> createState() => _MainWrapperState();
}

class _MainWrapperState extends State<MainWrapper> {
  final AuthService _authService = AuthService();
  final FirestoreService _firestoreService = FirestoreService();
  bool showSplash = true;
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    if (showSplash) {
      return SplashScreen(
        onContinue: () {
          setState(() {
            showSplash = false;
          });
        },
      );
    }

    return StreamBuilder<User?>(
      stream: _authService.authStateChanges,
      builder: (context, authSnapshot) {
        if (authSnapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            backgroundColor: Color(0xFF0F172A),
            body: Center(child: CircularProgressIndicator(color: Color(0xFF6366F1))),
          );
        }

        final user = authSnapshot.data;
        if (user == null) {
          return AuthScreen(authService: _authService);
        }

        return StreamBuilder<UserProfile?>(
          stream: _authService.currentUserProfileStream,
          builder: (context, profileSnapshot) {
            if (profileSnapshot.connectionState == ConnectionState.waiting) {
              return const Scaffold(
                backgroundColor: Color(0xFF0F172A),
                body: Center(child: CircularProgressIndicator(color: Color(0xFF6366F1))),
              );
            }

            final profile = profileSnapshot.data ??
                UserProfile(
                  uid: user.uid,
                  name: user.displayName ?? "Student",
                  email: user.email ?? "",
                  subject: "Computer Science",
                  school: "",
                  region: "",
                  targetGrade: "A",
                  role: "student",
                  paymentStatus: "unpaid",
                  points: 0,
                  streak: 1,
                  badges: [],
                  hasTakenDiagnostic: false,
                );

            final pages = [
              DashboardScreen(
                user: profile,
                authService: _authService,
                onNavigate: (index) {
                  setState(() => _currentIndex = index);
                },
              ),
              DailyDrillScreen(user: profile, firestoreService: _firestoreService),
              PracticeScreen(user: profile, firestoreService: _firestoreService),
              LeaderboardScreen(user: profile, firestoreService: _firestoreService),
              PaymentScreen(user: profile, firestoreService: _firestoreService),
              ProfileScreen(user: profile, authService: _authService),
            ];

            return Scaffold(
              body: pages[_currentIndex],
              bottomNavigationBar: BottomNavigationBar(
                currentIndex: _currentIndex,
                onTap: (index) => setState(() => _currentIndex = index),
                backgroundColor: const Color(0xFF1E293B),
                selectedItemColor: const Color(0xFF818CF8),
                unselectedItemColor: const Color(0xFF64748B),
                type: BottomNavigationBarType.fixed,
                items: const [
                  BottomNavigationBarItem(icon: Icon(Icons.dashboard_rounded), label: "Dashboard"),
                  BottomNavigationBarItem(icon: Icon(Icons.flash_on_rounded), label: "Daily Drill"),
                  BottomNavigationBarItem(icon: Icon(Icons.menu_book_rounded), label: "Practice"),
                  BottomNavigationBarItem(icon: Icon(Icons.leaderboard_rounded), label: "Leaderboard"),
                  BottomNavigationBarItem(icon: Icon(Icons.payment_rounded), label: "Payment"),
                  BottomNavigationBarItem(icon: Icon(Icons.person_rounded), label: "Profile"),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
