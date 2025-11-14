import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/users.schema';

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

  @Prop({ type: Array, default: [] })
  history: Array<{
    purchasedAt: Date;
    items: { productName: string; quantity: number; price: number }[];
  }>;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
