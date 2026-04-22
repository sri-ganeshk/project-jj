import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema({ timestamps: true })
export class Task {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ default: 'Medium' })
  priority: string;

  @Prop({ default: 0 })
  estimatedHours: number;

  @Prop({ default: 0 })
  actualHours: number;

  @Prop({ default: 'Pending' })
  status: string;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'Resource', default: null })
  assignedTo: Types.ObjectId | null;

  @Prop({ default: 1 })
  complexityScore: number;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
