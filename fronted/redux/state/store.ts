// redux/state/store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

// RTK Query API
import { baseApi } from "../svc/baseApi";

// Slices
import userReducer from "../slices/userSlice";
import groupReducer from "../slices/groupSlice";
import shoppingListReducer from "../slices/shoppinglistSlice";
import recommendedReducer from "../slices/recommendedSlice";
import uiReducer from "../slices/uiSlice";

// ----------------------
// Persist config
// ----------------------
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["user"], // persist only user data
};

// ----------------------
// Combine reducers
// ----------------------
const rootReducer = combineReducers({
  user: userReducer,
  group: groupReducer,
  shoppingList: shoppingListReducer,
  recommended: recommendedReducer,
  ui: uiReducer,

 
  [baseApi.reducerPath]: baseApi.reducer,
});

// ----------------------
// Persisted reducer
// ----------------------
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ----------------------
// Store
// ----------------------
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(baseApi.middleware),  
});

// ----------------------
// Persistor
// ----------------------
export const persistor = persistStore(store);

// ----------------------
// Types
// ----------------------
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
