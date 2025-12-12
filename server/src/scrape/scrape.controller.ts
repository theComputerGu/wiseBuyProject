import { Controller, Post, Body } from "@nestjs/common";
import { ScrapeService } from "./scrape.service";

@Controller("scrape")
export class ScrapeController {

  constructor(private readonly scrape: ScrapeService) {}

  // 🚀 בקשה אחת בלבד עם כל הברקודים
  @Post("batch")
  async batch(@Body() body:{ city:string; barcodes:string[] }) {
    return this.scrape.batch(body.city, body.barcodes);
  }
}
