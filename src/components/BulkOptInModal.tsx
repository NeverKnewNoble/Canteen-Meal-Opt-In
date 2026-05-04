'use client';

import { X, CheckCircle, Search, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { bulkCreateSelections } from '@/utils/selections';
import type { Menu } from '@/types/menu';
import type { Meal } from '@/types/meal';
import type { Department } from '@/types/department';
import type { User } from '@/types';

interface BulkOptInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  menus: Menu[];
  meals: Meal[];
  users: User[];
  departments: Map<string, string>;
  existingSelections: { user_id: string; meal_id: string }[];
}

export default function BulkOptInModal({
  isOpen,
  onClose,
  onSuccess,
  menus,
  meals,
  users,
  departments,
  existingSelections,
}: BulkOptInModalProps) {
  const [selectedMenuId, setSelectedMenuId] = useState('');
  const [selectedMealId, setSelectedMealId] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const active = menus.find((m) => m.status === 'active');
    setSelectedMenuId(active?.id ?? menus[0]?.id ?? '');
    setSelectedMealId('');
    setDepartmentFilter('All');
    setSearchQuery('');
    setSelectedUserIds(new Set());
  }, [isOpen, menus]);

  const mealsForMenu = useMemo(
    () => meals.filter((m) => m.menu_id === selectedMenuId),
    [meals, selectedMenuId]
  );

  useEffect(() => {
    if (mealsForMenu.length > 0 && !mealsForMenu.find((m) => m.id === selectedMealId)) {
      setSelectedMealId(mealsForMenu[0].id);
    } else if (mealsForMenu.length === 0) {
      setSelectedMealId('');
    }
  }, [mealsForMenu, selectedMealId]);

  const usersAlreadyChose = useMemo(() => {
    if (!selectedMealId) return new Set<string>();
    return new Set(
      existingSelections
        .filter((s) => s.meal_id === selectedMealId)
        .map((s) => s.user_id)
    );
  }, [existingSelections, selectedMealId]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const deptMatch =
        departmentFilter === 'All' || u.department === departmentFilter;
      const q = searchQuery.trim().toLowerCase();
      const searchMatch = q === '' || u.name.toLowerCase().includes(q);
      return deptMatch && searchMatch;
    });
  }, [users, departmentFilter, searchQuery]);

  const eligibleFilteredUserIds = useMemo(
    () => filteredUsers.filter((u) => !usersAlreadyChose.has(u.id)).map((u) => u.id),
    [filteredUsers, usersAlreadyChose]
  );

  const allEligibleSelected =
    eligibleFilteredUserIds.length > 0 &&
    eligibleFilteredUserIds.every((id) => selectedUserIds.has(id));

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (allEligibleSelected) {
        eligibleFilteredUserIds.forEach((id) => next.delete(id));
      } else {
        eligibleFilteredUserIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const departmentOptions = useMemo(() => {
    const ids = Array.from(new Set(users.map((u) => u.department)));
    return ids
      .map((id) => ({ id, name: departments.get(id) ?? 'Unknown' }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [users, departments]);

  const handleSubmit = async () => {
    if (!selectedMealId || selectedUserIds.size === 0) return;
    setSubmitting(true);
    try {
      await bulkCreateSelections({
        meal_id: selectedMealId,
        user_ids: Array.from(selectedUserIds),
        opted_in: true,
      });
      onSuccess();
      onClose();
    } catch {
      // toast already shown in helper
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedMeal = meals.find((m) => m.id === selectedMealId);
  const canSubmit =
    !submitting && selectedMealId !== '' && selectedUserIds.size > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col border-2 border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-main-text">Bulk Opt-In</h2>
              <p className="text-sm text-muted-text">
                Select a meal and the users to opt in
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-text hover:text-main-text transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Menu + Meal pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-main-text mb-2">
                Menu
              </label>
              <select
                value={selectedMenuId}
                onChange={(e) => setSelectedMenuId(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-main-text"
              >
                {menus.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.date}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-main-text mb-2">
                Meal
              </label>
              <select
                value={selectedMealId}
                onChange={(e) => setSelectedMealId(e.target.value)}
                disabled={mealsForMenu.length === 0}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-main-text disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {mealsForMenu.length === 0 ? (
                  <option value="">No meals on this menu</option>
                ) : (
                  mealsForMenu.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
              <input
                type="text"
                placeholder="Search users by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-main-text"
              />
            </div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-main-text"
            >
              <option value="All">All Departments</option>
              {departmentOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select-all + counts */}
          <div className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
            <label className="flex items-center gap-2 text-sm text-main-text cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allEligibleSelected}
                disabled={eligibleFilteredUserIds.length === 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 accent-primary"
              />
              Select all visible ({eligibleFilteredUserIds.length} eligible)
            </label>
            <div className="text-sm text-muted-text">
              <span className="font-medium text-main-text">{selectedUserIds.size}</span> selected
            </div>
          </div>

          {/* User list */}
          <div className="border-2 border-gray-200 rounded-lg max-h-64 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-text">
                No users match these filters.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {filteredUsers.map((u) => {
                  const alreadyChose = usersAlreadyChose.has(u.id);
                  const checked = selectedUserIds.has(u.id);
                  return (
                    <li
                      key={u.id}
                      className={`flex items-center justify-between px-4 py-2 ${
                        alreadyChose ? 'bg-gray-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <label
                        className={`flex items-center gap-3 grow ${
                          alreadyChose ? 'cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={alreadyChose}
                          onChange={() => toggleUser(u.id)}
                          className="w-4 h-4 accent-primary"
                        />
                        <div>
                          <div className="text-sm font-medium text-main-text">
                            {u.name}
                          </div>
                          <div className="text-xs text-muted-text">
                            {departments.get(u.department) ?? 'No Department'}
                          </div>
                        </div>
                      </label>
                      {alreadyChose && (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-gray-200 text-muted-text">
                          Already chose
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {selectedMeal && selectedUserIds.size > 0 && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-main-text">
              <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
              <span>
                Opting in <span className="font-semibold">{selectedUserIds.size}</span>{' '}
                user{selectedUserIds.size === 1 ? '' : 's'} for{' '}
                <span className="font-semibold">{selectedMeal.name}</span>. Users
                who already made a selection will be skipped.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2.5 text-main-text bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {submitting ? 'Opting in...' : 'Confirm Opt-In'}
          </button>
        </div>
      </div>
    </div>
  );
}
