'use client';

import { Clock, CheckCircle, User as UserIcon, CalendarDays, ChevronLeft, UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';
import { sampleMeals, sampleUserSelections } from '@/utils/sampleData';
import type { Meal, UserSelectionData } from '@/types';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function ReviewSubmit() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Sample data for the review
  const selectedMeal: Meal = { ...sampleMeals[0], name: "Rice with Chicken Curry" };
  const userSelections: UserSelectionData[] = sampleUserSelections;

  const handleSubmit = () => {
    setIsSubmitted(true);
    // Navigate to success page after a short delay
    setTimeout(() => {
      window.location.href = '/success_submit';
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar title="Review & Submit" step="Step 3 of 3" backHref="/select_names/select_menu" />
      
      <main className="flex justify-center items-center px-4 py-8">
        <div className="max-w-2xl w-full">

        {/* Deadline Alert */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-orange-600 mr-3" />
            <div>
              <p className="font-medium text-orange-900">Submission deadline</p>
              <p className="text-sm text-orange-700">2026-01-12 16:00</p>
            </div>
          </div>
        </div>

        {/* Selection Summary */}
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="font-semibold text-lg text-black mb-4">Summary of selections</h2>
          
          {/* Meal Info */}
          <div className="flex items-center mb-6 pb-6 border-b">
            <div className="bg-orange-100 p-3 rounded-lg mr-4">
              <UtensilsCrossed className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Tomorrow's Menu</p>
              <h3 className="font-semibold text-xl text-black">{selectedMeal.name}</h3>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <CalendarDays className="w-4 h-4 mr-1" />
                Tuesday, January 13
              </div>
            </div>
          </div>
          
          {/* User Selections */}
          <div className="space-y-4">
            {userSelections.map((selection) => (
              <div key={selection.user.id} className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">{selection.user.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-black">{selection.user.name}</p>
                    <p className="text-sm text-gray-500">{selection.user.department}</p>
                  </div>
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selection.optIn 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {selection.optIn ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Yes
                    </>
                  ) : (
                    'No'
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button 
          onClick={handleSubmit}
          disabled={isSubmitted}
          className={`w-full rounded-lg h-12 flex items-center justify-center font-medium transition-colors ${
            !isSubmitted 
              ? 'bg-black hover:bg-gray-900 text-white cursor-pointer' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSubmitted ? 'Submitting...' : 'Submit Selections'}
        </button>

        {/* Edit Selections Link */}
        {!isSubmitted && (
          <div className="text-center mt-4">
            <Link href="/select_names/select_menu" className="text-gray-600 hover:text-black text-sm underline">
              Edit selections
            </Link>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}