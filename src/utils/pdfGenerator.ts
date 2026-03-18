import { jsPDF } from 'jspdf';

export const downloadExamPDF = (exam: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('GradeBoost 60 - GCE Mock Exam', pageWidth / 2, y, { align: 'center' });
  y += 15;

  doc.setFontSize(18);
  doc.text(exam.title, pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Category: ${exam.category} | Duration: ${exam.duration} Minutes`, pageWidth / 2, y, { align: 'center' });
  y += 15;

  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 15;

  // Questions
  exam.questions.forEach((q: any, index: number) => {
    // Check if we need a new page
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    const questionText = `${index + 1}. ${q.question}`;
    const splitQuestion = doc.splitTextToSize(questionText, pageWidth - (margin * 2));
    doc.text(splitQuestion, margin, y);
    y += (splitQuestion.length * 7);

    if (q.marks) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text(`(${q.marks} Marks)`, pageWidth - margin - 20, y - 2);
    }

    if (q.options && q.options.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      q.options.forEach((opt: string, optIdx: number) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        const optText = `   ${String.fromCharCode(65 + optIdx)}) ${opt}`;
        const splitOpt = doc.splitTextToSize(optText, pageWidth - (margin * 3));
        doc.text(splitOpt, margin, y);
        y += (splitOpt.length * 7);
      });
    }

    y += 10; // Space between questions
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 285, { align: 'center' });
  }

  doc.save(`${exam.title.replace(/\s+/g, '_')}_Questions.pdf`);
};
