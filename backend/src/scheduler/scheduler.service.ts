import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { Task, TaskDocument } from '../schemas/task.schema';
import { Resource, ResourceDocument } from '../schemas/resource.schema';
import {
  OptimizedSchedule,
  OptimizedScheduleDocument,
} from '../schemas/optimized-schedule.schema';
import { AiService } from '../ai/ai.service';

export interface GeminiScheduleResult {
  projectId: string;
  optimizedSchedule: Array<{
    taskId: string;
    taskTitle: string;
    suggestedStartDate: string;
    suggestedResource: string;
    resourceName: string;
    reason: string;
  }>;
  conflicts: string[];
  summary: string;
}

@Injectable()
export class SchedulerService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(Resource.name) private resourceModel: Model<ResourceDocument>,
    @InjectModel(OptimizedSchedule.name)
    private scheduleModel: Model<OptimizedScheduleDocument>,
    private ai: AiService,
  ) {}

  async optimizeSchedule(projectId: string) {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) throw new NotFoundException('Project not found');

    const tasks = await this.taskModel.find({ projectId }).exec();
    const resources = await this.resourceModel.find({ projectId }).exec();

    const today = new Date().toISOString().split('T')[0];
    const totalResourceHours = resources.reduce(
      (s, r) => s + (r.availabilityHours || 0),
      0,
    );
    const totalEstimatedHours = tasks.reduce(
      (s, t) => s + (t.estimatedHours || 0),
      0,
    );

    const tasksSummary = tasks.map((t) => ({
      id: String(t._id),
      title: t.title,
      priority: t.priority,
      status: t.status,
      estimatedHours: t.estimatedHours,
      complexityScore: t.complexityScore,
      dueDate: t.dueDate,
    }));

    const resourcesSummary = resources.map((r) => ({
      id: String(r._id),
      name: r.name,
      role: r.role,
      availabilityHours: r.availabilityHours,
      skillSet: r.skillSet,
    }));

    const systemInstruction = `You are an expert Agile Project Planner and resource optimizer.
You MUST strictly output valid JSON only — no markdown, no explanation.
Your task: given a project's tasks and resources, produce an optimized assignment and schedule.

Rules:
- Assign high-priority and high-complexity tasks to the most skilled resources first
- Spread work so no resource is overloaded beyond their availabilityHours
- suggestedStartDate must be >= today (${today}) and before the project end date
- If a task cannot be assigned due to capacity, list it in conflicts[] with a reason
- Return "summary": a 1-2 sentence plain-text executive summary of your scheduling strategy

Output format:
{
  "projectId": "<id>",
  "optimizedSchedule": [
    {
      "taskId": "<task._id>",
      "taskTitle": "<title>",
      "suggestedStartDate": "YYYY-MM-DD",
      "suggestedResource": "<resource._id>",
      "resourceName": "<resource.name>",
      "reason": "<short reason why this resource was chosen>"
    }
  ],
  "conflicts": ["<description of any unresolvable conflict>"],
  "summary": "<executive summary>"
}`;

    const promptText = JSON.stringify({
      projectId,
      projectName: project.name,
      projectEndDate: project.endDate,
      today,
      totalResourceHours,
      totalEstimatedHours,
      tasks: tasksSummary,
      resources: resourcesSummary,
    });

    const result = (await this.ai.generateJson(
      promptText,
      systemInstruction,
    )) as GeminiScheduleResult;

    // Persist optimized schedule
    const doc = new this.scheduleModel({
      projectId,
      schedule: result.optimizedSchedule || [],
      conflicts: result.conflicts || [],
    });
    await doc.save();

    return { ...result, savedId: String(doc._id) };
  }

  async getHistory(projectId: string) {
    return this.scheduleModel
      .find({ projectId })
      .sort({ generatedAt: -1 })
      .limit(5)
      .exec();
  }
}
