import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import ItimText from '../../../components/Itimtext';
import BottomNav from '../../../components/Bottomnavigation';
import TopNav from '../../../components/Topnav';
import Title from '../../../components/Title';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/state/store';
import { useRouter } from 'expo-router';

function capitalizeFirstLetter(name: string) {
  if (!name) return name;
  return name[0].toUpperCase() + name.slice(1);
}

export default function HistoryScreen() {
  const activeGroup = useSelector((s: RootState) => s.group);
  const router = useRouter();

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

        {/* GROUP NAME */}
        <View style={styles.groupRow}>
          <ItimText size={16} color="#197FF4">
            Group:
          </ItimText>
          <ItimText size={16} weight="bold" color="#197FF4">
            {capitalizeFirstLetter(activeGroup?.activeGroup?.name ?? 'No group')}
          </ItimText>
        </View>

        {history.length === 0 && (
          <ItimText size={14} color="#666">
            No purchases yet for this group.
          </ItimText>
        )}

        <ScrollView showsVerticalScrollIndicator={false}>
          {history.map((item: any, i: number) => (
            <Pressable
              key={item._id || i}
              style={styles.card}
              onPress={() =>
                router.replace(
                  `/main/history/historyitems?id=${item.shoppingListId}`
                )
              }
            >
              <View style={styles.row}>

                {/* RIGHT SIDE — TEXT (RTL) */}
                <View style={styles.rightText}>
                  <ItimText size={16} weight="bold" style={styles.rtlText}>
                    {item.storename || 'Unknown Store'}
                  </ItimText>

                  <ItimText size={13} color="#555" style={styles.rtlText}>
                    {item.storeadress || 'Unknown address'}
                  </ItimText>

                  <ItimText size={13} color="#777" style={[styles.rtlText, { marginTop: 3 }]}>
                    {new Date(item.purchasedAt).toLocaleDateString()}
                  </ItimText>
                </View>

                {/* LEFT SIDE — PRICE */}
                <View style={styles.leftPrice}>
                  <ItimText size={17} weight="bold" color="#197FF4">
                    ₪{item.totalprice ?? '0.00'}
                  </ItimText>

                  <ItimText size={13} color="#444">
                    {item.itemcount ?? 0} items
                  </ItimText>
                </View>

              </View>
            </Pressable>
          ))}
        </ScrollView>

        <BottomNav />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },

  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 6,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  row: {
    flexDirection: 'row-reverse', // ⭐ RTL layout
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  rightText: {
    flex: 1,
  },

  leftPrice: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: 12,
  },

  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
