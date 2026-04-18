import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class ResourceService {
    private prisma;
    constructor(prisma: PrismaService);
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
