// src/prices/schemas/store-price.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StorePriceDocument = HydratedDocument<StorePrice>;

@Schema({ timestamps: true })
export class StorePrice {
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
    productId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Store', required: true, index: true })
    storeId: Types.ObjectId;

    @Prop({ type: Number, required: true })
    price: number;

    @Prop()
    updatedAtXml?: Date; // Real XML government update
}

export const StorePriceSchema = SchemaFactory.createForClass(StorePrice);

// prevent duplicates
StorePriceSchema.index({ productId: 1, storeId: 1 }, { unique: true });
