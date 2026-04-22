import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OptimizedScheduleDocument = OptimizedSchedule & Document;

export class ScheduleEntry {
  taskId: string;
  taskTitle: string;
  suggestedStartDate: string;
  suggestedResource: string;
  resourceName: string;
}

@Schema({ timestamps: true })
export class OptimizedSchedule {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ type: [Object], default: [] })
  schedule: ScheduleEntry[];

  @Prop({ type: [String], default: [] })
  conflicts: string[];

  @Prop({ default: Date.now })
  generatedAt: Date;
}

export const OptimizedScheduleSchema =
  SchemaFactory.createForClass(OptimizedSchedule);
