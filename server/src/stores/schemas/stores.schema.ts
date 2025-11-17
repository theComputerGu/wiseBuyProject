import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StoreDocument = Store & Document;

@Schema({ timestamps: true })
export class Store {
  @Prop({ required: true })
  ChainId: string

  @Prop({ required: true })
  storeId: string
  
  @Prop({ required: true })
  name: string;

  @Prop()
  address: string;

  @Prop()
  city?: string;

}

export const StoreSchema = SchemaFactory.createForClass(Store);
