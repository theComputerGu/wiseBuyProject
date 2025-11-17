import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';

import { storePricesService } from './storeprices.service';

@Controller('store-prices')
export class StorePricesController {
  constructor(private readonly service: storePricesService) {}


  @Post()
  addPrice(
    @Body('productId') productId: string,
    @Body('storeId') storeId: string,
    @Body('price') price: number,
  ) {
    return this.service.addPrice(productId, storeId, price);
  }


  @Patch(':id')
  updatePrice(
    @Param('id') id: string,
    @Body('price') price: number,
  ) {
    return this.service.updatePrice(id, price);
  }


  @Get('product/:productId')
  getPricesForProduct(@Param('productId') productId: string) {
    return this.service.getPricesForProduct(productId);
  }


  @Get('product/:productId/compare')
  comparePrices(@Param('productId') productId: string) {
    return this.service.compare(productId);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
