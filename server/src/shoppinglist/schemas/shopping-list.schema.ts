import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Store } from '../../stores/schemas/stores.schema';

export type ShoppingListDocument = HydratedDocument<ShoppingList>;

@Schema({ timestamps: true, versionKey: false })
export class ShoppingList {

  @Prop({
    type: [
      {
        productId: { type: Types.ObjectId, ref: 'Product', required: true, index: true },
        quantity: { type: Number, min: 0, required: true },
      },
    ],
    default: [],
  })
  items: Array<{
    productId: Types.ObjectId;
    quantity: number;
  }>;

  @Prop()
  total: number


}

export const ShoppingListSchema = SchemaFactory.createForClass(ShoppingList);


