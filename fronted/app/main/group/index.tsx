// app/group/index.tsx
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { useRouter } from "expo-router";
import BottomNav from '../../../components/Bottomnavigation';
import TopNav from '../../../components/Topnav'
import Title from '../../../components/Title'
import { API_URL } from '@env';


const BRAND = "#197FF4";

export default function GroupPage() {
  const router = useRouter();

  // דמו – החלף בנתונים אמיתיים כשתחבר BE
  const groups = useMemo(
    () => [
      { id: "g1", name: "Sean & mark home" },
      { id: "g2", name: "Tom & Johnathan home" },
      { id: "g3", name: "Goldberg family home" },
    ],
    []
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" , paddingHorizontal: 20}}>
        <TopNav />
        <Title text="Shopping lists" />
        

        {/* List */}
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          ItemSeparatorComponent={() => <View style={s.separator} />}
          renderItem={({ item }) => (
            <View style={s.row}>
              <Pressable style={{ flex: 1 }}>
                <Text style={s.link}>{item.name}</Text>
              </Pressable>
              <Ionicons name="list-outline" size={20} color={BRAND} />
            </View>
          )}
          ListFooterComponent={<View style={{ height: 8 }} />}
        />

        {/* Watermark עדין באמצע */}
        <Text style={s.watermark}>WiseBuy</Text>

        {/* Pills – Join/Create */}
        <View style={s.pills}>
          <Pressable style={[s.pill, s.pillSolid]} onPress={() => router.push("/main/group/join")}>
            <Text style={[s.pillText, { color: "#fff" }]}>Join Group</Text>
          </Pressable>

          <Pressable style={[s.pill, s.pillSolid]} onPress={() => router.push("/main/group/create")}>
            <Text style={[s.pillText, { color: "#fff" }]}>Create Group</Text>
          </Pressable>
        </View>

        <BottomNav />
      </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50, paddingHorizontal: 20 },
  wrap: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  brand: {
    fontSize: 20,
    fontWeight: "900",
    marginLeft: 8,
    color: BRAND,
  },
  section: {
    marginTop: 12,
    marginBottom: 6,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: "800",
    color: BRAND,
  },
  row: {
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  link: {
    color: BRAND,
    fontSize: 16,
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },

  watermark: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    top: "55%",
    fontSize: 36,
    fontWeight: "900",
    color: "#197FF4",
    opacity: 0.06,
  },

  pills: {
    position: 'relative',
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  pillSolid: {
    backgroundColor: BRAND,
  },
  pillText: {
    fontSize: 14,
    fontWeight: "800",
  },
});
