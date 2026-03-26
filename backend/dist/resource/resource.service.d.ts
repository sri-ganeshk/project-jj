import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class ResourceService {
    private prisma;
    constructor(prisma: PrismaService);
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
