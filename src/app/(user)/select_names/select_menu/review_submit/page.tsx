'use client';

import { Clock, Check, X, CalendarDays, Sparkles, ChevronDown, HandPlatter, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createSelection } from '@/utils/selections';
import { getTomorrowsMenu } from '@/utils/menu';
import { getMealsByMenuId } from '@/utils/meals';
import { getAllDepartments } from '@/utils/departments';
import type { User, Menu, Meal } from '@/types';
import type { MealSelection, UserMealSelectionsWithUser } from '@/types/selection';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function ReviewSubmit() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [departments, setDepartments] = useState<Map<string, string>>(new Map());
  const [userSelections, setUserSelections] = useState<UserMealSelectionsWithUser[]>([]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load selected users from localStorage
        const storedUsers = localStorage.getItem('selectedUsers');
        const users = storedUsers ? JSON.parse(storedUsers) : [];
        setSelectedUsers(users);

        // Get tomorrow's menu
        const tomorrowMenu = await getTomorrowsMenu();
        if (!tomorrowMenu) {
          console.error('No menu found for tomorrow');
          setLoading(false);
          return;
        }
        setMenu(tomorrowMenu);

        // Get meals for tomorrow's menu
        const menuMeals = await getMealsByMenuId(tomorrowMenu.id);
        setMeals(menuMeals);

        // Get departments for display
        const deptList = await getAllDepartments();
        const deptMap = new Map<string, string>();
        deptList.forEach(dept => {
          deptMap.set(dept.id, dept.name);
        });
        setDepartments(deptMap);

        // Load meal selections from localStorage
        const storedSelections = localStorage.getItem('userMealSelections');
        if (storedSelections) {
          const selections = JSON.parse(storedSelections);
          const userSelectionsData = selections.map((sel: any) => ({
            userId: sel.userId,
            user: users.find((u: User) => u.id === sel.userId) || { id: sel.userId, name: 'Unknown', department: null },
            meals: sel.meals
          }));
          setUserSelections(userSelectionsData);
        }

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Helper function to get department name
  const getDepartmentName = (departmentId: string | null | undefined) => {
    if (!departmentId) return 'No Department';
    return departments.get(departmentId) || 'Unknown Department';
  };

  // Track expanded users
  const [expandedUsers, setExpandedUsers] = useState<string[]>(
    userSelections.map(u => u.user.id)
  );

  const toggleUserExpanded = (userId: string) => {
    setExpandedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getMealName = (mealId: string) => {
    return meals.find(m => m.id === mealId)?.name || mealId;
  };

  const getYesCount = (userMeals: MealSelection[]) => {
    return userMeals.filter(m => m.optIn).length;
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);
    
    try {
      // Save all selections to database
      const selectionPromises = userSelections.flatMap(userSel =>
        userSel.meals
          .filter(mealSel => mealSel.optIn !== null)
          .map(mealSel =>
            createSelection({
              user_id: userSel.userId,
              meal_id: mealSel.mealId,
              opted_in: mealSel.optIn as boolean
            })
          )
      );

      await Promise.all(selectionPromises);
      
      // Clear localStorage after successful submission
      localStorage.removeItem('userMealSelections');
      localStorage.removeItem('selectedUsers');
      
      setTimeout(() => {
        window.location.href = '/success_submit';
      }, 1500);
    } catch (error) {
      console.error('Error submitting selections:', error);
      setIsSubmitted(false);
      // You might want to show an error message here
    }
  };

  // Calculate totals
  const totalYes = userSelections.reduce((acc, u) => acc + getYesCount(u.meals), 0);
  const totalSelections = userSelections.length * meals.length;

  return (
    <div className="min-h-screen bg-white">
      <Navbar title="Review & Submit" step="Step 3 of 3" backHref="/select_names/select_menu" />

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-text">Loading selections...</p>
        </div>
      )}

      {/* Content */}
      {!loading && (
        <main className="flex justify-center px-4 py-8">
          <div className="max-w-2xl w-full space-y-6">

        {/* Header Card */}
        <div className="bg-primary rounded-2xl p-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-red-200" />
            <span className="text-red-200 text-xs font-medium uppercase tracking-wider">{menu?.name || 'Review Selections'}</span>
            <Sparkles className="w-4 h-4 text-red-200" />
          </div>
          <h1 className="text-xl font-bold text-white mb-3">Confirm Your Choices</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-red-100">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4" />
              <span>{menu ? new Date(menu.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'Tomorrow'}</span>
            </div>
            <div className="w-px h-4 bg-red-300/50" />
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>Closes {menu ? new Date(menu.deadline).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '4:00 PM'}</span>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">{userSelections.length}</p>
            <p className="text-sm text-muted-text">People</p>
          </div>
          <div className="bg-success/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-success">{totalYes}</p>
            <p className="text-sm text-muted-text">Meals Opted In</p>
          </div>
        </div>

        {/* User Selection Cards */}
        {userSelections.map((userSel) => {
          const isExpanded = expandedUsers.includes(userSel.user.id);
          const yesCount = getYesCount(userSel.meals);

          return (
            <div key={userSel.user.id} className="border border-gray-200 rounded-2xl overflow-hidden">
              {/* User Header */}
              <button
                onClick={() => toggleUserExpanded(userSel.user.id)}
                className="w-full bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {userSel.user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-main-text">{userSel.user.name}</p>
                    <p className="text-sm text-muted-text">{getDepartmentName(userSel.user.department)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                      <Check className="w-3 h-3 mr-1" />
                      {yesCount}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-muted-text">
                      <X className="w-3 h-3 mr-1" />
                      {meals.length - yesCount}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-text transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Meals List */}
              <div
                className={`divide-y divide-gray-100 transition-all duration-200 overflow-hidden ${
                  isExpanded ? 'max-h-250 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                {userSel.meals.map((mealSel) => (
                  <div key={mealSel.mealId} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                        <HandPlatter className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-main-text">{getMealName(mealSel.mealId)}</span>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        mealSel.optIn
                          ? 'bg-success text-white'
                          : 'bg-gray-200 text-muted-text'
                      }`}
                    >
                      {mealSel.optIn ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Yes
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 mr-1" />
                          No
                        </>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Submit Button */}
        <div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitted}
            className={`w-full rounded-xl h-12 flex items-center justify-center font-medium transition-all cursor-pointer ${
              !isSubmitted
                ? 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/25'
                : 'bg-gray-200 text-muted-text cursor-not-allowed'
            }`}
          >
            {isSubmitted ? (
              'Submitting...'
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Selections
              </>
            )}
          </button>

          {!isSubmitted && (
            <div className="text-center mt-4">
              <Link href="/select_names/select_menu" className="text-primary hover:text-primary-hover text-sm font-medium">
                ← Edit selections
              </Link>
            </div>
          )}
        </div>

        </div>
      </main>
      )}
    </div>
  );
}