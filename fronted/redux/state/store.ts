import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { baseApi } from "../svc/baseApi";
import { storesApi } from "../svc/storesApi";
import { recommendationsApi } from "../svc/recommendationsApi";

import userReducer from "../slices/userSlice";
import groupReducer from "../slices/groupSlice";
import shoppingListReducer from "../slices/shoppinglistSlice";
import recommendedReducer from "../slices/recommendedSlice";
import uiReducer from "../slices/uiSlice";
import checkoutReducer from "../slices/checkoutSlice";
import storesReducer from "../slices/storesSlice";

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["user"],
};

const rootReducer = combineReducers({
  user: userReducer,
  group: groupReducer,
  shoppingList: shoppingListReducer,
  recommended: recommendedReducer,
  ui: uiReducer,
  checkout: checkoutReducer,
  stores: storesReducer,

  [baseApi.reducerPath]: baseApi.reducer,
  [recommendationsApi.reducerPath]: recommendationsApi.reducer,
});



const persisted = persistReducer(persistConfig, rootReducer);


export const store = configureStore({
  reducer: persisted,
  middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({ serializableCheck: false }).concat(
    baseApi.middleware,
    recommendationsApi.middleware,
    
  ),

});


export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;