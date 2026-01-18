'use client';

import { Search, Download, Eye, ChevronLeft, Calendar, Users, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { sampleSelections } from '@/utils/sampleData';
import type { SelectionDisplay } from '@/types';
import { getUniqueMeals, getUniqueMenus, filterSelections, getSelectionCounts } from '@/utils/viewSelectionsUtils';

export default function ViewSelections() {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuFilter, setMenuFilter] = useState('All Menus');
  const [mealFilter, setMealFilter] = useState('All Meals');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selections] = useState<SelectionDisplay[]>(sampleSelections);

  const menus = getUniqueMenus(selections);
  const meals = getUniqueMeals(selections);
  
  const filteredSelections = filterSelections(selections, searchQuery, mealFilter, statusFilter, menuFilter);

  const { optedInCount, skippedCount } = getSelectionCounts(filteredSelections);

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
                {menus.map(menu => (
                  <option key={menu} value={menu}>{menu}</option>
                ))}
              </select>
              <select
                value={mealFilter}
                onChange={(e) => setMealFilter(e.target.value)}
                className="w-auto px-4 text-main-text py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {meals.map(meal => (
                  <option key={meal} value={meal}>{meal}</option>
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
                {filteredSelections.map((selection) => (
                  <tr key={selection.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-main-text">{selection.userName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-text">{selection.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-main-text">{selection.menuName || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-main-text">{selection.mealName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-muted-text">
                        <Calendar className="w-4 h-4 mr-1" />
                        {selection.mealDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {selection.optedIn ? (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
