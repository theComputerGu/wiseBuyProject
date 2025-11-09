import { IsArray, IsDateString, IsEnum, IsMongoId, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ItemDto {
  @IsMongoId() productId: string;
  @IsOptional() @IsString() nameSnapshot?: string;
  @IsNumber() @Min(0) quantity: number;
  @IsString() @IsOptional() unit?: string;
  @IsNumber() @Min(0) pricePerUnit: number;
  @IsOptional() @IsNumber() @Min(0) lineTotal?: number;
  @IsOptional() @IsString() notes?: string;
}

export class CreateShoppingListDto {
  @IsMongoId() groupId: string;
  @IsMongoId() userId: string;
  @IsOptional() @IsMongoId() storeId?: string;

  @IsDateString() purchasedAt: string;

  @IsArray() @ValidateNested({ each: true }) @Type(() => ItemDto)
  items: ItemDto[];

  @IsOptional() @IsNumber() @Min(0) discountTotal?: number;
  @IsOptional() @IsNumber() @Min(0) taxTotal?: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsArray() receiptImages?: string[];

  @IsOptional() @IsEnum(['draft','final']) status?: 'draft'|'final';
}
