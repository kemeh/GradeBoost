import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/exam_question.dart';
import '../models/daily_drill.dart';
import '../models/leaderboard_entry.dart';
import '../models/duel.dart';

class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // Fetch active daily drill for subject
  Future<DailyDrill?> getDailyDrillForDay(int day, String subject) async {
    final query = await _db
        .collection('daily_drills')
        .where('day', isEqualTo: day)
        .where('subject', isEqualTo: subject)
        .limit(1)
        .get();

    if (query.docs.isEmpty) return null;
    return DailyDrill.fromFirestore(query.docs.first);
  }

  // Fetch exam questions by IDs
  Future<List<ExamQuestion>> getQuestionsByIds(List<String> ids) async {
    if (ids.isEmpty) return [];
    List<ExamQuestion> questions = [];
    for (String id in ids) {
      final doc = await _db.collection('exam_questions').doc(id).get();
      if (doc.exists) {
        questions.add(ExamQuestion.fromFirestore(doc));
      }
    }
    return questions;
  }

  // Fetch dynamic paper structure for a subject
  Future<List<String>> getPapersForSubject(String subjectName) async {
    try {
      final query = await _db
          .collection('subjects')
          .where('name', isEqualTo: subjectName)
          .limit(1)
          .get();

      if (query.docs.isNotEmpty) {
        final data = query.docs.first.data();
        if (data.containsKey('papers') && data['papers'] is List) {
          final papersList = (data['papers'] as List);
          if (papersList.isNotEmpty) {
            return papersList.map((p) {
              if (p is Map && p.containsKey('name')) {
                return p['name'].toString();
              }
              return p.toString();
            }).toList();
          }
        }
      }
    } catch (e) {
      print('Error fetching paper structure: $e');
    }
    return ['Paper 1', 'Paper 2', 'Paper 3'];
  }

  // Fetch practice questions by paper & subject
  Future<List<ExamQuestion>> getPracticeQuestions({
    required String subject,
    required String paper,
    int limit = 20,
  }) async {
    final query = await _db
        .collection('exam_questions')
        .where('subject', isEqualTo: subject)
        .where('paper', isEqualTo: paper)
        .limit(limit)
        .get();

    return query.docs.map((doc) => ExamQuestion.fromFirestore(doc)).toList();
  }

  // Submit drill answer
  Future<void> submitDrillAnswer({
    required String userId,
    required String questionId,
    required int day,
    required String selectedAnswer,
    required String correctAnswer,
    required double score,
    required String paper,
    required String topic,
  }) async {
    final submission = {
      'userId': userId,
      'questionId': questionId,
      'day': day,
      'selectedAnswer': selectedAnswer,
      'correctAnswer': correctAnswer,
      'score': score,
      'paper': paper,
      'topic': topic,
      'createdAt': FieldValue.serverTimestamp(),
    };

    await _db.collection('drill_submissions').add(submission);

    // Update user score & streak
    await _db.collection('users').doc(userId).update({
      'points': FieldValue.increment((score * 10).toInt()),
    });
  }

  // Fetch National Leaderboard
  Future<List<LeaderboardEntry>> getNationalLeaderboard() async {
    final query = await _db
        .collection('users')
        .orderBy('points', descending: true)
        .limit(50)
        .get();

    int rank = 1;
    return query.docs.map((doc) {
      final entry = LeaderboardEntry.fromFirestore(doc);
      return LeaderboardEntry(
        userId: entry.userId,
        name: entry.name,
        photoURL: entry.photoURL,
        points: entry.points,
        wins: entry.wins,
        losses: entry.losses,
        draws: entry.draws,
        rank: rank++,
      );
    }).toList();
  }

  // Submit Mobile Money payment submission
  Future<void> submitPaymentRequest({
    required String userId,
    required int amount,
    required String transactionId,
    required String network, // 'MTN' or 'Orange'
    required String paymentCode,
  }) async {
    final paymentDoc = {
      'userId': userId,
      'amount': amount,
      'paymentCode': paymentCode,
      'transactionId': transactionId,
      'network': network,
      'status': 'pending',
      'createdAt': FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
    };

    await _db.collection('payments').add(paymentDoc);
    await _db.collection('users').doc(userId).update({
      'paymentStatus': 'pending',
    });
  }
}
