import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class TaskService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createTaskDto: CreateTaskDto): Promise<{
        id: string;
        status: string;
        title: string;
        priority: string;
        estimatedHours: number;
        actualHours: number;
        dueDate: Date;
        complexityScore: number;
        projectId: string;
        assignedTo: string | null;
    }>;
    findAll(): Promise<({
        resource: {
            id: string;
            name: string;
            projectId: string;
            role: string;
            availabilityHours: number;
            skillSet: string;
        } | null;
    } & {
        id: string;
        status: string;
        title: string;
        priority: string;
        estimatedHours: number;
        actualHours: number;
        dueDate: Date;
        complexityScore: number;
        projectId: string;
        assignedTo: string | null;
    })[]>;
    findOne(id: string): Promise<{
        resource: {
            id: string;
            name: string;
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
        id: string;
        status: string;
        title: string;
        priority: string;
        estimatedHours: number;
        actualHours: number;
        dueDate: Date;
        complexityScore: number;
        projectId: string;
        assignedTo: string | null;
    }>;
    update(id: string, updateTaskDto: UpdateTaskDto): Promise<{
        id: string;
        status: string;
        title: string;
        priority: string;
        estimatedHours: number;
        actualHours: number;
        dueDate: Date;
        complexityScore: number;
        projectId: string;
        assignedTo: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        status: string;
        title: string;
        priority: string;
        estimatedHours: number;
        actualHours: number;
        dueDate: Date;
        complexityScore: number;
        projectId: string;
        assignedTo: string | null;
    }>;
}
