import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ItimText from '../components/itimtext';

export default function AccountScreen() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ✅ Logo */}
        <ItimText size={28} weight="bold" color="#197FF4" style={styles.logo}>
          WiseBuy
        </ItimText>

        {/* ✅ Account Section */}
        <ItimText size={22} weight="bold" color="#197FF4" style={styles.section}>
          Account
        </ItimText>

        <ItimText size={20} weight="bold" color="#197FF4" style={styles.subSection}>
          Settings
        </ItimText>

        <View style={styles.accountRow}>
          <View style={styles.profileContainer}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="account-circle" size={90} color="#197FF4" />
              <Pressable style={styles.addIcon}>
                <MaterialCommunityIcons name="plus" size={14} color="#fff" />
              </Pressable>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <ItimText size={14} color="#000" weight="bold">
              Account name
            </ItimText>
            <ItimText size={16}>Mark</ItimText>

            <ItimText size={14} color="#000" weight="bold">
              Created on
            </ItimText>
            <ItimText size={16}>19/5/2025</ItimText>

            <ItimText size={14} color="#000" weight="bold">
              Email Address
            </ItimText>
            <ItimText size={16}>marksheinberg01@gmail.com</ItimText>
          </View>

          <View style={styles.editIcons}>
            <MaterialCommunityIcons name="pencil" size={18} color="#197FF4" />
            <MaterialCommunityIcons name="pencil" size={18} color="#197FF4" style={{ marginTop: 40 }} />
          </View>
        </View>

        {/* ✅ Privacy Section */}
        <ItimText size={20} weight="bold" color="#197FF4" style={styles.subSection}>
          Privacy
        </ItimText>

        <View style={styles.privacyRow}>
          <View>
            <ItimText size={16} color="#000" weight="bold">
              Password
            </ItimText>
            <ItimText size={16} color="#000">
              {showPassword ? 'mySecret123!' : '********'}
            </ItimText>
          </View>

          <Pressable
            style={styles.showPasswordBtn}
            onPress={() => setShowPassword((prev) => !prev)}
          >
            <ItimText size={14} color="#197FF4">
              {showPassword ? 'hide password' : 'show password'}
            </ItimText>
          </Pressable>
        </View>

        {/* ✅ Others Section */}
        <ItimText size={20} weight="bold" color="#197FF4" style={styles.subSection}>
          Others
        </ItimText>

        <ItimText size={16} color="#000" style={styles.otherText}>
          Change Password
        </ItimText>
        <ItimText size={16} color="#000" style={styles.otherText}>
          Log out
        </ItimText>
        <ItimText size={16} color="red" style={styles.otherText}>
          Delete User
        </ItimText>
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
  logo: { marginBottom: 20 },
  section: { marginBottom: 10 },
  subSection: { marginTop: 15, marginBottom: 8 },
  accountRow: { flexDirection: 'row', alignItems: 'flex-start' },
  profileContainer: { alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  avatar: { position: 'relative' },
  addIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#197FF4',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcons: { justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 6 },
  privacyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  showPasswordBtn: {
    backgroundColor: '#EAF3FF',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  otherText: { marginBottom: 6 },
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
