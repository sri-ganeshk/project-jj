import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiModule } from '../ai/ai.module';
import { Project, ProjectSchema } from '../schemas/project.schema';
import { Task, TaskSchema } from '../schemas/task.schema';
import { Resource, ResourceSchema } from '../schemas/resource.schema';
import {
  RiskPrediction,
  RiskPredictionSchema,
} from '../schemas/risk-prediction.schema';
import { RiskController } from './risk.controller';
import { RiskService } from './risk.service';

@Module({
  imports: [
    AiModule,
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Resource.name, schema: ResourceSchema },
      { name: RiskPrediction.name, schema: RiskPredictionSchema },
    ]),
  ],
  controllers: [RiskController],
  providers: [RiskService],
})
export class RiskModule {}
