export interface Project {
  _id?: string;
  id: string;
  name: string;
  status: string;
  budget: number;
  startDate: string;
  endDate: string;
  createdAt?: string;
  tasks?: Task[];
  resources?: Resource[];
  risks?: RiskPrediction[];
}

export interface Task {
  _id?: string;
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  estimatedHours: number;
  actualHours?: number;
  dueDate: string;
  assignedTo?: string | Resource;
  resource?: Resource;
  complexityScore?: number;
}

export interface Resource {
  _id?: string;
  id: string;
  name: string;
  role: string;
  availabilityHours?: number;
  skillSet?: string;
  projectId?: string;
}

export interface RiskPrediction {
  _id?: string;
  id: string;
  projectId: string;
  riskType: string;
  riskScore: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  affectedArea: string;
  mitigationSuggestion: string;
  topRisks?: Array<{ area: string; mitigationSuggestion: string }>;
  predictedAt: string;
}

export interface Report {
  id: string;
  projectId: string;
  reportType: string;
  format: string;
  filePath: string;
  reportContent: string;
  generatedAt: string;
}

export interface ScheduleEntry {
  taskId: string;
  taskTitle: string;
  suggestedStartDate: string;
  suggestedResource: string;
  resourceName: string;
  reason?: string;
}

export interface OptimizedSchedule {
  id?: string;
  projectId: string;
  schedule: ScheduleEntry[];
  conflicts: string[];
  summary?: string;
  generatedAt: string;
}

// ── Form payload types ───────────────────────────

export interface CreateProjectPayload {
  name: string;
  status: string;
  budget: number;
  startDate: string;
  endDate: string;
}

export interface CreateTaskPayload {
  projectId: string;
  title: string;
  priority: string;
  status: string;
  estimatedHours: number;
  dueDate: string;
  assignedTo?: string;
  complexityScore?: number;
}
