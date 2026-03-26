import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  priority: string;

  @IsNumber()
  estimatedHours: number;

  @IsString()
  status: string;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsNumber()
  complexityScore?: number;
}
