import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ItimText from '../../../components/Itimtext';
import BottomNav from '../../../components/Bottomnavigation';
import TopNav from '../../../components/Topnav';
import Title from '../../../components/Title';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/state/store';
import { useRouter } from 'expo-router';

const BRAND = '#197FF4';

function capitalizeFirstLetter(name: string) {
  if (!name) return name;
  return name[0].toUpperCase() + name.slice(1);
}

function formatDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export default function HistoryScreen() {
  const activeGroup = useSelector((s: RootState) => s.group);
  const router = useRouter();

  const history = activeGroup.activeGroup?.history ?? [];

  if (!activeGroup) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <TopNav />
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-group-outline" size={60} color="#d1d5db" />
            <ItimText size={16} color="#71717a" style={{ marginTop: 12 }}>
              No active group selected
            </ItimText>
          </View>
          <BottomNav />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TopNav />
        <Title text="Purchase History" />

        {/* Group Info Card */}
        <View style={styles.groupCard}>
          <View style={styles.groupIcon}>
            <MaterialCommunityIcons name="account-group" size={22} color={BRAND} />
          </View>
          <View style={styles.groupInfo}>
            <ItimText size={13} color="#71717a">Current Group</ItimText>
            <ItimText size={16} weight="600" color="#1a1a1a">
              {capitalizeFirstLetter(activeGroup?.activeGroup?.name ?? 'No group')}
            </ItimText>
          </View>
          <View style={styles.historyCount}>
            <ItimText size={22} weight="bold" color={BRAND}>
              {history.length}
            </ItimText>
            <ItimText size={11} color="#71717a">purchases</ItimText>
          </View>
        </View>

        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="cart-off" size={60} color="#d1d5db" />
            <ItimText size={16} color="#71717a" style={{ marginTop: 12, textAlign: 'center' }}>
              No purchases yet for this group.
            </ItimText>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
                <View style={styles.cardContent}>
                  {/* Store Icon */}
                  <View style={styles.storeIcon}>
                    <MaterialCommunityIcons name="store" size={24} color={BRAND} />
                  </View>

                  {/* Store Info - RTL */}
                  <View style={styles.storeInfo}>
                    <ItimText size={16} weight="600" color="#1a1a1a" style={styles.rtlText} numberOfLines={1}>
                      {item.storename || 'Unknown Store'}
                    </ItimText>
                    <ItimText size={13} color="#71717a" style={styles.rtlText} numberOfLines={1}>
                      {item.storeadress || 'Unknown address'}
                    </ItimText>
                  </View>

                  {/* Price & Date */}
                  <View style={styles.priceSection}>
                    <ItimText size={18} weight="bold" color={BRAND}>
                      ₪{item.totalprice ?? '0.00'}
                    </ItimText>
                    <View style={styles.itemsBadge}>
                      <ItimText size={11} color="#71717a">
                        {item.itemcount ?? 0} items
                      </ItimText>
                    </View>
                  </View>
                </View>

                {/* Date Footer */}
                <View style={styles.cardFooter}>
                  <MaterialCommunityIcons name="calendar" size={14} color="#9ca3af" />
                  <ItimText size={12} color="#9ca3af" style={{ marginLeft: 4 }}>
                    {formatDate(item.purchasedAt)}
                  </ItimText>
                  <View style={{ flex: 1 }} />
                  <MaterialCommunityIcons name="chevron-left" size={18} color="#9ca3af" />
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}

        <BottomNav />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  groupIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  historyCount: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  storeIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  storeInfo: {
    flex: 1,
    marginRight: 12,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  itemsBadge: {
    backgroundColor: '#f4f4f5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fafafa',
    borderTopWidth: 1,
    borderTopColor: '#f4f4f5',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
