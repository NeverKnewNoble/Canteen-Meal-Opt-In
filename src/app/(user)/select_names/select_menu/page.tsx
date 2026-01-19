'use client';

import { CalendarDays, Clock, Check, X, ArrowRight, HandPlatter, Sparkles, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getTomorrowsMenu } from '@/utils/menu';
import { getMealsByMenuId } from '@/utils/meals';
import { createSelection, getSelectionsByUserId } from '@/utils/selections';
import { getAllDepartments } from '@/utils/departments';
import type { Meal, User, Menu } from '@/types';
import type { MealSelection, UserMealSelections } from '@/types/selection';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function SelectMenu() {
  // State for data
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [departments, setDepartments] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

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

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Track which user cards are expanded
  const [expandedUsers, setExpandedUsers] = useState<string[]>(
    selectedUsers.map(u => u.id) // All expanded by default
  );

  const toggleUserExpanded = (userId: string) => {
    setExpandedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Initialize selections: each user has selections for each meal
  const [userSelections, setUserSelections] = useState<UserMealSelections[]>([]);

  // Load existing selections when data is ready
  useEffect(() => {
    if (selectedUsers.length > 0 && meals.length > 0) {
      const initializeSelections = async () => {
        try {
          // Load existing selections for each user
          const selectionsPromises = selectedUsers.map(async (user) => {
            const existingSelections = await getSelectionsByUserId(user.id);
            const userMealSelections = meals.map(meal => {
              const existing = existingSelections.find(sel => 
                sel.meal_id === meal.id && menu && meals.some(m => m.id === meal.id)
              );
              return {
                mealId: meal.id,
                optIn: existing ? existing.opted_in : null
              };
            });
            return {
              userId: user.id,
              meals: userMealSelections
            };
          });

          const initializedSelections = await Promise.all(selectionsPromises);
          setUserSelections(initializedSelections);
        } catch (error) {
          console.error('Error loading selections:', error);
          // Fallback to empty selections
          const fallbackSelections = selectedUsers.map(user => ({
            userId: user.id,
            meals: meals.map(meal => ({ mealId: meal.id, optIn: null }))
          }));
          setUserSelections(fallbackSelections);
        }
      };
      initializeSelections();
    }
  }, [selectedUsers, meals, menu]);

  // Helper function to get department name
  const getDepartmentName = (departmentId: string | null | undefined) => {
    if (!departmentId) return 'No Department';
    return departments.get(departmentId) || 'Unknown Department';
  };

  const handleMealSelection = (userId: string, mealId: string, optIn: boolean) => {
    // Update local state
    setUserSelections(prev =>
      prev.map(userSel => {
        if (userSel.userId !== userId) return userSel;
        
        // If selecting YES to a meal, clear all other selections for this user
        if (optIn === true) {
          return {
            ...userSel,
            meals: userSel.meals.map(mealSel =>
              mealSel.mealId === mealId 
                ? { ...mealSel, optIn: true }
                : { ...mealSel, optIn: false }
            )
          };
        }
        
        // If selecting NO or skipping, just update this meal
        return {
          ...userSel,
          meals: userSel.meals.map(mealSel =>
            mealSel.mealId === mealId ? { ...mealSel, optIn } : mealSel
          )
        };
      })
    );

    // Save selections to localStorage
    const updatedSelections = userSelections.map(userSel => {
      if (userSel.userId !== userId) return userSel;
      
      const updatedMeals = userSel.meals.map(mealSel => {
        if (mealSel.mealId === mealId) {
          return { ...mealSel, optIn };
        }
        if (optIn === true && mealSel.mealId !== mealId) {
          return { ...mealSel, optIn: false };
        }
        return mealSel;
      });
      
      return { ...userSel, meals: updatedMeals };
    });
    
    localStorage.setItem('userMealSelections', JSON.stringify(updatedSelections));
  };

  const handleSkipMeal = (userId: string) => {
    const updatedSelections = userSelections.map(userSel => {
      if (userSel.userId !== userId) return userSel;
      return {
        ...userSel,
        meals: userSel.meals.map(mealSel => ({ ...mealSel, optIn: false }))
      };
    });
    
    setUserSelections(updatedSelections);
    localStorage.setItem('userMealSelections', JSON.stringify(updatedSelections));
  };

  const getMealSelection = (userId: string, mealId: string): boolean | null => {
    const userSel = userSelections.find(u => u.userId === userId);
    const mealSel = userSel?.meals.find(m => m.mealId === mealId);
    return mealSel?.optIn ?? null;
  };

  // Check if user has already selected a meal (optIn === true)
  const hasUserSelectedMeal = (userId: string) => {
    const userSel = userSelections.find(u => u.userId === userId);
    return userSel?.meals.some(m => m.optIn === true) ?? false;
  };

  // Check if all selections are complete (every user has either selected one meal or skipped all)
  const allSelectionsComplete = userSelections.every(userSel =>
    userSel.meals.every(mealSel => mealSel.optIn !== null)
  );

  // Count selected meals per user (should be max 1)
  const getSelectedCount = (userId: string) => {
    const userSel = userSelections.find(u => u.userId === userId);
    return userSel?.meals.filter(m => m.optIn === true).length ?? 0;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar title="Select Menu" step="Step 2 of 3" backHref="/select_names" />

      <main className="flex justify-center px-4 py-8">
        <div className="max-w-2xl w-full space-y-6">

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-text">Loading menu and users...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && (!menu || meals.length === 0) && (
          <div className="text-center py-12">
            <p className="text-red-500 font-medium">No menu available for tomorrow</p>
            <p className="text-muted-text text-sm mt-2">Please check back later or contact an administrator</p>
          </div>
        )}

        {/* Content */}
        {!loading && menu && meals.length > 0 && (
          <>
        {/* Header Card */}
        <div className="bg-primary rounded-2xl p-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-red-200" />
            <span className="text-red-200 text-xs font-medium uppercase tracking-wider">{menu.name}</span>
            <Sparkles className="w-4 h-4 text-red-200" />
          </div>
          <h1 className="text-xl font-bold text-white mb-3">Select Your Meals</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-red-100">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4" />
              <span>{new Date(menu.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="w-px h-4 bg-red-300/50" />
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>Closes {new Date(menu.deadline).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        {/* User Selections */}
        {selectedUsers.map((user) => {
          const isExpanded = expandedUsers.includes(user.id);
          const hasSelectedMeal = hasUserSelectedMeal(user.id);
          const userComplete = userSelections.find(u => u.userId === user.id)?.meals.every(m => m.optIn !== null);

          return (
            <div key={user.id} className="border border-gray-200 rounded-2xl overflow-hidden">
              {/* User Header - Clickable */}
              <button
                onClick={() => toggleUserExpanded(user.id)}
                className="w-full bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-main-text">{user.name}</p>
                    <p className="text-sm text-muted-text">{getDepartmentName(user.department)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-muted-text">Selected</p>
                    <p className={`text-lg font-semibold ${userComplete ? 'text-success' : 'text-primary'}`}>
                      {getSelectedCount(user.id)}/1
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-text transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Meals List - Collapsible */}
              <div
                className={`divide-y divide-gray-100 transition-all duration-200 overflow-hidden ${
                  isExpanded ? 'max-h-250 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                {meals.map((meal) => {
                  const selection = getMealSelection(user.id, meal.id);
                  const isYes = selection === true;
                  const isNo = selection === false;
                  const hideButtons = hasSelectedMeal && !isYes;

                  return (
                    <div key={meal.id} className="px-4 py-4">
                      <div className="flex items-start gap-3">
                        {/* Meal Icon */}
                        <div className="shrink-0 w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                          <HandPlatter className="w-5 h-5 text-primary" />
                        </div>

                        {/* Meal Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-main-text">{meal.name}</h3>
                          <p className="text-sm text-muted-text mt-0.5 line-clamp-1">{meal.description}</p>
                        </div>

                        {/* Yes/No Buttons - Hidden if user already selected a different meal */}
                        {!hideButtons ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleMealSelection(user.id, meal.id, true)}
                              className={`w-16 h-9 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                isYes
                                  ? 'bg-success text-white'
                                  : 'bg-gray-100 text-muted-text hover:bg-success/10 hover:text-success'
                              }`}
                            >
                              <Check className="w-4 h-4" />
                              Yes
                            </button>
                            <button
                              onClick={() => handleMealSelection(user.id, meal.id, false)}
                              className={`w-16 h-9 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                isNo
                                  ? 'bg-gray-600 text-white'
                                  : 'bg-gray-100 text-muted-text hover:bg-gray-200'
                              }`}
                            >
                              <X className="w-4 h-4" />
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-muted-text italic">Already selected</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Skip Meal Button - Only show if no meal selected yet */}
                {!hasSelectedMeal && (
                  <div className="px-4 py-3 bg-gray-50">
                    <button
                      onClick={() => handleSkipMeal(user.id)}
                      className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-muted-text hover:bg-gray-100 transition-colors"
                    >
                      Skip All Meals
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Review Selections Button */}
        <div>
          <Link href="/select_names/select_menu/review_submit" className="block">
            <button
              disabled={!allSelectionsComplete}
              className={`w-full rounded-xl h-12 flex items-center justify-center font-medium transition-colors cursor-pointer ${
                allSelectionsComplete
                  ? 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/25'
                  : 'bg-gray-200 text-muted-text cursor-not-allowed'
              }`}
            >
              Review Selections
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </Link>

          {allSelectionsComplete && (
            <p className="text-center text-sm text-success mt-3 font-medium">All selections complete</p>
          )}
        </div>
        </>
        )}

        </div>
      </main>
    </div>
  );
}