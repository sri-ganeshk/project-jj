export interface Project {
  id: string;
  name: string;
  status: string;
  budget: number;
  startDate: string;
  endDate: string;
  tasks?: Task[];
  resources?: Resource[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  resourceId?: string;
}

export interface Resource {
  id: string;
  name: string;
  role: string;
}
