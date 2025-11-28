import React, { useState, useEffect } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/state/store";
import { Ionicons } from "@expo/vector-icons";
import ItimText from "./Itimtext";

import { useGetUserGroupsQuery } from "../redux/svc/usersApi";
import { useGetGroupByIdQuery } from "../redux/svc/groupsApi";
import { useGetListByIdQuery } from "../redux/svc/shoppinglistApi";

import { setActiveGroup } from "../redux/slices/groupSlice";
import { setActiveList } from "../redux/slices/shoppinglistSlice";

export default function GroupSelector() {
  const dispatch = useDispatch();

  const user = useSelector((s: RootState) => s.user.current);
  const activeGroup = useSelector((s: RootState) => s.group.activeGroup);

  const [open, setOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  // ✅ מביא את כל הקבוצות המלאות של המשתמש
  const { data: groups } = useGetUserGroupsQuery(user?._id!, {
    skip: !user?._id,
  });

  // ✅ מביא קבוצה מסוימת
  const { data: groupData } = useGetGroupByIdQuery(selectedGroupId!, {
    skip: !selectedGroupId,
  });

  // ✅ מביא רשימת קניות של הקבוצה
  const { data: listData } = useGetListByIdQuery(selectedListId!, {
    skip: !selectedListId,
  });

  // כאשר הגיעה קבוצה מהשרת
  useEffect(() => {
    if (!groupData) return;

    dispatch(setActiveGroup(groupData));

    if (groupData.activeshoppinglist) {
      setSelectedListId(groupData.activeshoppinglist);
    }

    setOpen(false);
  }, [groupData]);

  // כאשר הגיעה רשימת קניות
  useEffect(() => {
    if (!listData) return;

    dispatch(setActiveList(listData));
  }, [listData]);

  const handleSelect = (groupId: string) => {
    if (groupId === activeGroup?._id) {
      setOpen(false);
      return;
    }
    setSelectedGroupId(groupId);
  };

  return (
    <View style={styles.container}>
      {/* כותרת עם חץ */}
      <Pressable style={styles.titleRow} onPress={() => setOpen(!open)}>
        <ItimText size={26} weight="bold" color="#197FF4">
          {activeGroup?.name ?? "Group"}
        </ItimText>

        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={22}
          color="#197FF4"
          style={{ marginLeft: 6 }}
        />
      </Pressable>

      {/* Dropdown מרחף */}
      {open && (
        <View style={styles.dropdownOverlay}>
          {groups?.map((g) => (
            <Pressable
              key={g._id}
              style={styles.groupItem}
              onPress={() => handleSelect(g._id)}
            >
              <ItimText
                size={16}
                color={activeGroup?._id === g._id ? "#197FF4" : "#333"}
                weight={activeGroup?._id === g._id ? "bold" : "normal"}
              >
                {g.name}
              </ItimText>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    zIndex: 100, // חשוב כדי שיצוף מעל הכל
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  dropdownOverlay: {
    position: "absolute",
    top: 40,   // מתחת לשם הקבוצה
    left: 0,
    right: 0,

    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },

  groupItem: {
    paddingVertical: 8,
  },
});
