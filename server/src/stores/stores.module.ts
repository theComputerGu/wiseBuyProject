import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Stores, StoresSchema } from "./schemas/stores.schema";
import { StoresService } from "./stores.service";
import { StoresController } from "./stores.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Stores.name, schema: StoresSchema },
    ]),
  ],
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService], // important: used by scrape / checkout modules
})
export class StoresModule {}
