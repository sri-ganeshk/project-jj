import { CreateTaskDto } from './create-task.dto';
declare const UpdateTaskDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateTaskDto>>;
export declare class UpdateTaskDto extends UpdateTaskDto_base {
    title?: string;
    priority?: string;
    estimatedHours?: number;
    actualHours?: number;
    status?: string;
    dueDate?: string;
    assignedTo?: string;
    complexityScore?: number;
}
export {};
