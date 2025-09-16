export interface Task {
  id: string;
  title: string;
  description?: string;
  category: string;
  notes?: string;
  
  // Scoring system (1-5 scale)
  importance: number;  // How important is this task
  urgency: number;     // How urgent is this task
  impact: number;      // Expected positive impact
  effort: number;      // Required effort/difficulty
  
  // Time estimates
  estimatedTime: number; // In minutes
  
  // Status and metadata
  status: 'incomplete' | 'in-progress' | 'complete';
  createdAt: Date;
  modifiedAt: Date;
  deadline?: Date;
  
  // Scheduling
  yearAssignment?: number;
  monthAssignment?: number;
  weekAssignment?: number;
  scheduledDate?: Date;
}

export interface TaskMetrics {
  priorityScore: number;        // (importance + urgency + impact - effort)
  schedulingWeight: number;     // (Importance × Impact) / (Effort × Time_Required)
  eisenhowerQuadrant: 1 | 2 | 3 | 4; // Based on importance/urgency
  impactEffortRatio: number;    // Impact / Effort
}

export type ViewMode = 'dashboard' | 'eisenhower' | 'impact-cost' | 'schedule';

export type FilterOptions = {
  status?: 'incomplete' | 'in-progress' | 'complete' | 'all';
  category?: string;
  scoreRange?: [number, number];
  timeRange?: [number, number]; // minutes
  quadrant?: 1 | 2 | 3 | 4;
};

export type SortOption = 
  | 'priority-desc' 
  | 'priority-asc' 
  | 'scheduling-weight-desc' 
  | 'deadline-asc' 
  | 'impact-desc' 
  | 'effort-asc';