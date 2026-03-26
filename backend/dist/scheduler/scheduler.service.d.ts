import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
export declare class SchedulerService {
    private prisma;
    private ai;
    constructor(prisma: PrismaService, ai: AiService);
    optimizeSchedule(projectId: string): Promise<{
        projectId: string;
        optimizedSchedule: Array<{
            taskId: string;
            suggestedStartDate: string;
            suggestedResource: string;
        }>;
        conflicts: unknown[];
    }>;
}
