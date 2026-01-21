'use client';

import { Calendar, Clock, ChevronLeft, FileText, UtensilsCrossed, Users } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getDashboardStats } from '@/utils/dashbaord';
import { getActiveMenu } from '@/utils/menu';
import { useState, useEffect } from 'react';
import type { Menu, DashboardStat } from '@/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [activeMenu, setActiveMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);

  // Load dashboard data on mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [dashboardStats, activeMenuData] = await Promise.all([
          getDashboardStats(),
          getActiveMenu()
        ]);
        setStats(dashboardStats);
        setActiveMenu(activeMenuData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar title="Admin Dashboard" step="Overview" />

      <main className="px-8 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-main-text">Admin Dashboard</h1>
            <p className="text-muted-text mt-2">Manage your canteen meal program</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat: DashboardStat, index: number) => (
              <Link key={index} href={stat.href} className="group">
                <div className="bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-primary/30 hover:bg-red-50 transition-all cursor-pointer hover:shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-red-100 text-primary">
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium text-success">
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-main-text">{stat.value}</h3>
                  <p className="text-sm text-muted-text mt-1">{stat.title}</p>
                </div>
              </Link>
            ))}
          </div>


          {/* Active Menu */}
          <div className="bg-white rounded-lg border-2 border-gray-200 mb-8">
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : activeMenu ? (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <div className="bg-red-100 p-3 rounded-lg mr-4">
                        <UtensilsCrossed className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-semibold text-main-text">{activeMenu.name}</h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-success">
                            Active Menu
                          </span>
                        </div>
                        <p className="text-sm text-muted-text">Current active menu</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center text-sm text-muted-text">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{new Date(activeMenu.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-text">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Deadline: {new Date(activeMenu.deadline).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-6">
                    <Link href="/admin/view_selections">
                      <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-main-text mb-2">No Active Menu</h3>
                  <p className="text-sm text-muted-text">No active menu found</p>
                  <Link href="/admin/manage_menu" className="mt-4 inline-block">
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium">
                      Create Menu
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>


          {/* Management Section */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-main-text">Management</h2>
              <span className="text-sm text-muted-text">Quick access to admin functions</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/admin/manage_users" className="group">
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-primary/30 hover:bg-red-50 transition-all hover:shadow-sm">
                  <div className="flex items-center">
                    <div className="bg-red-100 p-2 rounded-lg mr-4">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-main-text">Manage Users</h3>
                      <p className="text-sm text-muted-text">Add, edit, or remove users</p>
                    </div>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-muted-text rotate-180 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              <Link href="/admin/manage_menu" className="group">
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-primary/30 hover:bg-red-50 transition-all hover:shadow-sm">
                  <div className="flex items-center">
                    <div className="bg-red-100 p-2 rounded-lg mr-4">
                      <UtensilsCrossed className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-main-text">Manage Menu</h3>
                      <p className="text-sm text-muted-text">Create menus and add meals</p>
                    </div>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-muted-text rotate-180 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              <Link href="/admin/view_selections" className="group">
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-primary/30 hover:bg-red-50 transition-all hover:shadow-sm">
                  <div className="flex items-center">
                    <div className="bg-red-100 p-2 rounded-lg mr-4">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-main-text">View Selections</h3>
                      <p className="text-sm text-muted-text">Check user meal preferences</p>
                    </div>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-muted-text rotate-180 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              <Link href="/admin/reports" className="group">
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-primary/30 hover:bg-red-50 transition-all hover:shadow-sm">
                  <div className="flex items-center">
                    <div className="bg-red-100 p-2 rounded-lg mr-4">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-main-text">Reports</h3>
                      <p className="text-sm text-muted-text">Generate and view reports</p>
                    </div>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-muted-text rotate-180 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
