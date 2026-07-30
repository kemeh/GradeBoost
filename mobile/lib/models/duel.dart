import 'package:cloud_firestore/cloud_firestore.dart';

class Duel {
  final String id;
  final String player1Id;
  final String? player2Id;
  final List<String> questions;
  final int player1Score;
  final int player2Score;
  final int player1Time;
  final int player2Time;
  final String? winnerId;
  final String status; // 'waiting', 'active', 'completed'

  Duel({
    required this.id,
    required this.player1Id,
    this.player2Id,
    required this.questions,
    required this.player1Score,
    required this.player2Score,
    required this.player1Time,
    required this.player2Time,
    this.winnerId,
    required this.status,
  });

  factory Duel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    return Duel(
      id: doc.id,
      player1Id: data['player1Id'] ?? '',
      player2Id: data['player2Id'],
      questions: List<String>.from(data['questions'] ?? []),
      player1Score: (data['player1Score'] as num?)?.toInt() ?? 0,
      player2Score: (data['player2Score'] as num?)?.toInt() ?? 0,
      player1Time: (data['player1Time'] as num?)?.toInt() ?? 0,
      player2Time: (data['player2Time'] as num?)?.toInt() ?? 0,
      winnerId: data['winnerId'],
      status: data['status'] ?? 'waiting',
    );
  }
}

class LeaderboardEntry {
  final String userId;
  final String name;
  final String? photoURL;
  final int points;
  final int wins;
  final int losses;
  final int draws;
  final int rank;

  LeaderboardEntry({
    required this.userId,
    required this.name,
    this.photoURL,
    required this.points,
    required this.wins,
    required this.losses,
    required this.draws,
    required this.rank,
  });

  factory LeaderboardEntry.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    return LeaderboardEntry(
      userId: doc.id,
      name: data['name'] ?? 'Anonymous Student',
      photoURL: data['photoURL'],
      points: (data['points'] as num?)?.toInt() ?? 0,
      wins: (data['wins'] as num?)?.toInt() ?? 0,
      losses: (data['losses'] as num?)?.toInt() ?? 0,
      draws: (data['draws'] as num?)?.toInt() ?? 0,
      rank: (data['rank'] as num?)?.toInt() ?? 999,
    );
  }
}
