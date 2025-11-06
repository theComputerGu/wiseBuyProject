import { Controller, Get } from '@nestjs/common';

@Controller('products')
export class ProductsController {
  @Get()
  findAll() {
    return [{ ok: true, msg: 'products route is alive' }];
  }
}
