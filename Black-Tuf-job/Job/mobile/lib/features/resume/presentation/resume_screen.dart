import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/glass_card.dart';
import '../models/resume.dart';
import '../providers/resume_providers.dart';
import 'widgets/resume_file_picker.dart';

class ResumeScreen extends ConsumerStatefulWidget {
  const ResumeScreen({super.key});

  @override
  ConsumerState<ResumeScreen> createState() => _ResumeScreenState();
}

class _ResumeScreenState extends ConsumerState<ResumeScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController = TabController(
    length: 4,
    vsync: this,
  );

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Resume Tools'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          tabs: const [
            Tab(text: 'ATS Score'),
            Tab(text: 'Cover Letter'),
            Tab(text: 'Skill Gap'),
            Tab(text: 'Interview Prep'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [
          _ResumeScoreTab(),
          _CoverLetterTab(),
          _SkillGapTab(),
          _InterviewTab(),
        ],
      ),
    );
  }
}

/// Shared card for each tool: input fields + a run button + result area.
class _ToolCard extends StatelessWidget {
  const _ToolCard({
    required this.onRun,
    required this.busy,
    required this.children,
    this.canRun = true,
    this.runLabel,
  });

  final List<Widget> children;
  final VoidCallback onRun;
  final bool busy;
  final bool canRun;
  final String? runLabel;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      margin: const EdgeInsets.fromLTRB(20, 16, 20, 20),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ...children,
          const SizedBox(height: 18),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: busy || !canRun ? null : onRun,
              child: busy
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.4,
                        color: Colors.white,
                      ),
                    )
                  : Text(runLabel ?? 'Run'),
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        text,
        style: const TextStyle(
          color: AppColors.text,
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _ResumeScoreTab extends ConsumerStatefulWidget {
  const _ResumeScoreTab();

  @override
  ConsumerState<_ResumeScoreTab> createState() => _ResumeScoreTabState();
}

class _ResumeScoreTabState extends ConsumerState<_ResumeScoreTab> {
  final _resumeController = TextEditingController();
  final _roleController = TextEditingController();
  bool _busy = false;
  String? _error;
  ResumeAnalysis? _result;

  @override
  void dispose() {
    _resumeController.dispose();
    _roleController.dispose();
    super.dispose();
  }

  Future<void> _run() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final result = await ref.read(resumeRepositoryProvider).analyze(
            resumeText: _resumeController.text,
            targetRole: _roleController.text,
          );
      if (mounted) setState(() => _result = result);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final canRun = _resumeController.text.trim().length >= 50;
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _ToolCard(
            onRun: _run,
            busy: _busy,
            canRun: canRun,
            runLabel: 'Analyze resume',
            children: [
              const _SectionLabel('Upload or paste your resume (min 50 characters)'),
              ResumeFilePicker(
                onExtracted: (text, _) {
                  _resumeController.text = text;
                  setState(() {});
                },
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _resumeController,
                maxLines: 8,
                onChanged: (_) => setState(() {}),
                decoration: const InputDecoration(hintText: 'Paste your full resume text here…'),
              ),
              const SizedBox(height: 14),
              const _SectionLabel('Target role (optional)'),
              TextField(
                controller: _roleController,
                decoration: const InputDecoration(hintText: 'e.g. Senior Flutter Developer'),
              ),
            ],
          ),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
              child: Text(
                _error!,
                style: const TextStyle(color: AppColors.danger, fontSize: 13),
              ),
            ),
          if (_result != null) _ScoreResult(result: _result!),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}

class _ScoreResult extends StatelessWidget {
  const _ScoreResult({required this.result});

  final ResumeAnalysis result;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
      child: GlassCard(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                SizedBox(
                  width: 64,
                  height: 64,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      CircularProgressIndicator(
                        value: result.atsScore / 100,
                        strokeWidth: 7,
                        backgroundColor: AppColors.border,
                        color: result.atsScore >= 70
                            ? AppColors.success
                            : result.atsScore >= 40
                                ? AppColors.warning
                                : AppColors.danger,
                      ),
                      Center(
                        child: Text(
                          '${result.atsScore}',
                          style: const TextStyle(
                            color: AppColors.text,
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                const Expanded(
                  child: Text(
                    'ATS Score',
                    style: TextStyle(
                      color: AppColors.muted,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            if (result.summary.isNotEmpty) ...[
              const SizedBox(height: 14),
              Text(
                result.summary,
                style: const TextStyle(color: AppColors.muted, fontSize: 13),
              ),
            ],
            if (result.missingKeywords.isNotEmpty) ...[
              const SizedBox(height: 16),
              const Text(
                'Missing keywords',
                style: TextStyle(
                  color: AppColors.warning,
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  for (final kw in result.missingKeywords)
                    Chip(
                      label: Text(kw),
                      side: const BorderSide(color: AppColors.warning),
                      backgroundColor: AppColors.warning.withOpacity(0.1),
                      labelStyle: const TextStyle(
                        color: AppColors.warning,
                        fontSize: 12,
                      ),
                    ),
                ],
              ),
            ],
            if (result.suggestions.isNotEmpty) ...[
              const SizedBox(height: 16),
              const Text(
                'Suggestions',
                style: TextStyle(
                  color: AppColors.success,
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 8),
              for (final s in result.suggestions)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Padding(
                        padding: EdgeInsets.only(top: 2),
                        child: Text(
                          '• ',
                          style: TextStyle(color: AppColors.success),
                        ),
                      ),
                      Expanded(
                        child: Text(
                          s,
                          style: const TextStyle(
                            color: AppColors.muted,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ],
        ),
      ),
    );
  }
}

class _CoverLetterTab extends ConsumerStatefulWidget {
  const _CoverLetterTab();

  @override
  ConsumerState<_CoverLetterTab> createState() => _CoverLetterTabState();
}

class _CoverLetterTabState extends ConsumerState<_CoverLetterTab> {
  final _resumeController = TextEditingController();
  final _roleController = TextEditingController();
  final _companyController = TextEditingController();
  bool _busy = false;
  String? _error;
  String? _result;

  @override
  void dispose() {
    _resumeController.dispose();
    _roleController.dispose();
    _companyController.dispose();
    super.dispose();
  }

  Future<void> _run() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final result = await ref.read(resumeRepositoryProvider).coverLetter(
            resumeText: _resumeController.text,
            jobTitle: _roleController.text,
            companyName: _companyController.text,
          );
      if (mounted) setState(() => _result = result.coverLetter);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final canRun = _resumeController.text.trim().length >= 50 &&
        _roleController.text.trim().isNotEmpty &&
        _companyController.text.trim().isNotEmpty;
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _ToolCard(
            onRun: _run,
            busy: _busy,
            canRun: canRun,
            runLabel: 'Generate cover letter',
            children: [
              const _SectionLabel('Upload or paste your resume'),
              ResumeFilePicker(
                onExtracted: (text, _) {
                  _resumeController.text = text;
                  setState(() {});
                },
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _resumeController,
                maxLines: 6,
                onChanged: (_) => setState(() {}),
                decoration: const InputDecoration(hintText: 'Paste your resume…'),
              ),
              const SizedBox(height: 14),
              const _SectionLabel('Job title'),
              TextField(
                controller: _roleController,
                onChanged: (_) => setState(() {}),
                decoration: const InputDecoration(hintText: 'e.g. Flutter Developer'),
              ),
              const SizedBox(height: 14),
              const _SectionLabel('Company name'),
              TextField(
                controller: _companyController,
                onChanged: (_) => setState(() {}),
                decoration: const InputDecoration(hintText: 'e.g. Makeable'),
              ),
            ],
          ),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
              child: Text(
                _error!,
                style: const TextStyle(color: AppColors.danger, fontSize: 13),
              ),
            ),
          if (_result != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
              child: GlassCard(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Your cover letter',
                      style: TextStyle(
                        color: AppColors.text,
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 12),
                    SelectableText(
                      _result!,
                      style: const TextStyle(
                        color: AppColors.muted,
                        fontSize: 14,
                        height: 1.6,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}

class _SkillGapTab extends ConsumerStatefulWidget {
  const _SkillGapTab();

  @override
  ConsumerState<_SkillGapTab> createState() => _SkillGapTabState();
}

class _SkillGapTabState extends ConsumerState<_SkillGapTab> {
  final _resumeController = TextEditingController();
  final _roleController = TextEditingController();
  bool _busy = false;
  String? _error;
  SkillGapResult? _result;

  @override
  void dispose() {
    _resumeController.dispose();
    _roleController.dispose();
    super.dispose();
  }

  Future<void> _run() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final result = await ref.read(resumeRepositoryProvider).skillGap(
            resumeText: _resumeController.text,
            targetRole: _roleController.text,
          );
      if (mounted) setState(() => _result = result);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final canRun =
        _resumeController.text.trim().length >= 50 && _roleController.text.trim().isNotEmpty;
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _ToolCard(
            onRun: _run,
            busy: _busy,
            canRun: canRun,
            runLabel: 'Analyze skill gap',
            children: [
              const _SectionLabel('Upload or paste your resume'),
              ResumeFilePicker(
                onExtracted: (text, _) {
                  _resumeController.text = text;
                  setState(() {});
                },
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _resumeController,
                maxLines: 6,
                onChanged: (_) => setState(() {}),
                decoration: const InputDecoration(hintText: 'Paste your resume…'),
              ),
              const SizedBox(height: 14),
              const _SectionLabel('Target role'),
              TextField(
                controller: _roleController,
                onChanged: (_) => setState(() {}),
                decoration: const InputDecoration(hintText: 'e.g. Backend Engineer'),
              ),
            ],
          ),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
              child: Text(
                _error!,
                style: const TextStyle(color: AppColors.danger, fontSize: 13),
              ),
            ),
          if (_result != null) _SkillGapResultView(result: _result!),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}

class _SkillGapResultView extends StatelessWidget {
  const _SkillGapResultView({required this.result});

  final SkillGapResult result;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
      child: GlassCard(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _chipGroup('Current skills', result.currentSkills, AppColors.accent),
            const SizedBox(height: 14),
            _chipGroup('Missing skills', result.missingSkills, AppColors.warning),
            const SizedBox(height: 14),
            _chipGroup(
              'Recommended learning',
              result.recommendedLearning,
              AppColors.success,
            ),
          ],
        ),
      ),
    );
  }

  Widget _chipGroup(String label, List<String> items, Color color) {
    if (items.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            color: color,
            fontWeight: FontWeight.w700,
            fontSize: 14,
          ),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            for (final item in items)
              Chip(
                label: Text(item),
                side: BorderSide(color: color),
                backgroundColor: color.withOpacity(0.1),
                labelStyle: TextStyle(color: color, fontSize: 12),
              ),
          ],
        ),
      ],
    );
  }
}

class _InterviewTab extends ConsumerStatefulWidget {
  const _InterviewTab();

  @override
  ConsumerState<_InterviewTab> createState() => _InterviewTabState();
}

class _InterviewTabState extends ConsumerState<_InterviewTab> {
  final _roleController = TextEditingController();
  final _resumeController = TextEditingController();
  bool _busy = false;
  String? _error;
  List<String>? _questions;

  @override
  void dispose() {
    _roleController.dispose();
    _resumeController.dispose();
    super.dispose();
  }

  Future<void> _run() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final result = await ref.read(resumeRepositoryProvider).interviewPrep(
            jobTitle: _roleController.text,
            resumeText: _resumeController.text,
          );
      if (mounted) setState(() => _questions = result.questions);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final canRun = _roleController.text.trim().isNotEmpty;
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _ToolCard(
            onRun: _run,
            busy: _busy,
            canRun: canRun,
            runLabel: 'Generate interview questions',
            children: [
              const _SectionLabel('Job title'),
              TextField(
                controller: _roleController,
                onChanged: (_) => setState(() {}),
                decoration: const InputDecoration(hintText: 'e.g. Senior Flutter Developer'),
              ),
              const SizedBox(height: 14),
              const _SectionLabel('Upload or paste your resume (optional)'),
              ResumeFilePicker(
                onExtracted: (text, _) {
                  _resumeController.text = text;
                  setState(() {});
                },
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _resumeController,
                maxLines: 6,
                decoration: const InputDecoration(
                  hintText: 'Paste your resume to get questions about your experience…',
                ),
              ),
            ],
          ),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
              child: Text(
                _error!,
                style: const TextStyle(color: AppColors.danger, fontSize: 13),
              ),
            ),
          if (_questions != null && _questions!.isNotEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
              child: GlassCard(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Likely interview questions for ${_roleController.text}',
                      style: const TextStyle(
                        color: AppColors.text,
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 12),
                    for (final (index, q) in _questions!.indexed) ...[
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 24,
                            height: 24,
                            margin: const EdgeInsets.only(right: 10, top: 1),
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: AppColors.primary.withOpacity(0.15),
                              shape: BoxShape.circle,
                            ),
                            child: Text(
                              '${index + 1}',
                              style: const TextStyle(
                                color: AppColors.accent,
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                          Expanded(
                            child: Text(
                              q,
                              style: const TextStyle(
                                color: AppColors.muted,
                                fontSize: 14,
                              ),
                            ),
                          ),
                        ],
                      ),
                      if (index != _questions!.length - 1)
                        const SizedBox(height: 10),
                    ],
                  ],
                ),
              ),
            ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}