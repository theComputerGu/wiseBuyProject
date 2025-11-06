// src/products/schemas/product.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema({ timestamps: true })
export class Product {
_id: string;


@Prop({ required: true, trim: true })
title: string; // name displayed in ProductCard


@Prop({ trim: true })
brand?: string;


@Prop({ required: true, min: 0 })
price: number; // numeric price


@Prop({ default: 'ILS' })
currency: string; // ILS by default


@Prop({ trim: true })
unit?: string; // e.g. "/kg", "/unit"


@Prop({ default: 0, min: 0, max: 5 })
rating?: number; // 0–5


@Prop({ type: [String], default: [] })
images: string[]; // first item used as card image


@Prop({ default: true })
inStock: boolean;


@Prop({ trim: true })
category?: string; // e.g. "Dairy"


@Prop({ trim: true })
description?: string;


@Prop({ type: [String], default: [] })
tags: string[]; // for filters/search chips
}


export type ProductDocument = Product & Document;
export const ProductSchema = SchemaFactory.createForClass(Product);