'use client';

import { Search, Download, Eye, ChevronLeft, Calendar, Users, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getAllSelections } from '@/utils/selections';
import { getAllDepartments } from '@/utils/departments';
import { getAllMenus } from '@/utils/menu';
import { getAllMeals } from '@/utils/meals';
import { getAllUsers } from '@/utils/users';
import type { Selection } from '@/types/selection';
import type { Department } from '@/types/department';
import type { Menu } from '@/types/menu';
import type { Meal } from '@/types/meal';
import type { User } from '@/types';

export default function ViewSelections() {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuFilter, setMenuFilter] = useState('All Menus');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selections, setSelections] = useState<Selection[]>([]);
  const [departments, setDepartments] = useState<Map<string, string>>(new Map());
  const [menus, setMenus] = useState<Menu[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [selectionsData, deptList, menusData, mealsData, usersData] = await Promise.all([
          getAllSelections(),
          getAllDepartments(),
          getAllMenus(),
          getAllMeals(),
          getAllUsers()
        ]);

        setSelections(selectionsData);
        setMenus(menusData);
        setMeals(mealsData);
        setUsers(usersData);

        // Create department lookup map
        const deptMap = new Map<string, string>();
        deptList.forEach((dept: Department) => {
          deptMap.set(dept.id, dept.name);
        });
        setDepartments(deptMap);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Helper function to get user name
  const getUserName = (userId: string | null | undefined) => {
    if (!userId) return 'Unknown User';
    const user = users.find(u => u.id === userId);
    return user?.name || `User ${userId}`;
  };

  // Helper function to get user department
  const getUserDepartment = (userId: string | null | undefined) => {
    if (!userId) return 'No Department';
    const user = users.find(u => u.id === userId);
    return user?.department ? getDepartmentName(user.department) : 'No Department';
  };

  // Helper function to get department name
  const getDepartmentName = (departmentId: string | null | undefined) => {
    if (!departmentId) return 'No Department';
    return departments.get(departmentId) || 'Unknown Department';
  };

  // Helper function to get menu name
  const getMenuName = (menuId: string | null | undefined) => {
    if (!menuId) return 'No Menu';
    const menu = menus.find(m => m.id === menuId);
    return menu?.name || 'Unknown Menu';
  };

  // Helper function to get meal name
  const getMealName = (mealId: string | null | undefined) => {
    if (!mealId) return 'No Meal';
    const meal = meals.find(m => m.id === mealId);
    return meal?.name || 'Unknown Meal';
  };

  // Helper function to get menu date from meal
  const getMealDate = (mealId: string | null | undefined) => {
    if (!mealId) return 'Unknown Date';
    const meal = meals.find(m => m.id === mealId);
    if (meal?.menu_id) {
      const menu = menus.find(m => m.id === meal.menu_id);
      return menu?.date || 'Unknown Date';
    }
    return 'Unknown Date';
  };

  // Get unique menu names for filter
  const uniqueMenuNames = ['All Menus', ...menus.map(m => m.name)];

  // Create menu name to ID map
  const menuNameToIdMap = new Map<string, string>();
  menus.forEach(menu => {
    menuNameToIdMap.set(menu.name, menu.id);
  });

  // Filter selections
  const filteredSelections = selections.filter(selection => {
    const userName = getUserName(selection.user_id);
    const userDept = getUserDepartment(selection.user_id);
    
    const matchesSearch = searchQuery === '' || 
      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userDept.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMenu = menuFilter === 'All Menus' || 
      meals.find(m => m.id === selection.meal_id)?.menu_id === menuNameToIdMap.get(menuFilter);
    
    const matchesStatus = statusFilter === 'All' || 
      (statusFilter === 'Yes' && selection.opted_in) || 
      (statusFilter === 'No' && !selection.opted_in);
    
    return matchesSearch && matchesMenu && matchesStatus;
  });

  // Calculate counts
  const optedInCount = filteredSelections.filter(s => s.opted_in).length;
  const skippedCount = filteredSelections.filter(s => !s.opted_in).length;

  return (
    <div className="min-h-screen bg-white">
      <Navbar title="View Selections" step="Admin Screen 4/5" backHref="/admin" />
      
      <main className="px-8 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div>
              <h1 className="text-2xl font-bold text-main-text">View Selections</h1>
              <p className="text-muted-text">Review and manage meal selections</p>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
          <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-lg mr-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-text">Total Selections</p>
                  <p className="text-2xl font-bold text-main-text">{filteredSelections.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-text">Yes</p>
                  <p className="text-2xl font-bold text-main-text">{optedInCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="bg-gray-100 p-3 rounded-lg mr-4">
                  <XCircle className="w-6 h-6 text-muted-text" />
                </div>
                <div>
                  <p className="text-sm text-muted-text">No</p>
                  <p className="text-2xl font-bold text-main-text">{skippedCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white">
            <div className="flex space-x-4">
              <div className="relative grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text" />
                <input
                  type="text"
                  placeholder="Search by name or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-primary text-main-text"
                />
              </div>
              <select
                value={menuFilter}
                onChange={(e) => setMenuFilter(e.target.value)}
                className="w-auto px-4 text-main-text py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {uniqueMenuNames.map(menuName => (
                  <option key={menuName} value={menuName}>{menuName}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-auto px-4 text-main-text py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="All">All Status</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          {/* Selections Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-text uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-text uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-text uppercase tracking-wider">
                    Menu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-text uppercase tracking-wider">
                    Meal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-text uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-text uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSelections.map((selection) => {
                  const meal = meals.find(m => m.id === selection.meal_id);
                  const menu = menus.find(m => m.id === meal?.menu_id);
                  
                  return (
                    <tr key={selection.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-main-text">
                          {getUserName(selection.user_id)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-text">
                          {getUserDepartment(selection.user_id)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-main-text">{menu?.name || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-main-text">{getMealName(selection.meal_id)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-muted-text">
                          <Calendar className="w-4 h-4 mr-1" />
                          {getMealDate(selection.meal_id)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {selection.opted_in ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-muted-text">
                            <XCircle className="w-3 h-3 mr-1" />
                            No
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
          )}
        </div>
      </main>
    </div>
  );
}
