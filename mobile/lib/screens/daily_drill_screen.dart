import 'package:flutter/material.dart';
import '../models/user_profile.dart';
import '../models/exam_question.dart';
import '../models/daily_drill.dart';
import '../services/firestore_service.dart';

class DailyDrillScreen extends StatefulWidget {
  final UserProfile user;
  final FirestoreService firestoreService;

  const DailyDrillScreen({
    Key? key,
    required this.user,
    required this.firestoreService,
  }) : super(key: key);

  @override
  State<DailyDrillScreen> createState() => _DailyDrillScreenState();
}

class _DailyDrillScreenState extends State<DailyDrillScreen> {
  bool isLoading = true;
  DailyDrill? currentDrill;
  List<ExamQuestion> questions = [];
  int currentIndex = 0;
  String? selectedOption;
  bool isSubmitted = false;
  int score = 0;

  @override
  void initState() {
    super.initState();
    _loadDrill();
  }

  Future<void> _loadDrill() async {
    setState(() => isLoading = true);
    try {
      final drill = await widget.firestoreService.getDailyDrillForDay(1, widget.user.subject);
      if (drill != null && drill.questionIds.isNotEmpty) {
        final qList = await widget.firestoreService.getQuestionsByIds(drill.questionIds);
        setState(() {
          currentDrill = drill;
          questions = qList;
        });
      }
    } catch (e) {
      debugPrint("Error loading drill: $e");
    } finally {
      setState(() => isLoading = false);
    }
  }

  void _handleOptionSelect(String optionKey) {
    if (isSubmitted) return;
    setState(() {
      selectedOption = optionKey;
    });
  }

  void _submitAnswer() {
    if (selectedOption == null || currentDrill == null) return;
    final q = questions[currentIndex];
    final bool isCorrect = selectedOption == q.correctAnswer;

    if (isCorrect) score++;

    widget.firestoreService.submitDrillAnswer(
      userId: widget.user.uid,
      questionId: q.id,
      day: currentDrill!.day,
      selectedAnswer: selectedOption!,
      correctAnswer: q.correctAnswer,
      score: isCorrect ? 1.0 : 0.0,
      paper: q.paper,
      topic: q.topic,
    );

    setState(() {
      isSubmitted = true;
    });
  }

  void _nextQuestion() {
    if (currentIndex < questions.length - 1) {
      setState(() {
        currentIndex++;
        selectedOption = null;
        isSubmitted = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFF0F172A),
        body: Center(child: CircularProgressIndicator(color: Color(0xFF6366F1))),
      );
    }

    if (questions.isEmpty) {
      return Scaffold(
        backgroundColor: const Color(0xFF0F172A),
        appBar: AppBar(
          title: const Text("Daily Drill"),
          backgroundColor: const Color(0xFF0F172A),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.assignment_turned_in_rounded, size: 64, color: Color(0xFF6366F1)),
                const SizedBox(height: 16),
                const Text(
                  "No Drill Available",
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const SizedBox(height: 8),
                Text(
                  "There are currently no active daily drills configured for ${widget.user.subject}.",
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Color(0xFF94A3B8)),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final q = questions[currentIndex];

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: Text(
          "Question ${currentIndex + 1} of ${questions.length}",
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
        ),
        actions: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            margin: const EdgeInsets.only(right: 16),
            decoration: BoxDecoration(
              color: const Color(0xFF4F46E5).withOpacity(0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              q.paper,
              style: const TextStyle(color: Color(0xFF818CF8), fontWeight: FontWeight.bold, fontSize: 12),
            ),
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Question topic badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF334155),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                q.topic.toUpperCase(),
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 16),
            // Question text
            Text(
              q.questionText,
              style: const TextStyle(color: Colors.white, fontSize: 16, height: 1.4, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 24),

            // Options list
            ...q.options.entries.map((entry) {
              final String optKey = entry.key;
              final String optVal = entry.value;

              Color borderColor = const Color(0xFF334155);
              Color bgColor = const Color(0xFF1E293B);
              Color textColor = Colors.white;

              if (selectedOption == optKey) {
                borderColor = const Color(0xFF6366F1);
                bgColor = const Color(0xFF4F46E5).withOpacity(0.15);
              }

              if (isSubmitted) {
                if (optKey == q.correctAnswer) {
                  borderColor = const Color(0xFF10B981);
                  bgColor = const Color(0xFF10B981).withOpacity(0.15);
                  textColor = const Color(0xFF34D399);
                } else if (selectedOption == optKey && selectedOption != q.correctAnswer) {
                  borderColor = const Color(0xFFEF4444);
                  bgColor = const Color(0xFFEF4444).withOpacity(0.15);
                  textColor = const Color(0xFFF87171);
                }
              }

              return Padding(
                padding: const EdgeInsets.only(bottom: 12.0),
                child: InkWell(
                  onTap: () => _handleOptionSelect(optKey),
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: bgColor,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: borderColor, width: 1.5),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: borderColor.withOpacity(0.2),
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: Text(
                              optKey,
                              style: TextStyle(color: textColor, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Text(
                            optVal,
                            style: TextStyle(color: textColor, fontSize: 14),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),

            const SizedBox(height: 20),

            // Submit / Next Button
            if (!isSubmitted)
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: selectedOption == null ? null : _submitAnswer,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4F46E5),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text("SUBMIT ANSWER", style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              )
            else ...[
              // Explanation box
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "EXPLANATION",
                      style: TextStyle(color: Color(0xFF818CF8), fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      q.explanation.isNotEmpty ? q.explanation : "Correct answer is option ${q.correctAnswer}.",
                      style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 13, height: 1.4),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              if (currentIndex < questions.length - 1)
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _nextQuestion,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text("NEXT QUESTION", style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                )
              else
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFF10B981)),
                  ),
                  child: Center(
                    child: Text(
                      "Drill Complete! Score: $score / ${questions.length}",
                      style: const TextStyle(color: Color(0xFF34D399), fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                  ),
                )
            ]
          ],
        ),
      ),
    );
  }
}
