import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsArray,
} from 'class-validator';

export class CourseDto {
  id: string;
  name: string;
  code: string;
  universityId: string;
  universityName: string;
  description?: string;
  durationMonths?: number; // Total duration in months
  tuitionFee?: number;
  startDates?: string[];
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  universityId: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  durationMonths?: number; // Total duration in months

  @IsNumber()
  @IsOptional()
  tuitionFee?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  startDates?: string[];

  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: 'active' | 'inactive';
}

export class UpdateCourseDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  universityId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  durationMonths?: number; // Total duration in months

  @IsNumber()
  @IsOptional()
  tuitionFee?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  startDates?: string[];

  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: 'active' | 'inactive';
}

export class UpdateCourseStatusDto {
  @IsEnum(['active', 'inactive'])
  @IsNotEmpty()
  status: 'active' | 'inactive';
}
