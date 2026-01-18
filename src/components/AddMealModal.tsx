'use client';

import { X, Calendar, Clock } from 'lucide-react';
import { useState } from 'react';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMeal: (mealData: {
    menuDate: string;
    foodItemDescription: string;
    submissionDeadlineDate: string;
    submissionDeadlineTime: string;
  }) => void;
}

export default function AddMealModal({ isOpen, onClose, onAddMeal }: AddMealModalProps) {
  const [menuDate, setMenuDate] = useState('');
  const [foodItemDescription, setFoodItemDescription] = useState('');
  const [submissionDeadlineDate, setSubmissionDeadlineDate] = useState('');
  const [submissionDeadlineTime, setSubmissionDeadlineTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (menuDate && foodItemDescription && submissionDeadlineDate && submissionDeadlineTime) {
      onAddMeal({
        menuDate,
        foodItemDescription,
        submissionDeadlineDate,
        submissionDeadlineTime,
      });
      
      // Reset form
      setMenuDate('');
      setFoodItemDescription('');
      setSubmissionDeadlineDate('');
      setSubmissionDeadlineTime('');
      onClose();
    }
  };

  const handleClose = () => {
    setMenuDate('');
    setFoodItemDescription('');
    setSubmissionDeadlineDate('');
    setSubmissionDeadlineTime('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-main-text">Add New Meal</h2>
          <button
            onClick={handleClose}
            className="text-muted-text hover:text-main-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Food Item Description */}
          <div>
            <label className="block text-sm font-medium text-main-text mb-2">
              Food Item Description
            </label>
            <textarea
              value={foodItemDescription}
              onChange={(e) => setFoodItemDescription(e.target.value)}
              placeholder="Enter detailed description of the meal..."
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-primary text-main-text resize-none"
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
              value={menuDate}
              onChange={(e) => setMenuDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-primary text-main-text"
              required
            />
          </div>

          {/* Submission Deadline Date */}
          <div>
            <label className="block text-sm font-medium text-main-text mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Submission Deadline Date
            </label>
            <input
              type="date"
              value={submissionDeadlineDate}
              onChange={(e) => setSubmissionDeadlineDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-primary text-main-text"
              required
            />
          </div>

          {/* Submission Deadline Time */}
          <div>
            <label className="block text-sm font-medium text-main-text mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Submission Deadline Time
            </label>
            <input
              type="time"
              value={submissionDeadlineTime}
              onChange={(e) => setSubmissionDeadlineTime(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-primary text-main-text"
              required
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-main-text bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
            >
              Publish Menu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
