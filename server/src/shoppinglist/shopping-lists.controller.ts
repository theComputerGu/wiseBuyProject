import { Controller, Post, Get, Param, Patch, Body, Delete } from '@nestjs/common';
import { ShoppingListsService } from './shopping-lists.service';

@Controller('shopping-lists')
export class ShoppingListsController {
  constructor(private readonly service: ShoppingListsService) {}

  // CREATE LIST
  @Post()
  create() {
    return this.service.create();
  }

  // GET ALL
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // GET BY ID
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  // ADD ITEM
  @Patch(':id/items')
  addItem(
    @Param('id') id: string,
    @Body('productId') productId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.service.addItem(id, productId, quantity);
  }

  // UPDATE ITEM
  @Patch(':id/items/:index')
  updateItem(
    @Param('id') id: string,
    @Param('index') index: number,
    @Body('quantity') quantity: number,
  ) {
    return this.service.updateItem(id, index, quantity);
  }

  // REMOVE ITEM
  @Delete(':id/items/:index')
  removeItem(@Param('id') id: string, @Param('index') index: number) {
    return this.service.removeItem(id, index);
  }

  // DELETE LIST
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
