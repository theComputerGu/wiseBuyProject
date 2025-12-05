import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StoreDocument = Store & Document;

@Schema({ timestamps: true })
export class Store {
  @Prop({ required: true })
  ChainId: string;

  @Prop({ required: true })
  storeId: string;
  
  @Prop({ required: true })
  name: string;

  @Prop()
  address: string;

  @Prop()
  city?: string;

  // 🆕 GEO שמור תמיד על חנות
  @Prop({ type: Object, default: { lat: 0, lon: 0 } })
  geo: { lat:number, lon:number };

  // 🆕 Cache מחירים לפי ברקוד
  @Prop({ type:Object, default:{} })
  products:{
    [barcode:string]:{
      price:number,
      updatedAt:Date,
      history?:{price:number, date:Date}[]
    }
  };
}

export const StoreSchema = SchemaFactory.createForClass(Store);
StoreSchema.index({ChainId:1,storeId:1},{unique:true});
StoreSchema.index({city:1});
