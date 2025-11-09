import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ShoppingListsService } from './shopping-lists.service';
import { CreateShoppingListDto } from './dto/create-shopping-list.dto';
import { UpdateShoppingListDto } from './dto/update-shopping-list.dto';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { QueryShoppingListDto } from './dto/query-shopping-list.dto';

@Controller('shopping-lists')
export class ShoppingListsController {
  constructor(private readonly service: ShoppingListsService) {}

  @Post()
  create(@Body() dto: CreateShoppingListDto) {
    return this.service.create(dto);
  }

  @Get()
  find(@Query() q: QueryShoppingListDto) {
    return this.service.find(q);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateShoppingListDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // Items
  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() dto: AddItemDto) {
    return this.service.addItem(id, dto);
  }

  @Patch(':id/items/:idx')
  updateItem(@Param('id') id: string, @Param('idx') idx: string, @Body() dto: UpdateItemDto) {
    return this.service.updateItem(id, Number(idx), dto);
  }

  @Delete(':id/items/:idx')
  removeItem(@Param('id') id: string, @Param('idx') idx: string) {
    return this.service.removeItem(id, Number(idx));
  }

  // Stats
  @Get('stats/monthly')
  monthly(@Query('groupId') groupId: string, @Query('storeId') storeId?: string) {
    return this.service.monthlySpend(groupId, storeId);
  }
}
