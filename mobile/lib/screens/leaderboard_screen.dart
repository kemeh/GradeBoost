import 'package:flutter/material.dart';
import '../models/user_profile.dart';
import '../models/leaderboard_entry.dart';
import '../services/firestore_service.dart';

class LeaderboardScreen extends StatefulWidget {
  final UserProfile user;
  final FirestoreService firestoreService;

  const LeaderboardScreen({
    Key? key,
    required this.user,
    required this.firestoreService,
  }) : super(key: key);

  @override
  State<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen> {
  bool isLoading = true;
  List<LeaderboardEntry> leaderboard = [];

  @override
  void initState() {
    super.initState();
    _loadLeaderboard();
  }

  Future<void> _loadLeaderboard() async {
    setState(() => isLoading = true);
    try {
      final list = await widget.firestoreService.getNationalLeaderboard();
      setState(() {
        leaderboard = list;
      });
    } catch (e) {
      debugPrint("Leaderboard load error: $e");
    } finally {
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: const Text(
          "National Leaderboard",
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF6366F1)))
          : leaderboard.isEmpty
              ? const Center(
                  child: Text("No leaderboard data available.", style: TextStyle(color: Color(0xFF94A3B8))),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(20),
                  itemCount: leaderboard.length,
                  itemBuilder: (context, index) {
                    final entry = leaderboard[index];
                    final bool isMe = entry.userId == widget.user.uid;

                    Color rankColor = const Color(0xFF94A3B8);
                    if (entry.rank == 1) rankColor = const Color(0xFFF59E0B); // Gold
                    if (entry.rank == 2) rankColor = const Color(0xFF94A3B8); // Silver
                    if (entry.rank == 3) rankColor = const Color(0xFFD97706); // Bronze

                    return Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: isMe ? const Color(0xFF4F46E5).withOpacity(0.2) : const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isMe ? const Color(0xFF6366F1) : const Color(0xFF334155),
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              color: rankColor.withOpacity(0.15),
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: Text(
                                "#${entry.rank}",
                                style: TextStyle(color: rankColor, fontWeight: FontWeight.bold, fontSize: 13),
                              ),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Text(
                              entry.name,
                              style: TextStyle(
                                color: isMe ? const Color(0xFF818CF8) : Colors.white,
                                fontWeight: isMe ? FontWeight.bold : FontWeight.w500,
                                fontSize: 14,
                              ),
                            ),
                          ),
                          Text(
                            "${entry.points} XP",
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                        ],
                      ),
                    );
                  },
                ),
    );
  }
}
