export declare class CreateTaskDto {
    projectId: string;
    title: string;
    priority: string;
    estimatedHours: number;
    status: string;
    dueDate: string;
    assignedTo?: string;
    complexityScore?: number;
}
