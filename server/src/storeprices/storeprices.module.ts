import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { StorePricesController } from './storeprices.controller';
import { storePricesService } from './storeprices.service';
import { StorePrice, StorePriceSchema } from './schemas/storeprices.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StorePrice.name, schema: StorePriceSchema },
    ]),
  ],
  controllers: [StorePricesController],
  providers: [storePricesService],
  exports: [storePricesService],
})
export class StorePricesModule {}
