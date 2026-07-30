# GradeBoost60 Flutter Mobile Application Ecosystem

The **GradeBoost60 Mobile App** extends the GradeBoost60 Cameroon GCE Board Exam Preparation Platform to Android and iOS mobile devices. Built with Flutter and powered by the exact same Firebase backend ecosystem as the web platform, students can practice on-the-go with native mobile responsiveness, daily drill notifications, offline caching, and instant Mobile Money (MTN MoMo & Orange Money) payment verification.

---

## 📱 Mobile Features & Architecture

### 1. Unified Firebase Infrastructure
- **Shared Firestore Database**: Real-time sync between Web (`react`) and Mobile (`flutter`) using the `ai-studio-8cbb773b-9589-470c-a864-1eb415b2302d` Firestore database.
- **Shared Authentication**: Firebase Authentication accounts created on Web work seamlessly on Mobile and vice versa.
- **Shared Security Rules**: Strictly protected by `firestore.rules` for zero-trust data access across both platforms.

### 2. Core Mobile Modules
- ⚡ **Daily Drill Challenge**: Interactive 60-day challenge questions with instant scoring, timer, and detailed step-by-step explanations.
- 📚 **GCE Past Papers Practice**: Paper 1 (MCQ), Paper 2 (Theory/Structured), and Paper 3 (Practical/Problem Solving) categorized by subject and year.
- 🏆 **National Leaderboard**: Real-time student XP rankings across Cameroon GCE schools and regions.
- 💳 **Mobile Money Gateway**: MTN MoMo and Orange Money Cameroon receipt submission and subscription verification.
- 👤 **Student Profile**: Custom target grade configuration (Grade A-F), subject picker (Computer Science & ICT), and streak tracker.

---

## 🛠 Project Structure

```
mobile/
├── pubspec.yaml                 # Flutter package dependencies
├── lib/
│   ├── main.dart                # App entrypoint, auth routing & bottom nav bar
│   ├── models/
│   │   ├── user_profile.dart    # Student profile entity mapping
│   │   ├── exam_question.dart   # Question entity (MCQ & subparts)
│   │   ├── daily_drill.dart     # Daily drill mapping & submissions
│   │   └── duel.dart            # Duel & leaderboard entities
│   ├── services/
│   │   ├── auth_service.dart    # Firebase Auth state manager
│   │   └── firestore_service.dart # Realtime Firestore data queries
│   └── screens/
│       ├── splash_screen.dart   # Onboarding / splash view
│       ├── auth_screen.dart     # Student sign in & registration
│       ├── dashboard_screen.dart# Main stats, streak & module launcher
│       ├── daily_drill_screen.dart # Interactive drill solver
│       ├── practice_screen.dart # Past papers browser
│       ├── leaderboard_screen.dart # National rank list
│       ├── payment_screen.dart  # Mobile Money payment proof form
│       └── profile_screen.dart  # Account preferences
└── README.md
```

---

## 🚀 How to Run the Flutter Mobile App

### Prerequisites
1. **Flutter SDK** (v3.0.0 or higher) installed on your development machine.
2. **Android Studio** / **Xcode** for Android/iOS device emulation.

### Execution Steps
```bash
# Navigate to the mobile app directory
cd mobile

# Fetch Flutter dependencies
flutter pub get

# Run on connected Android or iOS emulator / physical device
flutter run
```

### Build Production Packages
```bash
# Build Android APK
flutter build apk --release

# Build Android App Bundle
flutter build appbundle --release

# Build iOS App Store Package
flutter build ipa --release
```

---

## 🤝 Cross-Platform Synchronization
Changes made by administrators on the GradeBoost60 Web Admin panel (such as adding new questions, setting up daily drills, updating Mobile Money pricing, or approving payments) instantly reflect across all student mobile devices in real-time.
