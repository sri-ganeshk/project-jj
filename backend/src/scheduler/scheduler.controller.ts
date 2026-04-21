import { Controller, Post, Param, Body } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';

@Controller('api/v1/scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Post('optimize/:projectId')
  optimizeSchedule(@Param('projectId') projectId: string) {
    return this.schedulerService.optimizeSchedule(projectId);
  }

  @Post('apply/:projectId')
  applyOptimization(
    @Param('projectId') projectId: string,
    @Body()
    body: {
      optimizedSchedule: Array<{
        taskId: string;
        suggestedStartDate: string;
        suggestedResource: string;
      }>;
    },
  ) {
    return this.schedulerService.applyOptimization(
      projectId,
      body.optimizedSchedule,
    );
  }
}
