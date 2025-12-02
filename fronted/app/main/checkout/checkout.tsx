import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Text,
  Pressable,
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";

import { useRouter } from "expo-router";
import ItimText from "../../../components/Itimtext";
import BottomNav from "../../../components/Bottomnavigation";
import TopNav from "../../../components/Topnav";
import Title from "../../../components/Title";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux/state/store";

import {
  setStores,
  setUserLocation,
} from "../../../redux/slices/checkoutSlice";

import { buildStores } from "../../../lib/buildStores";


// ======================================================
// 1) Reverse Geocode (מתוקן - לא נחסם יותר)
// ======================================================
async function reverseGeocode(lat: number, lon: number) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "WiseBuyApp/1.0 (tamir@example.com)",  
        "Accept-Language": "he",
      },
    });

    const text = await res.text();
    console.log("🌐 Reverse Response:", text.substring(0, 200));

    const data = JSON.parse(text);

    const city =
      data.address.city ||
      data.address.town ||
      data.address.village ||
      data.address.state;

    return city || "תל אביב";

  } catch (err) {
    console.log("🔥 ReverseGeocode JSON ERROR:", err);
    return "תל אביב";
  }
}



// ======================================================
// 2) MAIN COMPONENT
// ======================================================
export default function CheckoutScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const shoppingList = useSelector(
    (s: RootState) => s.shoppingList.activeList?.items
  );

  const stores = useSelector((s: RootState) => s.checkout.stores);
  const radius = useSelector((s: RootState) => s.checkout.radius);
  const userLocation = useSelector((s: RootState) => s.checkout.userLocation);

  const [loadingStores, setLoadingStores] = useState(false);


  // ======================================================
  // 3) Load GPS
  // ======================================================
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      dispatch(
        setUserLocation({
          lat: loc.coords.latitude,
          lon: loc.coords.longitude,
        })
      );

      console.log("📍 GPS:", loc.coords);
    })();
  }, []);



  // ======================================================
  // 4) Wait for GPS → Resolve city → build stores
  // ======================================================
  useEffect(() => {
    if (!userLocation) return;
    if (!shoppingList || shoppingList.length === 0) return;

    (async () => {
      console.log("🛒 SHOPPING LIST =", JSON.stringify(shoppingList));

      setLoadingStores(true);

      /// Get city from reverse geocoding
      const city = await reverseGeocode(
        userLocation.lat,
        userLocation.lon
      );

      console.log("🏙 City =", city);

      try {
        const result = await buildStores(shoppingList, city);
        dispatch(setStores(result));
      } catch (err) {
        console.log("❌ BUILD STORES ERROR:", err);
      }

      setLoadingStores(false);
    })();
  }, [userLocation, shoppingList]);



  // ======================================================
  // 5) RENDER UI
  // ======================================================
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        <TopNav />

        <Title text="Checkout" />
        <Title text="Your current location" icon="map-marker" />
        <Title text={`Radius: ${radius}km`} />

        {/* ============ MAP DISPLAY ============ */}
        <View style={styles.mapContainer}>
          {!userLocation ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#197FF4" />
              <Text>Loading location…</Text>
            </View>
          ) : (
            <MapView
              style={styles.map}
              region={{
                latitude: userLocation.lat,
                longitude: userLocation.lon,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              showsUserLocation
            >
              <Circle
                center={{
                  latitude: userLocation.lat,
                  longitude: userLocation.lon,
                }}
                radius={radius * 1000}
                fillColor="rgba(25, 127, 244, 0.1)"
                strokeColor="rgba(25, 127, 244, 0.5)"
                strokeWidth={2}
              />

              {stores.map((store) => (
                <Marker
                  key={store.id}
                  coordinate={{
                    latitude: store.geo.lat,
                    longitude: store.geo.lon,
                  }}
                  title={store.chain}
                  description={store.address}
                  onPress={() =>
                    router.push(
                      `/main/checkout/storecheckout?id=${store.id}`
                    )
                  }
                />
              ))}
            </MapView>
          )}
        </View>


        {/* ============ STORE LIST ============ */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {loadingStores ? (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator size="large" color="#197FF4" />
              <ItimText style={{ textAlign: "center", marginTop: 10 }}>
                Loading stores…
              </ItimText>
            </View>
          ) : (
            stores.map((store) => (
              <Pressable
                key={store.id}
                style={styles.storeCard}
                onPress={() =>
                  router.push(`/main/checkout/storecheckout?id=${store.id}`)
                }
              >
                <View style={styles.priceInfo}>
                  <ItimText size={16} color="#197FF4" weight="bold">
                    ₪{store.score.toFixed(2)}
                  </ItimText>
                  <ItimText size={12} color="#000">
                    Total Price
                  </ItimText>
                </View>

                <View style={styles.storeInfo}>
                  <ItimText size={16} weight="bold">
                    {store.chain}
                  </ItimText>
                  <ItimText size={12} color="#444">
                    {store.address}
                  </ItimText>
                </View>
              </Pressable>
            ))
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        <BottomNav />
      </View>
    </SafeAreaView>
  );
}


// ======================================================
// STYLES
// ======================================================
const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  mapContainer: {
    height: 250,
    width: "100%",
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 15,
  },
  map: { width: "100%", height: "100%" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  storeCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priceInfo: { justifyContent: "center" },
  storeInfo: { justifyContent: "center", alignItems: "flex-end", flex: 1 },
});
