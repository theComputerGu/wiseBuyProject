import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import { useIsFocused } from "@react-navigation/native";
import { useSelector } from "react-redux";

import ItimText from "../../../components/Itimtext";
import BottomNav from "../../../components/Bottomnavigation";
import TopNav from "../../../components/Topnav";
import Title from "../../../components/Title";

import { RootState } from "../../../redux/state/store";
import {
  useScrapeStoresMutation,
  useGetStoresBulkMutation,
} from "../../../redux/svc/storeApi";

/* =========================
   Types
========================= */
type UserLocation = {
  lat: number;
  lon: number;
};

type AggregatedStore = {
  id: string;
  chain: string;
  address: string;
  score: number;
  itemsFound: number;
  itemsMissing: number;
};

/* =========================
   Reverse Geocode
========================= */
async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        headers: {
          "User-Agent": "WiseBuyApp/1.0",
          "Accept-Language": "he",
        },
      }
    );

    const data = await res.json();
    const a = data?.address ?? {};

    return (
      a.town ||
      a.city ||
      a.village ||
      a.municipality ||
      a.suburb ||
      "תל אביב"
    );
  } catch {
    return "תל אביב";
  }
}

/* =========================
   MAIN
========================= */
export default function CheckoutScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();

  const shoppingList = useSelector(
    (s: RootState) => s.shoppingList.activeList?.items ?? []
  );

  const storesByItemcode = useSelector(
    (s: RootState) => s.stores.byItemcode
  );

  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [radius, setRadius] = useState(5);

  const [scrapeStores, { isLoading: scraping }] =
    useScrapeStoresMutation();
  const [getStoresBulk, { isLoading: loadingStores }] =
    useGetStoresBulkMutation();

  /* =========================
     LOCATION
  ========================= */
  useEffect(() => {
    if (!isFocused) return;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation({
        lat: loc.coords.latitude,
        lon: loc.coords.longitude,
      });
    })();
  }, [isFocused]);

  /* =========================
     SCRAPE + CACHE
  ========================= */
  useEffect(() => {
    if (!isFocused || !userLocation || !shoppingList.length) return;

    const barcodes = shoppingList
      .map(i => i._id?.itemcode)
      .filter((b): b is string => typeof b === "string");

    if (!barcodes.length) return;

    (async () => {
      const city = await reverseGeocode(
        userLocation.lat,
        userLocation.lon
      );

      await scrapeStores({ barcodes, city });
      await getStoresBulk({ itemcodes: barcodes });
    })();
  }, [isFocused, userLocation, shoppingList]);

  /* =========================
     AGGREGATE + SORT
  ========================= */
  const aggregatedStores = useMemo<AggregatedStore[]>(() => {
    const map: Record<string, AggregatedStore> = {};
    const totalItems = shoppingList.length;

    for (const item of shoppingList) {
      const code = item._id?.itemcode;
      if (!code) continue;

      const offers = storesByItemcode[code];
      if (!offers) continue;

      const qty = item.quantity ?? 1;

      for (const o of offers) {
        const key = `${o.chain}__${o.address}`;

        if (!map[key]) {
          map[key] = {
            id: key,
            chain: o.chain,
            address: o.address,
            score: 0,
            itemsFound: 0,
            itemsMissing: totalItems,
          };
        }

        map[key].score += o.price * qty;
        map[key].itemsFound += 1;
        map[key].itemsMissing -= 1;
      }
    }

    return Object.values(map).sort((a, b) => {
      // ✅ full stores first
      if (a.itemsMissing === 0 && b.itemsMissing > 0) return -1;
      if (a.itemsMissing > 0 && b.itemsMissing === 0) return 1;

      // ✅ cheapest first
      return a.score - b.score;
    });
  }, [shoppingList, storesByItemcode]);

  /* =========================
     BUILD PAYLOAD
  ========================= */
  function buildStoreCheckoutPayload(store: AggregatedStore) {
    return {
      chain: store.chain,
      products: shoppingList
        .map(item => {
          const code = item._id?.itemcode;
          if (!code) return null;

          const offer = (storesByItemcode[code] ?? []).find(
            o => o.chain === store.chain && o.address === store.address
          );

          if (!offer) return null;

          return {
            itemcode: code,
            amount: item.quantity ?? 1,
            price: offer.price,
            _id: item._id,
          };
        })
        .filter(Boolean),
    };
  }

  const loading = scraping || loadingStores;

  /* =========================
     UI
  ========================= */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        <TopNav />
        <Title text="Checkout" />

        {/* Radius */}
        <View style={{ alignItems: "center", marginVertical: 10 }}>
          <ItimText>Radius: {radius} km</ItimText>
          <Slider
            value={radius}
            minimumValue={1}
            maximumValue={20}
            step={1}
            style={{ width: "80%" }}
            onValueChange={setRadius}
          />
        </View>

        {/* MAP */}
        <View style={styles.mapContainer}>
          {!userLocation ? (
            <ActivityIndicator />
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
              {aggregatedStores.map(s => (
                <Marker
                  key={s.id}
                  title={s.chain}
                  description={`₪${s.score.toFixed(2)}`}
                  coordinate={{
                    latitude: userLocation.lat,
                    longitude: userLocation.lon,
                  }}
                />
              ))}
            </MapView>
          )}
        </View>

        {/* LIST */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator />
          ) : (
            aggregatedStores.map(s => (
              <Pressable
                key={s.id}
                style={[
                  styles.storeCard,
                  s.itemsMissing > 0 && styles.partialStore,
                ]}
                onPress={() => {
                  const payload = buildStoreCheckoutPayload(s);
                  router.replace({
                    pathname: "/main/checkout/storecheckout",
                    params: { store: JSON.stringify(payload) },
                  });
                }}
              >
                <View>
                  <ItimText weight="bold">{s.chain}</ItimText>
                  <ItimText size={12}>{s.address}</ItimText>

                  {s.itemsMissing === 0 ? (
                    <ItimText size={12} color="#2e7d32">
                      ✔ All items available
                    </ItimText>
                  ) : (
                    <ItimText size={12} color="#a00">
                      Missing {s.itemsMissing} item
                    </ItimText>
                  )}
                </View>

                <ItimText color="#197FF4" weight="bold">
                  ₪{s.score.toFixed(2)}
                </ItimText>
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

/* =========================
   Styles
========================= */
const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },

  mapContainer: {
    height: 250,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 15,
  },

  map: { width: "100%", height: "100%" },

  storeCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#a1a1a1ff",
    elevation: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  partialStore: {
    backgroundColor: "#f2f2f2",
    opacity: 0.65,
  },
});
