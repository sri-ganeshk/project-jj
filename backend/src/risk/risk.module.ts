import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { RiskController } from './risk.controller';
import { RiskService } from './risk.service';

@Module({
  imports: [AiModule],
  controllers: [RiskController],
  providers: [RiskService],
})
export class RiskModule {}
