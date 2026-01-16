// Analytics related types

export interface DepartmentData {
  department: string;
  participants: number;
  total: number;
  percentage: number;
}

export interface MealPopularity {
  meal: string;
  orders: number;
  rating: number;
}



export interface ReportSubmission {
  id: number;
  name: string;
  department: string;
  selection: 'Yes' | 'No';
  time: string;
}

export interface ReportData {
  menuItem: string;
  totalSubmissions: number;
  date: string;
  deadline: string;
  optIn: number;
  optOut: number;
  generatedDate: string;
  generatedTime: string;
  submissions: ReportSubmission[];
}

export interface DashboardStat {
  title: string;
  value: string;
  change: string;
  icon: any;
  color: 'blue' | 'green' | 'purple' | 'orange';
  href: string;
}
