import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  Packer,
  Footer,
  Header,
  PageNumber,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType
} from 'docx';
import { GeneratedPaperData } from '../types/paperGenerator';

/**
 * Creates and downloads a genuine Microsoft Word (.docx) examination paper.
 * Filename format: EDULPHA_[SUBJECT]_PAPER_2_[YEAR].docx
 */
export async function generateGCEPaper2Docx(
  data: GeneratedPaperData,
  options?: { appName?: string; logoUrl?: string }
): Promise<{ blob: Blob; filename: string }> {
  const brandName = options?.appName || 'EDULPHA';
  const cleanSubject = (data.subject || 'COMPUTER_SCIENCE').toUpperCase().replace(/[^A-Z0-9_]/g, '_');
  const filename = `${brandName.toUpperCase()}_${cleanSubject}_PAPER_2_${data.year || new Date().getFullYear()}.docx`;

  const borderNone = {
    top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  };

  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 12, color: 'CBD5E1' },
      bottom: { style: BorderStyle.SINGLE, size: 12, color: 'CBD5E1' },
      left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideHorizontal: { style: BorderStyle.DOTTED, size: 4, color: 'E2E8F0' },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: borderNone,
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'SUBJECT: ', bold: true, size: 22, color: '0F172A' }),
                  new TextRun({ text: (data.subject || '').toUpperCase(), size: 22, color: '334155' })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'PAPER NUMBER: ', bold: true, size: 22, color: '0F172A' }),
                  new TextRun({ text: (data.paperType || 'Paper 2').toUpperCase(), size: 22, color: '334155' })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: borderNone,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: 'EXAMINATION YEAR: ', bold: true, size: 22, color: '0F172A' }),
                  new TextRun({ text: String(data.year || new Date().getFullYear()), size: 22, color: '334155' })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: 'TIME ALLOWED: ', bold: true, size: 22, color: '0F172A' }),
                  new TextRun({ text: (data.timeAllowed || '3 Hours').toUpperCase(), size: 22, color: '334155' })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  // Candidate Instructions
  const instructionParagraphs: Paragraph[] = [
    new Paragraph({
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text: 'INSTRUCTIONS TO CANDIDATES',
          bold: true,
          size: 24,
          color: '0F172A'
        })
      ]
    })
  ];

  const defaultInstructions = [
    'Answer ALL questions or as specified in your syllabus examination instructions.',
    'All questions carry equal marks unless otherwise indicated.',
    'Write your answers clearly and orderly in the spaces provided or standard answer booklet.',
    'Credit will be given for clear diagrams, concise reasoning, and neat presentation.',
    'Mathematical and non-programmable calculators may be used where appropriate.'
  ];

  const candidateInstructions = (data.instructions && data.instructions.length > 0)
    ? data.instructions
    : defaultInstructions;

  candidateInstructions.forEach((inst, idx) => {
    instructionParagraphs.push(
      new Paragraph({
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({ text: `${idx + 1}. `, bold: true, size: 20, color: '334155' }),
          new TextRun({ text: inst, size: 20, color: '334155' })
        ]
      })
    );
  });

  // Divider paragraph
  instructionParagraphs.push(
    new Paragraph({
      spacing: { before: 200, after: 280 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 12, color: '94A3B8' }
      }
    })
  );

  // Question sections
  const questionParagraphs: Paragraph[] = [];

  (data.questions || []).forEach((q, qIndex) => {
    const qNumber = q.id || (qIndex + 1);
    const qTotalMarks = (q.subparts || []).reduce((sum, s) => sum + (Number(s.marks) || 0), 0);

    // Question Heading
    questionParagraphs.push(
      new Paragraph({
        spacing: { before: 320, after: 120 },
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: `QUESTION ${qNumber}`,
            bold: true,
            size: 26,
            color: '0F172A'
          }),
          new TextRun({
            text: `   [Total: ${qTotalMarks} Marks]`,
            italics: true,
            size: 22,
            color: '64748B'
          })
        ]
      })
    );

    // Main Question Text (if present)
    if (q.text && q.text.trim()) {
      const lines = q.text.split('\n');
      lines.forEach(line => {
        questionParagraphs.push(
          new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [
              new TextRun({ text: line, size: 22, color: '1E293B' })
            ]
          })
        );
      });
    }

    // Code Snippet in Main Question (if any)
    if (q.codeSnippet && q.codeSnippet.trim()) {
      const codeLines = q.codeSnippet.split('\n');
      codeLines.forEach(codeLine => {
        questionParagraphs.push(
          new Paragraph({
            spacing: { before: 20, after: 20 },
            indent: { left: 360 },
            shading: {
              type: ShadingType.CLEAR,
              fill: 'F1F5F9'
            },
            children: [
              new TextRun({
                text: codeLine || ' ',
                font: 'Courier New',
                size: 19,
                color: '0F172A'
              })
            ]
          })
        );
      });
    }

    // Subparts
    (q.subparts || []).forEach((sub, sIndex) => {
      const subLabel = sub.label || `(${String.fromCharCode(97 + sIndex)})`;
      const subMarks = Number(sub.marks) || 0;

      questionParagraphs.push(
        new Paragraph({
          spacing: { before: 120, after: 60 },
          indent: { left: 240 },
          children: [
            new TextRun({
              text: `${subLabel} `,
              bold: true,
              size: 22,
              color: '0F172A'
            }),
            new TextRun({
              text: sub.text || '',
              size: 22,
              color: '1E293B'
            }),
            new TextRun({
              text: `   [${subMarks} mark${subMarks === 1 ? '' : 's'}]`,
              bold: true,
              size: 22,
              color: '0F766E'
            })
          ]
        })
      );

      // Subpart code snippet (if any)
      if (sub.codeSnippet && sub.codeSnippet.trim()) {
        const subCodeLines = sub.codeSnippet.split('\n');
        subCodeLines.forEach(codeLine => {
          questionParagraphs.push(
            new Paragraph({
              spacing: { before: 20, after: 20 },
              indent: { left: 480 },
              shading: {
                type: ShadingType.CLEAR,
                fill: 'F8FAFC'
              },
              children: [
                new TextRun({
                  text: codeLine || ' ',
                  font: 'Courier New',
                  size: 19,
                  color: '0F172A'
                })
              ]
            })
          );
        });
      }
    });

    // Spacing divider after each question
    questionParagraphs.push(
      new Paragraph({
        spacing: { before: 160, after: 200 }
      })
    );
  });

  // Create Docx Document
  const doc = new Document({
    creator: `${brandName} Examination Practice System`,
    title: `${data.subject} Paper 2 (${data.year})`,
    description: `Official ${data.level || 'Advanced Level'} examination paper created via ${brandName}.`,
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1200, // 20mm
              bottom: 1200,
              left: 1200,
              right: 1200
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${brandName} SMART EXAM PRACTICE  |  ${(data.subject || '').toUpperCase()} PAPER 2 (${data.year})`,
                    size: 16,
                    color: '94A3B8'
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `© ${brandName} Examination System  •  Page `,
                    size: 18,
                    color: '64748B'
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                    color: '64748B'
                  }),
                  new TextRun({
                    text: ' of ',
                    size: 18,
                    color: '64748B'
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 18,
                    color: '64748B'
                  })
                ]
              })
            ]
          })
        },
        children: [
          // Header titles
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 80 },
            children: [
              new TextRun({
                text: `${brandName.toUpperCase()}`,
                bold: true,
                size: 34,
                color: '0F2C59' // Deep Royal Blue
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 80 },
            children: [
              new TextRun({
                text: 'CAMEROON GENERAL CERTIFICATE OF EDUCATION BOARD',
                bold: true,
                size: 24,
                color: '1E293B'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 200 },
            children: [
              new TextRun({
                text: `${(data.level || 'ADVANCED LEVEL').toUpperCase()} EXAMINATION`,
                bold: true,
                size: 22,
                color: 'D97706' // Golden Amber
              })
            ]
          }),
          metaTable,
          ...instructionParagraphs,
          ...questionParagraphs,
          // End of paper marker
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
            children: [
              new TextRun({
                text: '★★★  END OF EXAMINATION QUESTION PAPER  ★★★',
                bold: true,
                size: 22,
                color: '475569'
              })
            ]
          })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  return { blob, filename };
}

/**
 * Triggers the browser download of the Word (.docx) file.
 */
export async function downloadGCEPaper2Docx(
  data: GeneratedPaperData,
  options?: { appName?: string; logoUrl?: string }
): Promise<string> {
  const { blob, filename } = await generateGCEPaper2Docx(data, options);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => window.URL.revokeObjectURL(url), 15000);
  return filename;
}
