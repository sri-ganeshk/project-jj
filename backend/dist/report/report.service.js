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
exports.ReportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
let ReportService = class ReportService {
    prisma;
    ai;
    constructor(prisma, ai) {
        this.prisma = prisma;
        this.ai = ai;
    }
    async generateReport(projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                tasks: true,
                resources: true,
                risks: true,
            },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const promptText = JSON.stringify({
            project: {
                name: project.name,
                status: project.status,
                budget: project.budget,
            },
            tasks: project.tasks,
            risks: project.risks,
        });
        const systemInstruction = `You are an AI Executive Reporter. You strictly output valid JSON.
Generate an executive summary report for the project. 
Return a JSON object like: { "projectId": 123, "reportContent": "# Executive Summary\\n\\nMarkdown content here..." }`;
        const result = (await this.ai.generateJson(promptText, systemInstruction));
        await this.prisma.report.create({
            data: {
                projectId,
                reportType: 'Executive Summary',
                format: 'Markdown',
                filePath: `/tmp/reports/project_${projectId}_summary.md`,
            },
        });
        return result;
    }
};
exports.ReportService = ReportService;
exports.ReportService = ReportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], ReportService);
//# sourceMappingURL=report.service.js.map