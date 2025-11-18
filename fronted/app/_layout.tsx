// app/_layout.tsx
import React from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { View, ActivityIndicator } from "react-native";
import { store, persistor, RootState } from "../redux/state/store";


// 🔒 Auth Guard: ensures protected routes are locked when user is not logged in
function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();         // example: ["auth","login"] or ["main","group"]

  // ✔ FIXED: your slice name is `user`, not `auth`
  const user = useSelector((s: RootState) => s.user.current);

  React.useEffect(() => {
    const inAuth = segments[0] === "auth";   // Is the current route group "/auth"?

    // ❗ If user NOT logged in AND trying to access non-auth screen → redirect
    if (!user && !inAuth) {
      router.replace("/auth/home");
      return;
    }

    // ✔ NOTE:
    // We do NOT redirect logged-in users AWAY from /auth automatically.
    // This allows them to go back with the top bar/back button.
    // This is the behavior you wanted.

  }, [user, segments]);

  return <>{children}</>;
}



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
        <AuthGuard>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "fade",
            }}
          />
        </AuthGuard>
      </PersistGate>
    </Provider>
  );
}
