import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GroupDocument = Group & Document;

@Schema({ timestamps: true })
export class Group {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  admin: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  users: Types.ObjectId[];

  @Prop({ required: true, unique: true })
  groupcode: string;

  @Prop({
    type: [
      {
        productName: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        price: { type: Number, default: 0 },
        checked: { type: Boolean, default: false },
      },
    ],
    default: [],
  })
  shoppingList: {
    productName: string;
    quantity: number;
    price: number;
    checked: boolean;
  }[];

  // ⭐⭐⭐ היסטוריית רכישות — נוספה תמיכה ב־shoppingListId ⭐⭐⭐
  @Prop({
    type: [
      {
        shoppingListId: {
          type: Types.ObjectId,
          ref: 'ShoppingList',
          required: true,   // <<< חשוב!
        },

        purchasedAt: { type: Date, required: true },

        items: [
          {
            productName: { type: String },
            quantity: { type: Number },
            price: { type: Number },
          }
        ],

        total: { type: Number, default: 0 },

        storeId: {
          type: Types.ObjectId,
          ref: 'Store',
          required: false,
        },
      },
    ],
    default: [],
  })
  history: {
    shoppingListId?: Types.ObjectId;
    purchasedAt: Date;
    items: {
      productName: string;
      quantity: number;
      price: number;
    }[];
    total: number;
    storeId?: Types.ObjectId;
  }[];
}

export const GroupSchema = SchemaFactory.createForClass(Group);
