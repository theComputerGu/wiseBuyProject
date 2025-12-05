import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ItimText from '../../../components/Itimtext';
import BottomNav from '../../../components/Bottomnavigation';
import TopNav from '../../../components/Topnav';
import Title from '../../../components/Title';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/state/store';
import { useGetGroupsQuery, useGetGroupByIdQuery, } from '../../../redux/svc/groupsApi';
import { setActiveGroup } from '../../../redux/slices/groupSlice';
import { setActiveList } from '../../../redux/slices/shoppinglistSlice';
import { useRouter } from 'expo-router';
import { useGetListByIdQuery } from "../../../redux/svc/shoppinglistApi";
import { useRestorePurchaseMutation } from "../../../redux/svc/groupsApi";

export default function HistoryScreen() {

  const user = useSelector((s: RootState) => s.user);
  const activeGroup = useSelector((s: RootState) => s.group);
  const dispatch = useDispatch();
  const router = useRouter();
  const [restorePurchase] = useRestorePurchaseMutation();


  const history = activeGroup.activeGroup?.history ?? [];

  if (!activeGroup) {
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


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <TopNav />
        <Title text="History" />

        <View style={styles.groupRow}>
          <ItimText size={16} color="#197FF4">Group: </ItimText>
          <ItimText size={16} weight="bold" color="#197FF4">
            {activeGroup?.activeGroup?.name ?? 'No group'}
          </ItimText>
        </View>

        {history.length === 0 && (
          <ItimText size={14} color="#666">
            No purchases yet for this group.
          </ItimText>
        )}

        <ScrollView showsVerticalScrollIndicator={false}>
          {history.map((item: any, i: number) => {
            return (
              <Pressable
                key={item._id || i}
                style={styles.card}
                onPress={() => {
                  router.replace(
                    `/main/history/historyitems?id=${item.shoppingListId}`
                  );
                }}
              >
                <View style={styles.row}>
                  {/* LEFT SIDE INFORMATION */}
                  <View style={styles.left}>
                    <ItimText size={16} weight="bold">
                      {item.storename || "Unknown Store"}
                    </ItimText>

                    <ItimText size={13} color="#555">
                      {item.storeadress || "Unknown address"}
                    </ItimText>

                    <ItimText size={13} color="#777" style={{ marginTop: 3 }}>
                      {new Date(item.purchasedAt).toLocaleDateString()}
                    </ItimText>
                  </View>

                  {/* RIGHT SIDE PRICE */}
                  <View style={styles.right}>
                    <ItimText size={17} weight="bold" color="#197FF4">
                      ₪{item.totalprice ?? "0.00"}
                    </ItimText>

                    <ItimText size={13} color="#444">
                      {item.itemcount ?? 0} items
                    </ItimText>
                  </View>
                </View>
              </Pressable>
            );
          })}
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
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 6,
    marginHorizontal: 10,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: {
    flex: 1,
  },
  right: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
});
