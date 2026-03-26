import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
export declare class ReportService {
    private prisma;
    private ai;
    constructor(prisma: PrismaService, ai: AiService);
    generateReport(projectId: string): Promise<Record<string, unknown>>;
}
