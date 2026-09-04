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
import { GeneratedPaperData, SchoolBrandingSettings, DEFAULT_SCHOOL_BRANDING } from '../types/paperGenerator';

/**
 * Creates and downloads a genuine Microsoft Word (.docx) examination paper.
 * Filename format: [SCHOOL]_[SUBJECT]_PAPER_2_[YEAR].docx
 */
export async function generateGCEPaper2Docx(
  data: GeneratedPaperData,
  options?: { appName?: string; logoUrl?: string; branding?: SchoolBrandingSettings }
): Promise<{ blob: Blob; filename: string }> {
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
  const filename = `${schoolPrefix}_${cleanSubject}_PAPER_2_${data.year || new Date().getFullYear()}.docx`;

  const totalCalculatedMarks = (data.questions || []).reduce(
    (sum, q) => sum + (q.subparts || []).reduce((sSum, s) => sSum + (Number(s.marks) || 0), 0),
    0
  );
  const totalPaperMarks = data.targetTotalMarks || data.totalCalculatedMarks || totalCalculatedMarks || 100;

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
      // Row 1: Subject & Exam Year
      new TableRow({
        children: [
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            borders: borderNone,
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'SUBJECT: ', bold: true, size: 20, color: '0F172A' }),
                  new TextRun({ text: (data.subject || '').toUpperCase(), size: 20, color: '334155' })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            borders: borderNone,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: 'EXAM YEAR: ', bold: true, size: 20, color: '0F172A' }),
                  new TextRun({ text: String(data.year || new Date().getFullYear()), size: 20, color: '334155' })
                ]
              })
            ]
          })
        ]
      }),
      // Row 2: Paper & Duration
      new TableRow({
        children: [
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            borders: borderNone,
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'PAPER: ', bold: true, size: 20, color: '0F172A' }),
                  new TextRun({ text: (data.paperType || data.title || 'Paper 2').toUpperCase(), size: 20, color: '334155' })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            borders: borderNone,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: 'DURATION: ', bold: true, size: 20, color: '0F172A' }),
                  new TextRun({ text: (data.timeAllowed || '3 Hours').toUpperCase(), size: 20, color: '334155' })
                ]
              })
            ]
          })
        ]
      }),
      // Row 3: Level & Total Marks
      new TableRow({
        children: [
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            borders: borderNone,
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'LEVEL: ', bold: true, size: 20, color: '0F172A' }),
                  new TextRun({ text: (data.level || 'Advanced Level').toUpperCase(), size: 20, color: '334155' })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            borders: borderNone,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: 'TOTAL MARKS: ', bold: true, size: 20, color: '0F172A' }),
                  new TextRun({ text: `${totalPaperMarks} MARKS`, bold: true, size: 20, color: '0F766E' })
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
          size: 22,
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
        spacing: { before: 50, after: 50 },
        children: [
          new TextRun({ text: `${idx + 1}. `, bold: true, size: 19, color: '334155' }),
          new TextRun({ text: inst, size: 19, color: '334155' })
        ]
      })
    );
  });

  // Divider paragraph
  instructionParagraphs.push(
    new Paragraph({
      spacing: { before: 180, after: 260 },
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
            size: 25,
            color: '0F172A'
          }),
          new TextRun({
            text: `   [Total: ${qTotalMarks} Marks]`,
            italics: true,
            size: 21,
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
              new TextRun({ text: line, size: 21, color: '1E293B' })
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
                text: codeLine,
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
      const subLines = (sub.text || '').split('\n');

      questionParagraphs.push(
        new Paragraph({
          spacing: { before: 120, after: 60 },
          indent: { left: 240 },
          children: [
            new TextRun({
              text: `${subLabel} `,
              bold: true,
              size: 21,
              color: '0F172A'
            }),
            new TextRun({
              text: subLines[0] || '',
              size: 21,
              color: '1E293B'
            }),
            new TextRun({
              text: `   [${subMarks} mark${subMarks === 1 ? '' : 's'}]`,
              bold: true,
              size: 20,
              color: '0F766E' // Teal
            })
          ]
        })
      );

      // Remaining lines of subpart
      if (subLines.length > 1) {
        subLines.slice(1).forEach(remainingLine => {
          questionParagraphs.push(
            new Paragraph({
              spacing: { before: 40, after: 40 },
              indent: { left: 440 },
              children: [
                new TextRun({ text: remainingLine, size: 21, color: '1E293B' })
              ]
            })
          );
        });
      }

      // Subpart Code Snippet (if any)
      if (sub.codeSnippet && sub.codeSnippet.trim()) {
        const subCodeLines = sub.codeSnippet.split('\n');
        subCodeLines.forEach(codeLine => {
          questionParagraphs.push(
            new Paragraph({
              spacing: { before: 20, after: 20 },
              indent: { left: 520 },
              shading: {
                type: ShadingType.CLEAR,
                fill: 'F8FAFC'
              },
              children: [
                new TextRun({
                  text: codeLine,
                  font: 'Courier New',
                  size: 18,
                  color: '0F172A'
                })
              ]
            })
          );
        });
      }
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              bottom: 1000,
              left: 1100,
              right: 1100
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 0, after: 160 },
                children: [
                  ...(watermarkConfig.enabled ? [
                    new TextRun({
                      text: `[ ${watermarkConfig.text || 'OFFICIAL EXAMINATION PAPER'} ]    `,
                      size: 16,
                      color: 'CBD5E1'
                    })
                  ] : []),
                  new TextRun({
                    text: `${branding.schoolName}  •  ${branding.securityLabel || 'CONFIDENTIAL'}`,
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
                spacing: { before: 180, after: 0 },
                border: {
                  top: { style: BorderStyle.SINGLE, size: 6, color: 'E2E8F0' }
                },
                children: [
                  new TextRun({
                    text: `${branding.schoolName}  •  ${branding.securityLabel || 'CONFIDENTIAL • OFFICIAL EXAMINATION DOCUMENT'}        `,
                    size: 16,
                    color: '64748B'
                  }),
                  new TextRun({
                    text: 'Page ',
                    size: 16,
                    color: '64748B'
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    bold: true,
                    size: 16,
                    color: '0F172A'
                  }),
                  new TextRun({
                    text: ' of ',
                    size: 16,
                    color: '64748B'
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    bold: true,
                    size: 16,
                    color: '0F172A'
                  })
                ]
              })
            ]
          })
        },
        children: [
          // Official School Letterhead
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({
                text: branding.schoolName.toUpperCase(),
                bold: true,
                size: 32,
                color: '0F2C59' // Deep Navy
              })
            ]
          }),
          ...(branding.motto ? [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 0, after: 40 },
              children: [
                new TextRun({
                  text: `"${branding.motto}"`,
                  italics: true,
                  size: 20,
                  color: '475569'
                })
              ]
            })
          ] : []),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 30 },
            children: [
              new TextRun({
                text: `${branding.address || 'Yaoundé, Cameroon'}${branding.telephone ? `  •  Tel: ${branding.telephone}` : ''}`,
                size: 18,
                color: '64748B'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 120 },
            children: [
              new TextRun({
                text: `Email: ${branding.email || 'info@edulpha.academy'}  •  Web: ${branding.website || 'www.edulpha.academy'}`,
                size: 18,
                color: '64748B'
              })
            ]
          }),
          // Letterhead double divider
          new Paragraph({
            spacing: { before: 0, after: 120 },
            border: {
              bottom: { style: BorderStyle.DOUBLE, size: 12, color: '0F2C59' }
            }
          }),
          // Examination Board & Level
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 60 },
            children: [
              new TextRun({
                text: (branding.examinationBoardText || 'CAMEROON GENERAL CERTIFICATE OF EDUCATION BOARD').toUpperCase(),
                bold: true,
                size: 23,
                color: '1E293B'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 160 },
            children: [
              new TextRun({
                text: `${(data.level || 'ADVANCED LEVEL').toUpperCase()} EXAMINATION`,
                bold: true,
                size: 21,
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
  options?: { appName?: string; logoUrl?: string; branding?: SchoolBrandingSettings }
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
