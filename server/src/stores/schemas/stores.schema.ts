// src/stores/store.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StoreDocument = Store & Document;

@Schema({ timestamps: true })
export class Store {
  @Prop({ required: true })
  name: string;

  @Prop()
  address: string;

  //  Store location using GeoJSON (for "near me" queries)
  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
  })
  type: string;

  @Prop({
    type: [Number], // [longitude, latitude]
    index: '2dsphere', // enables geospatial queries
  })
  coordinates: number[];

  //city of store
  @Prop()
  city?: string;

}

export const StoreSchema = SchemaFactory.createForClass(Store);
StoreSchema.index({ coordinates: '2dsphere' }); // ✅ important for $near
