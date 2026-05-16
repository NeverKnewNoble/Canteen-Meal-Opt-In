'use client';

import { Search, UserPlus, ArrowRight, X, Plus, Lock, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAllUsers } from '@/utils/users';
import { getAllDepartments } from '@/utils/departments';
import { getAllMenus } from '@/utils/menu';
import { getAllMeals } from '@/utils/meals';
import { getAllSelections } from '@/utils/selections';
import { toast } from '@/components/alert';
import BulkOptInModal from '@/components/BulkOptInModal';
import type { Department } from '@/types/department';
import type { User } from '@/types';
import type { Menu } from '@/types/menu';
import type { Meal } from '@/types/meal';
import type { Selection } from '@/types/selection';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function SelectNames() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNames, setSelectedNames] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Map<string, string>>(new Map());
  const [menus, setMenus] = useState<Menu[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);

  // Fetch all users and departments on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, deptList, menusData, mealsData, selectionsData] = await Promise.all([
          getAllUsers(),
          getAllDepartments(),
          getAllMenus(),
          getAllMeals(),
          getAllSelections(),
        ]);

        setAllUsers(users);
        setMenus(menusData);
        setMeals(mealsData);
        setSelections(selectionsData);

        // Create department lookup map
        const deptMap = new Map<string, string>();
        deptList.forEach(dept => {
          deptMap.set(dept.id, dept.name);
        });
        setDepartments(deptMap);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const refreshSelections = async () => {
    try {
      const updated = await getAllSelections();
      setSelections(updated);
    } catch (error) {
      console.error('Failed to refresh selections:', error);
    }
  };

  const selectedUser = selectedNames[0];
  const canBulkOptIn = Boolean(selectedUser?.can_bulk_opt_in);

  // Helper function to get department name
  const getDepartmentName = (departmentId: string | null | undefined) => {
    if (!departmentId) return 'No Department';
    return departments.get(departmentId) || 'Unknown Department';
  };

  // Save selected user to localStorage whenever it changes
  useEffect(() => {
    if (selectedNames.length > 0) {
      localStorage.setItem('selectedUsers', JSON.stringify(selectedNames));
    } else {
      localStorage.removeItem('selectedUsers');
    }
  }, [selectedNames]);

  // Filter users based on search query
  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getDepartmentName(user.department).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSelected = (userId: string) => selectedNames.some(s => s.id === userId);

  return (
    <div className="min-h-screen bg-white">
      <Navbar title="Select Name" step="Step 1 of 3" backHref="/tomorrows_menu" />

      <main className="flex justify-center px-4 py-8">
        <div className="max-w-2xl w-full space-y-8">

        {/* Search Section */}
        <div>
          <label className="block text-sm font-medium text-main-text mb-2">
            Search for name
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-text" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or department..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-main-text"
            />
          </div>

          {/* Suggested Results */}
          {searchQuery.length >= 2 && filteredUsers.length > 0 && (
            <div className="mt-3 border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-100 overflow-hidden">
              {filteredUsers.slice(0, 5).map((user) => {
                const blocked = !user.can_self_opt_in;
                return (
                  <div
                    key={user.id}
                    onClick={() => {
                      if (blocked) {
                        toast.error(
                          `${user.name} must be opted in by an admin.`
                        );
                        return;
                      }
                      if (!isSelected(user.id)) {
                        setSelectedNames([user]);
                        setSearchQuery('');
                      }
                    }}
                    className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                      isSelected(user.id)
                        ? 'bg-primary/5'
                        : blocked
                        ? 'hover:bg-red-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        blocked ? 'bg-gray-100' : 'bg-primary/10'
                      }`}>
                        <span className={`text-sm font-semibold ${
                          blocked ? 'text-muted-text' : 'text-primary'
                        }`}>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className={`font-medium ${
                          blocked ? 'text-muted-text' : 'text-main-text'
                        }`}>{user.name}</p>
                        <p className="text-sm text-muted-text">
                          {blocked
                            ? 'Must be opted in by admin'
                            : getDepartmentName(user.department)}
                        </p>
                      </div>
                    </div>
                    {blocked ? (
                      <Lock className="w-5 h-5 text-muted-text" />
                    ) : !isSelected(user.id) ? (
                      <Plus className="w-5 h-5 text-muted-text" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Names Section */}
        <div>
          <h2 className="font-medium text-main-text mb-4">
            Selected Name
          </h2>

          {selectedNames.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <UserPlus className="w-12 h-12 text-muted-text mx-auto mb-4" />
              <p className="text-muted-text font-medium mb-1">No name selected yet</p>
              <p className="text-sm text-muted-text">Search and select your name to continue</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedNames.map((user) => (
                <div
                  key={user.id}
                  className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-2"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-main-text">{user.name}</span>
                  <button
                    onClick={() => setSelectedNames(selectedNames.filter(s => s.id !== user.id))}
                    className="w-5 h-5 rounded-full bg-gray-200 hover:bg-red-100 flex items-center justify-center transition-colors group"
                  >
                    <X className="w-3 h-3 text-muted-text group-hover:text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {canBulkOptIn && (
          <div className="border-2 border-primary/20 bg-red-50/40 rounded-lg p-4 flex items-start gap-3">
            <div className="bg-red-100 p-2 rounded-lg shrink-0">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div className="grow">
              <p className="text-sm font-semibold text-main-text">
                Bulk Opt-In role assigned
              </p>
              <p className="text-sm text-muted-text mb-3">
                You can opt in multiple staff at once for a meal.
              </p>
              <button
                type="button"
                onClick={() => setBulkOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium"
              >
                <UserPlus className="w-4 h-4" />
                Open Bulk Opt-In
              </button>
            </div>
          </div>
        )}

        {/* Next Button */}
        <Link href="/select_names/select_menu" className="block">
          <button
            disabled={selectedNames.length === 0}
            className={`w-full rounded-lg cursor-pointer h-12 flex items-center justify-center font-medium transition-colors ${
              selectedNames.length > 0
                ? 'bg-primary hover:bg-primary-hover text-white'
                : 'bg-gray-200 text-muted-text cursor-not-allowed'
            }`}
          >
            Next: Select Menu
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </Link>
        </div>
      </main>

      <BulkOptInModal
        isOpen={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onSuccess={refreshSelections}
        menus={menus}
        meals={meals}
        users={allUsers}
        departments={departments}
        existingSelections={selections.map((s) => ({
          user_id: s.user_id,
          meal_id: s.meal_id,
        }))}
      />
    </div>
  );
}