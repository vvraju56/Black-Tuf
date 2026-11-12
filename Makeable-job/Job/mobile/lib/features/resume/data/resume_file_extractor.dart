import 'dart:io';

import 'package:archive/archive.dart';
import 'package:pdfrx/pdfrx.dart';
import 'package:xml/xml.dart';

/// Thrown when a resume file cannot be read or has no extractable text.
class ResumeFileException implements Exception {
  const ResumeFileException(this.message);

  final String message;

  @override
  String toString() => message;
}

/// Extracts plain text from resume files (PDF, DOCX, TXT) so it can be fed
/// into the resume tools. Mirrors the web app's client-side parsing.
class ResumeFileExtractor {
  /// Returns the extracted text for [path], or throws if unsupported/empty.
  Future<String> extractText(String path) async {
    final lower = path.toLowerCase();
    if (lower.endsWith('.pdf')) return _fromPdf(path);
    if (lower.endsWith('.docx')) return _fromDocx(path);
    if (lower.endsWith('.doc')) {
      throw const ResumeFileException(
          'Legacy .doc files are not supported. Save it as .docx or .pdf instead.');
    }
    if (lower.endsWith('.txt') || lower.endsWith('.md')) {
      return File(path).readAsString();
    }
    throw const ResumeFileException('Please upload a PDF, DOCX, or TXT file.');
  }

  Future<String> _fromPdf(String path) async {
    final document = await PdfDocument.openFile(path);
    try {
      final buffer = StringBuffer();
      for (final page in document.pages) {
        final text = await page.loadStructuredText();
        final pageText = text.fullText.trim();
        if (pageText.isNotEmpty) {
          buffer.writeln(pageText);
          buffer.write('\n\n');
        }
      }
      return buffer.toString();
    } finally {
      document.dispose();
    }
  }

  Future<String> _fromDocx(String path) async {
    final bytes = await File(path).readAsBytes();
    final archive = ZipDecoder().decodeBytes(bytes);
    final entry = archive.findFile('word/document.xml');
    if (entry == null) {
      throw const ResumeFileException('Could not read that DOCX file.');
    }
    final xmlText = String.fromCharCodes(entry.content);
    final document = XmlDocument.parse(xmlText);
    const wNamespace = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
    return document
        .findAllElements('p', namespace: wNamespace)
        .map(
          (p) => p
              .findAllElements('t', namespace: wNamespace)
              .map((t) => t.innerText)
              .join(),
        )
        .where((s) => s.trim().isNotEmpty)
        .join('\n');
  }
}