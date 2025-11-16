// src/prices/prices.controller.ts
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


@Controller('prices')
export class storePricesController {
    constructor(private readonly pricesService: storePricesService) { }




    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.pricesService.delete(id);
    }

    @Get('product/:productId')
    getPrices(@Param('productId') productId: string) {
        return this.pricesService.getPricesForProduct(productId);
    }

    @Get('compare/:productId')
    compare(@Param('productId') productId: string) {
        return this.pricesService.compare(productId);
    }
}
