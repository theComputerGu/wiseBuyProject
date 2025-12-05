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


  @Prop({ type: Types.ObjectId, ref: 'ShoppingList', default: null })
  activeshoppinglist: Types.ObjectId | null;

  @Prop({ default: false })
  isDefault: boolean;


  @Prop({
    type: [
      {
        name: { type: String },

        shoppingListId: {
          type: Types.ObjectId,
          ref: 'ShoppingList',
          required: true,
        },

        purchasedAt: { type: Date, required: true },
        storename: { type: String },
        storeadress: { type: String },
        totalprice: { type: Number },
        itemcount: { type: Number },

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
    name: string;
    shoppingListId?: Types.ObjectId;
    purchasedAt: Date;
    storename: string;
    storeadress: string;
    totalprice: number;
    itemcount: number;
  }[];
}

export const GroupSchema = SchemaFactory.createForClass(Group);
