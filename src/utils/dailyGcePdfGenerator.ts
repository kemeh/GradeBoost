/**
 * Edulpha — Daily GCE Question & Mock Examination PDF Generator
 * Professional A4 Layout, Subtle Multi-Page Watermark, and Strict Source Attribution
 */
import { jsPDF } from 'jspdf';
import { DailyGceQuestion } from '../types';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface DailyGcePdfOptions {
  question: DailyGceQuestion;
  mode: 'question' | 'answersheet' | 'marking_guide';
  studentName?: string;
  studentId?: string;
  appName?: string;
}

/**
 * Draws the subtle, professional Edulpha watermark across the page.
 * Stays visible in grayscale and print without obscuring question content.
 */
function drawEdulphaWatermark(doc: jsPDF, pageWidth: number, pageHeight: number) {
  doc.saveGraphicsState();
  
  // Very light gray (subtle watermark)
  doc.setTextColor(240, 243, 246);
  doc.setFont('helvetica', 'bold');
  
  // Center diagonal watermark
  doc.setFontSize(54);
  doc.text('EDULPHA', pageWidth / 2, pageHeight / 2 - 10, {
    align: 'center',
    angle: 45
  });

  doc.setFontSize(18);
  doc.setTextColor(244, 246, 249);
  doc.text('Powered by Edulpha', pageWidth / 2, pageHeight / 2 + 15, {
    align: 'center',
    angle: 45
  });

  // Top-left and bottom-right secondary light marks
  doc.setFontSize(14);
  doc.setTextColor(247, 248, 251);
  doc.text('EDULPHA EXAMINATION ENGINE', marginSize, pageHeight - 25);

  doc.restoreGraphicsState();
}

const marginSize = 16;

/**
 * Draws the official Cameroon GCE style header
 */
function drawGceHeader(
  doc: jsPDF,
  pageWidth: number,
  title: string,
  subject: string,
  level: string,
  paper: string,
  dateStr: string,
  sourceType: string,
  mode: 'question' | 'answersheet' | 'marking_guide'
): number {
  const contentWidth = pageWidth - (marginSize * 2);
  let currentY = 14;

  // Header Box
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(marginSize, currentY, contentWidth, 38, 2, 2, 'FD');

  // Top Banner Accent
  doc.setFillColor(79, 70, 229); // indigo-600
  doc.rect(marginSize, currentY, contentWidth, 3, 'F');

  // Title: EDULPHA
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('EDULPHA', pageWidth / 2, currentY + 12, { align: 'center' });

  // Subtitle
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229); // indigo-600
  let modeTitle = 'DAILY GCE CHALLENGE';
  if (mode === 'answersheet') modeTitle = 'DAILY GCE CHALLENGE — CANDIDATE ANSWER SHEET';
  if (mode === 'marking_guide') modeTitle = 'DAILY GCE CHALLENGE — MARKING GUIDE & MODEL SOLUTION';
  doc.text(modeTitle, pageWidth / 2, currentY + 18, { align: 'center' });

  // Subject and Metadata Row
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85); // slate-700
  const metaText = `Subject: ${subject.toUpperCase()}   |   Level: ${level.toUpperCase()}   |   ${paper.toUpperCase()}   |   Date: ${dateStr}`;
  doc.text(metaText, pageWidth / 2, currentY + 26, { align: 'center' });

  // Source Attribution Badge
  doc.setFontSize(8);
  let sourceLabel = 'EDULPHA PRACTICE QUESTION';
  if (sourceType === 'PAST_GCE') sourceLabel = 'VERIFIED PAST GCE QUESTION';
  else if (sourceType === 'AI_GENERATED_GCE_STYLE') sourceLabel = 'EDULPHA AI-GENERATED GCE-STYLE PRACTICE';
  else if (sourceType === 'MOCK_EXAM') sourceLabel = 'EDULPHA MOCK EXAMINATION';

  if (mode === 'marking_guide') {
    sourceLabel += ' — OFFICIAL MODEL MARKING KEY';
  }

  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`[ ${sourceLabel} ]`, pageWidth / 2, currentY + 33, { align: 'center' });

  currentY += 44;

  // Instructions Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(marginSize, currentY, contentWidth, 18, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('EXAMINATION INSTRUCTIONS:', marginSize + 4, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('1. Answer all questions where required.   2. Show all necessary working and intermediate formulas.', marginSize + 4, currentY + 10);
  doc.text('3. Clearly state units for numerical answers.   4. Mathematical tables and silent calculators allowed where applicable.', marginSize + 4, currentY + 14);

  currentY += 24;
  return currentY;
}

/**
 * Draws the persistent footer on every page
 */
function drawGceFooter(doc: jsPDF, pageWidth: number, pageHeight: number, pageNum: number, totalPages: number) {
  const footerY = pageHeight - 10;
  doc.setDrawColor(226, 232, 240);
  doc.line(marginSize, footerY - 3, pageWidth - marginSize, footerY - 3);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('EDULPHA — Your Digital Learning Platform', marginSize, footerY);

  doc.setFont('helvetica', 'normal');
  doc.text(`Educational Technology Platform  |  Page ${pageNum} of ${totalPages}`, pageWidth - marginSize, footerY, { align: 'right' });
}

/**
 * Generates and downloads a single Daily GCE Question PDF
 */
export async function downloadDailyGceQuestionPDF(options: DailyGcePdfOptions) {
  const { question, mode, studentName, studentId } = options;

  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - (marginSize * 2);
  let pageNum = 1;

  // 1. Watermark & Header
  drawEdulphaWatermark(doc, pageWidth, pageHeight);
  let currentY = drawGceHeader(
    doc,
    pageWidth,
    'EDULPHA DAILY GCE CHALLENGE',
    question.subject,
    question.level,
    question.paper,
    question.date || new Date().toISOString().split('T')[0],
    question.sourceType,
    mode
  );

  // If Answer Sheet mode, draw candidate identification grid
  if (mode === 'answersheet') {
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(marginSize, currentY, contentWidth, 22, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Candidate Name: ${studentName || '_______________________________________'}`, marginSize + 4, currentY + 7);
    doc.text(`Student ID / Centre No: ${studentId || '_____________________'}`, marginSize + 4, currentY + 15);
    doc.text(`Date of Examination: ${question.date || '__________________'}`, pageWidth / 2 + 10, currentY + 7);
    doc.text(`Examiner Score: ________ / ${question.marks} mks`, pageWidth / 2 + 10, currentY + 15);

    currentY += 28;
  }

  // Question Info Strip
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(marginSize, currentY, contentWidth, 8, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`TOPIC: ${question.topic.toUpperCase()}${question.subtopic ? `  •  ${question.subtopic.toUpperCase()}` : ''}`, marginSize + 3, currentY + 5.5);
  doc.text(`[ TOTAL MARKS: ${question.marks} ]`, pageWidth - marginSize - 3, currentY + 5.5, { align: 'right' });

  currentY += 14;

  // Main Question Prompt
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('QUESTION 1', marginSize, currentY);
  currentY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  const promptLines = doc.splitTextToSize(question.questionText, contentWidth);
  doc.text(promptLines, marginSize, currentY);
  currentY += (promptLines.length * 5) + 6;

  // If MCQ and Options present
  if (question.questionType === 'mcq' && question.options) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('Select the ONE best option:', marginSize, currentY);
    currentY += 5;

    Object.entries(question.options).forEach(([key, val]) => {
      if (currentY > pageHeight - 30) {
        doc.addPage();
        pageNum++;
        drawEdulphaWatermark(doc, pageWidth, pageHeight);
        currentY = marginSize + 10;
      }

      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(marginSize, currentY - 3, contentWidth, 8, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text(key, marginSize + 4, currentY + 2.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(String(val), marginSize + 12, currentY + 2.5);

      currentY += 10;
    });
  }

  // If Subparts present (Paper 2 & 3)
  if (question.subparts && question.subparts.length > 0) {
    question.subparts.forEach((sp) => {
      if (currentY > pageHeight - 35) {
        doc.addPage();
        pageNum++;
        drawEdulphaWatermark(doc, pageWidth, pageHeight);
        currentY = marginSize + 10;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(79, 70, 229);
      doc.text(sp.label, marginSize, currentY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const subLines = doc.splitTextToSize(sp.text, contentWidth - 25);
      doc.text(subLines, marginSize + 10, currentY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`[${sp.marks} ${sp.marks === 1 ? 'mark' : 'marks'}]`, pageWidth - marginSize, currentY, { align: 'right' });

      currentY += (subLines.length * 4.5) + 3;

      if (sp.codeSnippet) {
        if (currentY > pageHeight - 35) {
          doc.addPage();
          pageNum++;
          drawEdulphaWatermark(doc, pageWidth, pageHeight);
          currentY = marginSize + 10;
        }

        doc.setFillColor(15, 23, 42);
        doc.rect(marginSize + 10, currentY, contentWidth - 10, 14, 'F');
        doc.setFont('courier', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(52, 211, 153); // emerald-400
        const codeLines = doc.splitTextToSize(sp.codeSnippet, contentWidth - 16);
        doc.text(codeLines.slice(0, 3), marginSize + 13, currentY + 4);
        currentY += 18;
      }

      // If Answer sheet mode: provide lined writing area
      if (mode === 'answersheet') {
        const linesCount = Math.max(3, Math.min(8, sp.marks * 2));
        doc.setDrawColor(226, 232, 240);
        for (let l = 0; l < linesCount; l++) {
          if (currentY > pageHeight - 25) {
            doc.addPage();
            pageNum++;
            drawEdulphaWatermark(doc, pageWidth, pageHeight);
            currentY = marginSize + 10;
          }
          doc.line(marginSize + 10, currentY + 3, pageWidth - marginSize, currentY + 3);
          currentY += 6;
        }
        currentY += 4;
      }
    });
  } else if (mode === 'answersheet' && question.questionType !== 'mcq') {
    // General structured writing box
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Candidate Working & Response Space:', marginSize, currentY);
    currentY += 3;

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    const boxHeight = Math.min(100, pageHeight - currentY - 20);
    doc.rect(marginSize, currentY, contentWidth, boxHeight);
    currentY += boxHeight + 8;
  }

  // If Mode === 'marking_guide': print model answer and marking scheme
  if (mode === 'marking_guide' && question.modelAnswer) {
    if (currentY > pageHeight - 60) {
      doc.addPage();
      pageNum++;
      drawEdulphaWatermark(doc, pageWidth, pageHeight);
      currentY = marginSize + 10;
    }

    doc.setDrawColor(16, 185, 129); // emerald-500
    doc.setFillColor(240, 253, 244); // emerald-50
    doc.roundedRect(marginSize, currentY, contentWidth, 12, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(6, 95, 70);
    doc.text('OFFICIAL MODEL SOLUTION & MARKING SCHEME', marginSize + 4, currentY + 5);
    doc.setFontSize(7.5);
    doc.setTextColor(5, 150, 105);
    doc.text('AI-Generated Marking Guide — For Learning & Revision Purposes', marginSize + 4, currentY + 9.5);

    currentY += 16;

    if (question.modelAnswer.expectedAnswer) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      const ansLines = doc.splitTextToSize(question.modelAnswer.expectedAnswer, contentWidth);
      doc.text(ansLines, marginSize, currentY);
      currentY += (ansLines.length * 4.5) + 6;
    }

    if (question.modelAnswer.markingPoints && question.modelAnswer.markingPoints.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('MARKING CRITERIA BREAKDOWN:', marginSize, currentY);
      currentY += 5;

      question.modelAnswer.markingPoints.forEach((mp) => {
        if (currentY > pageHeight - 25) {
          doc.addPage();
          pageNum++;
          drawEdulphaWatermark(doc, pageWidth, pageHeight);
          currentY = marginSize + 10;
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text(`• ${mp.point}`, marginSize + 3, currentY);

        doc.setFont('helvetica', 'bold');
        doc.text(`[${mp.marks} mk]`, pageWidth - marginSize, currentY, { align: 'right' });
        currentY += 5;
      });
    }

    if (question.modelAnswer.examTip) {
      currentY += 3;
      doc.setFillColor(250, 245, 255); // purple-50
      doc.setDrawColor(216, 180, 254);
      doc.roundedRect(marginSize, currentY, contentWidth, 12, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(107, 33, 168);
      doc.text('CAMEROON GCE EXAMINER TIP:', marginSize + 3, currentY + 4.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(88, 28, 135);
      const tipLines = doc.splitTextToSize(question.modelAnswer.examTip, contentWidth - 8);
      doc.text(tipLines, marginSize + 3, currentY + 8.5);
      currentY += 16;
    }
  }

  // Draw footers on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawGceFooter(doc, pageWidth, pageHeight, i, totalPages);
  }

  // Clean filename
  const cleanSubj = question.subject.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanPaper = question.paper.replace(/[^a-zA-Z0-9]/g, '_');
  const dateStr = question.date || new Date().toISOString().split('T')[0];
  let suffix = 'QuestionPaper';
  if (mode === 'answersheet') suffix = 'AnswerSheet';
  if (mode === 'marking_guide') suffix = 'MarkingGuide';

  const filename = `Edulpha_${cleanSubj}_${cleanPaper}_${suffix}_${dateStr}.pdf`;

  // Save the PDF
  doc.save(filename);

  // Record download history in Firestore (fire and forget)
  if (studentId) {
    addDoc(collection(db, 'download_history'), {
      studentId,
      documentTitle: `${question.subject} ${question.paper} Daily GCE Challenge (${suffix})`,
      subject: question.subject,
      paper: question.paper,
      date: dateStr,
      mode,
      filename,
      downloadedAt: serverTimestamp()
    }).catch(e => console.warn('Download history log skipped:', e));
  }
}

/**
 * Generates and downloads a compiled PDF containing all Daily Questions for today across all registered subjects
 */
export async function downloadAllSubjectsDailyGcePDF(params: {
  questions: DailyGceQuestion[];
  level: string;
  date: string;
  studentId?: string;
  studentName?: string;
}) {
  const { questions, level, date, studentId, studentName } = params;
  if (!questions || questions.length === 0) return;

  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - (marginSize * 2);

  // Cover / Header Page
  drawEdulphaWatermark(doc, pageWidth, pageHeight);

  // Header
  doc.setFillColor(30, 41, 59);
  doc.rect(marginSize, 16, contentWidth, 36, 'F');

  doc.setFillColor(79, 70, 229);
  doc.rect(marginSize, 16, contentWidth, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('EDULPHA', pageWidth / 2, 28, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(165, 180, 252);
  doc.text('COMPLETE DAILY GCE NATIONAL CHALLENGE', pageWidth / 2, 35, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240);
  doc.text(`Examination Level: ${level.toUpperCase()}   |   Date: ${date}`, pageWidth / 2, 43, { align: 'center' });

  let currentY = 60;

  // Table of Contents
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("TODAY'S SUBJECTS & PAPERS:", marginSize, currentY);
  currentY += 8;

  questions.forEach((q, idx) => {
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255);
    doc.roundedRect(marginSize, currentY - 3, contentWidth, 8, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(79, 70, 229);
    doc.text(`${idx + 1}.`, marginSize + 4, currentY + 2.5);

    doc.setTextColor(15, 23, 42);
    doc.text(`${q.subject} (${q.paper}) — Topic: ${q.topic}`, marginSize + 12, currentY + 2.5);

    doc.setTextColor(100, 116, 139);
    doc.text(`[${q.marks} mks]`, pageWidth - marginSize - 4, currentY + 2.5, { align: 'right' });

    currentY += 10;
  });

  // Questions on subsequent pages
  for (let qIdx = 0; qIdx < questions.length; qIdx++) {
    const q = questions[qIdx];
    doc.addPage();
    drawEdulphaWatermark(doc, pageWidth, pageHeight);

    let qY = drawGceHeader(
      doc,
      pageWidth,
      'EDULPHA DAILY GCE CHALLENGE',
      q.subject,
      q.level,
      q.paper,
      q.date || date,
      q.sourceType,
      'question'
    );

    // Subject banner
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`QUESTION ${qIdx + 1}: ${q.subject.toUpperCase()} (${q.paper})`, marginSize, qY);
    qY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    const pLines = doc.splitTextToSize(q.questionText, contentWidth);
    doc.text(pLines, marginSize, qY);
    qY += (pLines.length * 5) + 6;

    // Subparts
    if (q.subparts && q.subparts.length > 0) {
      q.subparts.forEach((sp) => {
        if (qY > pageHeight - 35) {
          doc.addPage();
          drawEdulphaWatermark(doc, pageWidth, pageHeight);
          qY = marginSize + 10;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(79, 70, 229);
        doc.text(sp.label, marginSize, qY);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        const sLines = doc.splitTextToSize(sp.text, contentWidth - 25);
        doc.text(sLines, marginSize + 10, qY);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`[${sp.marks} mks]`, pageWidth - marginSize, qY, { align: 'right' });

        qY += (sLines.length * 4.5) + 4;
      });
    }
  }

  // Draw footers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawGceFooter(doc, pageWidth, pageHeight, i, totalPages);
  }

  const filename = `Edulpha_Daily_GCE_Challenge_All_Subjects_${date}.pdf`;
  doc.save(filename);

  if (studentId) {
    addDoc(collection(db, 'download_history'), {
      studentId,
      documentTitle: `Daily GCE Challenge — Complete All Subjects Pack (${level})`,
      subject: 'All Subjects',
      paper: 'All Papers',
      date,
      mode: 'all_subjects_pack',
      filename,
      downloadedAt: serverTimestamp()
    }).catch(e => console.warn('Download history log skipped:', e));
  }
}
