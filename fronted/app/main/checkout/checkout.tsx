import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import { useIsFocused } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";

import ItimText from "../../../components/Itimtext";
import BottomNav from "../../../components/Bottomnavigation";
import TopNav from "../../../components/Topnav";
import Title from "../../../components/Title";
import type { StoresEntry } from "../../../redux/slices/storesSlice";
import { RootState } from "../../../redux/state/store";
import {
  useScrapeStoresMutation,
  useGetStoresBulkMutation,
} from "../../../redux/svc/storeApi";
import { clearStores, setStores, setSignature } from "../../../redux/slices/storesSlice";

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
  lat: number;
  lon: number;
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


    return `${a.road}, ${a.town}`;
  } catch {
    return "תל אביב";
  }
}
//calculate if shopping list changed
export function shoppingSignature(shopping: any[]): string {
  return shopping
    .map(i => `${i._id?.itemcode}:${i.quantity ?? 1}`)
    .sort()
    .join("|");
}

/* =========================
   MAIN
========================= */
export default function CheckoutScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const isFocused = useIsFocused();

  const shoppingList = useSelector(
    (s: RootState) => s.shoppingList.activeList?.items ?? []
  );


  const storesByItemcode = useSelector((s: RootState) => s.stores.stores);


  const lastSignature = useSelector(
    (s: RootState) => s.stores.signature
  );



  const currentSignature = shoppingSignature(shoppingList);

  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [radius, setRadius] = useState(5);
  const [isBuilding, setIsBuilding] = useState(false);

  const [scrapeStores, { isLoading: scraping }] = useScrapeStoresMutation();
  const [getStoresBulk, { isLoading: loadingStores }] =
    useGetStoresBulkMutation();

  /* =========================
     BAR CODES (memoized)
  ========================= */
  const barcodes = useMemo(
    () =>
      shoppingList
        .map((i) => i._id?.itemcode)
        .filter((b): b is string => typeof b === "string"),
    [shoppingList]
  );

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

  useEffect(() => {
    if (!isFocused || !userLocation) return;
    if (lastSignature === currentSignature) return;

    setIsBuilding(true);

    (async () => {
      dispatch(clearStores());

      const city = await reverseGeocode(userLocation.lat, userLocation.lon);

      await scrapeStores({ barcodes, city });

      const res = await getStoresBulk({ itemcodes: barcodes }).unwrap();

      const normalized = Object.fromEntries(
        res.map(doc => [
          doc.itemcode,
          { itemcode: doc.itemcode, stores: doc.stores },
        ])
      );

      dispatch(setStores(normalized));
      dispatch(setSignature(currentSignature));

      setIsBuilding(false);
    })();
  }, [isFocused, userLocation, currentSignature]);



  /* =========================
     AGGREGATE + SORT
  ========================= */
  const aggregatedStores = useMemo<AggregatedStore[]>(() => {
    if (!userLocation) return [];

    const map: Record<string, AggregatedStore> = {};
    const totalItems = shoppingList.length;

    // -------------------------
    // BUILD aggregation
    // -------------------------
    for (const item of shoppingList) {
      const code = item._id?.itemcode;
      if (!code) continue;

      const entry = storesByItemcode[code];
      if (!entry?.stores?.length) continue;

      const qty = item.quantity ?? 1;

      for (const o of entry.stores) {
        if (!o.geo) continue;

        const key = `${o.chain}__${o.address}`;

        if (!map[key]) {
          map[key] = {
            id: key,
            chain: o.chain,
            address: o.address,
            lat: o.geo.lat,
            lon: o.geo.lon,
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

    // -------------------------
    // FILTER by radius + SORT
    // -------------------------
    return Object.values(map)
      .filter(store => {
        const d = distanceKm(
          userLocation.lat,
          userLocation.lon,
          store.lat,
          store.lon
        );
        return d <= radius;
      })
      .sort((a, b) => {
        // full stores first
        if (a.itemsMissing === 0 && b.itemsMissing > 0) return -1;
        if (a.itemsMissing > 0 && b.itemsMissing === 0) return 1;

        // then cheapest
        return a.score - b.score;
      });
  }, [shoppingList, storesByItemcode, userLocation, radius]);
  /* =========================
     BUILD PAYLOAD
  ========================= */
  function buildStoreCheckoutPayload(store: AggregatedStore) {
    return {
      chain: store.chain,
      products: shoppingList
        .map((item) => {
          const code = item._id?.itemcode;
          if (!code) return null;

          const entry = storesByItemcode[code];
          const offer = entry?.stores?.find(
            (o) => o.chain === store.chain && o.address === store.address
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
  // distance helper to calculate stores in radius
  function distanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  /* =========================
     LOADING (NON-BLOCKING)
     - Show loader only if we have NOTHING to show yet.
  ========================= */
  const loading = isBuilding || loadingStores;

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
              provider={PROVIDER_GOOGLE}   
              style={styles.map}
              region={{
                latitude: userLocation.lat,
                longitude: userLocation.lon,
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
                  latitude: userLocation.lat,
                  longitude: userLocation.lon,
                }}
                radius={radius * 1000} // km → meters
                strokeWidth={2}
                strokeColor="rgba(25,127,244,0.8)"
                fillColor="rgba(25,127,244,0.15)"
              />
            </MapView>
          )}
        </View>

        {/* LIST */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator />
          ) : (
            aggregatedStores.map((s) => (
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
  {/* שמאל – מחיר */}
  <View style={styles.leftCol}>
    <ItimText
      color="#197FF4"
      weight="bold"
      style={styles.price}
    >
      ₪{s.score.toFixed(2)}
    </ItimText>
  </View>

  {/* ימין – טקסטים */}
  <View style={styles.rightCol}>
    <ItimText weight="bold">{s.chain}</ItimText>
    <ItimText size={12}>{s.address}</ItimText>

    {s.itemsMissing === 0 ? (
      <ItimText size={12} color="#2e7d32">
        כל המוצרים זמינים
      </ItimText>
    ) : (
      <ItimText size={12} color="#a00">
        חסרים {s.itemsMissing} מוצרים
      </ItimText>
    )}
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



const styles = StyleSheet.create({
  /* ===== LAYOUT GENERAL ===== */
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

  /* ===== STORE CARD ===== */
storeCard: {
  backgroundColor: "#fff",
  borderRadius: 14,
  padding: 14,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: "#a1a1a1ff",
  elevation: 4,

  flexDirection: "row",          // לא row-reverse
  justifyContent: "space-between",
  alignItems: "flex-start",
},

leftCol: {
  alignItems: "flex-start",      // מחיר שמאל
},

rightCol: {
  flex: 1,
  alignItems: "flex-end",        // טקסטים ימין
},

price: {
  marginTop: 10,                 // הורדה קטנה של המחיר
},


  /* ===== PARTIAL STORE ===== */
  partialStore: {
    backgroundColor: "#f2f2f2",
    opacity: 0.65,
  },
});
