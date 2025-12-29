import { SafeAreaView } from "react-native-safe-area-context";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import BottomNav from "../../../components/Bottomnavigation";
import TopNav from "../../../components/Topnav";
import Title from "../../../components/Title";
import ItimText from "../../../components/Itimtext";
import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux/state/store";
import { setActiveGroup } from "../../../redux/slices/groupSlice";
import { setUser } from "../../../redux/slices/userSlice";
import { useGetUserGroupsQuery } from "../../../redux/svc/usersApi";
import { useState } from "react";
import { useSetActiveGroupMutation } from "../../../redux/svc/usersApi";
import { useGetUserByIdQuery } from "../../../redux/svc/usersApi";
import GroupAccordion from "../../../components/groupaccordion";
import { setActiveList } from "../../../redux/slices/shoppinglistSlice";
import { useLazyGetListByIdQuery } from "../../../redux/svc/shoppinglistApi";

const BRAND = "#197FF4";

function capitalizeFirstLetter(name: string) {
  if (!name) return name;
  return name[0].toUpperCase() + name.slice(1);
}

export default function GroupPage() {
  const user = useSelector((s: RootState) => s.user);
  const userId = user.current?._id;
  const dispatch = useDispatch();

  const [triggerGetList] = useLazyGetListByIdQuery();
  const [updateActiveGroup] = useSetActiveGroupMutation();

  const { refetch: refetchUser } = useGetUserByIdQuery(userId!, {
    skip: !userId,
  });

  const router = useRouter();

  const { data: groups = [], isLoading, refetch: refetchGroups } =
    useGetUserGroupsQuery(userId!, {
      skip: !userId,
    });

  const activeGroupId = useSelector(
    (s: RootState) => s.group.activeGroup?._id
  );

  const [openGroupIds, setOpenGroupIds] = useState<string[]>([]);

  const toggleGroup = (id: string) => {
    setOpenGroupIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleSelectGroup = async (item: any) => {
    try {
      await updateActiveGroup({
        userId: userId!,
        groupId: item._id,
      }).unwrap();

      const freshUser = await refetchUser().unwrap();
      dispatch(setUser(freshUser));
      dispatch(setActiveGroup(item));

      const list = await triggerGetList(item.activeshoppinglist).unwrap();
      dispatch(setActiveList(list));
      refetchGroups();
    } catch (err) {
      console.log("ERROR SETTING ACTIVE GROUP:", err);
    }
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.container}>
        <TopNav />
        <Title text="My Groups" />

        {!isLoading && groups.length === 0 && (
          <View style={s.emptyState}>
            <MaterialCommunityIcons name="account-group-outline" size={60} color="#d1d5db" />
            <ItimText size={16} color="#71717a" style={{ marginTop: 12, textAlign: 'center' }}>
              You are not part of any group yet.
            </ItimText>
          </View>
        )}

        <FlatList
          data={groups}
          keyExtractor={(item) => item._id}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isOpen = openGroupIds.includes(item._id);
            const isActive = activeGroupId === item._id;

            return (
              <View style={[s.groupCard, isActive && s.groupCardActive]}>
                <Pressable style={s.cardHeader} onPress={() => toggleGroup(item._id)}>
                  <View style={[s.groupIcon, isActive && s.groupIconActive]}>
                    <MaterialCommunityIcons
                      name="account-group"
                      size={24}
                      color={isActive ? "#fff" : BRAND}
                    />
                  </View>

                  <View style={s.groupInfo}>
                    <ItimText size={17} weight="600" color="#1a1a1a">
                      {capitalizeFirstLetter(item.name)}
                    </ItimText>
                    <ItimText size={13} color="#71717a">
                      {item.users?.length || 0} members
                    </ItimText>
                  </View>

                  <View style={s.cardActions}>
                    {isActive ? (
                      <View style={s.activeBadge}>
                        <MaterialCommunityIcons name="check-circle" size={16} color="#22c55e" />
                        <ItimText size={12} color="#22c55e" weight="600" style={{ marginLeft: 4 }}>
                          Active
                        </ItimText>
                      </View>
                    ) : (
                      <Pressable style={s.selectBtn} onPress={() => handleSelectGroup(item)}>
                        <ItimText size={13} color="#fff" weight="600">Select</ItimText>
                      </Pressable>
                    )}

                    <Pressable onPress={() => toggleGroup(item._id)} style={s.expandBtn}>
                      <Ionicons
                        name={isOpen ? "chevron-up" : "chevron-down"}
                        size={20}
                        color="#9ca3af"
                      />
                    </Pressable>
                  </View>
                </Pressable>

                {isOpen && (
                  <View style={s.accordionWrapper}>
                    <GroupAccordion group={item} />
                  </View>
                )}
              </View>
            );
          }}
        />

        <View style={s.actionButtons}>
          <Pressable style={s.actionBtn} onPress={() => router.replace("/main/group/join")}>
            <MaterialCommunityIcons name="account-plus" size={20} color="#fff" />
            <ItimText size={15} color="#fff" weight="600" style={{ marginLeft: 8 }}>
              Join Group
            </ItimText>
          </Pressable>

          <Pressable style={s.actionBtn} onPress={() => router.replace("/main/group/create")}>
            <MaterialCommunityIcons name="plus-circle" size={20} color="#fff" />
            <ItimText size={15} color="#fff" weight="600" style={{ marginLeft: 8 }}>
              Create Group
            </ItimText>
          </Pressable>
        </View>

        <BottomNav />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  groupCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  groupCardActive: {
    borderColor: BRAND,
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  groupIconActive: {
    backgroundColor: BRAND,
  },
  groupInfo: {
    flex: 1,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  selectBtn: {
    backgroundColor: BRAND,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  expandBtn: {
    padding: 4,
  },
  accordionWrapper: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND,
    paddingVertical: 14,
    borderRadius: 14,
  },
});
