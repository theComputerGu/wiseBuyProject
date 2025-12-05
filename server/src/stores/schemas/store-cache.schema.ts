import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true }) // ← חובה! מוסיף updatedAt + createdAt
export class StoreCache {

  @Prop({ required: true })
  barcode: string;

  @Prop({ required: true })
  city: string;

  @Prop({ type: Array, default: [] })
  stores: any[];

  @Prop()
  updatedAt?: Date; // ← עכשיו כן קיים בטייפ!
}

export type StoreCacheDocument = StoreCache & Document;
export const StoreCacheSchema = SchemaFactory.createForClass(StoreCache);
