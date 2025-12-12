import { Controller, Post, Body } from "@nestjs/common";
import { ScrapeService } from "./scrape.service";

@Controller("scrape")
export class ScrapeController {
  constructor(private readonly scrapeService: ScrapeService) {}

  // =========================
  // POST /scrape/one
  // =========================
  @Post("one")
  async scrapeOne(
    @Body() body: { barcode: string; city: string },
  ) {
    return this.scrapeService.scrapeOne(body.barcode, body.city);
  }

  // =========================
  // POST /scrape/batch
  // =========================
  @Post("batch")
  async scrapeBatch(
    @Body()
    body: { barcodes: string[]; city: string },
  ) {
    return this.scrapeService.scrapeBatch(body.barcodes, body.city);
  }
}
