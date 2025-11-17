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

import { StoresService } from './stores.service';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.storesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.storesService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.storesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storesService.remove(id);
  }
}
