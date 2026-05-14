import { apiFetch } from '@/utils/api-client';
import type { DashboardStat } from '@/types';
import { Users, UtensilsCrossed, Calendar, TrendingUp } from 'lucide-react';

type StatsPayload = {
  totalUsers: number;
  activeMeals: number;
  todaySelections: number;
  participationRate: number;
  totalMeals: number;
};

const fallbackStats = (): DashboardStat[] => [
  {
    title: 'Total Users',
    value: '0',
    change: '0%',
    icon: Users,
    color: 'blue',
    href: '/canteen-control/manage_users',
  },
  {
    title: 'Active Meals',
    value: '0',
    change: '0',
    icon: UtensilsCrossed,
    color: 'green',
    href: '/canteen-control/manage_menu',
  },
  {
    title: "Today's Selections",
    value: '0',
    change: '0%',
    icon: Calendar,
    color: 'purple',
    href: '/canteen-control/view_selections',
  },
  {
    title: 'Participation Rate',
    value: '0%',
    change: '0%',
    icon: TrendingUp,
    color: 'orange',
    href: '/canteen-control/reports',
  },
];

export const getDashboardStats = async (): Promise<DashboardStat[]> => {
  try {
    const s = await apiFetch<StatsPayload>('/api/dashboard/stats');
    return [
      {
        title: 'Total Users',
        value: s.totalUsers.toString(),
        change: '+5%',
        icon: Users,
        color: 'blue',
        href: '/canteen-control/manage_users',
      },
      {
        title: 'Active Meals',
        value: s.activeMeals.toString(),
        change: '+2',
        icon: UtensilsCrossed,
        color: 'green',
        href: '/canteen-control/manage_menu',
      },
      {
        title: "Today's Selections",
        value: s.todaySelections.toString(),
        change: '+8%',
        icon: Calendar,
        color: 'purple',
        href: '/canteen-control/view_selections',
      },
      {
        title: 'Participation Rate',
        value: `${s.participationRate}%`,
        change: '+3%',
        icon: TrendingUp,
        color: 'orange',
        href: '/canteen-control/reports',
      },
    ];
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return fallbackStats();
  }
};
