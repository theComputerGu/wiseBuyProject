import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // GET /products?q=milk&category=dairy
  @Get()
  findAll(
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('brand') brand?: string,
  ) {
    return this.productsService.findAll({ q, category, brand });
  }

  // GET /products/65a0...
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // POST /products
  @Post()
  create(@Body() body: any) {
    return this.productsService.create(body);
  }

  // PATCH /products/65a0...
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.productsService.update(id, body);
  }

  // DELETE /products/65a0...
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
