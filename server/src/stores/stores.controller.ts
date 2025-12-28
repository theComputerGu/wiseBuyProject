import { Controller, Get, Post, Body, Query } from "@nestjs/common";
import { StoresService } from "./stores.service";
import { StoreOffer } from "./schemas/stores.schema";

@Controller("stores")
export class StoresController {
  constructor(
    private readonly storesService: StoresService,
  ) {}

 
  @Get("address")
  async getAddress(
    @Query("addressKey") addressKey: string,
  ) {
    return this.storesService.getOrCreateAddress(addressKey);
  }

  @Post("cached")
  async getCachedProducts(
    @Body()
    body: {
      addressKey: string;
      itemcodes: string[];
    },
  ) {
    const { addressKey, itemcodes } = body;
    return this.storesService.getCachedProducts(
      addressKey,
      itemcodes,
    );
  }


  @Post("upsert")
  async upsertProduct(
    @Body()
    body: {
      addressKey: string;
      itemcode: string;
      stores: StoreOffer[];
    },
  ) {
    const { addressKey, itemcode, stores } = body;
    await this.storesService.upsertProduct(
      addressKey,
      itemcode,
      stores,
    );

    return { ok: true };
  }
}
