import { jsPDF } from 'jspdf';
import { ExamQuestion } from '../types';
import { SchoolBrandingSettings, DEFAULT_SCHOOL_BRANDING } from '../types/paperGenerator';

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
  paperType?: string;
  timeAllowed: string;
  subject: string;
  year: number;
  level?: string;
  targetTotalMarks?: number;
  totalCalculatedMarks?: number;
  brandingSnapshot?: SchoolBrandingSettings;
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
  options?: { appName?: string; logoUrl?: string; branding?: SchoolBrandingSettings }
): Promise<{ blob: Blob; filename: string }> => {
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait'
  });

  const branding: SchoolBrandingSettings = 
    data.brandingSnapshot || 
    options?.branding || 
    {
      ...DEFAULT_SCHOOL_BRANDING,
      schoolName: options?.appName ? `${options.appName.toUpperCase()} INTERNATIONAL ACADEMY` : DEFAULT_SCHOOL_BRANDING.schoolName,
      schoolLogoUrl: options?.logoUrl || DEFAULT_SCHOOL_BRANDING.schoolLogoUrl
    };

  const watermarkConfig = branding.watermark || DEFAULT_SCHOOL_BRANDING.watermark!;
  const cleanSubject = (data.subject || 'COMPUTER_SCIENCE').toUpperCase().replace(/[^A-Z0-9_]/g, '_');
  const schoolPrefix = branding.schoolName.replace(/[^A-Z0-9]/gi, '_').toUpperCase().substring(0, 16);
  const filename = `${schoolPrefix}_${cleanSubject}_PAPER_2_${data.year || new Date().getFullYear()}.pdf`;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - (margin * 2);
  let currentY = 14;

  const totalCalculatedMarks = (data.questions || []).reduce(
    (sum, q) => sum + (q.subparts || []).reduce((sSum, s) => sSum + (Number(s.marks) || 0), 0),
    0
  );
  const totalPaperMarks = data.targetTotalMarks || data.totalCalculatedMarks || totalCalculatedMarks || 100;

  // Draw subtle, non-intrusive repeating watermark across page
  const drawWatermark = () => {
    if (watermarkConfig.enabled === false) return;

    try {
      const centerX = pageWidth / 2;
      const centerY = pageHeight / 2;
      const angle = watermarkConfig.rotation ?? -35;
      
      // Light faint watermark tint
      const opacity = watermarkConfig.opacity ?? 0.09;
      // High gray value = low contrast/opacity on white background
      const gray = Math.round(255 - (opacity * 135));
      
      doc.saveGraphicsState();
      doc.setDrawColor(gray, gray + 2, gray + 5);
      doc.setTextColor(gray, gray + 2, gray + 5);
      doc.setLineWidth(0.4);

      // Academic seal concentric circles
      doc.circle(centerX, centerY, 58, 'S');
      doc.circle(centerX, centerY, 54, 'S');
      doc.circle(centerX, centerY, 38, 'S');

      // Primary watermark text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text(
        (watermarkConfig.text || 'OFFICIAL EXAMINATION PAPER').toUpperCase(),
        centerX,
        centerY - 6,
        { align: 'center', angle }
      );

      // Secondary watermark text
      doc.setFontSize(13);
      doc.text(
        (watermarkConfig.secondaryText || branding.schoolName).toUpperCase(),
        centerX,
        centerY + 3,
        { align: 'center', angle }
      );

      // Academic Year line
      doc.setFontSize(10);
      doc.text(
        `★ ACADEMIC YEAR ${data.year || new Date().getFullYear()} ★`,
        centerX,
        centerY + 11,
        { align: 'center', angle }
      );

      doc.restoreGraphicsState();
    } catch (_) {
      // Ignore graphics state issues if any
    }
  };

  // Header function for pages
  const printHeader = (pageNum: number) => {
    // Watermark behind content on every page
    drawWatermark();

    if (pageNum === 1) {
      currentY = 14;

      // School Name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(15, 44, 89); // Deep Navy #0F2C59
      doc.text(branding.schoolName.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
      currentY += 4.5;

      // School Motto
      if (branding.motto) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105); // Slate-600
        doc.text(`"${branding.motto}"`, pageWidth / 2, currentY, { align: 'center' });
        currentY += 4.2;
      }

      // Address & Phone
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      doc.setTextColor(100, 116, 139); // Slate-500
      const addressLine = `${branding.address || 'Yaoundé, Cameroon'}${branding.telephone ? `  •  Tel: ${branding.telephone}` : ''}`;
      doc.text(addressLine, pageWidth / 2, currentY, { align: 'center' });
      currentY += 3.6;

      // Email & Website
      const contactLine = `Email: ${branding.email || 'info@edulpha.academy'}  •  Web: ${branding.website || 'www.edulpha.academy'}`;
      doc.text(contactLine, pageWidth / 2, currentY, { align: 'center' });
      currentY += 4.2;

      // Letterhead decorative double divider
      doc.setDrawColor(15, 44, 89); // Deep Navy
      doc.setLineWidth(0.6);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      doc.setDrawColor(203, 213, 225); // Slate-300
      doc.setLineWidth(0.2);
      doc.line(margin, currentY + 0.8, pageWidth - margin, currentY + 0.8);
      currentY += 5;

      // Examination Board Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(30, 41, 59); // Slate-800
      doc.text((branding.examinationBoardText || 'CAMEROON GENERAL CERTIFICATE OF EDUCATION BOARD').toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
      currentY += 4.5;

      // Examination Level
      doc.setFontSize(9.5);
      doc.setTextColor(180, 83, 9); // Amber-700
      doc.text(`${(data.level || 'ADVANCED LEVEL').toUpperCase()} EXAMINATION`, pageWidth / 2, currentY, { align: 'center' });
      currentY += 5;

      // Examination Information Box (6 fields)
      const metaBoxHeight = 21;
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.setFillColor(248, 250, 252); // slate-50
      doc.roundedRect(margin, currentY, contentWidth, metaBoxHeight, 1.5, 1.5, 'FD');

      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42); // slate-900

      // Row 1
      doc.setFont('helvetica', 'bold');
      doc.text('SUBJECT:', margin + 4, currentY + 5.5);
      doc.setFont('helvetica', 'normal');
      doc.text((data.subject || '').toUpperCase(), margin + 28, currentY + 5.5);

      doc.setFont('helvetica', 'bold');
      doc.text('EXAM YEAR:', pageWidth - margin - 40, currentY + 5.5);
      doc.setFont('helvetica', 'normal');
      doc.text(String(data.year || new Date().getFullYear()), pageWidth - margin - 4, currentY + 5.5, { align: 'right' });

      // Row 2
      doc.setFont('helvetica', 'bold');
      doc.text('PAPER:', margin + 4, currentY + 11.5);
      doc.setFont('helvetica', 'normal');
      doc.text((data.paperType || data.title || 'Paper 2').toUpperCase(), margin + 28, currentY + 11.5);

      doc.setFont('helvetica', 'bold');
      doc.text('DURATION:', pageWidth - margin - 40, currentY + 11.5);
      doc.setFont('helvetica', 'normal');
      doc.text((data.timeAllowed || '3 Hours').toUpperCase(), pageWidth - margin - 4, currentY + 11.5, { align: 'right' });

      // Row 3
      doc.setFont('helvetica', 'bold');
      doc.text('LEVEL:', margin + 4, currentY + 17.5);
      doc.setFont('helvetica', 'normal');
      doc.text((data.level || 'Advanced Level').toUpperCase(), margin + 28, currentY + 17.5);

      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL MARKS:', pageWidth - margin - 40, currentY + 17.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 118, 110); // Teal-700
      doc.text(`${totalPaperMarks} MARKS`, pageWidth - margin - 4, currentY + 17.5, { align: 'right' });

      currentY += metaBoxHeight + 5;

      // Instructions Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text('INSTRUCTIONS TO CANDIDATES', margin, currentY);
      currentY += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.2);
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
        currentY += (instLines.length * 3.6) + 0.8;
      });

      // Divider line
      currentY += 2;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 6;
    } else {
      // Page 2+ Running Compact Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(branding.schoolName.toUpperCase(), margin, 11);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      const subHead = `${(data.subject || '').toUpperCase()} — ${(data.paperType || data.title || 'PAPER 2').toUpperCase()} (${data.year || ''})`;
      doc.text(subHead, margin, 14.5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(148, 163, 184);
      doc.text(branding.securityLabel || 'CONFIDENTIAL', pageWidth - margin, 13, { align: 'right' });

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(margin, 16.5, pageWidth - margin, 16.5);
      currentY = 22;
    }
  };

  printHeader(1);

  // Render Questions
  (data.questions || []).forEach((q, qIdx) => {
    const qNumber = q.id || (qIdx + 1);
    const qTotalMarks = (q.subparts || []).reduce((sum, s) => sum + (Number(s.marks) || 0), 0);

    // Calculate approximate space needed for question header + prompt
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
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(
      `${branding.schoolName}  •  ${branding.securityLabel || 'CONFIDENTIAL • OFFICIAL EXAMINATION DOCUMENT'}`,
      margin,
      pageHeight - 7
    );
    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 7, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  }

  const blob = doc.output('blob');
  doc.save(filename);
  return { blob, filename };
};

