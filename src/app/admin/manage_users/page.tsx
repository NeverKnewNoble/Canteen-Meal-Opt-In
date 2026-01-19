'use client';

import { Search, Upload, Plus, Edit, Trash2, Users, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import AddUserModal from '@/components/AddUserModal';
import EditUserModal from '@/components/EditUserModal';
import AddDepartmentModal from '@/components/AddDepartmentModal';
import BulkImportModal from '@/components/BulkImportModal';
import { getAllUsers, createUser, updateUser, deleteUser, searchUsers, getUsersByDepartment } from '@/utils/users';
import { getAllDepartments, createDepartment, updateDepartment, deleteDepartment } from '@/utils/departments';
import { downloadCSVTemplate } from '@/utils/bulkImport';
import { toast } from '@/components/alert';
import type { User } from '@/types';
import type { Department } from '@/types/department';

export default function ManageUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch users and departments from database on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedUsers, fetchedDepartments] = await Promise.all([
          getAllUsers(),
          getAllDepartments()
        ]);
        setUsers(fetchedUsers);
        setDepartments(fetchedDepartments);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter users based on search only
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleAddUser = async (userData: { name: string; department: string }) => {
    try {
      // Find department ID from name
      const department = departments.find(dept => dept.name === userData.department);
      if (!department) {
        toast.error('Department not found');
        return;
      }

      const newUser = await createUser({
        name: userData.name,
        department: department.id // Use department ID instead of name
      });
      setUsers([...users, newUser]);
    } catch (error) {
      console.error('Failed to add user:', error);
    }
  };

  const handleEditUser = async (updatedUserData: { name: string; department: string }) => {
    if (!selectedUser) return;
    
    try {
      // Find department ID from name
      const department = departments.find(dept => dept.name === updatedUserData.department);
      if (!department) {
        toast.error('Department not found');
        return;
      }

      const updatedUser = await updateUser(selectedUser.id, {
        name: updatedUserData.name,
        department: department.id // Use department ID instead of name
      });
      setUsers(users.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleAddDepartment = async (departmentName: string) => {
  try {
    const newDepartment = await createDepartment({ name: departmentName });
    setDepartments([...departments, newDepartment]);
  } catch (error) {
    console.error('Failed to add department:', error);
  }
};

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      // Reset to all users when search is cleared
      try {
        const allUsers = await getAllUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    } else {
      // Use database search function
      try {
        const searchResults = await searchUsers(query);
        setUsers(searchResults);
      } catch (error) {
        console.error('Failed to search users:', error);
      }
    }
  };

  // Helper function to get department name from ID
  const getDepartmentName = (departmentId: string): string => {
    const department = departments.find(dept => dept.id === departmentId);
    return department?.name || 'Unknown Department';
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsEditUserModalOpen(true);
  };

  // Handle bulk import completion - refresh users list
  const handleBulkImportComplete = async () => {
    try {
      const refreshedUsers = await getAllUsers();
      setUsers(refreshedUsers);
    } catch (error) {
      console.error('Failed to refresh users:', error);
    }
  };

  // Handle download template
  const handleDownloadTemplate = () => {
    downloadCSVTemplate(departments);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar title="Manage Users" step="Admin" backHref="/admin" />

      <main className="px-8 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-main-text">Manage Users</h1>
              <p className="text-muted-text mt-1">Add, edit, or remove staff members</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDepartmentModalOpen(true)}
                className="bg-gray-100 text-main-text px-4 py-2.5 rounded-lg flex items-center hover:bg-gray-200 transition-colors font-medium border-2 border-gray-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Department
              </button>
              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="bg-primary text-white px-4 py-2.5 rounded-lg flex items-center hover:bg-primary-hover transition-colors font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add User
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 p-5 border-2 border-gray-200 rounded-xl bg-white">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-50">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-main-text transition-all"
                />
              </div>
              <button
                onClick={handleDownloadTemplate}
                className="bg-gray-100 text-main-text px-4 py-3 rounded-lg flex items-center hover:bg-gray-200 transition-colors font-medium border-2 border-gray-200"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Template
              </button>
              <button
                onClick={() => setIsBulkImportModalOpen(true)}
                className="bg-primary text-white px-4 py-3 rounded-lg flex items-center hover:bg-primary-hover transition-colors font-medium"
              >
                <Upload className="w-5 h-5 mr-2" />
                Bulk Import (CSV)
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border-2 border-gray-200 flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-main-text">{users.length}</p>
                <p className="text-sm text-muted-text">Total Users</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border-2 border-gray-200 flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-main-text">{departments.length}</p>
                <p className="text-sm text-muted-text">Departments</p>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-text uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-text uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-muted-text uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-3 text-muted-text">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-red-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-primary font-semibold text-sm">
                              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-main-text">{user.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-muted-text">
                          {getDepartmentName(user.department)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(user)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-muted-text hover:text-primary hover:bg-red-100 transition-colors mr-2"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-muted-text hover:text-primary hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-muted-text">No users found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onAddUser={handleAddUser}
        departments={departments.map(dept => dept.name)}
      />

      <EditUserModal
        isOpen={isEditUserModalOpen}
        onClose={() => {
          setIsEditUserModalOpen(false);
          setSelectedUser(null);
        }}
        onEditUser={handleEditUser}
        departments={departments.map(dept => dept.name)}
        user={selectedUser}
      />

      <AddDepartmentModal
        isOpen={isDepartmentModalOpen}
        onClose={() => setIsDepartmentModalOpen(false)}
        onAddDepartment={handleAddDepartment}
        existingDepartments={departments.map(dept => dept.name)}
      />

      <BulkImportModal
        isOpen={isBulkImportModalOpen}
        onClose={() => setIsBulkImportModalOpen(false)}
        onImportComplete={handleBulkImportComplete}
        departments={departments}
      />
    </div>
  );
}
