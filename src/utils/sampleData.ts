// Sample data for the canteen meal opt-in system

import type { 
  User, 
  Meal, 
  UserSelectionData, 
  AdminMeal, 
  Selection, 
  DepartmentData, 
  MealPopularity, 
  RecentActivity, 
  UpcomingMeal,
  ReportData,
  DashboardStat
} from '@/types';
import { Users, UtensilsCrossed, Calendar, TrendingUp } from 'lucide-react';

export const sampleUsers: User[] = [
  {
    id: '1',
    name: 'Lisa Anderson',
    department: 'Marketing'
  },
  {
    id: '2',
    name: 'John Smith',
    department: 'Engineering'
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    department: 'Design'
  },
  {
    id: '4',
    name: 'Mike Wilson',
    department: 'Sales'
  },
  {
    id: '5',
    name: 'Emily Brown',
    department: 'HR'
  },
  {
    id: '6',
    name: 'David Wilson',
    department: 'HR'
  },
  {
    id: '7',
    name: 'Jennifer Martinez',
    department: 'Finance'
  },
  {
    id: '8',
    name: 'Robert Taylor',
    department: 'Operations'
  },
  {
    id: '9',
    name: 'James Thomas',
    department: 'Engineering'
  },
  {
    id: '10',
    name: 'Maria Garcia',
    department: 'Sales'
  }
];

export const sampleMeals: Meal[] = [
  {
    id: 'vegetarian',
    name: 'Vegetarian Pasta',
    description: 'Penne pasta with roasted vegetables and marinara sauce',
    time: '12:00 PM',
    spots: 15,
    totalSpots: 30
  },
  {
    id: 'chicken',
    name: 'Grilled Chicken',
    description: 'Herb-crusted chicken breast with roasted potatoes',
    time: '12:30 PM',
    spots: 8,
    totalSpots: 25
  },
  {
    id: 'salad',
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with parmesan and croutons',
    time: '1:00 PM',
    spots: 20,
    totalSpots: 35
  },
  {
    id: 'fish',
    name: 'Grilled Salmon',
    description: 'Atlantic salmon with lemon butter sauce and asparagus',
    time: '12:15 PM',
    spots: 12,
    totalSpots: 20
  },
  {
    id: 'sandwich',
    name: 'Club Sandwich',
    description: 'Triple-decker sandwich with turkey, bacon, and avocado',
    time: '12:45 PM',
    spots: 18,
    totalSpots: 40
  }
];

export const departments = [
  'Marketing',
  'Engineering',
  'Design',
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Customer Support'
];

// Admin sample data
export const sampleUserSelections: UserSelectionData[] = [
  { user: { id: '1', name: 'Lisa Anderson', department: 'Marketing' }, optIn: true },
  { user: { id: '2', name: 'John Smith', department: 'Engineering' }, optIn: false },
];

export const sampleAdminMeals: AdminMeal[] = [
  { id: '1', name: 'Rice with Chicken Curry', date: '2026-01-13', deadline: '2026-01-12 16:00', status: 'active' },
  { id: '2', name: 'Pasta Carbonara', date: '2026-01-14', deadline: '2026-01-13 16:00', status: 'upcoming' },
  { id: '3', name: 'Grilled Salmon', date: '2026-01-12', deadline: '2026-01-11 16:00', status: 'completed' },
  { id: '4', name: 'Beef Tacos', date: '2026-01-15', deadline: '2026-01-14 16:00', status: 'upcoming' },
  { id: '5', name: 'Vegetable Stir Fry', date: '2026-01-11', deadline: '2026-01-10 16:00', status: 'completed' },
];

export const sampleSelections: Selection[] = [
  { id: '1', userName: 'Lisa Anderson', department: 'Marketing', mealName: 'Rice with Chicken Curry', mealDate: '2026-01-13', optedIn: true },
  { id: '2', userName: 'John Smith', department: 'Engineering', mealName: 'Rice with Chicken Curry', mealDate: '2026-01-13', optedIn: false },
  { id: '3', userName: 'Sarah Johnson', department: 'Marketing', mealName: 'Rice with Chicken Curry', mealDate: '2026-01-13', optedIn: true },
  { id: '4', userName: 'Michael Brown', department: 'Sales', mealName: 'Rice with Chicken Curry', mealDate: '2026-01-13', optedIn: true },
  { id: '5', userName: 'Emily Davis', department: 'Engineering', mealName: 'Rice with Chicken Curry', mealDate: '2026-01-13', optedIn: false },
  { id: '6', userName: 'David Wilson', department: 'HR', mealName: 'Rice with Chicken Curry', mealDate: '2026-01-13', optedIn: true },
];

export const sampleDepartmentData: DepartmentData[] = [
  { department: 'Engineering', participants: 25, total: 32, percentage: 78 },
  { department: 'Marketing', participants: 18, total: 22, percentage: 82 },
  { department: 'Sales', participants: 15, total: 20, percentage: 75 },
  { department: 'HR', participants: 8, total: 10, percentage: 80 },
  { department: 'Finance', participants: 12, total: 15, percentage: 80 },
  { department: 'Operations', participants: 11, total: 14, percentage: 79 },
];

export const sampleMealPopularity: MealPopularity[] = [
  { meal: 'Rice with Chicken Curry', orders: 145, rating: 4.5 },
  { meal: 'Pasta Carbonara', orders: 132, rating: 4.7 },
  { meal: 'Grilled Salmon', orders: 128, rating: 4.8 },
  { meal: 'Beef Tacos', orders: 115, rating: 4.6 },
  { meal: 'Vegetable Stir Fry', orders: 98, rating: 4.2 },
];

export const sampleRecentActivity: RecentActivity[] = [
  { action: 'New user registered', detail: 'John Smith - Engineering', time: '10 minutes ago', type: 'user' },
  { action: 'Meal deadline approaching', detail: 'Rice with Chicken Curry - 2 hours left', time: '2 hours ago', type: 'deadline' },
  { action: 'Bulk import completed', detail: '15 users added successfully', time: '4 hours ago', type: 'system' },
  { action: 'Weekly report generated', detail: 'Participation up 12% from last week', time: '1 day ago', type: 'report' },
];

export const sampleUpcomingMeals: UpcomingMeal[] = [
  { name: 'Rice with Chicken Curry', date: 'Tomorrow', deadline: '2026-01-12 16:00', status: 'active' },
  { name: 'Pasta Carbonara', date: '2026-01-14', deadline: '2026-01-13 16:00', status: 'upcoming' },
  { name: 'Grilled Salmon', date: '2026-01-15', deadline: '2026-01-14 16:00', status: 'upcoming' },
];

// Dashboard stats data
export const sampleDashboardStats: DashboardStat[] = [
  { title: 'Total Users', value: '89', change: '+5%', icon: Users, color: 'blue', href: '/admin/manage_users' },
  { title: 'Active Meals', value: '12', change: '+2', icon: UtensilsCrossed, color: 'green', href: '/admin/manage_meals' },
  { title: "Today's Selections", value: '67', change: '+8%', icon: Calendar, color: 'purple', href: '/admin/view_selections' },
  { title: 'Participation Rate', value: '75%', change: '+3%', icon: TrendingUp, color: 'orange', href: '/admin/reports' },
];

// Report data
export const sampleReportData: ReportData = {
  menuItem: 'Rice with Chicken Curry',
  totalSubmissions: 2,
  date: '2026-01-13',
  deadline: '2026-01-12 16:00',
  optIn: 2,
  optOut: 1,
  generatedDate: '1/14/2026',
  generatedTime: '1/14/2026, 6:16:19 PM',
  submissions: [
    {
      id: 1,
      name: 'John Smith',
      department: 'Engineering',
      selection: 'Yes',
      time: '1/12/2026, 10:30:00 AM'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      department: 'Marketing',
      selection: 'Yes',
      time: '1/12/2026, 10:30:00 AM'
    },
    {
      id: 3,
      name: 'Michael Brown',
      department: 'Sales',
      selection: 'No',
      time: '1/12/2026, 11:15:00 AM'
    }
  ]
};