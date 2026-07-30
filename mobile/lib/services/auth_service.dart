import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/user_profile.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  User? get currentUser => _auth.currentUser;

  Stream<User?> get authStateChanges => _auth.authStateChanges();

  Stream<UserProfile?> get currentUserProfileStream {
    return _auth.authStateChanges().asyncMap((user) async {
      if (user == null) return null;
      final doc = await _db.collection('users').doc(user.uid).get();
      if (!doc.exists) return null;
      return UserProfile.fromFirestore(doc);
    });
  }

  Future<UserProfile?> signInWithEmail(String email, String password) async {
    final cred = await _auth.signInWithEmailAndPassword(
      email: email,
      password: password,
    );
    if (cred.user != null) {
      final doc = await _db.collection('users').doc(cred.user!.uid).get();
      if (doc.exists) {
        return UserProfile.fromFirestore(doc);
      }
    }
    return null;
  }

  Future<UserProfile> registerUser({
    required String name,
    required String email,
    required String password,
    required String subject,
    required String school,
    required String region,
  }) async {
    final cred = await _auth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );
    final uid = cred.user!.uid;

    final profileData = {
      'name': name,
      'email': email,
      'subject': subject,
      'school': school,
      'region': region,
      'targetGrade': 'A',
      'role': 'student',
      'paymentStatus': 'unpaid',
      'points': 0,
      'streak': 1,
      'badges': ['welcome_badge'],
      'hasTakenDiagnostic': false,
      'createdAt': FieldValue.serverTimestamp(),
    };

    await _db.collection('users').doc(uid).set(profileData);
    final doc = await _db.collection('users').doc(uid).get();
    return UserProfile.fromFirestore(doc);
  }

  Future<void> signOut() async {
    await _auth.signOut();
  }
}
