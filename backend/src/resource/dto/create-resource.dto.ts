import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsNumber()
  @IsNotEmpty()
  availabilityHours: number;

  @IsOptional()
  @IsString()
  skillSet?: string;
}
