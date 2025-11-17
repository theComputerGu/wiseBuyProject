import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ActiveGroupState {
  activeGroupId: string | null;
}

const initialState: ActiveGroupState = {
  activeGroupId: null,
};

const activeGroupSlice = createSlice({
  name: 'activeGroup',
  initialState,
  reducers: {
    setActiveGroup: (state, action: PayloadAction<string | null>) => {
      state.activeGroupId = action.payload;
    },
  },
});

export const { setActiveGroup } = activeGroupSlice.actions;
export default activeGroupSlice.reducer;
