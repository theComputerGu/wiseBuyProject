export interface StoreProduct {
  itemcode: string;
  price: number;
  amount: number;
}

export interface StoreEntry {
  id: string;
  chain: string;
  city: string;
  address: string;

  geo: {
    lat: number;
    lon: number;
  };

  products: StoreProduct[];
  score: number;
}
