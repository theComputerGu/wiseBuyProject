import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Text,
  Pressable,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ItimText from '../../../components/Itimtext';
import BottomNav from '../../../components/Bottomnavigation';
import Button from '../../../components/Button';
import TopNav from '../../../components/Topnav';
import Title from '../../../components/Title';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux/state/store";
import { useAddToHistoryMutation } from "../../../redux/svc/groupsApi";
import { setActiveGroup } from "../../../redux/slices/groupSlice";
import { setActiveList } from "../../../redux/slices/shoppinglistSlice";

export default function CheckoutScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const activeGroup = useSelector((s: RootState) => s.group.activeGroup);
  const shoppingList = useSelector((s: RootState) => s.shoppingList.activeList);
  const [addToHistory] = useAddToHistoryMutation();


  // ⭐ MAP STATE (Integrated directly)
  const [location, setLocation] = useState<null | Location.LocationObjectCoords>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [radius, setRadius] = useState<number>(5);

  //function to convert an adress to a geocode
  // Convert Hebrew address → geo coordinates using OpenStreetMap (Nominatim)
  async function geocode(address: string) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}&limit=1`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "WiseBuy-App", // required by Nominatim policy
      },
    });

    const data = await res.json();

    if (!data || data.length === 0) {
      throw new Error("Address not found");
    }

    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
    };
  }



  useEffect(() => {
    (async () => {
      const geo = await geocode("נחל דן 11 , כרמיאל")
      console.log(geo)
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Location permission denied");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  const stores = [
    { id: 1, name: 'שופרסל דיל', price: '365.42₪', address: 'Derech Yitshak Rabin 17, Petah Tikva, ישראל' },
    { id: 2, name: 'שופרסל דיל', price: '365.42₪', address: 'Derech Yitshak Rabin 17, Petah Tikva, ישראל' },
    { id: 3, name: 'שופרסל דיל', price: '365.42₪', address: 'Derech Yitshak Rabin 17, Petah Tikva, ישראל' },
    { id: 4, name: 'שופרסל דיל', price: '365.42₪', address: 'Derech Yitshak Rabin 17, Petah Tikva, ישראל' },
    { id: 5, name: 'שופרסל דיל', price: '365.42₪', address: 'Derech Yitshak Rabin 17, Petah Tikva, ישראל' },
  ];



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>


        <TopNav />

        <Title text="Checkout" />
        <Title text="Your current location" icon="map-marker" />
        <Title text={`Radius: ${radius}km`} />

        {/* ------------------------- MAP AREA ------------------------- */}
        <View style={styles.mapContainer}>
          {errorMsg && (
            <View style={styles.center}>
              <Text style={{ color: "red" }}>{errorMsg}</Text>
            </View>
          )}

          {!location && !errorMsg && (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#197FF4" />
              <Text>Loading location...</Text>
            </View>
          )}

          {location && (
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              region={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              showsUserLocation
              showsMyLocationButton
            >


              <Circle
                center={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                radius={radius * 1000}
                fillColor="rgba(25, 127, 244, 0.1)"
                strokeColor="rgba(25, 127, 244, 0.5)"
                strokeWidth={2}
              />
            </MapView>
          )}
        </View>
        {/* ------------------------------------------------------------ */}

        {/* ⭐ Scroll area UNDER the map */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {stores.map((store) => (
            <Pressable
              key={store.id}
              onPress={() => router.replace(`/main/checkout/storecheckout?name=${store.name}`)}
              style={styles.storeCard}
            >
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
                  <MaterialCommunityIcons name="earth" size={16} color="#197FF4" />
                  <ItimText size={12} color="#555" style={{ marginLeft: 5, flexShrink: 1 }}>
                    {store.address}
                  </ItimText>
                </View>
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
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },

  /* MAP */
  mapContainer: {
    height: 250,
    width: "100%",
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 15,
    backgroundColor: "#eee",
  },

  map: {
    width: "100%",
    height: "100%",
  },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  /* STORE LIST */
  storeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
