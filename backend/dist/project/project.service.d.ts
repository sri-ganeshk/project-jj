import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class ProjectService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createProjectDto: CreateProjectDto): Promise<{
        id: string;
        name: string;
        startDate: Date;
        endDate: Date;
        status: string;
        budget: number;
        createdAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        startDate: Date;
        endDate: Date;
        status: string;
        budget: number;
        createdAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        tasks: {
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
        }[];
        resources: {
            id: string;
            name: string;
            projectId: string;
            role: string;
            availabilityHours: number;
            skillSet: string;
        }[];
    } & {
        id: string;
        name: string;
        startDate: Date;
        endDate: Date;
        status: string;
        budget: number;
        createdAt: Date;
    }>;
    update(id: string, updateProjectDto: UpdateProjectDto): Promise<{
        id: string;
        name: string;
        startDate: Date;
        endDate: Date;
        status: string;
        budget: number;
        createdAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        startDate: Date;
        endDate: Date;
        status: string;
        budget: number;
        createdAt: Date;
    }>;
}
