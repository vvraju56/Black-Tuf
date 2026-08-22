import '../../../core/network/api_client.dart';
import '../models/resume.dart';

class ResumeRepository {
  ResumeRepository(this._api);

  final ApiClient _api;

  Future<ResumeAnalysis> analyze({
    required String resumeText,
    String? targetRole,
    String? jobDescription,
  }) async {
    final response = await _api.post<Map<String, dynamic>>(
      '/resume/analyze',
      data: {
        'resume_text': resumeText,
        if (targetRole != null && targetRole.isNotEmpty) 'target_role': targetRole,
        if (jobDescription != null && jobDescription.isNotEmpty)
          'job_description': jobDescription,
      },
    );
    return ResumeAnalysis.fromJson(response.data!);
  }

  Future<CoverLetterResult> coverLetter({
    required String resumeText,
    required String jobTitle,
    required String companyName,
    String? jobDescription,
  }) async {
    final response = await _api.post<Map<String, dynamic>>(
      '/resume/cover-letter',
      data: {
        'resume_text': resumeText,
        'job_title': jobTitle,
        'company_name': companyName,
        if (jobDescription != null && jobDescription.isNotEmpty)
          'job_description': jobDescription,
      },
    );
    return CoverLetterResult.fromJson(response.data!);
  }

  Future<SkillGapResult> skillGap({
    required String resumeText,
    required String targetRole,
  }) async {
    final response = await _api.post<Map<String, dynamic>>(
      '/resume/skill-gap',
      data: {'resume_text': resumeText, 'target_role': targetRole},
    );
    return SkillGapResult.fromJson(response.data!);
  }

  Future<InterviewPrepResult> interviewPrep({
    required String jobTitle,
    String? jobDescription,
    String? resumeText,
  }) async {
    final response = await _api.post<Map<String, dynamic>>(
      '/resume/interview-prep',
      data: {
        'job_title': jobTitle,
        if (jobDescription != null && jobDescription.isNotEmpty)
          'job_description': jobDescription,
        if (resumeText != null && resumeText.isNotEmpty)
          'resume_text': resumeText,
      },
    );
    return InterviewPrepResult.fromJson(response.data!);
  }
}