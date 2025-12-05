import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ScrapeController } from "./scrape.controller";
import { ScrapeService } from "./scrape.service";

import { StoreCache, StoreCacheSchema } from "../stores/schemas/store-cache.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StoreCache.name, schema: StoreCacheSchema }
    ])
  ],
  controllers: [ScrapeController],
  providers: [ScrapeService],
  exports: [ScrapeService]  // במקרה שנשתמש בעתיד
})
export class ScrapeModule {}
