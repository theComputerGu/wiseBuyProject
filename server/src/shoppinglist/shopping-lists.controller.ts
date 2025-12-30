import { Controller, Post, Get, Param, Patch, Body, Delete } from '@nestjs/common';
import { ShoppingListsService } from './shopping-lists.service';

@Controller('shopping-lists')
export class ShoppingListsController {
  constructor(private readonly service: ShoppingListsService) {}


  @Post()
  create() {
    return this.service.create();
  }


  @Get()
  findAll() {
    return this.service.findAll();
  }


  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }


  @Patch(':id/items')
  addItem(
    @Param('id') id: string,
    @Body('productId') productId: string,
  ) {
    return this.service.addItem(id, productId);
  }



  @Delete(':id/items/:itemId')
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.service.removeItem(id, itemId);
  }


  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
