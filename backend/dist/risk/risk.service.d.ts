import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
export declare class RiskService {
    private prisma;
    private ai;
    constructor(prisma: PrismaService, ai: AiService);
    predictRisk(projectId: string): Promise<{
        riskScore: number;
        severity: string;
        riskType?: string;
        topRisks?: Array<{
            area: string;
            mitigationSuggestion: string;
        }>;
    }>;
}
