import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @IsString()
  @MaxLength(255)
  nameUz: string;

  @IsString()
  @MaxLength(255)
  nameRu: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parentId?: number;
}
