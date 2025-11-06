// src/products/dto/create-product.dto.ts
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';


export class CreateProductDto {
@IsString() title: string;
@IsOptional() @IsString() brand?: string;
@IsNumber() @Min(0) price: number;
@IsOptional() @IsString() currency?: string;
@IsOptional() @IsString() unit?: string;
@IsOptional() @IsNumber() @Min(0) @Max(5) rating?: number;
@IsOptional() @IsArray() images?: string[];
@IsOptional() @IsBoolean() inStock?: boolean;
@IsOptional() @IsString() category?: string;
@IsOptional() @IsString() description?: string;
@IsOptional() @IsArray() tags?: string[];
}