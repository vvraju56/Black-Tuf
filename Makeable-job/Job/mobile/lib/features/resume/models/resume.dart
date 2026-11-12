class ResumeAnalysis {
  const ResumeAnalysis({
    required this.atsScore,
    required this.missingKeywords,
    required this.suggestions,
    required this.summary,
  });

  final int atsScore;
  final List<String> missingKeywords;
  final List<String> suggestions;
  final String summary;

  factory ResumeAnalysis.fromJson(Map<String, dynamic> json) => ResumeAnalysis(
        atsScore: (json['ats_score'] as num?)?.toInt() ?? 0,
        missingKeywords: _stringList(json['missing_keywords']),
        suggestions: _stringList(json['suggestions']),
        summary: (json['summary'] as String?) ?? '',
      );
}

class SkillGapResult {
  const SkillGapResult({
    required this.currentSkills,
    required this.missingSkills,
    required this.recommendedLearning,
  });

  final List<String> currentSkills;
  final List<String> missingSkills;
  final List<String> recommendedLearning;

  factory SkillGapResult.fromJson(Map<String, dynamic> json) => SkillGapResult(
        currentSkills: _stringList(json['current_skills']),
        missingSkills: _stringList(json['missing_skills']),
        recommendedLearning: _stringList(json['recommended_learning']),
      );
}

class CoverLetterResult {
  const CoverLetterResult({required this.coverLetter});

  final String coverLetter;

  factory CoverLetterResult.fromJson(Map<String, dynamic> json) =>
      CoverLetterResult(coverLetter: (json['cover_letter'] as String?) ?? '');
}

class InterviewPrepResult {
  const InterviewPrepResult({required this.questions});

  final List<String> questions;

  factory InterviewPrepResult.fromJson(Map<String, dynamic> json) =>
      InterviewPrepResult(questions: _stringList(json['questions']));
}

List<String> _stringList(dynamic raw) {
  if (raw is! List) return const [];
  return raw.whereType<String>().toList();
}