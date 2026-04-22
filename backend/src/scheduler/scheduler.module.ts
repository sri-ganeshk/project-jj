import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiModule } from '../ai/ai.module';
import { Project, ProjectSchema } from '../schemas/project.schema';
import { Task, TaskSchema } from '../schemas/task.schema';
import { Resource, ResourceSchema } from '../schemas/resource.schema';
import {
  OptimizedSchedule,
  OptimizedScheduleSchema,
} from '../schemas/optimized-schedule.schema';
import { SchedulerController } from './scheduler.controller';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [
    AiModule,
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Resource.name, schema: ResourceSchema },
      { name: OptimizedSchedule.name, schema: OptimizedScheduleSchema },
    ]),
  ],
  controllers: [SchedulerController],
  providers: [SchedulerService],
})
export class SchedulerModule {}
