import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Stores, StoresSchema } from "./schemas/stores.schema";
import { StoresService } from "./stores.service";
import { StoresController } from "./stores.controller";
import { StoresResolveController } from "./stores-resolve.controller";
import { StoresResolverService } from "./stores-resolver.service";
import { ScrapeModule } from "../scrape/scrape.module"; // ✅ הוספה

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Stores.name, schema: StoresSchema },
    ]),
    ScrapeModule, // ✅ זה מה שחסר
  ],
  controllers: [StoresController, StoresResolveController],
  providers: [StoresService, StoresResolverService],
  exports: [StoresService, StoresResolverService],
})
export class StoresModule {}
