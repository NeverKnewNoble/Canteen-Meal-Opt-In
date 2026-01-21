'use client';

import { X, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Menu, MenuMeal, MealFormData } from '@/types';

interface EditMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditMeal: (mealId: string, mealData: MealFormData) => void;
  onSetSpecial: (menuId: string, mealId: string) => void;
  meal: MenuMeal | null;
  menu: Menu | null;
}

export default function EditMealModal({ isOpen, onClose, onEditMeal, onSetSpecial, meal, menu }: EditMealModalProps) {
  const [formData, setFormData] = useState<MealFormData>({
    name: '',
    description: '',
    menu_id: '',
  });

  useEffect(() => {
    if (meal) {
      setFormData({
        name: meal.name,
        description: meal.description,
        menu_id: meal.menu_id,
      });
    }
  }, [meal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (meal && formData.name) {
      onEditMeal(meal.id, formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      menu_id: '',
    });
    onClose();
  };

  const handleSetAsSpecial = () => {
    if (meal && menu) {
      onSetSpecial(menu.id, meal.id);
      handleClose();
    }
  };

  if (!isOpen || !meal || !menu) return null;

  const isSpecial = menu.todays_special === meal.id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-main-text">Edit Meal</h2>
            <p className="text-sm text-muted-text mt-1">Menu: <span className="font-medium">{menu.name}</span></p>
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
          {/* Special Badge */}
          {isSpecial && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-primary fill-current" />
              <span className="text-sm font-medium text-primary">This is today's special</span>
            </div>
          )}

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

          {/* Set as Special Button */}
          {!isSpecial && menu.meals && menu.meals.length > 1 && (
            <div className="pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSetAsSpecial}
                className="w-full px-4 py-3 bg-red-50 border border-red-200 text-primary rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Star className="w-4 h-4" />
                Set as Today's Special
              </button>
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
              Update Meal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
