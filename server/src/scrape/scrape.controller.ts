import { Controller, Post, Body } from "@nestjs/common";
import { ScrapeService } from "./scrape.service";
import { StoreOffer } from "../stores/schemas/stores.schema";

@Controller("scrape")
export class ScrapeController {
  constructor(
    private readonly scrapeService: ScrapeService,
  ) {}


  @Post("one")
  async scrapeOne(
    @Body()
    body: {
      barcode: string;
      city: string;
    },
  ): Promise<StoreOffer[]> {
    return this.scrapeService.scrapeOne(
      body.barcode,
      body.city,
    );
  }


  @Post("batch")
  async scrapeBatch(
    @Body()
    body: {
      barcodes: string[];
      city: string;
    },
  ): Promise<
    {
      itemcode: string;
      stores: StoreOffer[];
    }[]
  > {
    return this.scrapeService.scrapeBatch(
      body.barcodes,
      body.city,
    );
  }
}
