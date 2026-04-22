import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { Task, TaskDocument } from '../schemas/task.schema';
import {
  RiskPrediction,
  RiskPredictionDocument,
} from '../schemas/risk-prediction.schema';
import { Report, ReportDocument } from '../schemas/report.schema';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(RiskPrediction.name)
    private riskModel: Model<RiskPredictionDocument>,
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
    private ai: AiService,
  ) {}

  async generateReport(projectId: string) {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) throw new NotFoundException('Project not found');

    const tasks = await this.taskModel.find({ projectId }).exec();
    const risks = await this.riskModel
      .find({ projectId })
      .sort({ predictedAt: -1 })
      .limit(3)
      .exec();

    const today = new Date();
    const daysLeft = Math.ceil(
      (new Date(project.endDate).getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const completionPct =
      tasks.length > 0
        ? Math.round(
            (tasks.filter((t) => t.status === 'Done').length / tasks.length) *
              100,
          )
        : 0;
    const overdueTasks = tasks.filter(
      (t) => new Date(t.dueDate) < today && t.status !== 'Done',
    );

    const systemInstruction = `You are an AI Executive Reporter for software projects.
You MUST strictly output valid JSON only — no markdown fences, no explanation outside JSON.

Generate a professional executive summary report with detailed markdown content.

Output format:
{
  "projectId": "<id>",
  "reportContent": "# Executive Summary\\n\\n## Project Overview\\n...(rich markdown)...",
  "healthStatus": "On Track | At Risk | Off Track",
  "completionPercentage": 45,
  "keyHighlights": ["highlight 1", "highlight 2", "highlight 3"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}

The reportContent should be comprehensive markdown with sections:
- Executive Summary (2-3 paragraph overview)
- Project Health (current status, metrics)  
- Task Progress (breakdown by status, overdue analysis)
- Risk Summary (if risks exist)
- Recommendations (actionable next steps)
- Timeline Assessment (on track / behind schedule analysis)`;

    const promptText = JSON.stringify({
      projectId,
      projectName: project.name,
      status: project.status,
      budget: project.budget,
      startDate: project.startDate,
      endDate: project.endDate,
      daysLeft,
      completionPercentage: completionPct,
      taskSummary: {
        total: tasks.length,
        done: tasks.filter((t) => t.status === 'Done').length,
        inProgress: tasks.filter((t) => t.status === 'In Progress').length,
        inReview: tasks.filter((t) => t.status === 'In Review').length,
        todo: tasks.filter((t) => t.status === 'To Do').length,
        overdue: overdueTasks.length,
        overdueItems: overdueTasks.map((t) => ({
          title: t.title,
          dueDate: t.dueDate,
          priority: t.priority,
        })),
      },
      recentRisks: risks.map((r) => ({
        riskType: r.riskType,
        riskScore: r.riskScore,
        severity: r.severity,
        mitigationSuggestion: r.mitigationSuggestion,
      })),
    });

    const result = (await this.ai.generateJson(
      promptText,
      systemInstruction,
    )) as {
      projectId: string;
      reportContent: string;
      healthStatus: string;
      completionPercentage: number;
      keyHighlights: string[];
      recommendations: string[];
    };

    const report = new this.reportModel({
      projectId,
      reportType: 'Executive Summary',
      format: 'Markdown',
      filePath: `/reports/project_${projectId}_summary.md`,
      reportContent: result.reportContent || '',
    });
    await report.save();

    return { ...result, reportId: String(report._id) };
  }

  async findByProject(projectId: string) {
    return this.reportModel
      .find({ projectId })
      .sort({ generatedAt: -1 })
      .exec();
  }
}
