// src/state/store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer, persistStore } from 'redux-persist';

import authReducer from '../slices/authSlice';
import uiReducer from '../slices/uiSlice';
import shoppingDraftReducer from '../slices/shoppingDraftSlice';
import { wisebuyApi } from '../svc/wisebuyApi';


export const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  shoppingDraft: shoppingDraftReducer,
  [wisebuyApi.reducerPath]: wisebuyApi.reducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'ui', 'shoppingDraft'], // לא שומרים את cache ה-API
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) =>
    getDefault({ serializableCheck: false }).concat(wisebuyApi.middleware),
});

export const persistor = persistStore(store);
setupListeners(store.dispatch);

// טיפוסי עזר
export type RootState = ReturnType<typeof rootReducer>;  // ✅ בלי PersistPartial
export type AppDispatch = typeof store.dispatch;
