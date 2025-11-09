import { IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AddItemDto {
  @IsMongoId() productId: string;
  @IsOptional() @IsString() nameSnapshot?: string;
  @IsNumber() @Min(0) quantity: number;
  @IsOptional() @IsString() unit?: string;
  @IsNumber() @Min(0) pricePerUnit: number;
  @IsOptional() @IsNumber() @Min(0) lineTotal?: number;
  @IsOptional() @IsString() notes?: string;
}
