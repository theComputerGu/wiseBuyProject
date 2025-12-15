import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { GroupsModule } from './groups/groups.module';
import { StoresModule } from './stores/stores.module';
import { UsersModule } from './users/users.module';
import { ShoppingListsModule } from './shoppinglist/shopping-lists.module';
import { ScrapeModule } from './scrape/scrape.module';
import { RecommendationsModule } from "./reccommendations/recommendations.module";

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wisebuy'),
    ScrapeModule,
    ProductsModule,
    GroupsModule,
    StoresModule,
    UsersModule,
    ShoppingListsModule,
    RecommendationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
