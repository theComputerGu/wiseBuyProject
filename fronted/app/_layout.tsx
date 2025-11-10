import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { View, ActivityIndicator } from "react-native";
import { store, persistor } from "../app/src/state/store";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#197FF4" />
          </View>
        }
        persistor={persistor}
      >
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "none", // אפשר גם "slide" או "fade"
            gestureEnabled: true,
            animationTypeForReplace: "push",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="home" />
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="sign-up" />
          <Stack.Screen name="group/index" />
          <Stack.Screen name="group/join" />
          <Stack.Screen name="group/create" />
          <Stack.Screen name="group/create/add" />
        </Stack>
      </PersistGate>
    </Provider>
  );
}
