import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ActiveUserState {
  userId: string | null;   // logged-in user ID
  token?: string | null;    // JWT or session token
}

const initialState: ActiveUserState = {
  userId: null,
  token: null,
};

const activeUserSlice = createSlice({
  name: 'activeUser',
  initialState,
  reducers: {
    // set user session after login
    setUserSession: (
      state,
      action: PayloadAction<{ userId: string; token: string }>
    ) => {
      state.userId = action.payload.userId;
      state.token = action.payload.token;
    },

    // clear the active user state (logout)
    clearUserSession: (state) => {
      state.userId = null;
      state.token = null;
    },
  },
});

export const { setUserSession, clearUserSession } = activeUserSlice.actions;
export default activeUserSlice.reducer;
