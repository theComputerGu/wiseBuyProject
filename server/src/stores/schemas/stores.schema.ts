import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";





@Schema({ _id: false })
export class GeoPoint {
  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lon: number;
}






export const GeoPointSchema =
  SchemaFactory.createForClass(GeoPoint);

@Schema({ _id: false })
export class StoreOffer {
  @Prop({ required: true })
  chain: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  price: number;

  @Prop({ type: GeoPointSchema })
  geo?: GeoPoint;

  @Prop({ default: Date.now })
  lastUpdated: Date;
}






export const StoreOfferSchema =
  SchemaFactory.createForClass(StoreOffer);

@Schema({ _id: false })
export class ProductEntry {
  @Prop({ required: true })
  itemcode: string;

  @Prop({ type: [StoreOfferSchema], default: [] })
  stores: StoreOffer[];

  @Prop({ default: Date.now })
  lastUpdated: Date;
}








export const ProductEntrySchema =
  SchemaFactory.createForClass(ProductEntry);

@Schema({ timestamps: true })
export class Stores {
  @Prop({ required: true, unique: true, index: true })
  addressKey: string;

  @Prop({ type: [ProductEntrySchema], default: [] })
  products: ProductEntry[];
}





export type StoresDocument = Stores & Document;
export const StoresSchema =
  SchemaFactory.createForClass(Stores);
