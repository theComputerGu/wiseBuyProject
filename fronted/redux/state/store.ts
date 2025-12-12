import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { baseApi } from "../svc/baseApi";
import { storeApi } from "../svc/storeApi";          
import userReducer from "../slices/userSlice";
import groupReducer from "../slices/groupSlice";
import shoppingListReducer from "../slices/shoppinglistSlice";
import recommendedReducer from "../slices/recommendedSlice";
import uiReducer from "../slices/uiSlice";
import checkoutReducer from "../slices/checkoutSlice";
import storesReducer from "../slices/storesSlice";   

// ----------------------------
// Persist config
// ----------------------------
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["user"],
};

// ----------------------------
// Root reducer
// ----------------------------
const rootReducer = combineReducers({
  user: userReducer,
  group: groupReducer,
  shoppingList: shoppingListReducer,
  recommended: recommendedReducer,
  ui: uiReducer,
  checkout: checkoutReducer,

  stores: storesReducer,                   

  [baseApi.reducerPath]: baseApi.reducer,
  [storeApi.reducerPath]: storeApi.reducer,  
});

// ----------------------------
// Persisted reducer
// ----------------------------
const persisted = persistReducer(persistConfig, rootReducer);

// ----------------------------
// Store
// ----------------------------
export const store = configureStore({
  reducer: persisted,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      baseApi.middleware,
      storeApi.middleware                
    ),
});

// ----------------------------
// Persistor
// ----------------------------
export const persistor = persistStore(store);

// ----------------------------
// Types
// ----------------------------
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
