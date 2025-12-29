import { Controller, Post, Body } from "@nestjs/common";
import { StoresResolverService } from "./stores-resolver.service";
import { StoreOffer } from "./schemas/stores.schema";

@Controller("stores")
export class StoresResolveController {
  constructor(
    private readonly resolver: StoresResolverService,
  ) {}

  @Post("resolve")
  async resolveStores(
    @Body()
    body: {
      addressKey: string;
      itemcodes: string[];
    },
  ): Promise<{
    items: {
      itemcode: string;
      stores: StoreOffer[];
      source: "cache" | "scrape";
    }[];
    scoredStores: {
      storeId: string;
      chain: string;
      address: string;
      lat: number;
      lon: number;
      score: number;
      scoreBreakdown: {
        availability: number;
        price: number;
        distance: number;
        penalty: number;
      };
    }[];
  }> {
    console.log("RAW BODY:", body);
    console.log("addressKey:", body.addressKey);
    console.log("itemcodes:", body.itemcodes);

    const { addressKey, itemcodes } = body;

    return this.resolver.resolveStores(
      addressKey,
      itemcodes,
    );
  }
}