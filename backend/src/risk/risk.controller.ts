import { Controller, Get, Param } from '@nestjs/common';
import { RiskService } from './risk.service';

@Controller('api/v1/risk')
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  @Get('predict/:projectId')
  predictRisk(@Param('projectId') projectId: string) {
    return this.riskService.predictRisk(projectId);
  }
}
