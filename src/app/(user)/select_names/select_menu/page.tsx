'use client';

import { CalendarDays, Clock, Users, ChevronLeft, UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';
import { sampleMeals, sampleUserSelections } from '@/utils/sampleData';
import type { Meal, User, UserSelection } from '@/types';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { 
  updateUserSelection, 
  initializeUserSelections, 
  areAllSelectionsComplete, 
  getTomorrowMeal 
} from '@/utils/selectMenuUtils';

export default function SelectMenu() {
  // Get selected users from localStorage or use sample data
  const [selectedUsers] = useState<User[]>([
    { id: '1', name: 'Lisa Anderson', department: 'Marketing' },
  ]);
  
  const [userSelections, setUserSelections] = useState<UserSelection[]>(
    initializeUserSelections(selectedUsers)
  );
  
  // Get tomorrow's meal
  const tomorrowMeal: Meal = getTomorrowMeal(sampleMeals);

  const handleUpdateUserSelection = (userId: string, optIn: boolean | null) => {
    setUserSelections(prev => updateUserSelection(prev, userId, optIn));
  };

  const allSelectionsComplete = areAllSelectionsComplete(userSelections);

  return (
    <div className="min-h-screen bg-white">
      <Navbar title="Select Menu" step="Step 2 of 3" backHref="/select_names" />
      
      <main className="flex justify-center items-center px-4 py-8">
        <div className="max-w-2xl w-full">

        {/* Tomorrow's Menu Card */}
        <div className="border border-gray-200 rounded-lg p-6 mb-8 bg-white shadow-sm">
          <div className="flex items-center mb-4">
            <div className="bg-orange-100 p-3 rounded-lg mr-4">
              <UtensilsCrossed className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Tomorrow's Menu</p>
              <h3 className="font-semibold text-xl text-black">{tomorrowMeal.name}</h3>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <CalendarDays className="w-4 h-4 mr-2" />
              Tuesday, January 13
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Deadline: 2026-01-12 16:00
            </div>
          </div>
        </div>

        {/* User Selections */}
        <div className="mb-8">
          <p className="text-sm text-gray-600 mb-4">Make selections for {selectedUsers.length} person{selectedUsers.length > 1 ? 's' : ''}</p>
          
          {selectedUsers.map((user, index) => {
            const userSelection = userSelections.find(s => s.userId === user.id);
            
            return (
              <div key={user.id} className="mb-6">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">{user.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-black">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.department}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 ml-11">
                  <button
                    onClick={() => handleUpdateUserSelection(user.id, true)}
                    className={`border-2 rounded-lg p-4 text-center transition-all ${
                      userSelection?.optIn === true
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 bg-white text-black hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg font-semibold mb-1">Yes</div>
                    <div className="text-sm opacity-80">Opt-in for meal</div>
                  </button>
                  
                  <button
                    onClick={() => handleUpdateUserSelection(user.id, false)}
                    className={`border-2 rounded-lg p-4 text-center transition-all ${
                      userSelection?.optIn === false
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 bg-white text-black hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg font-semibold mb-1">No</div>
                    <div className="text-sm opacity-80">Skip this meal</div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Review Selections Button */}
        <Link href="/select_names/select_menu/review_submit">
          <button 
            disabled={!allSelectionsComplete}
            className={`w-full rounded-lg h-12 flex items-center justify-center font-medium transition-colors ${
              allSelectionsComplete 
                ? 'bg-black hover:bg-gray-900 text-white cursor-pointer' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Review Selections
          </button>
        </Link>
        
        {allSelectionsComplete && (
          <p className="text-center text-sm text-green-600 mt-3">All selections complete</p>
        )}
        </div>
      </main>
    </div>
  );
}