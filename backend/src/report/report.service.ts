import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ReportService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
  ) {}

  async generateReport(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: true,
        resources: true,
        risks: true,
      },
    });

    if (!project) throw new NotFoundException('Project not found');

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

    const result = (await this.ai.generateJson(
      promptText,
      systemInstruction,
    )) as Record<string, unknown>;

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
}
