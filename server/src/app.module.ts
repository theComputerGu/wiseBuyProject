import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // טוען את .env אוטומטית והופך את process.env לזמין בכל מקום
    ConfigModule.forRoot({ isGlobal: true }),

    // חיבור ל-MongoDB: אם אין MONGO_URI בקובץ env, ניפול לפולבאק
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wisebuy',
    ),

    ProductsModule,
  ],
  controllers:[AppController],
  providers:[AppService],
})
export class AppModule {}
