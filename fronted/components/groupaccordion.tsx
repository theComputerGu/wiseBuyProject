// fronted/components/groupaccordion.tsx

import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/state/store";

import {
  useRemoveUserFromGroupMutation,
  useDeleteGroupMutation,
  useGetGroupUsersQuery,
  useGetUserByIdQuery,
} from "../redux/svc/wisebuyApi";

import { setUser } from "../redux/slices/authSlice";

export default function GroupAccordion({ group }: any) {
  const dispatch = useDispatch();

  // 🟦 נטען משתמש
  const user = useSelector((s: RootState) => s.auth.user);
  const userId = user?._id;

  // אם אין יוזר — לא לרנדר
  if (!userId) return null;

  // 🟦 refetch לטעינת משתמש עדכני מהשרת
  const { refetch: refetchUser } = useGetUserByIdQuery(userId, {
    skip: !userId,
  });

  // 🟦 האם אדמין?
  const isAdmin =
    typeof group.admin === "string"
      ? group.admin === userId
      : group.admin?._id === userId;

  // 🟦 API Hooks
  const [removeUserFromGroup] = useRemoveUserFromGroupMutation();
  const [deleteGroup] = useDeleteGroupMutation();

  // 🟦 מביאים משתמשים בקבוצה
  const { data: members = [] } = useGetGroupUsersQuery(group._id);

  // ---------------------------------------------------------
  // יציאה מהקבוצה
  // ---------------------------------------------------------
  const handleLeave = () => {
    Alert.alert("Leave group", `Are you sure you want to leave "${group.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          try {
            // 🟦 פעולה לשרת
            await removeUserFromGroup({
              id: group._id,
              userId: userId!, // בטוח שאינו undefined
            }).unwrap();

            // 🟦 רענון משתמש מהשרת
            const freshUser = await refetchUser().unwrap();
            dispatch(setUser(freshUser));

            Alert.alert("Success", "You left the group");
          } catch (err) {
            Alert.alert("Error", "Could not leave group");
          }
        },
      },
    ]);
  };

  // ---------------------------------------------------------
  // מחיקת קבוצה (אדמין בלבד)
  // ---------------------------------------------------------
  const handleDelete = () => {
    Alert.alert("Delete group", `Delete "${group.name}" permanently?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            // 🟦 מחיקה בשרת
            await deleteGroup({
              id: group._id,
              requesterId: userId!,
            }).unwrap();

            // 🟦 רענון משתמש
            const freshUser = await refetchUser().unwrap();
            dispatch(setUser(freshUser));

            Alert.alert("Deleted", "Group removed successfully");
          } catch (err) {
            Alert.alert("Error", "Could not delete group");
          }
        },
      },
    ]);
  };

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <View style={styles.box}>
      <Text style={styles.label}>Group Code: #{group.groupcode}</Text>

      <Text style={styles.label}>Members:</Text>

      {members.map((u: any) => (
        <View key={u._id} style={styles.memberRow}>
          <Ionicons name="person-circle-outline" size={20} />
          <Text style={styles.member}>
            {u.name}
            {u._id === group.admin ? " (Admin)" : ""}
            {"  "}
            <Text style={{ color: "#888" }}>@{u.email}</Text>
          </Text>
        </View>
      ))}

      {!isAdmin && (
        <Pressable onPress={handleLeave}>
          <Text style={styles.leave}>Leave Group</Text>
        </Pressable>
      )}

      {isAdmin && (
        <Pressable onPress={handleDelete}>
          <Text style={styles.delete}>Delete Group</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  label: {
    fontWeight: "700",
    marginBottom: 4,
    fontSize: 15,
  },
  memberRow: { flexDirection: "row", alignItems: "center", marginVertical: 2 },
  member: { marginLeft: 6, fontSize: 14, fontWeight: "600" },
  leave: { marginTop: 12, color: "red", fontWeight: "700" },
  delete: { marginTop: 12, color: "red", fontWeight: "900", fontSize: 15 },
});
