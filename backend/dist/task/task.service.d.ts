import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class TaskService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createTaskDto: CreateTaskDto): Promise<{
        status: string;
        id: string;
        projectId: string;
        title: string;
        priority: string;
        estimatedHours: number;
        actualHours: number;
        dueDate: Date;
        assignedTo: string | null;
        complexityScore: number;
    }>;
    findAll(): Promise<({
        resource: {
            name: string;
            id: string;
            projectId: string;
            role: string;
            availabilityHours: number;
            skillSet: string;
        } | null;
    } & {
        status: string;
        id: string;
        projectId: string;
        title: string;
        priority: string;
        estimatedHours: number;
        actualHours: number;
        dueDate: Date;
        assignedTo: string | null;
        complexityScore: number;
    })[]>;
    findOne(id: string): Promise<{
        resource: {
            name: string;
            id: string;
            projectId: string;
            role: string;
            availabilityHours: number;
            skillSet: string;
        } | null;
        dependencies: {
            id: string;
            taskId: string;
            dependsOnTaskId: string;
            dependencyType: string;
        }[];
        dependentOn: {
            id: string;
            taskId: string;
            dependsOnTaskId: string;
            dependencyType: string;
        }[];
        history: {
            id: string;
            taskId: string;
            oldStatus: string;
            newStatus: string;
            changedAt: Date;
            changedBy: string;
        }[];
    } & {
        status: string;
        id: string;
        projectId: string;
        title: string;
        priority: string;
        estimatedHours: number;
        actualHours: number;
        dueDate: Date;
        assignedTo: string | null;
        complexityScore: number;
    }>;
    update(id: string, updateTaskDto: UpdateTaskDto): Promise<{
        status: string;
        id: string;
        projectId: string;
        title: string;
        priority: string;
        estimatedHours: number;
        actualHours: number;
        dueDate: Date;
        assignedTo: string | null;
        complexityScore: number;
    }>;
    remove(id: string): Promise<{
        status: string;
        id: string;
        projectId: string;
        title: string;
        priority: string;
        estimatedHours: number;
        actualHours: number;
        dueDate: Date;
        assignedTo: string | null;
        complexityScore: number;
    }>;
}
