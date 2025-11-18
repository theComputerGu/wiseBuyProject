// fronted/app/main/account.tsx
import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Alert, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNav from '../../components/Bottomnavigation';
import TopNav from '../../components/Topnav';
import ItimText from '../../components/Itimtext';
import Title from '../../components/Title';
import TextField from '../../components/TextField';
import Button from '../../components/Button';

import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../redux/state/store';
import { clearUser, setUser} from '../../redux/slices/userSlice';
import {
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUploadAvatarMutation,
} from '../../redux/svc/usersApi';
import { useRouter } from 'expo-router';

export default function AccountScreen() {
  const dispatch = useDispatch();
  const router = useRouter();

  const user = useSelector((s: RootState) => s.user);

  const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation();
  const [avatarBust, setAvatarBust] = useState<number>(Date.now());

  const createdAtText = useMemo(() => {
    if (!user.current?.createdAt) return '';
    try {
      const d = new Date(user.current.createdAt);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return '';
    }
  }, [user.current?.createdAt]);

  const [showPassword, setShowPassword] = useState(false);
  const [editName, setEditName] = useState(false);
  const [editEmail, setEditEmail] = useState(false);

  const [changePwMode, setChangePwMode] = useState(false);
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');

  const [name, setName] = useState(user.current?.name || '');
  const [email, setEmail] = useState(user.current?.email || '');

  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  // ⬅⬅ FIX: always use _id
  const getUserId = () => user.current?._id;

  // עדכון שם/אימייל
  const saveField = async (field: 'name' | 'email') => {
    const id = getUserId();
    if (!id) return alert('No logged-in user');

    const patch: { name?: string; email?: string } = {};
    if (field === 'name') patch.name = name?.trim();
    if (field === 'email') patch.email = email?.trim();

    try {
      const updated = await updateUser({ id, patch }).unwrap();
      dispatch(
        setUser({
          _id: updated._id,
          name: updated.name,
          email: updated.email,
          avatarUrl: updated.avatarUrl ?? user.current?.avatarUrl ?? null,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
          groups: updated.groups ?? user.current?.groups ?? [],
        })
      );
      if (field === 'name') setEditName(false);
      if (field === 'email') setEditEmail(false);
    } catch (e: any) {
      alert(e?.data?.message || 'Failed to update user');
    }
  };

  // שינוי סיסמה
  const savePassword = async () => {
    const id = getUserId();
    if (!id) return alert('No logged-in user');

    if (!pwNew || pwNew.length < 6) return alert('Password must be at least 6 characters');
    if (pwNew !== pwConfirm) return alert('Passwords do not match');

    try {
      const updated = await updateUser({
        id,
        patch: { password: pwNew } as any // ⬅⬅ FIX: allow password in patch
      }).unwrap();

      dispatch(
        setUser({
          _id: updated._id,
          name: updated.name,
          email: updated.email,
          avatarUrl: updated.avatarUrl ?? user.current?.avatarUrl ?? null,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
          groups: updated.groups ?? user.current?.groups ?? [],
        })
      );
      setPwCurrent('');
      setPwNew('');
      setPwConfirm('');
      setChangePwMode(false);
      alert('Password updated successfully');
    } catch (e: any) {
      alert(e?.data?.message || 'Failed to update password');
    }
  };

  // בחירת תמונה + העלאה
  const onPickAndUploadAvatar = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      alert('Permission to access media library is required');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });

    if (res.canceled) return;

    const id = getUserId();
    if (!id) return alert('No logged-in user');

    try {
      const file = {
        uri: res.assets[0].uri,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      } as any;

      const updated = await uploadAvatar({ id, file }).unwrap();

      dispatch(
        setUser({
          _id: updated._id ?? id,
          name: updated.name ?? user.current?.name ?? '',
          email: updated.email ?? user.current?.email ?? '',
          avatarUrl: updated.avatarUrl ?? user.current?.avatarUrl ?? null,
          createdAt: updated.createdAt ?? user.current?.createdAt,
          updatedAt: updated.updatedAt ?? user.current?.updatedAt,
          groups: updated.groups ?? user.current?.groups ?? [],
        })
      );

      setAvatarBust(Date.now());
    } catch (e: any) {
      alert(e?.data?.message || 'Failed to upload avatar');
    }
  };

  const onLogout = () => {
    dispatch(clearUser());
    router.replace('/auth/home');
  };

  const onDeleteUser = async () => {
    const id = getUserId();
    if (!id) return alert('No logged-in user');

    Alert.alert('Delete User', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: isDeleting ? 'Deleting...' : 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteUser({ id }).unwrap();
            dispatch(clearUser());
            router.replace('/');
          } catch (e: any) {
            alert(e?.data?.message || 'Failed to delete user');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffffff' }}>
      <View style={styles.container}>
        <TopNav />
        <ScrollView showsVerticalScrollIndicator={false}>

          <Title text="Account" />
          <Title text="Settings" />

          <View style={styles.accountRow}>
            <View style={styles.profileContainer}>
              <Pressable onPress={onPickAndUploadAvatar} style={styles.avatarWrap}>
                {user.current?.avatarUrl ? (
                  <Image
                    source={{ uri: `${user.current.avatarUrl}?t=${avatarBust}` }}
                    style={styles.avatarImg}
                  />
                ) : (
                  <MaterialCommunityIcons name="account-circle" size={90} color="#197FF4" />
                )}
                <Pressable style={styles.addIcon} onPress={onPickAndUploadAvatar}>
                  <MaterialCommunityIcons name="plus" size={14} color="#fff" />
                </Pressable>
              </Pressable>
              {isUploading ? <ItimText size={12} color="#197FF4">Uploading...</ItimText> : null}
            </View>

            <View style={{ flex: 1 }}>
              <ItimText size={14} color="#000" weight="bold">Account name</ItimText>
              {editName ? (
                <View style={{ gap: 6 }}>
                  <TextField value={name} onChangeText={setName} placeholder="Account name" />
                  <Button title={isLoading ? 'Saving...' : 'Save'} onPress={() => saveField('name')} />
                </View>
              ) : (
                <ItimText size={16}>{user.current?.name || '—'}</ItimText>
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
                <ItimText size={16}>{user.current?.email || '—'}</ItimText>
              )}
            </View>

            <View style={styles.editIcons}>
              <Pressable onPress={() => { setName(user.current?.name || ''); setEditName(true); }}>
                <MaterialCommunityIcons name="pencil" size={18} color="#197FF4" />
              </Pressable>
              <Pressable style={{ marginTop: 40 }} onPress={() => { setEmail(user.current?.email || ''); setEditEmail(true); }}>
                <MaterialCommunityIcons name="pencil" size={18} color="#197FF4" />
              </Pressable>
            </View>
          </View>

          <Title text="Privacy" />

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

              <Pressable style={styles.showPasswordBtn} onPress={() => setShowPassword((p) => !p)}>
                <ItimText size={14} color="#197FF4">
                  {showPassword ? 'hide password' : 'show password'}
                </ItimText>
              </Pressable>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button title={isLoading ? 'Saving...' : 'Save'} onPress={savePassword} />
                <Pressable
                  onPress={() => { setChangePwMode(false); setPwCurrent(''); setPwNew(''); setPwConfirm(''); }}
                  style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#eee' }}
                >
                  <ItimText size={14} color="#000">Cancel</ItimText>
                </Pressable>
              </View>
            </View>
          ) : (
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

          <Title text="Others" />
          <Pressable onPress={onLogout}>
            <ItimText size={16} color="#000" style={styles.otherText}>Log out</ItimText>
          </Pressable>
          <Pressable onPress={onDeleteUser}>
            <ItimText size={16} color="red" style={styles.otherText}>
              {isDeleting ? 'Deleting...' : 'Delete User'}
            </ItimText>
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
  avatarWrap: { position: 'relative' },
  avatarImg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#197FF4',
    backgroundColor: '#eee',
  },
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
  privacyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  showPasswordBtn: { backgroundColor: '#EAF3FF', borderRadius: 10, paddingVertical: 4, paddingHorizontal: 10 },
  otherText: { marginBottom: 6 },
});
