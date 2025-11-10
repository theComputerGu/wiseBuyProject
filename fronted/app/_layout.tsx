import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { View, ActivityIndicator } from "react-native";
import { store, persistor } from "../redux/state/store";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate
        persistor={persistor}
        loading={
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#197FF4" />
          </View>
        }
      >
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
          }}
        />
      </PersistGate>
    </Provider>
  );
}
