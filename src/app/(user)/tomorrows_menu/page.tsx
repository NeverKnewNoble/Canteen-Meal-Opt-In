'use client';

import { CalendarDays, Clock, UtensilsCrossed, ArrowRight, Sparkles, HandPlatter } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getTomorrowsMenu } from '@/utils/menu';
import type { Menu } from '@/types/menu';

export default function TomorrowsMenu() {
  const [tomorrowMenu, setTomorrowMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTomorrowsMenu = async () => {
      try {
        const menu = await getTomorrowsMenu();
        setTomorrowMenu(menu);
      } catch (error) {
        console.error('Error fetching tomorrow\'s menu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTomorrowsMenu();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format deadline time
  const formatDeadline = (deadlineString: string) => {
    const deadline = new Date(deadlineString);
    return deadline.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar title="Tomorrow's Menu" step="Menu Preview" backHref="/" />
        <main className="px-4 py-8">
          <div className="max-w-lg mx-auto text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!tomorrowMenu) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar title="Tomorrow's Menu" step="Menu Preview" backHref="/" />
        <main className="px-4 py-8">
          <div className="max-w-lg mx-auto text-center">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
              <UtensilsCrossed className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">No Menu Available</h2>
              <p className="text-gray-500 mb-6">There's no menu scheduled for tomorrow. Please check back later.</p>
              <Link href="/" className="inline-block">
                <button className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold transition-all">
                  Go Back Home
                </button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar title="Tomorrow's Menu" step="Menu Preview" backHref="/" />

      <main className="px-4 py-8">
        <div className="max-w-lg mx-auto">

          {/* Menu Card */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">

            {/* Card Header - Decorative Top */}
            <div className="bg-primary px-6 py-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-red-200" />
                <span className="text-red-200 text-xs font-medium uppercase tracking-wider">Tomorrow's Special</span>
                <Sparkles className="w-4 h-4 text-red-200" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                {tomorrowMenu.name}
              </h1>
            </div>

            {/* Date & Time Info */}
            <div className="bg-red-50 px-6 py-3 flex items-center justify-center gap-6 border-b border-red-100">
              <div className="flex items-center text-sm text-main-text">
                <CalendarDays className="w-4 h-4 mr-2 text-primary" />
                <span>{formatDate(tomorrowMenu.date)}</span>
              </div>
              <div className="w-px h-4 bg-red-200" />
              <div className="flex items-center text-sm text-main-text">
                <Clock className="w-4 h-4 mr-2 text-warning" />
                <span>Closes {formatDeadline(tomorrowMenu.deadline)}</span>
              </div>
            </div>

            {/* Menu Items Section */}
            <div className="px-6 py-6">
              <div className="text-center mb-5">
                <h2 className="text-sm font-semibold text-muted-text uppercase tracking-wider">Available Options</h2>
                <div className="mt-2 flex items-center justify-center">
                  <div className="h-px w-8 bg-red-200" />
                  <UtensilsCrossed className="w-4 h-4 mx-3 text-primary" />
                  <div className="h-px w-8 bg-red-200" />
                </div>
              </div>

              {/* Meal Options List */}
              <div className="space-y-4">
                {tomorrowMenu.meals?.map((meal) => (
                  <div
                    key={meal.id}
                    className="flex items-start gap-3 pb-4 border-b border-dashed border-gray-200 last:border-0 last:pb-0"
                  >
                    <div className="shrink-0 w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                      <HandPlatter className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-main-text">{meal.name}</h3>
                      <p className="text-sm text-muted-text mt-0.5">{meal.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative Divider */}
            <div className="px-6">
              <div className="border-t-2 border-dashed border-gray-200" />
            </div>

            {/* CTA Section */}
            <div className="px-6 py-6 text-center">
              <p className="text-sm text-muted-text mb-4">
                Select your name and choose your meal preference
              </p>
              <Link href="/select_names" className="block">
                <button className="w-full cursor-pointer bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 inline-flex items-center justify-center gap-2">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <p className="text-xs text-muted-text mt-3">
                Don't miss out — deadline is today at {formatDeadline(tomorrowMenu.deadline)}
              </p>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
