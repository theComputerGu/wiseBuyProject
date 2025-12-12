import { Controller, Get, Post, Body, Query } from "@nestjs/common";
import { StoresService } from "./stores.service";
import { StoreOffer } from "./schemas/stores.schema";

@Controller("stores")
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  // =========================
  // GET /stores?itemcode=XXX
  // =========================
  @Get()
  async getByItemcode(
    @Query("itemcode") itemcode: string,
  ) {
    return this.storesService.getByItemcode(itemcode);
  }

  // =========================
  // POST /stores/upsert
  // =========================
  @Post("upsert")
  async upsertStores(
    @Body()
    body: {
      itemcode: string;
      stores: StoreOffer[];
    },
  ) {
    const { itemcode, stores } = body;
    return this.storesService.upsertStores(itemcode, stores);
  }

  // =========================
  // POST /stores/bulk
  // =========================
  @Post("bulk")
  async getBulk(
    @Body("itemcodes") itemcodes: string[],
  ) {
    return this.storesService.getMany(itemcodes);
  }
}
