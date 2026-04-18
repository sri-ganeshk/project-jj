import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
export declare class ProjectController {
    private readonly projectService;
    constructor(projectService: ProjectService);
    create(createProjectDto: CreateProjectDto): Promise<{
        name: string;
        startDate: Date;
        endDate: Date;
        status: string;
        budget: number;
        id: string;
        createdAt: Date;
    }>;
    findAll(): Promise<{
        name: string;
        startDate: Date;
        endDate: Date;
        status: string;
        budget: number;
        id: string;
        createdAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        tasks: {
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
        }[];
        resources: {
            name: string;
            id: string;
            projectId: string;
            role: string;
            availabilityHours: number;
            skillSet: string;
        }[];
    } & {
        name: string;
        startDate: Date;
        endDate: Date;
        status: string;
        budget: number;
        id: string;
        createdAt: Date;
    }>;
    update(id: string, updateProjectDto: UpdateProjectDto): Promise<{
        name: string;
        startDate: Date;
        endDate: Date;
        status: string;
        budget: number;
        id: string;
        createdAt: Date;
    }>;
    remove(id: string): Promise<{
        name: string;
        startDate: Date;
        endDate: Date;
        status: string;
        budget: number;
        id: string;
        createdAt: Date;
    }>;
}
