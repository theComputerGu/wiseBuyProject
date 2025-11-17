import { createSlice, PayloadAction } from '@reduxjs/toolkit';
/*
note: contain active (logged in) user with his info
*/

//
// TYPES
//
export interface User {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    groups: string[];
    defaultGroupId?: string | null | undefined;
    createdAt?: string;
    updatedAt?: string;
}

export interface UserState {
    current: User | null;
    isLoading: boolean;
}

//
// INITIAL STATE
//
const initialState: UserState = {
    current: null,
    isLoading: false,
};

//
// SLICE
//
export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (s, a: PayloadAction<User>) => {
            s.current = a.payload;
        },
        clearUser: (s) => {
            s.current = null;
        },
        setLoading: (s, a: PayloadAction<boolean>) => {
            s.isLoading = a.payload;
        },
    },
});

export const { setUser, clearUser, setLoading,  } = userSlice.actions;
export default userSlice.reducer;
