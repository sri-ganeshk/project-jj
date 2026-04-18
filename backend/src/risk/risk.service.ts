import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class RiskService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
  ) {}

  async predictRisk(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { tasks: true, resources: true },
    });

    if (!project) throw new NotFoundException('Project not found');

    const promptText = JSON.stringify({
      tasks: project.tasks,
      budget: project.budget,
      endDate: project.endDate,
    });

    const systemInstruction = `You are an AI Risk Assessor. Evaluate the provided project metrics. You strictly output valid JSON.
Return a JSON object containing a float 'riskScore' between 0.0 and 1.0, a string 'severity' (Low, Medium, High, Critical), string 'riskType' and an array of 'topRisks' with suggestion strings like: { "riskScore": 0.75, "severity": "High", "riskType": "Resource Allocation", "topRisks": [{"area": "Backend", "mitigationSuggestion": "Reassign Task 12"}] }`;

    const result = (await this.ai.generateJson(
      promptText,
      systemInstruction,
    )) as {
      riskScore: number;
      severity: string;
      riskType?: string;
      topRisks?: Array<{ area: string; mitigationSuggestion: string }>;
    };

    // Persist finding
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

  /** Return all persisted risk predictions, newest first */
  async findAll() {
    return this.prisma.riskPrediction.findMany({
      orderBy: { predictedAt: 'desc' },
    });
  }

  /** Return risk predictions for a specific project, newest first */
  async findByProject(projectId: string) {
    return this.prisma.riskPrediction.findMany({
      where: { projectId },
      orderBy: { predictedAt: 'asc' },
    });
  }
}
