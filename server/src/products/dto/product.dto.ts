import { IsOptional, IsString, IsIn } from 'class-validator';

export class CreateProductDto {

  @IsString()
  itemcode: string;

  @IsString()
  title: string;

  @IsIn(['unit', 'kg', 'gram', 'liter'])
  @IsOptional()
  unit?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  pricerange?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  category?: string;
}

export class UpdateProductDto {

  @IsString()
  @IsOptional()
  title?: string;

  @IsIn(['unit', 'kg', 'gram', 'liter'])
  @IsOptional()
  unit?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  pricerange?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  category?: string;
}
