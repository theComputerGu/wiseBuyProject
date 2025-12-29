export type GeoPoint = {
  lat: number;
  lon: number;
};

export type StoreOffer = {
  chain: string;
  address: string;
  price: number;
  geo?: GeoPoint;
  lastUpdated?: string;
};

export type StoresEntry = {
  itemcode: string;
  stores: StoreOffer[];
};
