import { configureStore } from '@reduxjs/toolkit';

import userReducer from '../slices/userSlice';
import groupReducer from '../slices/groupSlice';
import shoppingListReducer from '../slices/shoppinglistSlice';
import recommendedReducer from '../slices/recommendedSlice';
import uiReducer from '../slices/uiSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    group: groupReducer,
    shoppingList: shoppingListReducer,
    recommended: recommendedReducer,
    ui: uiReducer,
  },
});

// Types for useSelector and useDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
