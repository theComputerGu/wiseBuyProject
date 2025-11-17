import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";

import { baseApi } from "../svc/baseApi";
import authReducer from "../slices/authSlice";
import shoppingDraftReducer from "../slices/activeshoppinglistSlice";
import uiReducer from "../slices/uiSlice";


const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth", "shoppingDraft"], // מה שאתה רוצה לשמור
};

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: authReducer,
  shoppingDraft: shoppingDraftReducer,
  ui: uiReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: false,
    }).concat(baseApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
