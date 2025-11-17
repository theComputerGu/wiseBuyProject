import { createSlice, PayloadAction } from '@reduxjs/toolkit';
/*
note: contain active group
*/

//types
export interface Group {
     _id: string;
    name: string;
    admin: string;
    users: string[];
    groupcode: string;
    activeshoppinglist: string; //should only contain the id and not the full list
    history: { // history should contain the full list of history for said group
        name: string;
        shoppingListId?: string;
        purchasedAt: Date;
        storeId?: string;
    }[];
    createdAt?: string;
    updatedAt?: string;
}

export interface GroupState {
  activeGroup: Group | null;
  isLoading: boolean;
}

//
// INITIAL STATE
//
const initialState: GroupState = {
  activeGroup: null,
  isLoading: false,
};

//
// SLICE
//
export const groupSlice = createSlice({
  name: 'group',
  initialState,
  reducers: {
    setActiveGroup: (s, a: PayloadAction<Group>) => {
      s.activeGroup = a.payload;
    },
    clearActiveGroup: (s) => {
      s.activeGroup = null;
    },
    setGroupLoading: (s, a: PayloadAction<boolean>) => {
      s.isLoading = a.payload;
    },
  },
});

export const { setActiveGroup, clearActiveGroup, setGroupLoading } =
  groupSlice.actions;

export default groupSlice.reducer;
