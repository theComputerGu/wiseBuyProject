import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type User = {
  _id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  groups: string[];
  createdAt?: string;
  updatedAt?: string;
  defaultGroupId?: string | null;
};

interface AuthState {
  token?: string;
  user?: User;
  activeGroupId?: string | null;
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
      if (!a.payload) {
        s.user = undefined;
        s.activeGroupId = undefined;
        return;
      }

      // לא לדרוס — אלא למזג
      s.user = {
        ...s.user,
        ...a.payload,
        groups: a.payload.groups ?? s.user?.groups ?? [],
        defaultGroupId: a.payload.defaultGroupId ?? s.user?.defaultGroupId ?? null
      };

      if (s.user.defaultGroupId) {
        s.activeGroupId = s.user.defaultGroupId;
      }
    },

    setActiveGroup: (s, a: PayloadAction<string | undefined>) => {
      s.activeGroupId = a.payload;
    },

    signOut: (s) => {
      s.token = undefined;
      s.user = undefined;
      s.activeGroupId = undefined;
    },
  },
});

export const { setToken, setUser, setActiveGroup, signOut } = authSlice.actions;
export default authSlice.reducer;
