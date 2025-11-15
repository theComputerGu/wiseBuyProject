import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Store } from '../../stores/schemas/stores.schema';

export type ShoppingListDocument = HydratedDocument<ShoppingList>;

@Schema({ timestamps: true, versionKey: false })
export class ShoppingList {
  @Prop({ type: Types.ObjectId, ref: 'Group', required: true, index: true })
  groupId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId; // יוצר/מבצע הקנייה

  @Prop({ type: Types.ObjectId, ref: 'Store' })
  storeId?: Types.ObjectId | Store;  // ⬅⬅⬅ שיניתי


  @Prop({ type: Date, required: true, index: true })
  purchasedAt: Date;

  @Prop({
    type: [
      {
        productId: { type: Types.ObjectId, ref: 'Product', required: true, index: true },
        nameSnapshot: { type: String }, // לשמור שם מוצר בזמן הקנייה (אופציונלי)
        quantity: { type: Number, min: 0, required: true },
        unit: { type: String, default: 'unit' }, // 'unit' | 'kg' | 'litre' ...
        pricePerUnit: { type: Number, min: 0, required: true },
        lineTotal: { type: Number, min: 0, required: true },
        notes: { type: String },
      },
    ],
    default: [],
  })
  items: Array<{
    productId: Types.ObjectId;
    nameSnapshot?: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    lineTotal: number;
    notes?: string;
  }>;

  @Prop({ type: Number, min: 0, required: true, default: 0 })
  subtotal: number;

  @Prop({ type: Number, default: 0, min: 0 })
  discountTotal: number;

  @Prop({ type: Number, default: 0, min: 0 })
  taxTotal: number;

  @Prop({ type: Number, min: 0, required: true, default: 0, index: true })
  total: number;

  @Prop({ type: String, default: 'ILS' })
  currency: string;

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: [String], default: [] })
  receiptImages?: string[]; // URLs לחשבוניות/תמונות

  @Prop({ type: String, enum: ['draft', 'final'], default: 'final', index: true })
  status: 'draft' | 'final';
}

export const ShoppingListSchema = SchemaFactory.createForClass(ShoppingList);

// אינדקסים שימושיים
ShoppingListSchema.index({ groupId: 1, purchasedAt: -1 });
ShoppingListSchema.index({ groupId: 1, storeId: 1, purchasedAt: -1 });

// חישוב סכומים לפני שמירה אם לא סופקו
ShoppingListSchema.pre('save', function (next) {
  const doc = this as ShoppingListDocument;
  const subtotal = (doc.items ?? []).reduce((sum, it) => sum + (it.lineTotal ?? it.quantity * it.pricePerUnit), 0);
  doc.subtotal = subtotal;
  if (!doc.total || doc.isModified('items') || doc.isModified('discountTotal') || doc.isModified('taxTotal')) {
    doc.total = Math.max(0, subtotal - (doc.discountTotal || 0) + (doc.taxTotal || 0));
  }
  next();
});
