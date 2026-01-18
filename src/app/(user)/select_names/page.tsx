'use client';

import { Search, UserPlus, ArrowRight, X, Plus } from 'lucide-react';
import { useState } from 'react';
import { sampleUsers } from '@/utils/sampleData';
import type { User } from '@/types';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function SelectNames() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNames, setSelectedNames] = useState<User[]>([]);

  // Filter users based on search query
  const filteredUsers = sampleUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSelected = (userId: string) => selectedNames.some(s => s.id === userId);

  return (
    <div className="min-h-screen bg-white">
      <Navbar title="Select Names" step="Step 1 of 3" backHref="/tomorrows_menu" />

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
              {filteredUsers.slice(0, 5).map((user) => (
                <div
                  key={user.id}
                  onClick={() => {
                    if (!isSelected(user.id)) {
                      setSelectedNames([...selectedNames, user]);
                    }
                  }}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                    isSelected(user.id)
                      ? 'bg-primary/5'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-main-text">{user.name}</p>
                      <p className="text-sm text-muted-text">{user.department}</p>
                    </div>
                  </div>
                  {!isSelected(user.id) && (
                    <Plus className="w-5 h-5 text-muted-text" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Names Section */}
        <div>
          <h2 className="font-medium text-main-text mb-4">
            Selected Names ({selectedNames.length})
          </h2>

          {selectedNames.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <UserPlus className="w-12 h-12 text-muted-text mx-auto mb-4" />
              <p className="text-muted-text font-medium mb-1">No names selected yet</p>
              <p className="text-sm text-muted-text">Search and select at least one name to continue</p>
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
    </div>
  );
}