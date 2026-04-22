import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RiskPredictionDocument = RiskPrediction & Document;

class TopRisk {
  area: string;
  mitigationSuggestion: string;
}

@Schema({ timestamps: true })
export class RiskPrediction {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ required: true })
  riskType: string;

  @Prop({ required: true })
  riskScore: number;

  @Prop({ required: true })
  severity: string;

  @Prop({ default: 'Unknown' })
  affectedArea: string;

  @Prop({ default: '' })
  mitigationSuggestion: string;

  @Prop({ type: [Object], default: [] })
  topRisks: TopRisk[];

  @Prop({ default: Date.now })
  predictedAt: Date;
}

export const RiskPredictionSchema =
  SchemaFactory.createForClass(RiskPrediction);
