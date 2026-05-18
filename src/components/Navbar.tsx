'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface NavbarProps {
  title: string;
  step: string;
  backHref?: string;
}

export default function Navbar({ title, step, backHref }: NavbarProps) {
  return (
    <nav className="bg-white px-3 sm:px-4 py-3 sm:py-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between gap-2 w-full bg-white border border-gray-200 rounded-full px-3 sm:px-6 py-2 sm:py-3 shadow-sm">
          {backHref ? (
            <Link href={backHref} className="flex items-center text-muted-text hover:text-main-text transition-colors min-w-0">
              <ChevronLeft className="w-5 h-5 mr-1 shrink-0" />
              <h1 className="font-bold text-base sm:text-xl text-main-text truncate">{title}</h1>
            </Link>
          ) : (
            <h1 className="font-bold text-base sm:text-xl text-main-text truncate min-w-0">{title}</h1>
          )}
          <span className="text-xs sm:text-sm text-muted-text bg-gray-100 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap shrink-0">{step}</span>
        </div>
      </div>
    </nav>
  );
}
