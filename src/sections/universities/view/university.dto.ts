import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUrl,
} from 'class-validator';

export class UniversityDto {
  id: string;
  name: string;
  cityId: string;
  cityName: string;
  countryCode: string; // Added field
  countryName: string; // Added field
  description?: string;
  website?: string;
  logoUrl?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export class CreateUniversityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  cityId: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: 'active' | 'inactive';
}

export class UpdateUniversityDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  cityId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: 'active' | 'inactive';
}

export class UpdateUniversityStatusDto {
  @IsEnum(['active', 'inactive'])
  @IsNotEmpty()
  status: 'active' | 'inactive';
}
