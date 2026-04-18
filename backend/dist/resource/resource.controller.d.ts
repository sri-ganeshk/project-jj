import { ResourceService } from './resource.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
export declare class ResourceController {
    private readonly resourceService;
    constructor(resourceService: ResourceService);
    create(createResourceDto: CreateResourceDto): Promise<{
        name: string;
        id: string;
        projectId: string;
        role: string;
        availabilityHours: number;
        skillSet: string;
    }>;
    findAll(): Promise<({
        project: {
            name: string;
            startDate: Date;
            endDate: Date;
            status: string;
            budget: number;
            id: string;
            createdAt: Date;
        };
    } & {
        name: string;
        id: string;
        projectId: string;
        role: string;
        availabilityHours: number;
        skillSet: string;
    })[]>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        projectId: string;
        role: string;
        availabilityHours: number;
        skillSet: string;
    }>;
    update(id: string, updateResourceDto: UpdateResourceDto): Promise<{
        name: string;
        id: string;
        projectId: string;
        role: string;
        availabilityHours: number;
        skillSet: string;
    }>;
    remove(id: string): Promise<{
        name: string;
        id: string;
        projectId: string;
        role: string;
        availabilityHours: number;
        skillSet: string;
    }>;
}
