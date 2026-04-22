import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiModule } from '../ai/ai.module';
import { Project, ProjectSchema } from '../schemas/project.schema';
import { Task, TaskSchema } from '../schemas/task.schema';
import {
  RiskPrediction,
  RiskPredictionSchema,
} from '../schemas/risk-prediction.schema';
import { Report, ReportSchema } from '../schemas/report.schema';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [
    AiModule,
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Task.name, schema: TaskSchema },
      { name: RiskPrediction.name, schema: RiskPredictionSchema },
      { name: Report.name, schema: ReportSchema },
    ]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
