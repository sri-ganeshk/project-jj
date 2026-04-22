import { Controller, Get, Param } from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('api/v1/report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('generate/:projectId')
  generateReport(@Param('projectId') projectId: string) {
    return this.reportService.generateReport(projectId);
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.reportService.findByProject(projectId);
  }
}
