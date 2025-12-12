export type StoreEntry = {
  id:string;
  chain:string;
  address:string;
  geo:{ lat:number; lon:number };
  products:{ itemcode:string; price:number; amount:number }[];

  score:number;     // מחיר כולל
  rating:number;    // דירוג 0–100 אחרי נרמול
  stars:number;     // ⭐ 1–5 לתצוגה
};
