import React from 'react';
import { Menu, User } from 'lucide-react';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Menu & Title */}
        <div className="flex items-center gap-4">
          <button className="text-news-black p-1">
            <Menu className="w-6 h-6" />
          </button>
          
          {/* Logo Inline SVG for pixel-perfect rendering without external dependencies */}
          <svg width="100" height="24" viewBox="0 0 100 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-0.5 select-none pointer-events-none">
            {/* 'EL PA' */}
            <text x="0" y="20" fontFamily="'Times New Roman', Times, serif" fontSize="24" fontWeight="900" fill="#121212" letterSpacing="-1">EL PA</text>
            
            {/* 'I' */}
            <text x="66" y="20" fontFamily="'Times New Roman', Times, serif" fontSize="24" fontWeight="900" fill="#121212">I</text>
            
            {/* Blue Accent Mark (Tilde style wedge) */}
            <path d="M66 4 L76 2 L77 5 L66 7 Z" fill="#005596" />
            
            {/* 'S' */}
            <text x="78" y="20" fontFamily="'Times New Roman', Times, serif" fontSize="24" fontWeight="900" fill="#121212">S</text>
          </svg>
        </div>

        {/* Right: CTA & User */}
        <div className="flex items-center gap-3">
          <button className="bg-news-yellow hover:bg-[#ebd040] text-[10px] md:text-[11px] font-bold uppercase px-3 py-1.5 rounded-[1px] transition-colors tracking-wide text-black shadow-sm">
            Suscríbete
          </button>
          <button className="text-news-black p-1">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};