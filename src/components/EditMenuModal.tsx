'use client';

import { X, Calendar, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Menu, MenuFormData, MenuStatus } from '@/types';

interface EditMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditMenu: (menuId: string, menuData: MenuFormData) => void;
  menu: Menu | null;
}

export default function EditMenuModal({ isOpen, onClose, onEditMenu, menu }: EditMenuModalProps) {
  const [formData, setFormData] = useState<MenuFormData>({
    name: '',
    date: '',
    deadline: '',
    status: 'upcoming',
    todays_special: null,
  });

  useEffect(() => {
    if (menu) {
      setFormData({
        name: menu.name,
        date: menu.date,
        deadline: menu.deadline,
        status: menu.status,
        todays_special: menu.todays_special,
      });
    }
  }, [menu]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (menu && formData.name && formData.date && formData.deadline) {
      onEditMenu(menu.id, formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      date: '',
      deadline: '',
      status: 'upcoming',
      todays_special: null,
    });
    onClose();
  };

  if (!isOpen || !menu) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-main-text">Edit Menu</h2>
          <button
            onClick={handleClose}
            className="text-muted-text hover:text-main-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Menu Name */}
          <div>
            <label className="block text-sm font-medium text-main-text mb-2">
              Menu Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter menu name..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-main-text transition-all"
              required
            />
          </div>

          {/* Menu Date */}
          <div>
            <label className="block text-sm font-medium text-main-text mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Menu Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-main-text transition-all"
              required
            />
          </div>

          {/* Submission Deadline */}
          <div>
            <label className="block text-sm font-medium text-main-text mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Submission Deadline
            </label>
            <input
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-main-text transition-all"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-main-text mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as MenuStatus })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-main-text transition-all"
            >
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Today's Special */}
          {menu.meals && menu.meals.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-main-text mb-2">
                Today's Special
              </label>
              <select
                value={formData.todays_special || ''}
                onChange={(e) => setFormData({ ...formData, todays_special: e.target.value || null })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-main-text transition-all"
              >
                <option value="">None (First meal will be special)</option>
                {menu.meals.map((meal) => (
                  <option key={meal.id} value={meal.id}>
                    {meal.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-main-text bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
            >
              Update Menu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
