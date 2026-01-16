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
    <nav className="bg-white px-4 py-4">
      <div className="max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-between w-full bg-white border border-gray-200 rounded-full px-6 py-3 shadow-sm">
          {backHref ? (
            <Link href={backHref} className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <ChevronLeft className="w-5 h-5 mr-1" />
              <h1 className="font-bold text-xl text-black">{title}</h1>
            </Link>
          ) : (
            <h1 className="font-bold text-xl text-black">{title}</h1>
          )}
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{step}</span>
        </div>
      </div>
    </nav>
  );
}
