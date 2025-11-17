// app/_layout.tsx
import React from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import { View, ActivityIndicator } from "react-native";
import { store, persistor } from "../redux/state/store";


// קומפוננטת Guard שמריצה הפניה אם אין משתמש ומנסים לצאת מ-/auth
function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments(); // למשל ["auth","sign-in"] או ["main","account"]
  const user = useSelector((s: any) => s.auth?.user);

  React.useEffect(() => {
    // האם כרגע נמצאים בקבוצת /auth ?
    const inAuth = segments[0] === "auth";

    // אם אין משתמש ומנסים להגיע למסכים שאינם ב-/auth → החזר ל-/auth/home
    if (!user && !inAuth) {
      router.replace("/auth/home");
    }
    // בכוונה לא מבצעים כאן הפניה הפוכה (משתמש מחובר שנמצא ב-/auth)
    // כדי לשמור על ההתנהגות שרצית (Back וחיצים במסכי Auth נשארים)
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
