import { supabase } from '@/lib/supabase';
import type { DashboardStat } from '@/types';
import { Users, UtensilsCrossed, Calendar, TrendingUp } from 'lucide-react';

// Get total number of users
export const getTotalUsers = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching total users:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getTotalUsers:', error);
    return 0;
  }
};

// Get total number of meals
export const getTotalMeals = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('meals')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching total meals:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getTotalMeals:', error);
    return 0;
  }
};

// Get today's selections count
export const getTodaySelections = async (): Promise<number> => {
  try {
    const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    const { count, error } = await supabase
      .from('selections')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    if (error) {
      console.error('Error fetching today selections:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getTodaySelections:', error);
    return 0;
  }
};

// Get participation rate (percentage of users who have made selections)
export const getParticipationRate = async (): Promise<number> => {
  try {
    const totalUsers = await getTotalUsers();
    
    if (totalUsers === 0) return 0;

    const { count, error } = await supabase
      .from('selections')
      .select('user_id', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching participation data:', error);
      return 0;
    }

    const uniqueUsers = count || 0;
    return Math.round((uniqueUsers / totalUsers) * 100);
  } catch (error) {
    console.error('Error in getParticipationRate:', error);
    return 0;
  }
};

// Get active meals count (meals from active/upcoming menus)
export const getActiveMeals = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('meals')
      .select('id', { count: 'exact', head: true })
      .in('menu_id', (
        await supabase
          .from('menu')
          .select('id')
          .in('status', ['active', 'upcoming'])
      ).data?.map(menu => menu.id) || []);

    if (error) {
      console.error('Error fetching active meals:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getActiveMeals:', error);
    return 0;
  }
};

// Get all dashboard stats
export const getDashboardStats = async (): Promise<DashboardStat[]> => {
  try {
    const [totalUsers, activeMeals, todaySelections, participationRate] = await Promise.all([
      getTotalUsers(),
      getActiveMeals(),
      getTodaySelections(),
      getParticipationRate()
    ]);

    return [
      {
        title: 'Total Users',
        value: totalUsers.toString(),
        change: '+5%', // This could be calculated based on historical data
        icon: Users,
        color: 'blue',
        href: '/admin/manage_users'
      },
      {
        title: 'Active Meals',
        value: activeMeals.toString(),
        change: '+2', // This could be calculated based on historical data
        icon: UtensilsCrossed,
        color: 'green',
        href: '/admin/manage_menu'
      },
      {
        title: "Today's Selections",
        value: todaySelections.toString(),
        change: '+8%', // This could be calculated based on historical data
        icon: Calendar,
        color: 'purple',
        href: '/admin/view_selections'
      },
      {
        title: 'Participation Rate',
        value: `${participationRate}%`,
        change: '+3%', // This could be calculated based on historical data
        icon: TrendingUp,
        color: 'orange',
        href: '/admin/reports'
      }
    ];
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return fallback data
    return [
      {
        title: 'Total Users',
        value: '0',
        change: '0%',
        icon: Users,
        color: 'blue',
        href: '/admin/manage_users'
      },
      {
        title: 'Active Meals',
        value: '0',
        change: '0',
        icon: UtensilsCrossed,
        color: 'green',
        href: '/admin/manage_menu'
      },
      {
        title: "Today's Selections",
        value: '0',
        change: '0%',
        icon: Calendar,
        color: 'purple',
        href: '/admin/view_selections'
      },
      {
        title: 'Participation Rate',
        value: '0%',
        change: '0%',
        icon: TrendingUp,
        color: 'orange',
        href: '/admin/reports'
      }
    ];
  }
};