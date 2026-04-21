import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class SchedulerService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
  ) {}

  async optimizeSchedule(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { tasks: { include: { dependencies: true } }, resources: true },
    });

    if (!project) throw new NotFoundException('Project not found');

    const promptText = JSON.stringify({
      tasks: project.tasks,
      resources: project.resources,
      targetEndDate: project.endDate,
    });

    const systemInstruction = `You are an expert Agile Project Planner. You strictly output valid JSON. 
You will receive a list of tasks, their dependencies, and available resources. 
Your job is to return a JSON array mapping each taskId to an optimal 'assignedResource' (MongoDB ObjectId string) and 'suggestedStartDate' (YYYY-MM-DD) taking into account estimated hours and dependencies.
Return a JSON structure like: { "projectId": "some-id", "optimizedSchedule": [ { "taskId": "task-id", "suggestedStartDate": "2026-03-24", "suggestedResource": "resource-id" } ], "conflicts": [] }`;

    const result = (await this.ai.generateJson(
      promptText,
      systemInstruction,
    )) as {
      projectId: string;
      optimizedSchedule: Array<{
        taskId: string;
        suggestedStartDate: string;
        suggestedResource: string;
      }>;
      conflicts: unknown[];
    };
    return result;
  }

  async applyOptimization(
    projectId: string,
    optimizedSchedule: Array<{
      taskId: string;
      suggestedStartDate: string;
      suggestedResource: string;
    }>,
  ) {
    const updates = optimizedSchedule.map((item) =>
      this.prisma.task.update({
        where: { id: item.taskId },
        data: {
          startDate: new Date(item.suggestedStartDate),
          assignedTo: item.suggestedResource,
        },
      }),
    );
    await Promise.all(updates);
    return { status: 'success', updatedCount: updates.length };
  }
}
