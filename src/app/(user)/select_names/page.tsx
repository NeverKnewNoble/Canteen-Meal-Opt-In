'use client';

import { Search, UserPlus, ArrowRight, CircleUser } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar title="Select Names" step="Step 1 of 3" backHref="/" />
      
      <main className="flex justify-center items-center px-4 py-8">
        <div className="max-w-2xl w-full">

        {/* Search Section */}
        <div className="mb-8">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search for name
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or department..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-black"
              />
            </div>
          </div>

          {/* Suggested Results */}
          {searchQuery.length >= 2 && filteredUsers.length > 0 && (
            <div className="mt-4">
              {filteredUsers.slice(0, 5).map((user) => (
                <div
                  key={user.id}
                  onClick={() => {
                    if (!selectedNames.find(selected => selected.id === user.id)) {
                      setSelectedNames([...selectedNames, user]);
                    }
                  }}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors mb-2"
                >
                  <div className="flex items-center">
                    <div className='mr-3'>
                      <CircleUser className='w-10 h-10 text-black'/>  
                    </div>
                    <div>
                      <h3 className="font-medium text-black">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.department}</p>
                    </div>
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-400 mt-2">Autocomplete triggers after 2 characters</p>
            </div>
          )}
        </div>

        {/* Selected Names Section */}
        <div className="mb-8">
          <h2 className="font-medium text-black mb-4">
            Selected Names ({selectedNames.length})
          </h2>
          
          {selectedNames.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium mb-1">No names selected yet</p>
              <p className="text-sm text-gray-400">Search and select at least one name to continue</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedNames.map((user) => (
                <div key={user.id} className="inline-flex items-center bg-gray-100 border border-gray-200 rounded-full px-3 py-2">
                  <CircleUser className='w-5 h-5 text-black mr-2'/>  
                  <div className='flex-1'>
                    <span className="text-black font-medium text-sm">{user.name}</span>
                    <p className="text-xs text-gray-500">{user.department}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedNames(selectedNames.filter(selected => selected.id !== user.id))}
                    className="ml-2 text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Next Button */}
        <Link href="/select_names/select_menu">
          <button 
            disabled={selectedNames.length === 0}
            className={`w-full rounded-lg h-12 flex cursor-pointer items-center justify-center font-medium transition-colors ${
              selectedNames.length > 0 
                ? 'bg-black hover:bg-gray-900 text-white cursor-pointer' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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