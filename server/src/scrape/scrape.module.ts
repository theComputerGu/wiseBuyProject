import { Module } from "@nestjs/common";
import { ScrapeController } from "./scrape.controller";
import { ScrapeService } from "./scrape.service";
import { StoresModule } from "../stores/stores.module";

@Module({
  imports: [StoresModule],
  controllers: [ScrapeController],
  providers: [ScrapeService],
})
export class ScrapeModule {}
