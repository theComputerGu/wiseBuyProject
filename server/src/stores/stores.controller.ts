// src/stores/stores.controller.ts
import { Controller, Get, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { StoresService } from './stores.service';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  // 🟢 Create a store
  @Post()
  async create(
    @Body('name') name: string,
    @Body('address') address: string,
    @Body('city') city: string,
    @Body('lat') lat: number,
    @Body('lng') lng: number,
  ) {
    return this.storesService.create({
      name,
      address,
      city,
      coordinates: [lng, lat],
    });
  }

  // 🟢 Get all stores
  @Get()
  async findAll() {
    return this.storesService.findAll();
  }

  // 🟢 Get store by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  // 🟡 Get stores near user location
  @Get('nearby')
  async findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('maxDistance') maxDistance?: string,
  ) {
    return this.storesService.findNearby(
      parseFloat(lat),
      parseFloat(lng),
      maxDistance ? parseInt(maxDistance, 10) : 5000,
    );
  }

  //  Delete a store
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.storesService.delete(id);
  }
}
