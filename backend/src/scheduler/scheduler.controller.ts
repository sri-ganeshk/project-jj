import { Controller, Post, Param } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';

@Controller('api/v1/scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Post('optimize/:projectId')
  optimizeSchedule(@Param('projectId') projectId: string) {
    return this.schedulerService.optimizeSchedule(projectId);
  }
}
