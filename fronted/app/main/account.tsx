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
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../redux/state/store';
import { clearUser, setUser } from '../../redux/slices/userSlice';
import {
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUploadAvatarMutation,
} from '../../redux/svc/usersApi';
import { useRouter } from 'expo-router';

const BRAND = '#197FF4';

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

  const [editName, setEditName] = useState(false);
  const [changePwMode, setChangePwMode] = useState(false);
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState(user.current?.name || '');
  const [email, setEmail] = useState(user.current?.email || '');

  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const getUserId = () => user.current?._id;

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
          passwordLength: updated.passwordLength,
          avatarUrl: updated.avatarUrl ?? user.current?.avatarUrl ?? null,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
          groups: updated.groups ?? user.current?.groups ?? [],
        })
      );
      if (field === 'name') setEditName(false);
    } catch (e: any) {
      alert(e?.data?.message || 'Failed to update user');
    }
  };

  const savePassword = async () => {
    const id = getUserId();
    if (!id) return alert('No logged-in user');

    if (!pwNew || pwNew.length < 6) return alert('Password must be at least 6 characters');
    if (pwNew !== pwConfirm) return alert('Passwords do not match');

    try {
      const updated = await updateUser({
        id,
        patch: { password: pwNew } as any
      }).unwrap();

      dispatch(
        setUser({
          _id: updated._id,
          name: updated.name,
          email: updated.email,
          passwordLength: updated.passwordLength,
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
          passwordLength: updated.passwordLength ?? user.current?.passwordLength ?? 0,
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

    Alert.alert('Delete User', 'Are you sure you want to delete your account? This action cannot be undone.', [
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TopNav />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          <Title text="Account" />

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <Pressable onPress={onPickAndUploadAvatar} style={styles.avatarContainer}>
              {user.current?.avatarUrl ? (
                <Image
                  source={{ uri: `${user.current.avatarUrl}?t=${avatarBust}` }}
                  style={styles.avatarImg}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialCommunityIcons name="account" size={50} color="#fff" />
                </View>
              )}
              <View style={styles.cameraIcon}>
                <MaterialCommunityIcons name="camera" size={14} color="#fff" />
              </View>
            </Pressable>
            {isUploading && <ItimText size={12} color={BRAND} style={{ marginTop: 8 }}>Uploading...</ItimText>}

            <ItimText size={22} weight="bold" color="#1a1a1a" style={styles.userName}>
              {user.current?.name || 'User'}
            </ItimText>
            <ItimText size={14} color="#71717a">
              {user.current?.email || ''}
            </ItimText>
            <ItimText size={12} color="#a1a1aa" style={{ marginTop: 4 }}>
              Member since {createdAtText}
            </ItimText>
          </View>

          {/* Account Settings Section */}
          <View style={styles.section}>
            <ItimText size={13} color="#71717a" weight="600" style={styles.sectionTitle}>
              ACCOUNT SETTINGS
            </ItimText>

            {/* Name Row */}
            <Pressable
              style={styles.settingRow}
              onPress={() => { setName(user.current?.name || ''); setEditName(true); }}
            >
              <View style={styles.settingIcon}>
                <MaterialCommunityIcons name="account-outline" size={22} color={BRAND} />
              </View>
              <View style={styles.settingContent}>
                <ItimText size={13} color="#71717a">Name</ItimText>
                {editName ? (
                  <View style={styles.editField}>
                    <TextField
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter name"
                      style={styles.textInput}
                    />
                    <View style={styles.editButtons}>
                      <Pressable style={styles.saveBtn} onPress={() => saveField('name')}>
                        <ItimText size={13} color="#fff">{isLoading ? 'Saving...' : 'Save'}</ItimText>
                      </Pressable>
                      <Pressable style={styles.cancelBtn} onPress={() => setEditName(false)}>
                        <ItimText size={13} color="#71717a">Cancel</ItimText>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <ItimText size={16} color="#1a1a1a">{user.current?.name || '—'}</ItimText>
                )}
              </View>
              {!editName && (
                <MaterialCommunityIcons name="chevron-right" size={22} color="#d4d4d8" />
              )}
            </Pressable>

            {/* Email Row */}
            <View style={styles.settingRow}>
              <View style={styles.settingIcon}>
                <MaterialCommunityIcons name="email-outline" size={22} color={BRAND} />
              </View>
              <View style={styles.settingContent}>
                <ItimText size={13} color="#71717a">Email</ItimText>
                <ItimText size={16} color="#1a1a1a">{user.current?.email || '—'}</ItimText>
              </View>
            </View>
          </View>

          {/* Security Section */}
          <View style={styles.section}>
            <ItimText size={13} color="#71717a" weight="600" style={styles.sectionTitle}>
              SECURITY
            </ItimText>

            {changePwMode ? (
              <View style={styles.passwordForm}>
                <TextField
                  value={pwCurrent}
                  onChangeText={setPwCurrent}
                  placeholder="Current password"
                  secure={!showPassword}
                  style={styles.passwordInput}
                />
                <TextField
                  value={pwNew}
                  onChangeText={setPwNew}
                  placeholder="New password"
                  secure={!showPassword}
                  style={styles.passwordInput}
                />
                <TextField
                  value={pwConfirm}
                  onChangeText={setPwConfirm}
                  placeholder="Confirm new password"
                  secure={!showPassword}
                  style={styles.passwordInput}
                />
                <Pressable
                  style={styles.showPasswordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? "eye-off" : "eye"}
                    size={18}
                    color="#71717a"
                  />
                  <ItimText size={13} color="#71717a" style={{ marginLeft: 6 }}>
                    {showPassword ? 'Hide passwords' : 'Show passwords'}
                  </ItimText>
                </Pressable>
                <View style={styles.editButtons}>
                  <Pressable style={styles.saveBtn} onPress={savePassword}>
                    <ItimText size={14} color="#fff">{isLoading ? 'Saving...' : 'Update Password'}</ItimText>
                  </Pressable>
                  <Pressable
                    style={styles.cancelBtn}
                    onPress={() => { setChangePwMode(false); setPwCurrent(''); setPwNew(''); setPwConfirm(''); }}
                  >
                    <ItimText size={14} color="#71717a">Cancel</ItimText>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable style={styles.settingRow} onPress={() => setChangePwMode(true)}>
                <View style={styles.settingIcon}>
                  <MaterialCommunityIcons name="lock-outline" size={22} color={BRAND} />
                </View>
                <View style={styles.settingContent}>
                  <ItimText size={13} color="#71717a">Password</ItimText>
                  <ItimText size={16} color="#1a1a1a">
                    {"•".repeat(user.current?.passwordLength ?? 8)}
                  </ItimText>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={22} color="#d4d4d8" />
              </Pressable>
            )}
          </View>

          {/* Actions Section */}
          <View style={styles.section}>
            <ItimText size={13} color="#71717a" weight="600" style={styles.sectionTitle}>
              ACTIONS
            </ItimText>

            <Pressable style={styles.settingRow} onPress={onLogout}>
              <View style={[styles.settingIcon, { backgroundColor: '#fef3c7' }]}>
                <MaterialCommunityIcons name="logout" size={22} color="#f59e0b" />
              </View>
              <View style={styles.settingContent}>
                <ItimText size={16} color="#1a1a1a">Log Out</ItimText>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#d4d4d8" />
            </Pressable>

            <Pressable style={styles.settingRow} onPress={onDeleteUser}>
              <View style={[styles.settingIcon, { backgroundColor: '#fee2e2' }]}>
                <MaterialCommunityIcons name="trash-can-outline" size={22} color="#ef4444" />
              </View>
              <View style={styles.settingContent}>
                <ItimText size={16} color="#ef4444">
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </ItimText>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#d4d4d8" />
            </Pressable>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

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
  profileCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: BRAND,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: BRAND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: BRAND,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    marginTop: 8,
  },
  section: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#f4f4f5',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  editField: {
    marginTop: 8,
  },
  textInput: {
    marginBottom: 8,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  saveBtn: {
    backgroundColor: BRAND,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  cancelBtn: {
    backgroundColor: '#f4f4f5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  passwordForm: {
    padding: 16,
    gap: 12,
  },
  passwordInput: {
    marginBottom: 4,
  },
  showPasswordToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
});
