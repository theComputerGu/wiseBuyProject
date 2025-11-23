import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; 
import ItimText from '../../components/Itimtext';
import BottomNav from '../../components/Bottomnavigation';
import Button from '../../components/Button';
import TopNav from '../../components/Topnav'
import Title from '../../components/Title'
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '@env';
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/state/store";
import { useAddToHistoryMutation } from "../../redux/svc/groupsApi";
import { setActiveGroup } from "../../redux/slices/groupSlice";
import { setActiveList } from "../../redux/slices/shoppinglistSlice"

export default function CheckoutScreen() {
  const router = useRouter(); 
  const dispatch = useDispatch();
  const activeGroup = useSelector((s: RootState) => s.group.activeGroup);
  const shoppingList = useSelector((s: RootState) => s.shoppingList.activeList);
  const [addToHistory] = useAddToHistoryMutation();
  const stores = [
    {
      id: 1,
      name: 'שופרסל דיל',
      price: '365.42₪',
      address: 'Derech Yitshak Rabin 17, Petah Tikva, ישראל',
    },
    {
      id: 2,
      name: 'שופרסל דיל',
      price: '365.42₪',
      address: 'Derech Yitshak Rabin 17, Petah Tikva, ישראל',
    },
    {
      id: 3,
      name: 'שופרסל דיל',
      price: '365.42₪',
      address: 'Derech Yitshak Rabin 17, Petah Tikva, ישראל',
    },
    {
      id: 4,
      name: 'שופרסל דיל',
      price: '365.42₪',
      address: 'Derech Yitshak Rabin 17, Petah Tikva, ישראל',
    },
    {
      id: 5,
      name: 'שופרסל דיל',
      price: '365.42₪',
      address: 'Derech Yitshak Rabin 17, Petah Tikva, ישראל',
    },
  ];

  const handleCheckout = async () => {
  if (!activeGroup) return;

  try {
    const res = await addToHistory({
      groupId: activeGroup._id,
      name: `Checkout - ${new Date().toLocaleString()}`
    }).unwrap();

    // מעדכן Redux
    dispatch(setActiveGroup(res.updatedGroup));
    dispatch(setActiveList(res.newList));

    router.replace("/main/history");

  } catch (err) {
    console.error("Checkout error:", err);
  }
};


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffffff" , justifyContent: 'space-between' }}>
    <View style={styles.container}>
      <TopNav />

      <Title text="Checkout" />
      <Title text="your current location" icon='map-marker' />
      <Title text="Top 5 stores near your location" />
      

      <ScrollView showsVerticalScrollIndicator={false}>
        

        {/* ✅ Stores List */}
        {stores.map((store) => (
          <View key={store.id} style={styles.storeCard}>
            <View style={styles.priceInfo}>
              <ItimText size={15} color="#197FF4" weight="bold">
                {store.price}
              </ItimText>
              <ItimText size={13} color="#000">
                מחיר סל
              </ItimText>
            </View>

            <View style={styles.storeInfo}>
              <ItimText size={16} color="#000" weight="bold">
                {store.name}
              </ItimText>
              <View style={styles.addressRow}>
                <MaterialCommunityIcons
                  name="earth"
                  size={16}
                  color="#197FF4"
                />
                <ItimText
                  size={12}
                  color="#555"
                  style={{ marginLeft: 5, flexShrink: 1 }}
                >
                  {store.address}
                </ItimText>
              </View>
            </View>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ✅ Mark as purchased button */}
      <Button
        title="Mark as purchased!"
        onPress={handleCheckout}
      />

      <BottomNav />
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20, justifyContent: 'space-between' },
  logo: { marginBottom: 10 },
  section: { marginBottom: 10 },
  locationRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  storeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceInfo: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  storeInfo: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flex: 1,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
});
