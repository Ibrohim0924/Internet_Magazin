import { IsString, IsNumber, IsOptional, Min, Max, IsUrl } from 'class-validator';

export class CreateProductDto {
  @IsString()
  nameUz: string;

  @IsString()
  nameRu: string;

  @IsOptional()
  @IsString()
  descriptionUz?: string;

  @IsOptional()
  @IsString()
  descriptionRu?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  categoryUz?: string;

  @IsOptional()
  @IsString()
  categoryRu?: string;

  @IsOptional()
  @IsString()
  brandUz?: string;

  @IsOptional()
  @IsString()
  brandRu?: string;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}