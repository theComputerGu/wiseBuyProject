
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { storePricesService } from './storeprices.service';
import { storePricesController } from './storeprices.controller';

import { StorePrice, StorePriceSchema } from './schemas/storeprices.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: StorePrice.name, schema: StorePriceSchema },
        ]),
    ],
    controllers: [storePricesController],
    providers: [storePricesService],
    exports: [storePricesService],
})
export class PricesModule { }
