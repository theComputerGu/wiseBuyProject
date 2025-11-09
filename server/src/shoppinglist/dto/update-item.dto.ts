import { IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateItemDto {
  @IsOptional() @IsMongoId() productId?: string;
  @IsOptional() @IsString() nameSnapshot?: string;
  @IsOptional() @IsNumber() @Min(0) quantity?: number;
  @IsOptional() @IsString() unit?: string;
  @IsOptional() @IsNumber() @Min(0) pricePerUnit?: number;
  @IsOptional() @IsNumber() @Min(0) lineTotal?: number;
  @IsOptional() @IsString() notes?: string;
}
