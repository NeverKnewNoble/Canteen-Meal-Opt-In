'use client';

import { X, ShieldCheck, Search, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { updateUser } from '@/utils/users';
import { toast } from '@/components/alert';
import type { User } from '@/types';

interface AssignBulkOptInRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updated: User[]) => void;
  users: User[];
  departments: Map<string, string>;
}

export default function AssignBulkOptInRoleModal({
  isOpen,
  onClose,
  onSaved,
  users,
  departments,
}: AssignBulkOptInRoleModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSearchQuery('');
    setDepartmentFilter('All');
    setPending({});
  }, [isOpen]);

  const departmentOptions = useMemo(() => {
    const ids = Array.from(new Set(users.map((u) => u.department)));
    return ids
      .map((id) => ({ id, name: departments.get(id) ?? 'Unknown' }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [users, departments]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const deptMatch =
        departmentFilter === 'All' || u.department === departmentFilter;
      const q = searchQuery.trim().toLowerCase();
      const searchMatch = q === '' || u.name.toLowerCase().includes(q);
      return deptMatch && searchMatch;
    });
  }, [users, departmentFilter, searchQuery]);

  const effectiveValue = (u: User) =>
    pending[u.id] === undefined ? u.can_bulk_opt_in : pending[u.id];

  const togglePending = (u: User) => {
    const current = effectiveValue(u);
    const next = !current;
    setPending((prev) => {
      const copy = { ...prev };
      if (next === u.can_bulk_opt_in) {
        delete copy[u.id];
      } else {
        copy[u.id] = next;
      }
      return copy;
    });
  };

  const changedEntries = useMemo(
    () => Object.entries(pending),
    [pending]
  );

  const grantedCount = useMemo(
    () =>
      users.reduce((n, u) => (effectiveValue(u) ? n + 1 : n), 0),
    [users, pending]
  );

  const handleSave = async () => {
    if (changedEntries.length === 0) {
      onClose();
      return;
    }
    setSubmitting(true);
    try {
      const updated: User[] = [];
      for (const [userId, value] of changedEntries) {
        const u = await updateUser(userId, { can_bulk_opt_in: value });
        updated.push(u);
      }
      onSaved(updated);
      toast.success(
        `Updated bulk opt-in role for ${updated.length} user${
          updated.length === 1 ? '' : 's'
        }`
      );
      onClose();
    } catch (error) {
      console.error('Failed to update bulk opt-in role:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col border-2 border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-main-text">
                Assign Bulk Opt-In Role
              </h2>
              <p className="text-sm text-muted-text">
                Grant selected users permission to opt in others in bulk
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

          {/* Counts */}
          <div className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg text-sm">
            <div className="flex items-center gap-2 text-muted-text">
              <Users className="w-4 h-4" />
              <span>
                <span className="font-medium text-main-text">
                  {grantedCount}
                </span>{' '}
                user{grantedCount === 1 ? '' : 's'} will have the role
              </span>
            </div>
            <div className="text-muted-text">
              <span className="font-medium text-main-text">
                {changedEntries.length}
              </span>{' '}
              unsaved change{changedEntries.length === 1 ? '' : 's'}
            </div>
          </div>

          {/* User list */}
          <div className="border-2 border-gray-200 rounded-lg max-h-80 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-text">
                No users match these filters.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {filteredUsers.map((u) => {
                  const checked = effectiveValue(u);
                  const changed = pending[u.id] !== undefined;
                  return (
                    <li
                      key={u.id}
                      className="flex items-center justify-between px-4 py-2 hover:bg-gray-50"
                    >
                      <label className="flex items-center gap-3 grow cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePending(u)}
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
                      {changed && (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          Unsaved
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
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
            onClick={handleSave}
            disabled={submitting || changedEntries.length === 0}
            className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
