// fronted/lib/types.ts

// המשתמש האפליקטיבי בצד ה-Frontend.
// שמרתי גם id אופציונלי כדי לשמור תאימות לקוד קיים שמשתמש ב-id ולא ב-_id.
export interface AppUser {
  _id: string;
  id?: string;              // תאימות לאזורים ישנים בקוד
  name: string;
  email?: string;
  groups: string[];
  defaultGroupId?: string;
  createdAt?: string;       // ISO string מהשרת
  updatedAt?: string;       // ISO string מהשרת
}
