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
  title: string;
  timeAllowed: string;
  subject: string;
  year: number;
  questions: {
    id: number;
    text: string;
    subparts: {
      label: string;
      text: string;
      marks: number;
    }[];
  }[];
}

export const generateGCEPaper2PDF = async (data: GCEPaper2Data) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let currentY = 20;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('EDULPHA', pageWidth / 2, currentY, { align: 'center' });
  currentY += 8;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text('Smart Exam Practice System', pageWidth / 2, currentY, { align: 'center' });
  currentY += 12;

  doc.setDrawColor(226, 232, 240); // slate-200
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;

  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text(`SUBJECT: ${data.subject.toUpperCase()}`, margin, currentY);
  doc.text(`YEAR: ${data.year}`, pageWidth - margin - 30, currentY);
  currentY += 7;
  
  doc.text(`PAPER: ${data.title.toUpperCase()}`, margin, currentY);
  currentY += 7;

  doc.text(`DURATION: ${data.timeAllowed.toUpperCase()}`, margin, currentY);
  currentY += 12;

  // Instructions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('INSTRUCTIONS TO CANDIDATES', margin, currentY);
  currentY += 7;
  
  doc.setFont('helvetica', 'normal');
  const instructions = [
    'Answer ALL questions or as specified in the section instructions.',
    'All questions carry equal marks unless otherwise stated.',
    'Credit will be given for clear working, algorithms, and explanations where appropriate.',
    'You are reminded of the need for good English and orderly presentation in your answers.'
  ];

  instructions.forEach((inst, i) => {
    doc.text(`${i + 1}. ${inst}`, margin + 5, currentY);
    currentY += 6;
  });
  currentY += 10;

  // Questions
  data.questions.forEach((q, qIdx) => {
    // Check for new page
    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`${q.id}.`, margin, currentY);
    
    const mainTextLines = doc.splitTextToSize(q.text, contentWidth - 10);
    doc.text(mainTextLines, margin + 10, currentY);
    currentY += (mainTextLines.length * 6) + 5;

    q.subparts.forEach((sub) => {
      if (currentY > pageHeight - 30) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont('helvetica', 'normal');
      const subLabel = sub.label;
      const subTextLines = doc.splitTextToSize(sub.text, contentWidth - 25);
      
      doc.text(subLabel, margin + 15, currentY);
      doc.text(subTextLines, margin + 25, currentY);
      
      // Marks
      doc.setFont('helvetica', 'bold');
      doc.text(`(${sub.marks} marks)`, pageWidth - margin - 20, currentY + (subTextLines.length * 6) - 6);
      
      currentY += (subTextLines.length * 6) + 4;
    });

    currentY += 10;
  });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  doc.save(`GCE_AL_${data.subject.replace(/\s+/g, '_')}_Paper2_${data.year}.pdf`);
};
