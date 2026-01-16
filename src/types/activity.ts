// Activity related types

export interface RecentActivity {
  action: string;
  detail: string;
  time: string;
  type: 'user' | 'deadline' | 'system' | 'report';
}
