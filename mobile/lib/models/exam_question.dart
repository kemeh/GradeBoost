import 'package:cloud_firestore/cloud_firestore.dart';

class SubPart {
  final String label;
  final String text;
  final int marks;

  SubPart({required this.label, required this.text, required this.marks});

  factory SubPart.fromMap(Map<String, dynamic> map) {
    return SubPart(
      label: map['label'] ?? '',
      text: map['text'] ?? '',
      marks: (map['marks'] as num?)?.toInt() ?? 1,
    );
  }

  Map<String, dynamic> toMap() => {
        'label': label,
        'text': text,
        'marks': marks,
      };
}

class ExamQuestion {
  final String id;
  final String questionText;
  final Map<String, String> options;
  final String correctAnswer;
  final String explanation;
  final String subject;
  final String paper; // 'Paper 1', 'Paper 2', 'Paper 3'
  final String? section;
  final String topic;
  final int marks;
  final String difficulty;
  final int year;
  final bool isDailyDrill;
  final String? imageUrl;
  final List<SubPart>? subParts;

  ExamQuestion({
    required this.id,
    required this.questionText,
    required this.options,
    required this.correctAnswer,
    required this.explanation,
    required this.subject,
    required this.paper,
    this.section,
    required this.topic,
    required this.marks,
    required this.difficulty,
    required this.year,
    required this.isDailyDrill,
    this.imageUrl,
    this.subParts,
  });

  factory ExamQuestion.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};

    Map<String, String> parsedOptions = {};
    if (data['options'] is Map) {
      (data['options'] as Map).forEach((key, value) {
        parsedOptions[key.toString()] = value.toString();
      });
    } else {
      if (data['optionA'] != null) parsedOptions['A'] = data['optionA'].toString();
      if (data['optionB'] != null) parsedOptions['B'] = data['optionB'].toString();
      if (data['optionC'] != null) parsedOptions['C'] = data['optionC'].toString();
      if (data['optionD'] != null) parsedOptions['D'] = data['optionD'].toString();
    }

    List<SubPart>? parsedSubParts;
    if (data['subParts'] is List) {
      parsedSubParts = (data['subParts'] as List)
          .map((item) => SubPart.fromMap(Map<String, dynamic>.from(item)))
          .toList();
    }

    return ExamQuestion(
      id: doc.id,
      questionText: data['questionText'] ?? '',
      options: parsedOptions,
      correctAnswer: data['correctAnswer'] ?? 'A',
      explanation: data['explanation'] ?? '',
      subject: data['subject'] ?? 'Computer Science',
      paper: data['paper'] ?? 'Paper 1',
      section: data['section'],
      topic: data['topic'] ?? 'General',
      marks: (data['marks'] as num?)?.toInt() ?? 1,
      difficulty: data['difficulty'] ?? 'Medium',
      year: (data['year'] as num?)?.toInt() ?? 2024,
      isDailyDrill: data['isDailyDrill'] ?? false,
      imageUrl: data['imageUrl'],
      subParts: parsedSubParts,
    );
  }
}
