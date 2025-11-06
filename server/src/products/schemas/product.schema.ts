import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true }) title: string;
  @Prop() brand?: string;
  @Prop({ required: true, type: Number }) price: number;
  @Prop({ default: 'ILS' }) currency?: string;
  @Prop({ type: [String], default: [] }) images: string[];
  @Prop({ default: true }) inStock: boolean;
  @Prop() category?: string;
  @Prop() description?: string;
  @Prop({ type: [String], default: [] }) tags?: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
