// src/groups/schemas/group.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/users.schema';

export type GroupDocument = Group & Document;

@Schema({ timestamps: true })
export class Group {
  // Group name
  @Prop({ required: true })
  name: string;

  // Users in the group
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  users: Types.ObjectId[];

  // Group join code
  @Prop({ required: true, unique: true })
  groupcode: string;

  // Active shopping list
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

  // History of past shopping lists
  @Prop({ type: Array, default: [] })
  history: Array<
    {
      purchasedAt: Date;
      items: {
        productName: string;
        quantity: number;
        price: number;
      }[];
    }
  >;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
