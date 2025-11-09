import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { ProductsModule } from './products/products.module';
import { GroupsModule } from './groups/groups.module';
import { StoresModule } from './stores/stores.module';
import { UsersModule } from './users/users.module'; // ✅ הוסף
import { ShoppingListsModule } from './shoppinglist/shopping-lists.module'; // ✅ הוסף

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wisebuy'),

    // ✅ כל המודולים שמגדירים ראוטים
    ProductsModule,
    GroupsModule,
    StoresModule,
    UsersModule,            // ✅ חדש
    ShoppingListsModule,    // ✅ חדש
  ],
  controllers:[AppController],
  providers:[AppService],
})
export class AppModule {}
