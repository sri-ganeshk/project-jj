import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  budget: number;

  @Prop({ default: '' })
  requiredSkills: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
