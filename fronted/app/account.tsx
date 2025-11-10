// fronted/app/account.tsx
import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import BottomNav from '../components/Bottomnavigation';
import TopNav from '../components/Topnav';
import ItimText from '../components/Itimtext';
import Title from '../components/Title';
import TextField from '../components/TextField';
import Button from '../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../app/src/state/store';
import { setUser, signOut } from '../app/src/slices/authSlice';
import { useUpdateUserMutation, useDeleteUserMutation } from '../app/src/svc/wisebuyApi';
import { useRouter } from 'expo-router';

export default function AccountScreen() {
  const dispatch = useDispatch();
  const router = useRouter();

  const user = useSelector((s: RootState) => s.auth.user);

  const createdAtText = useMemo(() => {
    if (!user?.createdAt) return '';
    try {
      const d = new Date(user.createdAt);
      return `${d.getDate()}/${(d.getMonth() + 1)}/${d.getFullYear()}`;
    } catch { return ''; }
  }, [user?.createdAt]);

  const [showPassword, setShowPassword] = useState(false); // שימוש לשדות שינוי סיסמה
  const [editName, setEditName] = useState(false);
  const [editEmail, setEditEmail] = useState(false);

  // מצב שינוי סיסמה
  const [changePwMode, setChangePwMode] = useState(false);
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const saveField = async (field: 'name' | 'email') => {
    const id = user?.id || (user as any)?._id;
    if (!id) return alert('No logged-in user');

    const patch: any = {};
    if (field === 'name') patch.name = name?.trim();
    if (field === 'email') patch.email = email?.trim();

    try {
      const updated = await updateUser({ id, patch }).unwrap();
      dispatch(setUser({
        id: updated._id,
        name: updated.name,
        email: updated.email,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      }));
      if (field === 'name') setEditName(false);
      if (field === 'email') setEditEmail(false);
    } catch (e: any) {
      alert(e?.data?.message || 'Failed to update user');
    }
  };

  const savePassword = async () => {
    const id = user?.id || (user as any)?._id;
    if (!id) return alert('No logged-in user');

    // ולידציה בסיסית
    if (!pwNew || pwNew.length < 6) return alert('Password must be at least 6 characters');
    if (pwNew !== pwConfirm) return alert('Passwords do not match');

    // אם חשוב לך לבדוק סיסמה נוכחית בצד שרת – תוסיף שם לוגיקה. כרגע ה-API שלך לא דורש את זה.
    try {
      const updated = await updateUser({ id, patch: { password: pwNew } }).unwrap();
      // לא שומרים סיסמה ב-state, רק מעדכנים זמן עדכון וכו'
      dispatch(setUser({
      id: updated._id,
      name: updated.name,
      email: updated.email,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
  }));
      setPwCurrent(''); setPwNew(''); setPwConfirm(''); setChangePwMode(false);
      alert('Password updated successfully');
    } catch (e: any) {
      alert(e?.data?.message || 'Failed to update password');
    }
  };

  const onLogout = () => {
    dispatch(signOut());
    router.replace('/home'); // החזרה ל-Home (התאם אם יש לך נתיב אחר)
  };

  const onDeleteUser = async () => {
    const id = user?.id || (user as any)?._id;
    if (!id) return alert('No logged-in user');

    Alert.alert(
      'Delete User',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isDeleting ? 'Deleting...' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser({ id }).unwrap();
              dispatch(signOut());
              router.replace('/');
            } catch (e: any) {
              alert(e?.data?.message || 'Failed to delete user');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffffff' }}>
      <View style={styles.container}>
        <TopNav />
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Account */}
          <Title text="Account" />
          <Title text="Settings" />

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
              <ItimText size={14} color="#000" weight="bold">Account name</ItimText>
              {editName ? (
                <View style={{ gap: 6 }}>
                  <TextField value={name} onChangeText={setName} placeholder="Account name" />
                  <Button title={isLoading ? 'Saving...' : 'Save'} onPress={() => saveField('name')} />
                </View>
              ) : (
                <ItimText size={16}>{user?.name || '—'}</ItimText>
              )}

              <ItimText size={14} color="#000" weight="bold">Created on</ItimText>
              <ItimText size={16}>{createdAtText || '—'}</ItimText>

              <ItimText size={14} color="#000" weight="bold">Email Address</ItimText>
              {editEmail ? (
                <View style={{ gap: 6 }}>
                  <TextField value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
                  <Button title={isLoading ? 'Saving...' : 'Save'} onPress={() => saveField('email')} />
                </View>
              ) : (
                <ItimText size={16}>{user?.email || '—'}</ItimText>
              )}
            </View>

            <View style={styles.editIcons}>
              <Pressable onPress={() => { setName(user?.name || ''); setEditName(true); }}>
                <MaterialCommunityIcons name="pencil" size={18} color="#197FF4" />
              </Pressable>
              <Pressable style={{ marginTop: 40 }} onPress={() => { setEmail(user?.email || ''); setEditEmail(true); }}>
                <MaterialCommunityIcons name="pencil" size={18} color="#197FF4" />
              </Pressable>
            </View>
          </View>

          {/* Privacy */}
          <Title text="Privacy" />

          {/* מצב שינוי סיסמה */}
          {changePwMode ? (
            <View style={{ gap: 10, marginBottom: 12 }}>
              <ItimText size={16} color="#000" weight="bold">Change Password</ItimText>

              <TextField
                value={pwCurrent}
                onChangeText={setPwCurrent}
                placeholder="Current password (optional)"
                secure={!showPassword}
              />
              <TextField
                value={pwNew}
                onChangeText={setPwNew}
                placeholder="New password"
                secure={!showPassword}
              />
              <TextField
                value={pwConfirm}
                onChangeText={setPwConfirm}
                placeholder="Confirm new password"
                secure={!showPassword}
              />

              <Pressable style={styles.showPasswordBtn} onPress={() => setShowPassword(p => !p)}>
                <ItimText size={14} color="#197FF4">{showPassword ? 'hide password' : 'show password'}</ItimText>
              </Pressable>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button title={isLoading ? 'Saving...' : 'Save'} onPress={savePassword} />
                {/* במקום variant, נשתמש ב-Pressable פשוט לביטול */}
                <Pressable
                  onPress={() => { setChangePwMode(false); setPwCurrent(''); setPwNew(''); setPwConfirm(''); }}
                  style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#eee' }}
                >
                  <ItimText size={14} color="#000">Cancel</ItimText>
                </Pressable>
            </View>
            </View>
          ) : (
            // מצב תצוגה רגיל – לא ניתן להציג סיסמה שמורה (אין גישה אליה)
            <View style={styles.privacyRow}>
              <View style={{ flex: 1 }}>
                <ItimText size={16} color="#000" weight="bold">Password</ItimText>
                <ItimText size={16} color="#000">********</ItimText>
              </View>
              <Pressable style={styles.showPasswordBtn} onPress={() => setChangePwMode(true)}>
                <ItimText size={14} color="#197FF4">Change password</ItimText>
              </Pressable>
            </View>
          )}

          {/* Others */}
          <Title text="Others" />
          <Pressable onPress={() => setChangePwMode(true)}>
            <ItimText size={16} color="#000" style={styles.otherText}>Change Password</ItimText>
          </Pressable>
          <Pressable onPress={onLogout}>
            <ItimText size={16} color="#000" style={styles.otherText}>Log out</ItimText>
          </Pressable>
          <Pressable onPress={onDeleteUser}>
            <ItimText size={16} color="red" style={styles.otherText}>{isDeleting ? 'Deleting...' : 'Delete User'}</ItimText>
          </Pressable>
        </ScrollView>

        <BottomNav />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
  accountRow: { flexDirection: 'row', alignItems: 'flex-start' },
  profileContainer: { alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  avatar: { position: 'relative' },
  addIcon: {
    position: 'absolute', bottom: 5, right: 5, backgroundColor: '#197FF4',
    borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center',
  },
  editIcons: { justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 6 },
  privacyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  showPasswordBtn: { backgroundColor: '#EAF3FF', borderRadius: 10, paddingVertical: 4, paddingHorizontal: 10 },
  otherText: { marginBottom: 6 },
});
