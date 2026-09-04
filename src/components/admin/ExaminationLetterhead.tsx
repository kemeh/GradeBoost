import React from 'react';
import { SchoolBrandingSettings, DEFAULT_SCHOOL_BRANDING } from '../../types/paperGenerator';
import { Shield, Award, School } from 'lucide-react';

interface ExaminationWatermarkProps {
  branding?: SchoolBrandingSettings;
  year?: number;
}

export const ExaminationWatermark: React.FC<ExaminationWatermarkProps> = ({ branding, year }) => {
  const currentBranding = branding || DEFAULT_SCHOOL_BRANDING;
  const watermark = currentBranding.watermark || DEFAULT_SCHOOL_BRANDING.watermark!;

  if (watermark.enabled === false) return null;

  const opacity = watermark.opacity ?? 0.08;
  const rotation = watermark.rotation ?? -35;
  const primaryText = watermark.text || 'OFFICIAL EXAMINATION PAPER';
  const secondaryText = watermark.secondaryText || currentBranding.schoolName;
  const examYear = watermark.academicYear || year || new Date().getFullYear();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
      style={{ opacity }}
    >
      <div
        className="flex flex-col items-center justify-center text-center transform transition-transform"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* Academic Seal SVG Graphic */}
        <svg
          className="w-72 h-72 md:w-96 md:h-96 text-slate-800"
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Ring */}
          <circle cx="200" cy="200" r="185" stroke="currentColor" strokeWidth="4" strokeDasharray="6 4" />
          <circle cx="200" cy="200" r="172" stroke="currentColor" strokeWidth="2" />
          
          {/* Inner Ring */}
          <circle cx="200" cy="200" r="125" stroke="currentColor" strokeWidth="3" />
          <circle cx="200" cy="200" r="115" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          
          {/* Central Emblems */}
          <path
            d="M200 145 L208 165 L230 166 L213 180 L219 201 L200 188 L181 201 L187 180 L170 166 L192 165 Z"
            fill="currentColor"
            opacity="0.6"
          />
          <path
            d="M200 215 L205 228 L218 229 L208 238 L212 251 L200 243 L188 251 L192 238 L182 229 L195 228 Z"
            fill="currentColor"
            opacity="0.4"
          />
        </svg>

        {/* Diagonal Watermark Typography */}
        <div className="absolute inset-0 flex flex-col items-center justify-center font-serif text-slate-900 leading-tight px-4">
          <div className="text-xl md:text-2xl font-black tracking-widest uppercase">
            {primaryText}
          </div>
          <div className="text-xs md:text-sm font-semibold tracking-wider text-slate-700 mt-1 uppercase">
            {secondaryText}
          </div>
          <div className="text-[10px] md:text-xs font-mono tracking-widest text-slate-600 mt-1">
            ★ SESSION {examYear} • SECURE PAPER ★
          </div>
        </div>
      </div>
    </div>
  );
};

interface ExaminationLetterheadProps {
  branding?: SchoolBrandingSettings;
  paperInfo: {
    subject: string;
    paperType?: string;
    title?: string;
    year: number;
    level?: string;
    timeAllowed?: string;
    totalMarks?: number;
    instructions?: string[];
  };
}

export const ExaminationLetterhead: React.FC<ExaminationLetterheadProps> = ({
  branding,
  paperInfo
}) => {
  const brand = branding || DEFAULT_SCHOOL_BRANDING;
  const examYear = paperInfo.year || new Date().getFullYear();
  const totalMarks = paperInfo.totalMarks || 100;

  const defaultInstructions = [
    'Answer ALL questions or as specified in the examination instructions.',
    'All questions carry equal marks unless otherwise indicated.',
    'Write your answers clearly and orderly in the examination booklet or response sheets provided.',
    'Credit will be given for clear algorithms, correct logic, legible diagrams, and neat presentation.',
    'Mathematical and non-programmable calculators may be used where appropriate.'
  ];

  const instructions = paperInfo.instructions && paperInfo.instructions.length > 0
    ? paperInfo.instructions
    : defaultInstructions;

  return (
    <header className="relative z-10 font-sans border-b border-slate-300 pb-5 mb-6 text-slate-900">
      {/* Top Identity Block */}
      <div className="text-center space-y-1">
        {/* School Crest / Logo */}
        <div className="flex items-center justify-center gap-3">
          {brand.schoolLogoUrl ? (
            <img
              src={brand.schoolLogoUrl}
              alt={brand.schoolName}
              className="h-12 w-auto max-w-[140px] object-contain"
              onError={(e) => {
                // Fallback to vector icon if image fails
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-lg shadow-sm">
              <School className="w-5 h-5 text-amber-400" />
            </div>
          )}
        </div>

        {/* Official School Name */}
        <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#0F2C59] font-serif uppercase">
          {brand.schoolName}
        </h1>

        {/* School Motto */}
        {brand.motto && (
          <p className="text-xs md:text-sm italic font-serif text-slate-600">
            &ldquo;{brand.motto}&rdquo;
          </p>
        )}

        {/* Contact and Location details */}
        <div className="text-[11px] text-slate-500 font-sans flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 pt-0.5">
          {brand.address && <span>{brand.address}</span>}
          {brand.telephone && (
            <>
              <span className="hidden sm:inline">•</span>
              <span>Tel: {brand.telephone}</span>
            </>
          )}
          {brand.email && (
            <>
              <span className="hidden sm:inline">•</span>
              <span>Email: {brand.email}</span>
            </>
          )}
          {brand.website && (
            <>
              <span className="hidden sm:inline">•</span>
              <span>Web: {brand.website}</span>
            </>
          )}
        </div>
      </div>

      {/* Official Letterhead Decorative Double Divider */}
      <div className="my-3 space-y-[2px]">
        <div className="h-[2px] bg-[#0F2C59]" />
        <div className="h-[1px] bg-slate-300" />
      </div>

      {/* Examination Board and Session Banner */}
      <div className="text-center space-y-0.5 my-2">
        <h2 className="text-sm md:text-base font-bold tracking-wide text-slate-900 uppercase">
          {brand.examinationBoardText || 'CAMEROON GENERAL CERTIFICATE OF EDUCATION BOARD'}
        </h2>
        <div className="text-xs md:text-sm font-bold text-amber-700 tracking-wider uppercase">
          {(paperInfo.level || 'ADVANCED LEVEL').toUpperCase()} EXAMINATION
        </div>
        {brand.examinationCentreNumber && (
          <div className="text-[11px] font-mono text-slate-500 tracking-widest">
            {brand.examinationCentreNumber}
          </div>
        )}
      </div>

      {/* Examination Information Box (6 fields) */}
      <div className="my-3 bg-slate-50 border border-slate-300 rounded text-xs leading-relaxed divide-y divide-slate-200">
        {/* Row 1 */}
        <div className="grid grid-cols-2 divide-x divide-slate-200 px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900">SUBJECT:</span>
            <span className="font-semibold text-slate-800 uppercase">{paperInfo.subject}</span>
          </div>
          <div className="flex items-center justify-end gap-1.5 text-right pl-3">
            <span className="font-bold text-slate-900">EXAM YEAR:</span>
            <span className="font-mono font-semibold text-slate-800">{examYear}</span>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 divide-x divide-slate-200 px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900">PAPER:</span>
            <span className="font-semibold text-slate-800 uppercase">
              {paperInfo.paperType || paperInfo.title || 'Paper 2'}
            </span>
          </div>
          <div className="flex items-center justify-end gap-1.5 text-right pl-3">
            <span className="font-bold text-slate-900">DURATION:</span>
            <span className="font-semibold text-slate-800 uppercase">
              {paperInfo.timeAllowed || '3 Hours'}
            </span>
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-2 divide-x divide-slate-200 px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900">LEVEL:</span>
            <span className="font-semibold text-slate-800 uppercase">
              {paperInfo.level || 'Advanced Level'}
            </span>
          </div>
          <div className="flex items-center justify-end gap-1.5 text-right pl-3">
            <span className="font-bold text-slate-900">TOTAL MARKS:</span>
            <span className="font-bold text-teal-700 font-mono text-sm">
              {totalMarks} MARKS
            </span>
          </div>
        </div>
      </div>

      {/* Candidate Instructions */}
      <div className="mt-3 pt-2 text-xs">
        <h3 className="font-bold uppercase tracking-wide text-slate-900 text-[11px] mb-1.5">
          INSTRUCTIONS TO CANDIDATES:
        </h3>
        <ol className="list-decimal list-outside pl-4 space-y-1 text-slate-700 leading-relaxed text-[11px]">
          {instructions.map((inst, idx) => (
            <li key={idx}>{inst}</li>
          ))}
        </ol>
      </div>
    </header>
  );
};

interface ExaminationContinuationHeaderProps {
  branding?: SchoolBrandingSettings;
  subject: string;
  paperType?: string;
  year?: number;
}

export const ExaminationContinuationHeader: React.FC<ExaminationContinuationHeaderProps> = ({
  branding,
  subject,
  paperType,
  year
}) => {
  const brand = branding || DEFAULT_SCHOOL_BRANDING;
  return (
    <div className="border-b border-slate-200 pb-1.5 mb-4 flex items-center justify-between text-[11px] text-slate-500 font-sans">
      <div>
        <span className="font-bold text-slate-700">{brand.schoolName}</span>
        <span className="mx-1.5 text-slate-300">|</span>
        <span className="uppercase">{subject} — {paperType || 'PAPER 2'} ({year || new Date().getFullYear()})</span>
      </div>
      <div className="font-bold text-slate-400 tracking-wider">
        {brand.securityLabel || 'CONFIDENTIAL'}
      </div>
    </div>
  );
};

interface ExaminationPageFooterProps {
  branding?: SchoolBrandingSettings;
  pageNumber?: number;
  totalPages?: number;
}

export const ExaminationPageFooter: React.FC<ExaminationPageFooterProps> = ({
  branding,
  pageNumber = 1,
  totalPages = 1
}) => {
  const brand = branding || DEFAULT_SCHOOL_BRANDING;
  return (
    <footer className="mt-8 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-sans gap-2">
      <div className="flex items-center gap-1.5">
        <Shield className="w-3.5 h-3.5 text-slate-400" />
        <span>{brand.schoolName}</span>
        <span>•</span>
        <span>{brand.securityLabel || 'CONFIDENTIAL • OFFICIAL EXAMINATION DOCUMENT'}</span>
      </div>
      <div className="font-semibold text-slate-600">
        Page {pageNumber} of {totalPages}
      </div>
      <div className="text-[10px] text-slate-400">
        Issued: {new Date().toLocaleDateString()}
      </div>
    </footer>
  );
};
