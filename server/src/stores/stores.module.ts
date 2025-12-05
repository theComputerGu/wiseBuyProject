import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { StoresController } from "./stores.controller";
import { StoresService } from "./stores.service";

import { Store, StoreSchema } from "./schemas/stores.schema";
import { StoreCache, StoreCacheSchema } from "./schemas/store-cache.schema";

import { StoreCacheService } from "./store-cache.service";
import { StoreCacheController } from "./store-cache.controller";

@Module({
  imports:[
    MongooseModule.forFeature([
      { name: Store.name, schema: StoreSchema },
      { name: StoreCache.name, schema: StoreCacheSchema }
    ])
  ],
  controllers:[StoresController, StoreCacheController],   // 👈 תוודא שזה כאן!
  providers:[StoresService, StoreCacheService],
  exports:[StoreCacheService]
})
export class StoresModule {}
