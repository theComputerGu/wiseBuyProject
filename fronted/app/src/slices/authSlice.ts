import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type User = {
  id: string;
  name: string;
  email?: string;
  defaultGroupId?: string;

  // 👇 תוספת מינימלית כדי ש-Account יוכל לשמור ולהציג תאריכים
  createdAt?: string;   // ISO string מהשרת (אופציונלי)
  updatedAt?: string;   // ISO string מהשרת (אופציונלי)
  avatarUrl?: string | null;   // ⬅️ חדש
};

interface AuthState {
  token?: string;
  user?: User;
  activeGroupId?: string;
}

const initialState: AuthState = {
  token: undefined,
  user: undefined,
  activeGroupId: undefined,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (s, a: PayloadAction<string | undefined>) => {
      s.token = a.payload;
    },
    setUser: (s, a: PayloadAction<User | undefined>) => {
      s.user = a.payload;
      if (a.payload?.defaultGroupId) s.activeGroupId = a.payload.defaultGroupId;
    },
    signOut: (s) => {
      s.token = undefined;
      s.user = undefined;
      s.activeGroupId = undefined;
    },
  },
});

export const { setToken, setUser, signOut } = authSlice.actions;
export default authSlice.reducer;
