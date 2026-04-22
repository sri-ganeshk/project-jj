import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReportDocument = Report & Document;

@Schema({ timestamps: true })
export class Report {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ required: true })
  reportType: string;

  @Prop({ required: true })
  format: string;

  @Prop({ default: '' })
  filePath: string;

  @Prop({ default: '' })
  reportContent: string;

  @Prop({ default: Date.now })
  generatedAt: Date;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
