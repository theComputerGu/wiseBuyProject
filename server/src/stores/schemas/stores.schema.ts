import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

// ----------------------------
// Subdocument: GeoPoint
// ----------------------------
@Schema({ _id: false })
export class GeoPoint {
  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lon: number;
}

const GeoPointSchema = SchemaFactory.createForClass(GeoPoint);

// ----------------------------
// Subdocument: StoreOffer
// ----------------------------
@Schema({ _id: false })
export class StoreOffer {
  @Prop({ required: true })
  chain: string;          // e.g. "Shufersal", "Rami Levy"

  @Prop({ required: true })
  address: string;        // full address

  @Prop({ required: true, min: 0 })
  price: number;          // price in ILS

  @Prop({ type: GeoPointSchema, required: false })
  geo?: GeoPoint;         // coordinates (optional for now)

  @Prop({ default: Date.now })
  lastUpdated: Date;      // scrape timestamp
}

const StoreOfferSchema = SchemaFactory.createForClass(StoreOffer);

// ----------------------------
// Main Schema: Stores
// ----------------------------
@Schema({ timestamps: true })
export class Stores {
  @Prop({ required: true, index: true,})
  itemcode: string;       // barcode

  @Prop({ type: [StoreOfferSchema], default: [] })
  stores: StoreOffer[];
}

export type StoresDocument = Stores & Document;
export const StoresSchema = SchemaFactory.createForClass(Stores);
