import { ResourceService } from './resource.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
export declare class ResourceController {
    private readonly resourceService;
    constructor(resourceService: ResourceService);
    create(createResourceDto: CreateResourceDto): Promise<{
        id: string;
        name: string;
        projectId: string;
        role: string;
        availabilityHours: number;
        skillSet: string;
    }>;
    findAll(): Promise<({
        project: {
            id: string;
            name: string;
            startDate: Date;
            endDate: Date;
            status: string;
            budget: number;
            createdAt: Date;
        };
    } & {
        id: string;
        name: string;
        projectId: string;
        role: string;
        availabilityHours: number;
        skillSet: string;
    })[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        projectId: string;
        role: string;
        availabilityHours: number;
        skillSet: string;
    }>;
    update(id: string, updateResourceDto: UpdateResourceDto): Promise<{
        id: string;
        name: string;
        projectId: string;
        role: string;
        availabilityHours: number;
        skillSet: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        projectId: string;
        role: string;
        availabilityHours: number;
        skillSet: string;
    }>;
}
