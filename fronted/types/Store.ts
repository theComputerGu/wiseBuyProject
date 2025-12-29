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



export type ScoredStore = {
  storeId: string;
  chain: string;
  address: string;
  lat: number;
  lon: number;
  score: number;
  scoreBreakdown: {
    availability: number;
    price: number;
    distance: number;
    penalty: number;
  };
};
