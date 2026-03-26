import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectModule } from './project/project.module';
import { TaskModule } from './task/task.module';
import { ResourceModule } from './resource/resource.module';
import { PrismaModule } from './prisma/prisma.module';
import { AiModule } from './ai/ai.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { RiskModule } from './risk/risk.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    ProjectModule,
    TaskModule,
    ResourceModule,
    PrismaModule,
    AiModule,
    SchedulerModule,
    RiskModule,
    ReportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
