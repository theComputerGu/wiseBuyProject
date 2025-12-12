import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/*
  ========= מבנה חדש של CACHE =========
  מסמך יחיד לכל עיר!

  city       → "תל אביב"
  stores[]   → כל חנות בעיר
      storeId        → מזהה ייחודי (chain + address)
      chain          → שופרסל / רמי לוי / יוחננוף ...
      address        → כתובת הסניף
      geo            → קואורדינטות
      products[]     → רשימת מוצרים שנמצאו בחנות
          barcode    → ברקוד המוצר
          price      → מחיר עדכני
          updatedAt  → זמן עדכון (לבדיקת TTL)
*/

@Schema({ timestamps: true })
export class StoreCache {

  @Prop({ required: true, unique: true })
  city: string; // ← קאש פר עיר בלבד!

  @Prop({
    type: [{
      storeId: String,
      chain: String,
      address: String,
      geo: {
        lat: Number,
        lon: Number,
      },
      products: [{
        barcode: String,
        price: Number,
        updatedAt: Date,
      }]
    }],
    default: []
  })
  stores: {
    storeId: string;
    chain: string;
    address: string;
    geo: { lat:number; lon:number };
    products: {
      barcode:string;
      price:number;
      updatedAt:Date;
    }[];
  }[];

  @Prop()
  updatedAt?: Date; // חובה כדי לממש TTL
}

export type StoreCacheDocument = StoreCache & Document;
export const StoreCacheSchema = SchemaFactory.createForClass(StoreCache);
StoreCacheSchema.index({ city:1 }, { unique:true }); // 🔥 קאש יחיד לכל עיר!
