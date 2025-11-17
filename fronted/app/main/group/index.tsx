// app/main/group/index.tsx

import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "../../../components/Bottomnavigation";
import TopNav from "../../../components/Topnav";
import Title from "../../../components/Title";
import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux/state/store";
import { setActiveGroup } from "../../../redux/slices/authSlice";
import { useGetUserGroupsQuery } from "../../../redux/svc/usersApi";
import { useState } from "react";

import GroupAccordion from "../../../components/groupaccordion";

const BRAND = "#197FF4";

export default function GroupPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const userId = user?._id;
  const dispatch = useDispatch();
  const router = useRouter();

  const { data: groups = [], isLoading } = useGetUserGroupsQuery(userId!, {
    skip: !userId,
  });

  const activeGroupId = useSelector((s: RootState) => s.auth.activeGroupId);

  const [openGroupIds, setOpenGroupIds] = useState<string[]>([]);

  const toggleGroup = (id: string) => {
    setOpenGroupIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF", paddingHorizontal: 20 }}>
      <TopNav />
      <Title text="Shopping lists" />

      {!isLoading && groups.length === 0 && (
        <Text style={{ textAlign: "center", marginTop: 30, fontSize: 16, color: "#777" }}>
          You are not part of any group yet.
        </Text>
      )}

      <FlatList
        data={groups}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        ItemSeparatorComponent={() => <View style={s.separator} />}
        renderItem={({ item }) => {
          const isOpen = openGroupIds.includes(item._id);

          return (
            <>
              <View style={s.row}>
                {/* פתיחה/סגירה */}
                <Pressable style={{ flex: 1 }} onPress={() => toggleGroup(item._id)}>
                  <Text style={s.link}>{item.name}</Text>
                </Pressable>

                {/* כפתור בחירת קבוצה פעילה */}
                <Pressable
                  style={s.selectButton}
                  onPress={() => dispatch(setActiveGroup(item._id))}
                >
                  <Text style={s.selectText}>
                    {activeGroupId === item._id ? "Active ✓" : "Select"}
                  </Text>
                </Pressable>

                <Ionicons
                  name={isOpen ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={BRAND}
                  onPress={() => toggleGroup(item._id)}
                />
              </View>

              {isOpen && <GroupAccordion group={item} />}
            </>
          );
        }}
      />

      <Text style={s.watermark}>WiseBuy</Text>

      <View style={s.pills}>
        <Pressable
          style={[s.pill, s.pillSolid]}
          onPress={() => router.replace("/main/group/join")}
        >
          <Text style={[s.pillText, { color: "#fff" }]}>Join Group</Text>
        </Pressable>

        <Pressable
          style={[s.pill, s.pillSolid]}
          onPress={() => router.replace("/main/group/create")}
        >
          <Text style={[s.pillText, { color: "#fff" }]}>Create Group</Text>
        </Pressable>
      </View>

      <BottomNav />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
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
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
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
  pillSolid: { backgroundColor: BRAND },
  pillText: { fontSize: 14, fontWeight: "800" },

  // 🎯 הכפתור החדש
  selectButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: BRAND,
    borderRadius: 12,
    marginRight: 10,
  },
  selectText: {
    color: "white",
    fontWeight: "700",
    fontSize: 12,
  },
});
