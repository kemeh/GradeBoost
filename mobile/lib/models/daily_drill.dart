import 'package:cloud_firestore/cloud_firestore.dart';

class DailyDrill {
  final String id;
  final int day; // 1-60
  final List<String> questionIds;
  final String subject;
  final String? paper;
  final String topic;
  final bool isFree;

  DailyDrill({
    required this.id,
    required this.day,
    required this.questionIds,
    required this.subject,
    this.paper,
    required this.topic,
    required this.isFree,
  });

  factory DailyDrill.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    return DailyDrill(
      id: doc.id,
      day: (data['day'] as num?)?.toInt() ?? 1,
      questionIds: List<String>.from(data['questionIds'] ?? []),
      subject: data['subject'] ?? 'Computer Science',
      paper: data['paper'],
      topic: data['topic'] ?? 'General',
      isFree: data['isFree'] ?? false,
    );
  }
}

class DrillSubmission {
  final String id;
  final String userId;
  final String questionId;
  final int day;
  final String selectedAnswer;
  final String correctAnswer;
  final double score;
  final String paper;
  final String topic;
  final DateTime createdAt;

  DrillSubmission({
    required this.id,
    required this.userId,
    required this.questionId,
    required this.day,
    required this.selectedAnswer,
    required this.correctAnswer,
    required this.score,
    required this.paper,
    required this.topic,
    required this.createdAt,
  });

  factory DrillSubmission.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    return DrillSubmission(
      id: doc.id,
      userId: data['userId'] ?? '',
      questionId: data['questionId'] ?? '',
      day: (data['day'] as num?)?.toInt() ?? 1,
      selectedAnswer: data['selectedAnswer'] ?? '',
      correctAnswer: data['correctAnswer'] ?? '',
      score: (data['score'] as num?)?.toDouble() ?? 0.0,
      paper: data['paper'] ?? 'Paper 1',
      topic: data['topic'] ?? 'General',
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'userId': userId,
      'questionId': questionId,
      'day': day,
      'selectedAnswer': selectedAnswer,
      'correctAnswer': correctAnswer,
      'score': score,
      'paper': paper,
      'topic': topic,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }
}
