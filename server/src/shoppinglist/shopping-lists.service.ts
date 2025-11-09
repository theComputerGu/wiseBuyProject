import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { ShoppingList, ShoppingListDocument } from './schemas/shopping-list.schema';
import { CreateShoppingListDto } from './dto/create-shopping-list.dto';
import { UpdateShoppingListDto } from './dto/update-shopping-list.dto';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { QueryShoppingListDto } from './dto/query-shopping-list.dto';

@Injectable()
export class ShoppingListsService {
  constructor(
    @InjectModel(ShoppingList.name) private model: Model<ShoppingListDocument>,
  ) {}

  async create(dto: CreateShoppingListDto) {
    // אם לא סופק lineTotal לפריטים – נחושב
    dto.items = (dto.items ?? []).map(it => ({
      ...it,
      lineTotal: typeof it.lineTotal === 'number' ? it.lineTotal : it.quantity * it.pricePerUnit,
    }));
    return this.model.create(dto);
  }

  async findById(id: string) {
    const doc = await this.model.findById(id).populate(['userId','groupId','storeId','items.productId']).lean();
    if (!doc) throw new NotFoundException('Shopping list not found');
    return doc;
  }

  async find(query: QueryShoppingListDto) {
    const filter: FilterQuery<ShoppingListDocument> = {};
    if (query.groupId) filter.groupId = new Types.ObjectId(query.groupId);
    if (query.userId) filter.userId = new Types.ObjectId(query.userId);
    if (query.storeId) filter.storeId = new Types.ObjectId(query.storeId);
    if (query.status) filter.status = query.status as any;
    if (query.from || query.to) {
      filter.purchasedAt = {};
      if (query.from) (filter.purchasedAt as any).$gte = new Date(query.from);
      if (query.to) (filter.purchasedAt as any).$lte = new Date(query.to);
    }
    return this.model.find(filter).sort({ purchasedAt: -1 }).lean();
  }

  async update(id: string, dto: UpdateShoppingListDto) {
    if (dto.items) {
      dto.items = dto.items.map(it => ({
        ...it,
        lineTotal: typeof it.lineTotal === 'number' ? it.lineTotal : (it.quantity ?? 0) * (it.pricePerUnit ?? 0),
      }));
    }
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true, runValidators: true });
    if (!doc) throw new NotFoundException('Shopping list not found');
    return doc;
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Shopping list not found');
    return { deleted: true };
  }

  async addItem(id: string, item: AddItemDto) {
    const doc = await this.model.findById(id);
    if (!doc) throw new NotFoundException('Shopping list not found');
    const lineTotal = typeof item.lineTotal === 'number' ? item.lineTotal : item.quantity * item.pricePerUnit;
    doc.items.push({ ...item, lineTotal } as any);
    await doc.save();
    return doc;
  }

  async updateItem(id: string, itemIndex: number, patch: UpdateItemDto) {
    const doc = await this.model.findById(id);
    if (!doc) throw new NotFoundException('Shopping list not found');
    if (itemIndex < 0 || itemIndex >= doc.items.length) throw new NotFoundException('Item index out of range');

    const current = doc.items[itemIndex] as any;
    const merged = { ...current.toObject?.() ?? current, ...patch };
    merged.lineTotal = typeof merged.lineTotal === 'number' ? merged.lineTotal : (merged.quantity ?? 0) * (merged.pricePerUnit ?? 0);
    doc.items[itemIndex] = merged;
    await doc.save();
    return doc;
  }

  async removeItem(id: string, itemIndex: number) {
    const doc = await this.model.findById(id);
    if (!doc) throw new NotFoundException('Shopping list not found');
    doc.items.splice(itemIndex, 1);
    await doc.save();
    return doc;
  }

  // דוגמת אגרגציה לסטטיסטיקות: הוצאת חודשית לפי קבוצה/חנות
  async monthlySpend(groupId: string, storeId?: string) {
    const match: any = { groupId: new Types.ObjectId(groupId) };
    if (storeId) match.storeId = new Types.ObjectId(storeId);

    return this.model.aggregate([
      { $match: match },
      {
        $group: {
          _id: { y: { $year: '$purchasedAt' }, m: { $month: '$purchasedAt' } },
          total: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
    ]);
  }
}
