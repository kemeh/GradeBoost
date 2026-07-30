import 'package:flutter/material.dart';
import '../models/user_profile.dart';
import '../models/exam_question.dart';
import '../services/firestore_service.dart';

class PracticeScreen extends StatefulWidget {
  final UserProfile user;
  final FirestoreService firestoreService;

  const PracticeScreen({
    Key? key,
    required this.user,
    required this.firestoreService,
  }) : super(key: key);

  @override
  State<PracticeScreen> createState() => _PracticeScreenState();
}

class _PracticeScreenState extends State<PracticeScreen> {
  String selectedPaper = 'Paper 1';
  bool isLoading = false;
  List<ExamQuestion> questions = [];
  List<String> paperTypes = ['Paper 1', 'Paper 2', 'Paper 3'];

  @override
  void initState() {
    super.initState();
    _loadPaperTypesAndQuestions();
  }

  Future<void> _loadPaperTypesAndQuestions() async {
    setState(() => isLoading = true);
    try {
      final fetchedTypes = await widget.firestoreService.getPapersForSubject(widget.user.subject);
      if (fetchedTypes.isNotEmpty) {
        setState(() {
          paperTypes = fetchedTypes;
          selectedPaper = fetchedTypes.first;
        });
      }
      await _fetchQuestions();
    } catch (e) {
      debugPrint("Error loading papers: $e");
    } finally {
      setState(() => isLoading = false);
    }
  }

  Future<void> _fetchQuestions() async {
    setState(() => isLoading = true);
    try {
      final qList = await widget.firestoreService.getPracticeQuestions(
        subject: widget.user.subject,
        paper: selectedPaper,
        limit: 20,
      );
      setState(() {
        questions = qList;
      });
    } catch (e) {
      debugPrint("Error fetching practice questions: $e");
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
          "Past Papers Practice",
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
      body: Column(
        children: [
          // Paper selector tabs
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
            child: Row(
              children: paperTypes.map((paper) {
                final bool isSelected = selectedPaper == paper;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4.0),
                    child: InkWell(
                      onTap: () {
                        setState(() {
                          selectedPaper = paper;
                        });
                        _fetchQuestions();
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFF4F46E5) : const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isSelected ? const Color(0xFF6366F1) : const Color(0xFF334155),
                          ),
                        ),
                        child: Center(
                          child: Text(
                            paper,
                            style: TextStyle(
                              color: isSelected ? Colors.white : const Color(0xFF94A3B8),
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          // Question list or empty state
          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF6366F1)))
                : questions.isEmpty
                    ? Center(
                        child: Text(
                          "No questions available for $selectedPaper.",
                          style: const TextStyle(color: Color(0xFF94A3B8)),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(20),
                        itemCount: questions.length,
                        itemBuilder: (context, index) {
                          final q = questions[index];
                          return Container(
                            margin: const EdgeInsets.only(bottom: 14),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E293B),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: const Color(0xFF334155)),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF334155),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        "Q${index + 1} • ${q.topic}",
                                        style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                    Text(
                                      "${q.marks} Mark${q.marks > 1 ? 's' : ''}",
                                      style: const TextStyle(color: Color(0xFF818CF8), fontSize: 12, fontWeight: FontWeight.bold),
                                    )
                                  ],
                                ),
                                const SizedBox(height: 10),
                                Text(
                                  q.questionText,
                                  style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w500),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
