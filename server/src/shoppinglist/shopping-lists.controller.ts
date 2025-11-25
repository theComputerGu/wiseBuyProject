import { Controller, Post, Get, Param, Patch, Body, Delete } from '@nestjs/common';
import { ShoppingListsService } from './shopping-lists.service';

@Controller('shopping-lists')
export class ShoppingListsController {
  constructor(private readonly service: ShoppingListsService) {}

  // create list
  @Post()
  create() {
    return this.service.create();
  }

  // get all
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // get by id
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  // add item update by plus one
  @Patch(':id/items')
  addItem(
    @Param('id') id: string,
    @Body('productId') productId: string,
  ) {
    return this.service.addItem(id, productId);
  }


  // remove item
  @Delete(':id/items/:itemId')
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.service.removeItem(id, itemId);
  }

  // delete list
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
