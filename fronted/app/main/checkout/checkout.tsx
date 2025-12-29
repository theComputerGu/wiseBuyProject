import React, { useMemo, useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import * as Location from "expo-location";

import TopNav from "../../../components/Topnav";
import BottomNav from "../../../components/Bottomnavigation";
import Title from "../../../components/Title";
import ItimText from "../../../components/Itimtext";

import {
  useAppSelector,
  useAppDispatch,
} from "../../../redux/state/hooks";

import {
  appendStores,
  setSignature,
  setScoredStores,
} from "../../../redux/slices/storesSlice";

import {
  setRadius,
  setUserLocation,
} from "../../../redux/slices/checkoutSlice";

import { useResolveStoresMutation } from "../../../redux/svc/storesApi";
import { ShoppingListItem } from "../../../redux/slices/shoppinglistSlice";
import { ScoredStore } from "../../../types/Store";

/* ======================================================
   HELPERS
====================================================== */

function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function buildAddressKey(lat: number, lon: number) {
  return `${lat.toFixed(4)},${lon.toFixed(4)}`;
}

/* ===== NEW: QUALITY META ===== */

function qualityMeta(v: number) {
  if (v >= 75) {
    return { label: "GOOD", color: "#2ecc71" }; // ירוק
  }
  if (v >= 45) {
    return { label: "OK", color: "#f1c40f" }; // צהוב
  }
  return { label: "WEAK", color: "#e74c3c" }; // אדום
}

/* ===== NEW: CARD BACKGROUND BY SCORE ===== */

function scoreCardBg(score: number) {
  if (score >= 80) return "#eafaf1"; // ירקרק
  if (score >= 60) return "#fff9e6"; // צהבהב
  return "#fdecea"; // אדמדם
}

/* ======================================================
   COMPONENT
====================================================== */

export default function CheckoutScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();

  /* =========================
     REDUX STATE
  ========================= */

  const shoppingItems = useAppSelector(
    (s) => s.shoppingList.activeList?.items ?? []
  );

  const scoredStores = useAppSelector(
    (s) => s.stores.scoredStores
  );

  const storedSignature = useAppSelector(
    (s) => s.stores.signature
  );

  const radius = useAppSelector(
    (s) => s.checkout.radius
  );

  const location = useAppSelector(
    (s) => s.checkout.userLocation
  );

  /* =========================
     API
  ========================= */

  const [resolveStores] = useResolveStoresMutation();

  /* =========================
     EFFECT: GET USER LOCATION
  ========================= */

  useEffect(() => {
    (async () => {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.warn("❌ Location permission denied");
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      dispatch(
        setUserLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        })
      );
    })();
  }, [dispatch]);

  /* =========================
     LIST SIGNATURE
  ========================= */

  const listSignature = useMemo(() => {
    const itemsSig = shoppingItems
      .map(
        (i: ShoppingListItem) =>
          `${i._id.itemcode}:${i.quantity}`
      )
      .join("|");

    const locSig = location
      ? buildAddressKey(location.lat, location.lon)
      : "noloc";

    return `${itemsSig}@${locSig}`;
  }, [shoppingItems, location]);

  /* =========================
     ALL ITEMCODES
  ========================= */

  const allItemcodes = useMemo(() => {
    return shoppingItems
      .map((i) => i._id?.itemcode)
      .filter((c): c is string => Boolean(c));
  }, [shoppingItems]);

  /* =========================
     EFFECT: RESOLVE STORES
  ========================= */

  useEffect(() => {
    if (!isFocused) return;
    if (!shoppingItems.length) return;
    if (!location) return;
    if (!allItemcodes.length) return;
    if (storedSignature === listSignature) return;

    const payload = {
      addressKey: buildAddressKey(location.lat, location.lon),
      itemcodes: allItemcodes,
    };

    resolveStores(payload)
      .unwrap()
      .then((data) => {
        for (const r of data.items) {
          dispatch(
            appendStores({
              itemcode: r.itemcode,
              stores: r.stores,
            })
          );
        }

        dispatch(setScoredStores(data.scoredStores));
        dispatch(setSignature(listSignature));
      })
      .catch(console.error);
  }, [
    isFocused,
    location,
    allItemcodes.join(","),
    listSignature,
    storedSignature,
    resolveStores,
    dispatch,
  ]);

  /* =========================
     FILTER + SORT
  ========================= */

  const visibleStores = useMemo<ScoredStore[]>(() => {
    if (!location) return [];

    return scoredStores
      .filter((s) => {
        const d = distanceKm(
          location.lat,
          location.lon,
          s.lat,
          s.lon
        );
        return d <= radius;
      })
      .sort((a, b) => b.score - a.score);
  }, [scoredStores, location, radius]);

  /* =========================
     RENDER
  ========================= */

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        <TopNav />
        <Title text="Checkout" />

        <View style={{ alignItems: "center", marginVertical: 10 }}>
          <ItimText color="#197FF4">
            Radius: {radius} km
          </ItimText>
          <Slider
            value={radius}
            minimumValue={0.2}
            maximumValue={3}
            step={0.2}
            style={{ width: "80%" }}
            onValueChange={(v) => dispatch(setRadius(v))}
          />
        </View>

        <View style={styles.mapContainer}>
          {location && (
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              region={{
                latitude: location.lat,
                longitude: location.lon,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              showsUserLocation
            >
              {visibleStores.map((s) => (
                <Marker
                  key={s.storeId}
                  title={s.chain}
                  description={`Score: ${s.score}/100`}
                  coordinate={{
                    latitude: s.lat,
                    longitude: s.lon,
                  }}
                />
              ))}

              <Circle
                center={{
                  latitude: location.lat,
                  longitude: location.lon,
                }}
                radius={radius * 1000}
                strokeWidth={2}
                strokeColor="rgba(25,127,244,0.8)"
                fillColor="rgba(25,127,244,0.15)"
              />
            </MapView>
          )}
        </View>

        <ScrollView>
          {visibleStores.map((s) => {
            const avail = qualityMeta(s.scoreBreakdown.availability);
            const price = qualityMeta(s.scoreBreakdown.price);
            const dist  = qualityMeta(s.scoreBreakdown.distance);

            return (
              <Pressable
                key={s.storeId}
                style={[
                  styles.storeCard,
                  { backgroundColor: scoreCardBg(s.score) },
                ]}
                onPress={() =>
                  router.push({
                    pathname: "/main/checkout/storecheckout",
                    params: {
                      chain: s.chain,
                      address: s.address,
                    },
                  })
                }
              >
                <ItimText weight="bold">{s.chain}</ItimText>
                <ItimText>{s.address}</ItimText>

                <ItimText color="#197FF4">
                  Score: {s.score}/100
                </ItimText>

                <ItimText>
                  Availability:{" "}
                  <ItimText color={avail.color}>
                    {avail.label}
                  </ItimText>{" "}
                  · Price:{" "}
                  <ItimText color={price.color}>
                    {price.label}
                  </ItimText>{" "}
                  · Distance:{" "}
                  <ItimText color={dist.color}>
                    {dist.label}
                  </ItimText>
                </ItimText>
              </Pressable>
            );
          })}
          <View style={{ height: 120 }} />
        </ScrollView>

        <BottomNav />
      </View>
    </SafeAreaView>
  );
}

/* ======================================================
   STYLES
====================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mapContainer: {
    height: 250,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 15,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  storeCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
});
