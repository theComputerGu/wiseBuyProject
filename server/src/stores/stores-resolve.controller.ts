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
  ): Promise<
    {
      itemcode: string;
      stores: StoreOffer[];
      source: "cache" | "scrape";
    }[]
  > {
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
