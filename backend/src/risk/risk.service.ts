import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { Task, TaskDocument } from '../schemas/task.schema';
import { Resource, ResourceDocument } from '../schemas/resource.schema';
import {
  RiskPrediction,
  RiskPredictionDocument,
} from '../schemas/risk-prediction.schema';
import { AiService } from '../ai/ai.service';

export interface GeminiRiskResult {
  riskScore: number;
  severity: string;
  riskType: string;
  topRisks: Array<{ area: string; mitigationSuggestion: string }>;
  summary: string;
}

@Injectable()
export class RiskService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(Resource.name) private resourceModel: Model<ResourceDocument>,
    @InjectModel(RiskPrediction.name)
    private riskModel: Model<RiskPredictionDocument>,
    private ai: AiService,
  ) {}

  async predictRisk(projectId: string) {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) throw new NotFoundException('Project not found');

    const tasks = await this.taskModel.find({ projectId }).exec();
    const resources = await this.resourceModel.find({ projectId }).exec();

    const today = new Date();
    const daysLeft = Math.ceil(
      (new Date(project.endDate).getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const overdueTasks = tasks.filter(
      (t) => new Date(t.dueDate) < today && t.status !== 'Done',
    ).length;
    const pendingTasks = tasks.filter((t) => t.status !== 'Done').length;
    const totalEstimatedHours = tasks.reduce(
      (s, t) => s + (t.estimatedHours || 0),
      0,
    );
    const totalResourceHours = resources.reduce(
      (s, r) => s + (r.availabilityHours || 0),
      0,
    );
    const highPriorityCount = tasks.filter(
      (t) => t.priority === 'High' || t.priority === 'Critical',
    ).length;

    const systemInstruction = `You are an AI Risk Assessor for software projects.
You MUST strictly output valid JSON only — no markdown, no explanation.

Evaluate the project metrics and return a comprehensive risk assessment.

Risk scoring guide:
- riskScore: float 0.0–1.0 (0=safe, 1=critical failure imminent)
- Consider: days remaining, overdue tasks, resource capacity vs workload, high-priority tasks
- severity: "Low" if <0.3, "Medium" if 0.3–0.6, "High" if 0.6–0.8, "Critical" if >0.8
- riskType: the PRIMARY risk category (e.g. "Schedule Slip", "Resource Overload", "Scope Creep", "Budget Risk", "Technical Debt")
- topRisks: identify up to 4 distinct risk areas with actionable mitigation suggestions
- summary: 2-3 sentence plain-text executive summary

Output format:
{
  "riskScore": 0.72,
  "severity": "High",
  "riskType": "Schedule Slip",
  "summary": "The project faces high schedule risk...",
  "topRisks": [
    { "area": "Backend Development", "mitigationSuggestion": "..." },
    { "area": "Resource Allocation", "mitigationSuggestion": "..." }
  ]
}`;

    const promptText = JSON.stringify({
      projectName: project.name,
      status: project.status,
      budget: project.budget,
      startDate: project.startDate,
      endDate: project.endDate,
      daysLeft,
      totalTasks: tasks.length,
      pendingTasks,
      overdueTasks,
      highPriorityTasks: highPriorityCount,
      totalEstimatedHours,
      totalResourceHours,
      capacityGap: totalEstimatedHours - totalResourceHours,
      resourceCount: resources.length,
      tasksByStatus: {
        todo: tasks.filter((t) => t.status === 'To Do').length,
        inProgress: tasks.filter((t) => t.status === 'In Progress').length,
        inReview: tasks.filter((t) => t.status === 'In Review').length,
        done: tasks.filter((t) => t.status === 'Done').length,
      },
    });

    const result = (await this.ai.generateJson(
      promptText,
      systemInstruction,
    )) as GeminiRiskResult;

    const prediction = new this.riskModel({
      projectId,
      riskScore: result.riskScore,
      severity: result.severity,
      riskType: result.riskType || 'General',
      affectedArea: result.topRisks?.[0]?.area || 'Unknown',
      mitigationSuggestion: result.topRisks?.[0]?.mitigationSuggestion || '',
      topRisks: result.topRisks || [],
    });
    await prediction.save();

    return result;
  }

  async findAll() {
    return this.riskModel.find().sort({ predictedAt: -1 }).exec();
  }

  async findByProject(projectId: string) {
    return this.riskModel.find({ projectId }).sort({ predictedAt: -1 }).exec();
  }
}
