'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import type { Menu, MealFormData } from '@/types';

interface AddMealToMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMeal: (mealData: MealFormData) => void;
  menu: Menu | null;
}

export default function AddMealToMenuModal({ isOpen, onClose, onAddMeal, menu }: AddMealToMenuModalProps) {
  const [formData, setFormData] = useState<MealFormData>({
    name: '',
    description: '',
    menu_id: menu?.id || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.name && menu) {
      onAddMeal(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      menu_id: menu?.id || '',
    });
    onClose();
  };

  if (!isOpen || !menu) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-main-text">Add Meal to Menu</h2>
            <p className="text-sm text-muted-text mt-1">Adding to: <span className="font-medium">{menu.name}</span></p>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-text hover:text-main-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Meal Name */}
          <div>
            <label className="block text-sm font-medium text-main-text mb-2">
              Meal Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter meal name..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-main-text transition-all"
              required
            />
          </div>

          {/* Meal Description */}
          <div>
            <label className="block text-sm font-medium text-main-text mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter detailed description of the meal (optional)..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-main-text resize-none transition-all"
            />
          </div>

          {/* Menu Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-muted-text">
              <span className="font-medium">Menu Date:</span> {menu.date}
            </p>
            <p className="text-sm text-muted-text mt-1">
              <span className="font-medium">Current Meals:</span> {menu.meals?.length || 0}
            </p>
          </div>

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
              Add Meal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
