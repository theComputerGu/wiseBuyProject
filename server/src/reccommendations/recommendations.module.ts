import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { RecommendationsService } from "./recommendations.service";
import { RecommendationsController } from "./recommendations.controller";

import { User, UserSchema } from "../users/schemas/users.schema";
import { Group, GroupSchema } from "../groups/schemas/groups.schema";
import {
  ShoppingList,
  ShoppingListSchema,
} from "../shoppinglist/schemas/shopping-list.schema";
import {
  Product,
  ProductSchema,
} from "../products/schemas/product.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Group.name, schema: GroupSchema },
      { name: ShoppingList.name, schema: ShoppingListSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
})
export class RecommendationsModule {}
