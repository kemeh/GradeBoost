import 'package:cloud_firestore/cloud_firestore.dart';

class UserProfile {
  final String uid;
  final String name;
  final String email;
  final String subject;
  final String school;
  final String region;
  final String targetGrade;
  final String role;
  final String paymentStatus;
  final int points;
  final int streak;
  final List<String> badges;
  final bool hasTakenDiagnostic;

  UserProfile({
    required this.uid,
    required this.name,
    required this.email,
    required this.subject,
    required this.school,
    required this.region,
    required this.targetGrade,
    required this.role,
    required this.paymentStatus,
    required this.points,
    required this.streak,
    required this.badges,
    required this.hasTakenDiagnostic,
  });

  factory UserProfile.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    return UserProfile(
      uid: doc.id,
      name: data['name'] ?? '',
      email: data['email'] ?? '',
      subject: data['subject'] ?? 'Computer Science',
      school: data['school'] ?? '',
      region: data['region'] ?? '',
      targetGrade: data['targetGrade'] ?? 'A',
      role: data['role'] ?? 'student',
      paymentStatus: data['paymentStatus'] ?? 'unpaid',
      points: (data['points'] as num?)?.toInt() ?? 0,
      streak: (data['streak'] as num?)?.toInt() ?? 0,
      badges: List<String>.from(data['badges'] ?? []),
      hasTakenDiagnostic: data['hasTakenDiagnostic'] ?? false,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'email': email,
      'subject': subject,
      'school': school,
      'region': region,
      'targetGrade': targetGrade,
      'role': role,
      'paymentStatus': paymentStatus,
      'points': points,
      'streak': streak,
      'badges': badges,
      'hasTakenDiagnostic': hasTakenDiagnostic,
    };
  }
}
