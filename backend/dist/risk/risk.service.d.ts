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
    findAll(): Promise<{
        id: string;
        projectId: string;
        riskType: string;
        riskScore: number;
        severity: string;
        affectedArea: string;
        mitigationSuggestion: string;
        predictedAt: Date;
    }[]>;
    findByProject(projectId: string): Promise<{
        id: string;
        projectId: string;
        riskType: string;
        riskScore: number;
        severity: string;
        affectedArea: string;
        mitigationSuggestion: string;
        predictedAt: Date;
    }[]>;
}
