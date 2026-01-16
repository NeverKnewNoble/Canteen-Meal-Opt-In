'use client';

import { Calendar, Clock, ChevronLeft, FileText, UtensilsCrossed, Users } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { sampleUpcomingMeals, sampleDashboardStats } from '@/utils/sampleData';

export default function AdminDashboard() {
  const stats = sampleDashboardStats;
  const upcomingMeals = sampleUpcomingMeals;

  const getColorClass = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
    };
    return colors[color as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  const getBorderColorClass = (color: string) => {
    const colors = {
      blue: 'border-2 border-blue-200 hover:bg-blue-50',
      green: 'border-2 border-green-200 hover:bg-green-50',
      purple: 'border-2 border-purple-200 hover:bg-purple-50',
      orange: 'border-2 border-orange-200 hover:bg-orange-50',
    };
    return colors[color as keyof typeof colors] || 'border-2 border-gray-200 hover:bg-gray-50';
  };

  const getActivityColor = (type: string) => {
    const types = {
      user: 'bg-blue-100 text-blue-800',
      deadline: 'bg-orange-100 text-orange-800',
      system: 'bg-green-100 text-green-800',
      report: 'bg-purple-100 text-purple-800',
    };
    return types[type as keyof typeof types] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Admin Dashboard" step="Overview" backHref="/" />
      
      <main className="px-8 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-2">Manage your canteen meal program</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Link key={index} href={stat.href} className="group">
                <div className={`bg-white p-6 rounded-lg ${getBorderColorClass(stat.color)} transition-all cursor-pointer hover:shadow-lg`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${getColorClass(stat.color)}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                  <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
                </div>
              </Link>
            ))}
          </div>


          {/* Active Menu */}
          <div className="bg-white rounded-lg border border-gray-200 mb-8">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="bg-orange-100 p-3 rounded-lg mr-4">
                      <UtensilsCrossed className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-semibold text-gray-900">Rice with Chicken Curry</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active Menu
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">Tomorrow's lunch option</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Tomorrow</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Deadline: 4:00 PM</span>
                    </div>
                  </div>
                </div>
                <div className="ml-6">
                  <Link href="/admin/view_selections">
                    <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>


          {/* Management Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 ">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Management</h2>
              <span className="text-sm text-gray-500">Quick access to admin functions</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/admin/manage_users" className="group">
                <div className="flex items-center justify-between p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-all hover:shadow-sm">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-4">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Manage Users</h3>
                      <p className="text-sm text-gray-500">Add, edit, or remove users</p>
                    </div>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              <Link href="/admin/manage_meals" className="group">
                <div className="flex items-center justify-between p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-all hover:shadow-sm">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-lg mr-4">
                      <UtensilsCrossed className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Manage Meals</h3>
                      <p className="text-sm text-gray-500">Create and schedule meals</p>
                    </div>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              <Link href="/admin/view_selections" className="group">
                <div className="flex items-center justify-between p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-all hover:shadow-sm">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-2 rounded-lg mr-4">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">View Selections</h3>
                      <p className="text-sm text-gray-500">Check user meal preferences</p>
                    </div>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              <Link href="/admin/reports" className="group">
                <div className="flex items-center justify-between p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition-all hover:shadow-sm">
                  <div className="flex items-center">
                    <div className="bg-orange-100 p-2 rounded-lg mr-4">
                      <FileText className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Reports</h3>
                      <p className="text-sm text-gray-500">Generate and view reports</p>
                    </div>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
