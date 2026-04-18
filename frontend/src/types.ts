export interface Project {
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
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  estimatedHours: number;
  actualHours?: number;
  dueDate: string;
  assignedTo?: string;
  resource?: Resource;
  complexityScore?: number;
}

export interface Resource {
  id: string;
  name: string;
  role: string;
  availabilityHours?: number;
  skillSet?: string;
  projectId?: string;
}

export interface RiskPrediction {
  id: string;
  projectId: string;
  riskType: string;
  riskScore: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  affectedArea: string;
  mitigationSuggestion: string;
  predictedAt: string;
}

export interface Report {
  id: string;
  projectId: string;
  reportType: string;
  format: string;
  filePath: string;
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
