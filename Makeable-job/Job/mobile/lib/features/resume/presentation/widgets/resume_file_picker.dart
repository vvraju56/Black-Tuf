import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';

import '../../../../core/theme/app_theme.dart';
import '../../data/resume_file_extractor.dart';

/// Upload button for resume files (PDF, DOCX, TXT). Extracts text locally
/// on-device and hands it to [onExtracted].
class ResumeFilePicker extends StatefulWidget {
  const ResumeFilePicker({super.key, required this.onExtracted});

  final void Function(String text, String fileName) onExtracted;

  @override
  State<ResumeFilePicker> createState() => _ResumeFilePickerState();
}

class _ResumeFilePickerState extends State<ResumeFilePicker> {
  final _extractor = ResumeFileExtractor();
  bool _busy = false;
  String? _fileName;
  String? _error;

  Future<void> _pick() async {
    final picked = await FilePicker.pickFiles(
      type: FileType.custom,
      allowedExtensions: const ['pdf', 'doc', 'docx', 'txt', 'md'],
      allowMultiple: false,
    );
    final file = picked.isEmpty ? null : picked.first;
    final path = file?.path;
    if (file == null || path == null) return;

    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final text = await _extractor.extractText(path);
      if (!mounted) return;
      if (text.trim().isEmpty) {
        setState(() {
          _error = 'Could not extract text from that file — try a different one.';
          _busy = false;
        });
        return;
      }
      setState(() {
        _fileName = file.name;
        _busy = false;
      });
      widget.onExtracted(text, file.name);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e is ResumeFileException
            ? e.message
            : 'Failed to read that file — try converting it to PDF or DOCX.';
        _busy = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        OutlinedButton.icon(
          onPressed: _busy ? null : _pick,
          icon: _busy
              ? const SizedBox(
                  height: 18,
                  width: 18,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.2,
                    color: AppColors.accent,
                  ),
                )
              : const Icon(Icons.upload_file_rounded, color: AppColors.accent),
          label: Text(_busy ? 'Extracting text…' : 'Upload resume (PDF, DOCX or TXT)'),
        ),
        if (_fileName != null) ...[
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.description_outlined,
                  size: 16, color: AppColors.accent),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  _fileName!,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: AppColors.muted, fontSize: 12),
                ),
              ),
              IconButton(
                onPressed: () => setState(() => _fileName = null),
                icon: const Icon(Icons.close_rounded, size: 16, color: AppColors.muted),
                visualDensity: VisualDensity.compact,
              ),
            ],
          ),
        ],
        if (_error != null) ...[
          const SizedBox(height: 8),
          Text(
            _error!,
            style: const TextStyle(color: AppColors.warning, fontSize: 12),
          ),
        ],
      ],
    );
  }
}