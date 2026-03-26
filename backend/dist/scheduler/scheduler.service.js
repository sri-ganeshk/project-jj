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
exports.SchedulerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
let SchedulerService = class SchedulerService {
    prisma;
    ai;
    constructor(prisma, ai) {
        this.prisma = prisma;
        this.ai = ai;
    }
    async optimizeSchedule(projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: { tasks: { include: { dependencies: true } }, resources: true },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const promptText = JSON.stringify({
            tasks: project.tasks,
            resources: project.resources,
            targetEndDate: project.endDate,
        });
        const systemInstruction = `You are an expert Agile Project Planner. You strictly output valid JSON. 
You will receive a list of tasks, their dependencies, and available resources. 
Your job is to return a JSON array mapping each taskId to an optimal 'assignedResource' (MongoDB ObjectId string) and 'suggestedStartDate' (YYYY-MM-DD) taking into account estimated hours and dependencies.
Return a JSON structure like: { "projectId": "some-id", "optimizedSchedule": [ { "taskId": "task-id", "suggestedStartDate": "2026-03-24", "suggestedResource": "resource-id" } ], "conflicts": [] }`;
        const result = (await this.ai.generateJson(promptText, systemInstruction));
        return result;
    }
};
exports.SchedulerService = SchedulerService;
exports.SchedulerService = SchedulerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], SchedulerService);
//# sourceMappingURL=scheduler.service.js.map