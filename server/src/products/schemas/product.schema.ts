import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true , unique: true})
  itemcode?: string;

  @Prop({ required: true })
  title: string;

  @Prop({
    type: String,
    enum: ['unit', 'kg', 'gram', 'liter'],
    default: 'unit',
    required: true,
  })
  unit: 'unit' | 'kg' | 'gram' | 'liter';

  @Prop()
  brand?: string;

  @Prop()
  pricerange?: string;

  @Prop()
  image?: string;

  @Prop()
  category?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
