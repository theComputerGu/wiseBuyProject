// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="home" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="group/index" />
      <Stack.Screen name="group/join" />
      <Stack.Screen name="group/create" />
      <Stack.Screen name="group/create/add" />
    </Stack>
  );
}
