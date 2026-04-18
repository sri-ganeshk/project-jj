import { Controller, Get, Param } from '@nestjs/common';
import { RiskService } from './risk.service';

@Controller('api/v1/risk')
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  /** Run AI risk prediction and persist the result */
  @Get('predict/:projectId')
  predictRisk(@Param('projectId') projectId: string) {
    return this.riskService.predictRisk(projectId);
  }

  /** Get all persisted risk predictions across all projects */
  @Get()
  findAll() {
    return this.riskService.findAll();
  }

  /** Get all risk predictions for a specific project */
  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.riskService.findByProject(projectId);
  }
}
