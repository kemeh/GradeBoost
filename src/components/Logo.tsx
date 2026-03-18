import React from 'react';

export const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      {/* Chart Bars */}
      <rect x="20" y="60" width="12" height="20" rx="2" fill="#d9232e" />
      <rect x="38" y="45" width="12" height="35" rx="2" fill="#0056b3" />
      <rect x="56" y="35" width="12" height="45" rx="2" fill="#d9232e" />
      
      {/* Arrow */}
      <path d="M20 50L45 30L75 45L85 15" stroke="#0056b3" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M75 15H85V25" stroke="#0056b3" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Bottom Curve */}
      <path d="M15 65C15 80 35 90 55 90C75 90 85 80 85 70" stroke="#0056b3" strokeWidth="4" strokeLinecap="round" />
      <path d="M80 65L85 70L90 65" stroke="#0056b3" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div className="flex font-black text-2xl tracking-tighter">
      <span className="text-[#0056b3]">Grade</span>
      <span className="text-[#d9232e]">Boost</span>
      <span className="text-[#0056b3]">60</span>
    </div>
  </div>
);
