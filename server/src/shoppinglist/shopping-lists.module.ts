import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ShoppingList, ShoppingListSchema } from './schemas/shopping-list.schema';
import { ShoppingListsService } from './shopping-lists.service';
import { ShoppingListsController } from './shopping-lists.controller';

import { Group, GroupSchema } from '../groups/schemas/groups.schema';  // ← חובה!

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShoppingList.name, schema: ShoppingListSchema },
      { name: Group.name, schema: GroupSchema },   // ← השורה שחסרה אצלך
    ]),
  ],
  providers: [ShoppingListsService],
  controllers: [ShoppingListsController],
  exports: [ShoppingListsService],
})
export class ShoppingListsModule {}
