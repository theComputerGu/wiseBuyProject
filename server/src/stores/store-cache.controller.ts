import { Controller, Post, Body } from "@nestjs/common";
import { StoreCacheService } from "./store-cache.service";

@Controller("stores/cache")
export class StoreCacheController {

  constructor(private cache: StoreCacheService) {}

  // === Check existing cache (<TTL hours)
  @Post("check")
  async check(@Body() body:{ barcodes:string[], ttl:number }) {
    const cached = await this.cache.findValid(body.barcodes, body.ttl ?? 24);
    const missing = body.barcodes.filter(b => !cached[b]);
    return { cached, missing };
  }

  // === Update cache with latest scraped batch
  @Post("update")
  async update(@Body() body:{ data:Record<string,string[][]> }) {
    await this.cache.updateBatch(body.data);
    return { updated:true };
  }
}
