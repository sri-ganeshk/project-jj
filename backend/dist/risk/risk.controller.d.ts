import { RiskService } from './risk.service';
export declare class RiskController {
    private readonly riskService;
    constructor(riskService: RiskService);
    predictRisk(projectId: string): Promise<{
        riskScore: number;
        severity: string;
        riskType?: string;
        topRisks?: {
            area: string;
            mitigationSuggestion: string;
        }[] | undefined;
    }>;
}
