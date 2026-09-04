import { jsPDF } from 'jspdf';
import { ExamQuestion } from '../types';

export const downloadQuestionAsPDF = async (question: ExamQuestion, dayNumber?: number) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let currentY = 20;

  // Add Watermark
  doc.setTextColor(245, 245, 245);
  doc.setFontSize(60);
  doc.setFont('helvetica', 'bold');
  doc.text('Vertexon Technologies', pageWidth / 2, pageHeight / 2, {
    align: 'center',
    angle: 45
  });

  // Header Design
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Accent line
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 45, pageWidth, 2, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text('EDULPHA', margin, 25);
  
  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.setFont('helvetica', 'bold');
  doc.text('Smart Exam Practice System', margin, 35);
  
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFont('helvetica', 'normal');
  doc.text(`${dayNumber ? `Day ${dayNumber} Challenge` : 'Practice Question'}`, pageWidth - margin - 40, 35);
  
  currentY = 65;

  // Question Info Card
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(margin, currentY - 5, contentWidth, 18, 2, 2, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85); // slate-700
  const sectionText = question.section ? `  |  SECTION: ${question.section.toUpperCase()}` : '';
  doc.text(`${question.subject.toUpperCase()}  |  ${question.paper.toUpperCase()}${sectionText}  |  TOPIC: ${question.topic.toUpperCase()}`, margin + 5, currentY + 6);
  
  currentY += 30;

  // Question Text Section
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(margin, currentY - 5, 3, 10, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('Question:', margin + 8, currentY + 3);
  currentY += 15;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(51, 65, 85); // slate-700
  const splitText = doc.splitTextToSize(question.questionText, contentWidth);
  doc.text(splitText, margin, currentY);
  currentY += (splitText.length * 7) + 15;

  // Image if exists
  if (question.imageUrl) {
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = question.imageUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const maxImgHeight = pageHeight - currentY - margin - 20;
      let imgWidth = contentWidth;
      let imgHeight = (img.height * imgWidth) / img.width;
      
      if (imgHeight > maxImgHeight) {
        imgHeight = maxImgHeight;
        imgWidth = (img.width * imgHeight) / img.height;
      }
      
      // Check if image fits on page, if not add new page
      if (currentY + imgHeight > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
        
        // Re-add watermark on new page
        doc.setTextColor(245, 245, 245);
        doc.setFontSize(60);
        doc.setFont('helvetica', 'bold');
        doc.text('Vertexon Technologies', pageWidth / 2, pageHeight / 2, {
          align: 'center',
          angle: 45
        });
      }

      doc.addImage(img, 'JPEG', (pageWidth - imgWidth) / 2, currentY, imgWidth, imgHeight);
      currentY += imgHeight + 15;
    } catch (error) {
      console.error('Error adding image to PDF:', error);
    }
  }

  // Options if Paper 1
  if (question.paper === 'Paper 1' && question.options) {
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(margin, currentY - 5, 3, 8, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text('Options:', margin + 8, currentY + 1);
    currentY += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105); // slate-600
    Object.entries(question.options).forEach(([key, value]) => {
      const optionText = `${key}: ${value}`;
      const splitOption = doc.splitTextToSize(optionText, contentWidth - 15);
      
      if (currentY + (splitOption.length * 7) > pageHeight - margin) {
        doc.addPage();
        currentY = margin + 10;
        
        // Re-add watermark on new page
        doc.setTextColor(245, 245, 245);
        doc.setFontSize(60);
        doc.setFont('helvetica', 'bold');
        doc.text('Vertexon Technologies', pageWidth / 2, pageHeight / 2, {
          align: 'center',
          angle: 45
        });
      }

      doc.setFillColor(241, 245, 249); // slate-100
      doc.roundedRect(margin, currentY - 5, contentWidth, (splitOption.length * 7) + 4, 1, 1, 'F');
      
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.setFont('helvetica', 'bold');
      doc.text(key, margin + 5, currentY);
      
      doc.setTextColor(71, 85, 105); // slate-600
      doc.setFont('helvetica', 'normal');
      doc.text(splitOption, margin + 12, currentY);
      currentY += (splitOption.length * 7) + 8;
    });
  } else {
    // Space for structured answer
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(margin, currentY - 5, 3, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text('Your Answer:', margin + 8, currentY + 1);
    currentY += 10;

    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.rect(margin, currentY, contentWidth, 80);
    currentY += 90;
  }

  // Footer
  const footerY = pageHeight - 15;
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');
  
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFont('helvetica', 'normal');
  doc.text('© Edulpha - Powered by Vertexon Technologies', margin, footerY);
  doc.text(`Downloaded: ${new Date().toLocaleDateString()}`, pageWidth - margin - 40, footerY);

  doc.save(`Edulpha_DailyDrill_Day${dayNumber || 'X'}_${question.id?.substring(0, 5) || 'export'}.pdf`);
};

export interface GCEPaper2Data {
  id?: string;
  title: string;
  timeAllowed: string;
  subject: string;
  year: number;
  level?: string;
  instructions?: string[];
  questions: {
    id: number;
    text: string;
    codeSnippet?: string;
    subparts: {
      label: string;
      text: string;
      marks: number;
      codeSnippet?: string;
    }[];
  }[];
}

export const generateGCEPaper2PDF = async (
  data: GCEPaper2Data,
  options?: { appName?: string; logoUrl?: string }
): Promise<{ blob: Blob; filename: string }> => {
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait'
  });

  const brandName = (options?.appName || 'EDULPHA').toUpperCase();
  const cleanSubject = (data.subject || 'COMPUTER_SCIENCE').toUpperCase().replace(/[^A-Z0-9_]/g, '_');
  const filename = `${brandName}_${cleanSubject}_PAPER_2_${data.year || new Date().getFullYear()}.pdf`;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - (margin * 2);
  let currentY = 16;

  // Header function for pages
  const printHeader = (pageNum: number) => {
    if (pageNum === 1) {
      // Main Title on Page 1
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(15, 44, 89); // Deep Royal Blue
      doc.text(brandName, pageWidth / 2, currentY, { align: 'center' });
      currentY += 5.5;

      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59); // Slate-800
      doc.text('CAMEROON GENERAL CERTIFICATE OF EDUCATION BOARD', pageWidth / 2, currentY, { align: 'center' });
      currentY += 5;

      doc.setFontSize(10);
      doc.setTextColor(217, 119, 6); // Golden Amber
      doc.text(`${(data.level || 'ADVANCED LEVEL').toUpperCase()} EXAMINATION`, pageWidth / 2, currentY, { align: 'center' });
      currentY += 6;

      // Meta Box
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.setFillColor(248, 250, 252); // slate-50
      doc.roundedRect(margin, currentY, contentWidth, 18, 1.5, 1.5, 'FD');

      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFont('helvetica', 'bold');
      doc.text(`SUBJECT: ${(data.subject || '').toUpperCase()}`, margin + 4, currentY + 6);
      doc.text(`PAPER: ${(data.title || 'Paper 2').toUpperCase()}`, margin + 4, currentY + 12);

      doc.text(`EXAM YEAR: ${data.year || new Date().getFullYear()}`, pageWidth - margin - 4, currentY + 6, { align: 'right' });
      doc.text(`TIME ALLOWED: ${(data.timeAllowed || '3 Hours').toUpperCase()}`, pageWidth - margin - 4, currentY + 12, { align: 'right' });

      currentY += 23;

      // Instructions Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('INSTRUCTIONS TO CANDIDATES', margin, currentY);
      currentY += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);

      const instructions = (data.instructions && data.instructions.length > 0)
        ? data.instructions
        : [
            'Answer ALL questions or as specified in the examination instructions.',
            'All questions carry equal marks unless otherwise indicated.',
            'Write your answers clearly and legibly in the spaces provided or answer booklet.',
            'Credit will be given for clear algorithms, diagrams, and orderly presentation.'
          ];

      instructions.forEach((inst, i) => {
        const instLines = doc.splitTextToSize(`${i + 1}. ${inst}`, contentWidth - 4);
        doc.text(instLines, margin + 2, currentY);
        currentY += (instLines.length * 3.8) + 0.8;
      });

      // Divider line
      currentY += 2;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 6;
    } else {
      // Running header on continuation pages
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`${brandName}  |  ${(data.subject || '').toUpperCase()} - PAPER 2 (${data.year || ''})`, margin, 12);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(margin, 14, pageWidth - margin, 14);
      currentY = 20;
    }
  };

  printHeader(1);

  // Render Questions
  (data.questions || []).forEach((q, qIdx) => {
    const qNumber = q.id || (qIdx + 1);
    const qTotalMarks = (q.subparts || []).reduce((sum, s) => sum + (Number(s.marks) || 0), 0);

    // Calculate approximate space needed for question header + first prompt
    if (currentY > pageHeight - 35) {
      doc.addPage();
      printHeader(doc.getNumberOfPages());
    }

    // Question Heading
    doc.setFillColor(241, 245, 249); // slate-100
    doc.roundedRect(margin, currentY - 3, contentWidth, 7, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(`QUESTION ${qNumber}`, margin + 3, currentY + 2);
    
    if (qTotalMarks > 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(`[Total: ${qTotalMarks} Marks]`, pageWidth - margin - 3, currentY + 2, { align: 'right' });
    }
    currentY += 8;

    // Main Question Text (if any)
    if (q.text && q.text.trim()) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);

      const mainTextLines = doc.splitTextToSize(q.text.trim(), contentWidth - 4);
      if (currentY + (mainTextLines.length * 4.2) > pageHeight - 25) {
        doc.addPage();
        printHeader(doc.getNumberOfPages());
      }
      doc.text(mainTextLines, margin + 2, currentY);
      currentY += (mainTextLines.length * 4.2) + 2;
    }

    // Question Code Snippet (if any)
    if (q.codeSnippet && q.codeSnippet.trim()) {
      doc.setFont('courier', 'normal');
      doc.setFontSize(8.5);
      const codeLines = doc.splitTextToSize(q.codeSnippet.trim(), contentWidth - 12);
      const codeBoxHeight = (codeLines.length * 3.8) + 4;

      if (currentY + codeBoxHeight > pageHeight - 25) {
        doc.addPage();
        printHeader(doc.getNumberOfPages());
      }

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin + 4, currentY, contentWidth - 8, codeBoxHeight, 1, 1, 'FD');
      doc.setTextColor(15, 23, 42);
      doc.text(codeLines, margin + 8, currentY + 3.5);
      currentY += codeBoxHeight + 3;
    }

    // Subparts
    (q.subparts || []).forEach((sub, sIdx) => {
      const subLabel = sub.label || `(${String.fromCharCode(97 + sIdx)})`;
      const subMarks = Number(sub.marks) || 0;
      const markText = `[${subMarks} mark${subMarks === 1 ? '' : 's'}]`;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.2);
      const subTextLines = doc.splitTextToSize(sub.text.trim(), contentWidth - 36);
      const subHeight = (subTextLines.length * 4.1) + 2;

      if (currentY + subHeight > pageHeight - 25) {
        doc.addPage();
        printHeader(doc.getNumberOfPages());
      }

      // Subpart Label
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(subLabel, margin + 4, currentY);

      // Subpart Text
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text(subTextLines, margin + 12, currentY);

      // Marks aligned right
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 118, 110); // teal-700
      doc.text(markText, pageWidth - margin - 3, currentY, { align: 'right' });

      currentY += subHeight;

      // Subpart code snippet (if any)
      if (sub.codeSnippet && sub.codeSnippet.trim()) {
        doc.setFont('courier', 'normal');
        doc.setFontSize(8.2);
        const subCodeLines = doc.splitTextToSize(sub.codeSnippet.trim(), contentWidth - 24);
        const subCodeBoxHeight = (subCodeLines.length * 3.6) + 4;

        if (currentY + subCodeBoxHeight > pageHeight - 25) {
          doc.addPage();
          printHeader(doc.getNumberOfPages());
        }

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin + 12, currentY, contentWidth - 16, subCodeBoxHeight, 1, 1, 'FD');
        doc.setTextColor(15, 23, 42);
        doc.text(subCodeLines, margin + 16, currentY + 3.5);
        currentY += subCodeBoxHeight + 2;
      }
    });

    currentY += 4;
  });

  // End of paper note
  if (currentY > pageHeight - 25) {
    doc.addPage();
    printHeader(doc.getNumberOfPages());
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('★★★  END OF EXAMINATION QUESTION PAPER  ★★★', pageWidth / 2, currentY + 6, { align: 'center' });

  // Footers on every page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`© ${brandName} Examination Practice System`, margin, pageHeight - 8);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  const blob = doc.output('blob');
  doc.save(filename);
  return { blob, filename };
};

