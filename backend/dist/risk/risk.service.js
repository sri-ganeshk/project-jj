"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
let RiskService = class RiskService {
    prisma;
    ai;
    constructor(prisma, ai) {
        this.prisma = prisma;
        this.ai = ai;
    }
    async predictRisk(projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: { tasks: true, resources: true },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const promptText = JSON.stringify({
            tasks: project.tasks,
            budget: project.budget,
            endDate: project.endDate,
        });
        const systemInstruction = `You are an AI Risk Assessor. Evaluate the provided project metrics. You strictly output valid JSON.
Return a JSON object containing a float 'riskScore' between 0.0 and 1.0, a string 'severity' (Low, Medium, High, Critical), string 'riskType' and an array of 'topRisks' with suggestion strings like: { "riskScore": 0.75, "severity": "High", "riskType": "Resource Allocation", "topRisks": [{"area": "Backend", "mitigationSuggestion": "Reassign Task 12"}] }`;
        const result = (await this.ai.generateJson(promptText, systemInstruction));
        await this.prisma.riskPrediction.create({
            data: {
                projectId,
                riskScore: result.riskScore,
                severity: result.severity,
                riskType: result.riskType || 'General',
                affectedArea: result.topRisks?.[0]?.area || 'Unknown',
                mitigationSuggestion: result.topRisks?.[0]?.mitigationSuggestion || '',
            },
        });
        return result;
    }
};
exports.RiskService = RiskService;
exports.RiskService = RiskService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], RiskService);
//# sourceMappingURL=risk.service.js.map