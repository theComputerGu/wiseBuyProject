// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",       // אפשר גם "none" למעבר מיידי
        gestureEnabled: false,   // מבטל מחוות push/back שמרגישות כמו שכבות
        animationTypeForReplace: "push", // כשהולכים עם replace (ראו סעיף 2)
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
  );
}
