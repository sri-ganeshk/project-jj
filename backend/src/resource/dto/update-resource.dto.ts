import { PartialType } from '@nestjs/mapped-types';
import { CreateResourceDto } from './create-resource.dto';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateResourceDto extends PartialType(CreateResourceDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsNumber()
  availabilityHours?: number;

  @IsOptional()
  @IsString()
  skillSet?: string;
}
