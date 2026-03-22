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
  doc.text('GradeBoost60', margin, 25);
  
  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.setFont('helvetica', 'bold');
  doc.text('Daily Drill by GradeBoost60', margin, 35);
  
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
  doc.text('© GradeBoost60 - Powered by Vertexon Technologies', margin, footerY);
  doc.text(`Downloaded: ${new Date().toLocaleDateString()}`, pageWidth - margin - 40, footerY);

  doc.save(`GradeBoost60_DailyDrill_Day${dayNumber || 'X'}_${question.id?.substring(0, 5) || 'export'}.pdf`);
};
