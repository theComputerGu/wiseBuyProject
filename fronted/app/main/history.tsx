import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ItimText from '../../components/Itimtext';
import BottomNav from '../../components/Bottomnavigation';
import TopNav from '../../components/Topnav';
import Title from '../../components/Title';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/state/store';
import {
  useGetGroupsQuery,
  useGetGroupByIdQuery,
} from '../../redux/svc/wisebuyApi';
import { setActiveGroup } from '../../redux/slices/authSlice';
import { setActiveList } from '../../redux/slices/shoppingSessionSlice'; // ⬅️ חדש
import { useRouter } from 'expo-router';

export default function HistoryScreen() {

  const user = useSelector((s: RootState) => s.auth.user);
  const activeGroupId = useSelector((s: RootState) => s.auth.activeGroupId);
  const { data: groups = [] } = useGetGroupsQuery();
  const dispatch = useDispatch();
  const router = useRouter();

  // בחירת קבוצה אוטומטית
  if (!activeGroupId && groups.length > 0) {
    dispatch(setActiveGroup(groups[0]._id));
  }

  const activeGroup = groups.find((g) => g._id === activeGroupId) || null;

  const {
    data: currentGroup,
    isLoading,
    error,
  } = useGetGroupByIdQuery(activeGroupId!, { skip: !activeGroupId });

  const history = currentGroup?.history ?? [];

  if (!activeGroupId) {
    return (
      <SafeAreaView style={styles.container}>
        <TopNav />
        <View style={styles.center}>
          <ItimText size={16}>No active group selected</ItimText>
        </View>
        <BottomNav />
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <TopNav />
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
        <BottomNav />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <TopNav />
        <Title text="History" />

        <View style={styles.groupRow}>
          <ItimText size={16} color="#197FF4">Group: </ItimText>
          <ItimText size={16} weight="bold" color="#197FF4">
            {activeGroup?.name ?? 'No group'}
          </ItimText>
          <MaterialCommunityIcons name="chevron-down" size={22} color="#197FF4" />
        </View>

        {history.length === 0 && (
          <ItimText size={14} color="#666">
            No purchases yet for this group.
          </ItimText>
        )}

        <ScrollView showsVerticalScrollIndicator={false}>
          {history.map((item: any, i: number) => (
            <Pressable
              key={i}
              style={styles.purchaseCard}
              onPress={() => {
                if (!item.shoppingListId) return;

                dispatch(
                  setActiveList({
                    listId: item.shoppingListId,
                    purchaseNumber: i + 1,
                  })
                );

                router.push("/main/product");
              }}
            >
              <View style={styles.leftCol}>
                <ItimText size={16} weight="bold">
                  Purchase #{i + 1}
                </ItimText>
                <ItimText size={13} color="#555">
                  Items: {item.items.length} • Total: {item.total}₪ • Date:{' '}
                  {new Date(item.purchasedAt).toLocaleDateString()}
                </ItimText>
              </View>
            </Pressable>
          ))}

          <View style={{ height: 120 }} />
        </ScrollView>

        <BottomNav />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
  groupRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  purchaseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  leftCol: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
