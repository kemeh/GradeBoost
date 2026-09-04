import { GeneratedPaperData, PaperValidationIssue, PaperValidationResult } from '../types/paperGenerator';

/**
 * Validates the full examination paper data against Cameroon GCE Paper 2 standards
 * and user configuration.
 */
export function validatePaper(paper: Partial<GeneratedPaperData>): PaperValidationResult {
  const errors: PaperValidationIssue[] = [];
  const warnings: PaperValidationIssue[] = [];

  // 1. Basic Metadata Validation
  if (!paper.subject || !paper.subject.trim()) {
    errors.push({
      id: 'err-subject',
      type: 'error',
      message: 'Subject is required. Please select or enter a subject.',
      field: 'subject'
    });
  }

  if (!paper.paperType || !paper.paperType.trim()) {
    errors.push({
      id: 'err-paper-type',
      type: 'error',
      message: 'Paper type is required (e.g., Paper 2).',
      field: 'paperType'
    });
  }

  const currentYear = new Date().getFullYear();
  if (!paper.year || isNaN(paper.year) || paper.year < 1990 || paper.year > currentYear + 10) {
    errors.push({
      id: 'err-year',
      type: 'error',
      message: `Examination year must be a valid 4-digit year between 1990 and ${currentYear + 10}.`,
      field: 'year'
    });
  }

  if (!paper.timeAllowed || !paper.timeAllowed.trim()) {
    errors.push({
      id: 'err-time',
      type: 'error',
      message: 'Duration / Time allowed is required (e.g., 3 Hours).',
      field: 'timeAllowed'
    });
  }

  // Instructions validation
  const validInstructions = (paper.instructions || []).filter(inst => inst && inst.trim().length > 0);
  if (validInstructions.length === 0) {
    errors.push({
      id: 'err-instructions',
      type: 'error',
      message: 'At least one candidate instruction is required.',
      field: 'instructions'
    });
  }

  const questions = paper.questions || [];
  const targetCount = paper.targetQuestionsCount || 8;

  // 2. Question count check
  if (questions.length === 0) {
    errors.push({
      id: 'err-no-questions',
      type: 'error',
      message: `Paper must contain questions. Expected ${targetCount} questions for Paper 2.`
    });
  } else if (questions.length < targetCount) {
    errors.push({
      id: 'err-insufficient-questions',
      type: 'error',
      message: `Paper has only ${questions.length} question${questions.length === 1 ? '' : 's'}. Cameroon GCE Paper 2 requires ${targetCount} questions.`
    });
  }

  // 3. Question numbering and uniqueness
  const seenIds = new Set<number>();
  let totalCalculatedMarks = 0;
  let totalSubparts = 0;

  questions.forEach((q, qIndex) => {
    const expectedId = qIndex + 1;
    if (seenIds.has(q.id)) {
      errors.push({
        id: `err-dup-id-${q.id}`,
        type: 'error',
        message: `Duplicate question number ${q.id} found. Question numbers must be unique.`,
        questionId: q.id
      });
    }
    seenIds.add(q.id);

    if (q.id !== expectedId) {
      warnings.push({
        id: `warn-id-seq-${q.id}`,
        type: 'warning',
        message: `Question #${qIndex + 1} has ID ${q.id}. Sequential ordering (1..${questions.length}) is recommended.`,
        questionId: q.id
      });
    }

    // Question text
    if (!q.text || !q.text.trim()) {
      errors.push({
        id: `err-q-text-${q.id}`,
        type: 'error',
        message: `Question ${q.id} has no prompt or description text.`,
        questionId: q.id,
        field: 'text'
      });
    }

    // Subparts validation
    const subparts = q.subparts || [];
    if (subparts.length === 0) {
      errors.push({
        id: `err-q-nosub-${q.id}`,
        type: 'error',
        message: `Question ${q.id} contains no sub-questions. Each question must contain at least one sub-part.`,
        questionId: q.id
      });
    } else {
      let qTotalMarks = 0;
      const seenLabels = new Set<string>();

      subparts.forEach((sub, sIndex) => {
        totalSubparts++;
        const subLabel = sub.label?.trim() || `(#${sIndex + 1})`;

        // Duplicate labels within question
        if (sub.label && seenLabels.has(sub.label.trim().toLowerCase())) {
          warnings.push({
            id: `warn-dup-label-${q.id}-${sIndex}`,
            type: 'warning',
            message: `Question ${q.id} has repeated sub-question label '${sub.label}'.`,
            questionId: q.id,
            subpartIndex: sIndex
          });
        }
        if (sub.label) seenLabels.add(sub.label.trim().toLowerCase());

        // Subpart text
        if (!sub.text || !sub.text.trim()) {
          errors.push({
            id: `err-sub-text-${q.id}-${sIndex}`,
            type: 'error',
            message: `Question ${q.id} sub-part ${subLabel} is empty. Please enter the question text.`,
            questionId: q.id,
            subpartIndex: sIndex,
            field: 'subpart-text'
          });
        }

        // Subpart marks
        const marks = Number(sub.marks);
        if (isNaN(marks) || marks <= 0) {
          errors.push({
            id: `err-sub-marks-${q.id}-${sIndex}`,
            type: 'error',
            message: `Question ${q.id} sub-part ${subLabel} has invalid marks (${sub.marks}). Marks must be a positive number.`,
            questionId: q.id,
            subpartIndex: sIndex,
            field: 'subpart-marks'
          });
        } else {
          qTotalMarks += marks;
          totalCalculatedMarks += marks;
        }
      });

      // Target marks per question check (e.g. 17 marks each if configured)
      if (paper.targetMarksPerQuestion && qTotalMarks !== paper.targetMarksPerQuestion) {
        warnings.push({
          id: `warn-q-target-marks-${q.id}`,
          type: 'warning',
          message: `Question ${q.id} total marks is ${qTotalMarks} (standard target is ${paper.targetMarksPerQuestion} marks).`,
          questionId: q.id
        });
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    totalMarks: totalCalculatedMarks,
    totalQuestions: questions.length,
    totalSubparts
  };
}

/**
 * Generates an automatic sub-part label based on index:
 * 0 -> (a), 1 -> (b), ... 25 -> (z), 26 -> (aa)
 */
export function getSubpartLabel(index: number): string {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  if (index < letters.length) {
    return `(${letters[index]})`;
  }
  const first = Math.floor(index / letters.length) - 1;
  const second = index % letters.length;
  return `(${letters[first] || 'a'}${letters[second]})`;
}

/**
 * Generates Roman numerals for nested sub-sub parts:
 * 0 -> (i), 1 -> (ii), 2 -> (iii), 3 -> (iv), 4 -> (v)
 */
export function getRomanNumeral(index: number): string {
  const romanNumerals = ['(i)', '(ii)', '(iii)', '(iv)', '(v)', '(vi)', '(vii)', '(viii)', '(ix)', '(x)'];
  return romanNumerals[index] || `(${index + 1})`;
}
