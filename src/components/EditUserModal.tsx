'use client';

import { X, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { User } from '@/types';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditUser: (userData: User) => void;
  user: User | null;
  departments: string[];
}

export default function EditUserModal({ isOpen, onClose, onEditUser, user, departments }: EditUserModalProps) {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name);
      setDepartment(user.department);
    }
  }, [isOpen, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim() && department && user) {
      onEditUser({
        id: user.id,
        name: name.trim(),
        department,
      });
      onClose();
    }
  };

  const handleClose = () => {
    setName('');
    setDepartment('');
    onClose();
  };

  const isValid = name.trim().length > 0 && department.length > 0;

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 border-2 border-gray-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <Edit className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-main-text">Edit User</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-text hover:text-main-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-main-text mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter user's full name"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-main-text transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-main-text mb-2">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-main-text transition-all"
              required
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 text-main-text bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
