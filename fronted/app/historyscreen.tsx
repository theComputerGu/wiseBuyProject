import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ItimText from '../components/ItimText';

export default function HistoryScreen() {
  const history = [
    {
      id: 3,
      store: 'Rami levy',
      items: 17,
      total: '325.40₪',
      date: '18/05/2025',
      address: 'Ha-Sivim St 37, Petah Tikva',
    },
    {
      id: 2,
      store: 'Rami levy',
      items: 4,
      total: '89.90₪',
      date: '13/05/2025',
      address: 'Ha-Sivim St 37, Petah Tikva',
    },
    {
      id: 1,
      store: 'Rami levy',
      items: 12,
      total: '289.15₪',
      date: '11/05/2025',
      address: 'Ha-Sivim St 37, Petah Tikva',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ✅ App Logo */}
        <ItimText size={28} weight="bold" color="#197FF4" style={styles.logo}>
          WiseBuy
        </ItimText>

        {/* ✅ Page Title */}
        <ItimText size={22} weight="bold" color="#197FF4" style={styles.section}>
          History
        </ItimText>

        {/* ✅ Group Selector */}
        <View style={styles.groupRow}>
          <ItimText size={16} color="#197FF4">
            Group: <ItimText size={16} color="#197FF4" weight="bold">Sean & Mark home</ItimText>
          </ItimText>
          <MaterialCommunityIcons name="chevron-down" size={22} color="#197FF4" />
        </View>

        {/* ✅ Purchase List */}
        {history.map((item) => (
          <View key={item.id} style={styles.purchaseCard}>
            <View style={styles.leftCol}>
              <View style={styles.purchaseHeader}>
                <ItimText size={16} color="#000" weight="bold">
                  Purchase {item.id}
                </ItimText>
                <MaterialCommunityIcons
                  name="pencil"
                  size={16}
                  color="#197FF4"
                  style={{ marginLeft: 4 }}
                />
              </View>

              <ItimText size={13} color="#555">
                Items Bought: {item.items}  •  Total: {item.total}  •  Date: {item.date}
              </ItimText>
            </View>

            <View style={styles.rightCol}>
              <ItimText size={15} color="#000" weight="bold">
                {item.store}
              </ItimText>
              <ItimText size={12} color="#777">{item.address}</ItimText>
            </View>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ✅ Bottom Navigation */}
      <View style={styles.bottomNav}>
        <MaterialCommunityIcons name="home" size={28} color="#197FF4" />
        <MaterialCommunityIcons name="account-group" size={28} color="#197FF4" />
        <Pressable style={styles.addButton}>
          <MaterialCommunityIcons name="plus" size={32} color="#fff" />
        </Pressable>
        <MaterialCommunityIcons name="cart" size={28} color="#197FF4" />
        <MaterialCommunityIcons name="account" size={28} color="#197FF4" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50, paddingHorizontal: 20 },
  logo: { marginBottom: 10 },
  section: { marginBottom: 10 },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  purchaseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  purchaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  leftCol: {
    flex: 1,
    justifyContent: 'center',
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#197FF4',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
});
