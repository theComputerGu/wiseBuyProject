import { IsDateString, IsMongoId, IsOptional, IsString } from 'class-validator';

export class QueryShoppingListDto {
  @IsOptional() @IsMongoId() groupId?: string;
  @IsOptional() @IsMongoId() userId?: string;
  @IsOptional() @IsMongoId() storeId?: string;
  @IsOptional() @IsDateString() from?: string; // כולל
  @IsOptional() @IsDateString() to?: string;   // כולל
  @IsOptional() @IsString() status?: 'draft'|'final';
}
