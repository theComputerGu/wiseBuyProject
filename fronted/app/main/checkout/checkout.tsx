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
} from "../../../redux/slices/storesSlice";

import {
  setRadius,
  setUserLocation,
} from "../../../redux/slices/checkoutSlice";

import { useResolveStoresMutation } from "../../../redux/svc/storesApi";
import { ShoppingListItem } from "../../../redux/slices/shoppinglistSlice";

/* ======================================================
   TYPES
====================================================== */

type AggregatedStore = {
  id: string;
  chain: string;
  address: string;
  lat: number;
  lon: number;
  score: number;
  itemsFound: number;
  itemsMissing: number;
};

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

  const storesByItemcode = useAppSelector(
    (s) => s.stores.stores
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
     MISSING ITEMCODES 🔑
  ========================= */

  const missingItemcodes = useMemo(() => {
    return shoppingItems
      .map((i) => i._id?.itemcode)
      .filter((c): c is string => Boolean(c))
      .filter((code) => {
        const entry = storesByItemcode[code];
        return !entry || entry.stores.length === 0;
      });
  }, [shoppingItems, storesByItemcode]);

  /* =========================
     EFFECT: RESOLVE STORES
  ========================= */

  useEffect(() => {
    if (!isFocused) return;
    if (!shoppingItems.length) return;
    if (!location) return;
    if (missingItemcodes.length === 0) return;

    const payload = {
      addressKey: buildAddressKey(location.lat, location.lon),
      itemcodes: missingItemcodes,
    };

    console.log("🚀 RESOLVE STORES PAYLOAD:", payload);

    resolveStores(payload)
      .unwrap()
      .then((results) => {
        console.log("✅ API RESULTS:", results);

        for (const r of results) {
          dispatch(
            appendStores({
              itemcode: r.itemcode,
              stores: r.stores,
            })
          );
        }

        dispatch(setSignature(listSignature));
      })
      .catch((err) => {
        console.error("❌ Resolve stores failed:", err);
      });
  }, [
    location,
    missingItemcodes.join(","), // 🔑 מונע כפילויות
    listSignature,
    resolveStores,
    dispatch,
  ]);

  /* =========================
     AGGREGATION
  ========================= */

  const aggregatedStores = useMemo<AggregatedStore[]>(() => {
    if (!location) return [];

    const map: Record<string, AggregatedStore> = {};
    const totalItems = shoppingItems.length;

    for (const item of shoppingItems) {
      const itemcode = item._id?.itemcode;
      if (!itemcode) continue;

      const entry = storesByItemcode[itemcode];
      if (!entry?.stores?.length) continue;

      const qty = item.quantity ?? 1;

      for (const offer of entry.stores) {
        if (!offer.geo) continue;

        const key = `${offer.chain}__${offer.address}`;

        if (!map[key]) {
          map[key] = {
            id: key,
            chain: offer.chain,
            address: offer.address,
            lat: offer.geo.lat,
            lon: offer.geo.lon,
            score: 0,
            itemsFound: 0,
            itemsMissing: totalItems,
          };
        }

        map[key].score += offer.price * qty;
        map[key].itemsFound += 1;
        map[key].itemsMissing -= 1;
      }
    }

    return Object.values(map)
      .filter((store) => {
        const d = distanceKm(
          location.lat,
          location.lon,
          store.lat,
          store.lon
        );
        return d <= radius;
      })
      .sort((a, b) => {
        if (a.itemsMissing === 0 && b.itemsMissing > 0) return -1;
        if (a.itemsMissing > 0 && b.itemsMissing === 0) return 1;
        return a.score - b.score;
      });
  }, [shoppingItems, storesByItemcode, location, radius]);

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
            minimumValue={1}
            maximumValue={3}
            step={0.5}
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
              {aggregatedStores.map((s) => (
                <Marker
                  key={s.id}
                  title={s.chain}
                  description={`₪${s.score.toFixed(2)}`}
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
          {aggregatedStores.map((s) => (
            <Pressable
              key={s.id}
              style={styles.storeCard}
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
                ₪{s.score.toFixed(2)}
              </ItimText>
            </Pressable>
          ))}
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
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
});
