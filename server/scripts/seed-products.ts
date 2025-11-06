import 'dotenv/config';
import mongoose from 'mongoose';
import { ProductSchema } from '../src/products/schemas/product.schema';

const Product = mongoose.model('Product', ProductSchema as any);

async function main() {
  await mongoose.connect(process.env.MONGO_URI!);

  // כאן תדביק את הנתונים המקומיים שלך מ־ProductCard
  const mock = [
    {
      title: 'Milk 3% 1L',
      brand: 'Tnuva',
      price: 6.9,
      unit: '/unit',
      rating: 4.3,
      images: ['https://example.com/milk.png'],
      category: 'Dairy',
      tags: ['milk'],
    },
  ];

  await Product.deleteMany({});
  await Product.insertMany(mock);
  console.log('Seeded', mock.length);
  await mongoose.disconnect();
}
main();
