'use client';

import { Search, Plus, Edit, Trash2, Calendar, Clock, Star, ChevronLeft, UtensilsCrossed, ChevronDown, HandPlatter } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import AddMenuModal from '@/components/AddMenuModal';
import EditMenuModal from '@/components/EditMenuModal';
import AddMealToMenuModal from '@/components/AddMealToMenuModal';
import EditMealModal from '@/components/EditMealModal';
import { getAllMenus, createMenu, updateMenu, deleteMenu, getStatusColor, setTodaysSpecial } from '@/utils/menu';
import { getAllMeals, createMeal, updateMeal, deleteMeal, getMealsByMenuId } from '@/utils/meals';
import { toast } from '@/components/alert';
import type { Menu, MenuMeal, MenuFormData, MealFormData } from '@/types';

export default function ManageMenu() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [menus, setMenus] = useState<Menu[]>([]);
  const [meals, setMeals] = useState<MenuMeal[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isAddMenuModalOpen, setIsAddMenuModalOpen] = useState(false);
  const [isEditMenuModalOpen, setIsEditMenuModalOpen] = useState(false);
  const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);
  const [isEditMealModalOpen, setIsEditMealModalOpen] = useState(false);
  
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MenuMeal | null>(null);
  const [collapsedCards, setCollapsedCards] = useState<Set<string>>(new Set());

  // Fetch menus and meals from database on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedMenus, fetchedMeals] = await Promise.all([
          getAllMenus(),
          getAllMeals()
        ]);
        setMenus(fetchedMenus);
        setMeals(fetchedMeals);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to get meals for a menu
  const getMealsForMenu = (menuId: string): MenuMeal[] => {
    return meals.filter(meal => meal.menu_id === menuId);
  };

  // Filter menus based on search and status
  const filteredMenus = menus.filter((menu) => {
    const matchesSearch = menu.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || menu.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  const handleAddMenu = async (menuData: MenuFormData) => {
    try {
      const newMenu = await createMenu(menuData);
      setMenus([...menus, newMenu]);
      toast.success("Menu created successfully!");
    } catch (error: any) {
      console.error('Failed to add menu:', error);
      
      // Check for duplicate key constraint violation
      if (error?.code === "23505" && error?.message?.includes('menu_date_key')) {
        toast.error("You can't create more than 1 menu on the same date. Please choose a different date.");
      } else {
        toast.error("Failed to create menu. Please try again.");
      }
    }
  };
  
  const handleEditMenu = async (menuId: string, menuData: MenuFormData) => {
    try {
      const updatedMenu = await updateMenu(menuId, menuData);
      setMenus(menus.map(menu => menu.id === menuId ? updatedMenu : menu));
    } catch (error) {
      console.error('Failed to update menu:', error);
    }
  };
  
  const handleAddMeal = async (mealData: MealFormData) => {
    if (selectedMenu) {
      try {
        const newMeal = await createMeal({
          ...mealData,
          menu_id: selectedMenu.id
        });
        
        // Update the menu with new meal
        const updatedMenu = await updateMenu(selectedMenu.id, {
          name: selectedMenu.name,
          date: selectedMenu.date,
          deadline: selectedMenu.deadline,
          status: selectedMenu.status
        });
        
        // Refresh menus to get the updated menu with new meal
        const refreshedMenus = await getAllMenus();
        setMenus(refreshedMenus);
        
        // Refresh meals to get the updated meals
        const refreshedMeals = await getAllMeals();
        setMeals(refreshedMeals);
      } catch (error) {
        console.error('Failed to add meal:', error);
      }
    }
  };
  
  const handleEditMeal = async (mealId: string, mealData: MealFormData) => {
    if (selectedMenu) {
      try {
        // Update the meal
        await updateMeal(mealId, mealData);
        
        // Refresh data from database
        const refreshedMenus = await getAllMenus();
        const refreshedMeals = await getAllMeals();
        
        setMenus(refreshedMenus);
        setMeals(refreshedMeals);
      } catch (error) {
        console.error('Failed to update meal:', error);
      }
    }
  };
  
  const handleSetSpecial = async (menuId: string, mealId: string) => {
    try {
      await setTodaysSpecial(menuId, mealId);
      
      // Refresh menus to get the updated menu with special meal
      const refreshedMenus = await getAllMenus();
      setMenus(refreshedMenus);
    } catch (error) {
      console.error('Failed to set special:', error);
    }
  };
  
  const handleDeleteMeal = async (menuId: string, mealId: string) => {
    try {
      // Delete the meal
      await deleteMeal(mealId);
      
      // Refresh data from database
      const refreshedMenus = await getAllMenus();
      const refreshedMeals = await getAllMeals();
      
      setMenus(refreshedMenus);
      setMeals(refreshedMeals);
    } catch (error) {
      console.error('Failed to delete meal:', error);
    }
  };
  
  const handleDeleteMenu = async (menuId: string) => {
    try {
      await deleteMenu(menuId);
      setMenus(menus.filter(menu => menu.id !== menuId));
    } catch (error) {
      console.error('Failed to delete menu:', error);
    }
  };
  
  const openEditMenuModal = (menu: Menu) => {
    setSelectedMenu(menu);
    setIsEditMenuModalOpen(true);
  };
  
  const openAddMealModal = (menu: Menu) => {
    setSelectedMenu(menu);
    setIsAddMealModalOpen(true);
  };
  
  const openEditMealModal = (menu: Menu, meal: MenuMeal) => {
    setSelectedMenu(menu);
    setSelectedMeal(meal);
    setIsEditMealModalOpen(true);
  };
  
  const toggleCardCollapse = (menuId: string) => {
    setCollapsedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  };
  
  return (
    <div className="min-h-screen bg-white">
      <Navbar title="Manage Menu" step="Admin" backHref="/admin" />
      
      <main className="px-8 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-main-text">Manage Menu</h1>
              <p className="text-muted-text mt-1">Create menus and manage meals</p>
            </div>
            <button
              onClick={() => setIsAddMenuModalOpen(true)}
              className="bg-primary cursor-pointer text-white px-6 py-3 rounded-lg flex items-center hover:bg-primary-hover transition-colors font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Menu
            </button>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 p-5 border-2 border-gray-200 rounded-xl bg-white">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text" />
                <input
                  type="text"
                  placeholder="Search by menu name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-main-text transition-all"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-main-text transition-all min-w-45"
              >
                <option value="All">All Status</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Menu Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredMenus.map((menu) => {
              const isCollapsed = collapsedCards.has(menu.id);
              
              return (
                <div key={menu.id} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-primary/30 transition-all">
                  {/* Menu Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <button
                            onClick={() => toggleCardCollapse(menu.id)}
                            className="p-1 rounded-lg cursor-pointer text-muted-text hover:text-primary hover:bg-red-100 transition-colors mr-2"
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
                          </button>
                          <h3 className="text-xl font-bold text-main-text">{menu.name}</h3>
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(menu.status)}`}>
                            {menu.status.charAt(0).toUpperCase() + menu.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-text">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{menu.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Deadline: {new Date(menu.deadline).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditMenuModal(menu)}
                          className="p-2 rounded-lg cursor-pointer text-muted-text hover:text-primary hover:bg-red-100 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMenu(menu.id)}
                          className="p-2 rounded-lg cursor-pointer text-muted-text hover:text-primary hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                  </div>

                  {/* Meals Section - Collapsible */}
                  {!isCollapsed && (
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-main-text">Meals ({getMealsForMenu(menu.id)?.length || 0})</h4>
                        <button
                          onClick={() => openAddMealModal(menu)}
                          className="px-3 py-1.5 cursor-pointer bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Add Meal
                        </button>
                      </div>
                      
                      {/* Meals List */}
                      <div className="space-y-3">
                        {getMealsForMenu(menu.id) && getMealsForMenu(menu.id).length > 0 ? (
                          getMealsForMenu(menu.id).map((meal) => (
                            <div key={meal.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                              <div className="flex">
                                {/* Meal Icon Section */}
                                <div className="bg-linear-to-br from-red-50 to-red-100 p-4 flex items-center justify-center">
                                  <HandPlatter className="w-8 h-8 text-primary" />
                                </div>
                                
                                {/* Meal Content Section */}
                                <div className="flex-1 p-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <h5 className="text-lg font-semibold text-main-text mb-1">{meal.name}</h5>
                                      {menu.todays_special === meal.id && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium shadow-sm">
                                          <Star className="w-3 h-3 fill-current" />
                                          Today's Special
                                        </span>
                                      )}
                                      <p className="text-sm text-muted-text leading-relaxed">{meal.description}</p>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => openEditMealModal(menu, meal)}
                                        className="p-2 rounded-lg text-muted-text hover:text-primary hover:bg-gray-100 transition-colors"
                                        title="Edit meal"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleSetSpecial(menu.id, meal.id)}
                                        className="p-2 rounded-lg text-muted-text hover:text-yellow-600 hover:bg-yellow-50 transition-colors"
                                        title="Set as today's special"
                                      >
                                        <Star className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteMeal(menu.id, meal.id)}
                                        className="p-2 rounded-lg text-muted-text hover:text-red-600 hover:bg-red-50 transition-colors"
                                        title="Delete meal"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <HandPlatter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-muted-text">No meals added yet</p>
                            <button
                              onClick={() => openAddMealModal(menu)}
                              className="mt-3 cursor-pointer text-primary hover:text-primary-hover text-sm font-medium"
                            >
                              Add first meal
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Empty State */}
          {filteredMenus.length === 0 && (
            <div className="text-center py-12">
              <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-main-text mb-2">No menus found</h3>
              <p className="text-muted-text mb-6">
                {searchQuery || statusFilter !== 'All' 
                  ? 'Try adjusting your search or filters' 
                  : 'Create your first menu to get started'}
              </p>
              {!searchQuery && statusFilter === 'All' && (
                <button
                  onClick={() => setIsAddMenuModalOpen(true)}
                  className="px-6 py-3 cursor-pointer bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
                >
                  <Plus className="w-5 h-5 mr-2 inline" />
                  Create Menu
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AddMenuModal
        isOpen={isAddMenuModalOpen}
        onClose={() => setIsAddMenuModalOpen(false)}
        onAddMenu={handleAddMenu}
      />
      
      <EditMenuModal
        isOpen={isEditMenuModalOpen}
        onClose={() => {
          setIsEditMenuModalOpen(false);
          setSelectedMenu(null);
        }}
        onEditMenu={handleEditMenu}
        menu={selectedMenu}
      />
      
      <AddMealToMenuModal
        isOpen={isAddMealModalOpen}
        onClose={() => {
          setIsAddMealModalOpen(false);
          setSelectedMenu(null);
        }}
        onAddMeal={handleAddMeal}
        menu={selectedMenu}
      />
      
      <EditMealModal
        isOpen={isEditMealModalOpen}
        onClose={() => {
          setIsEditMealModalOpen(false);
          setSelectedMenu(null);
          setSelectedMeal(null);
        }}
        onEditMeal={handleEditMeal}
        onSetSpecial={handleSetSpecial}
        meal={selectedMeal}
        menu={selectedMenu}
      />
    </div>
  );
}
