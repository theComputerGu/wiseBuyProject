import React, { useMemo, useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import {View,StyleSheet,ScrollView,Pressable,ActivityIndicator,Modal,Alert,Text,} from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import TopNav from "../../../components/Topnav";
import BottomNav from "../../../components/Bottomnavigation";
import Title from "../../../components/Title";
import ItimText from "../../../components/Itimtext";
const BRAND = "#197FF4";
import {useAppSelector,useAppDispatch,} from "../../../redux/state/hooks";
import {appendStores,setSignature,setScoredStores,} from "../../../redux/slices/storesSlice";
import {setRadius,setUserLocation,} from "../../../redux/slices/checkoutSlice";
import { useResolveStoresMutation } from "../../../redux/svc/storesApi";
import { ShoppingListItem } from "../../../redux/slices/shoppinglistSlice";
import { ScoredStore } from "../../../types/Store";
import { clearStores } from "../../../redux/slices/storesSlice";


function distanceKm(lat1: number,lon1: number,lat2: number,lon2: number) {

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



function qualityMeta(v: number) {
  if (v >= 75) {
    return { label: "GOOD", color: "#2ecc71" };
  }
  if (v >= 45) {
    return { label: "OK", color: "#f1c40f" };
  }
  return { label: "WEAK", color: "#e74c3c" };
}



function getCardStyle(score: number) {
  if (score >= 80) {
    return {
      bg: "#ffffff",
      border: "#e2e8f0",
      accent: "#10b981",
    };
  }
  if (score >= 60) {
    return {
      bg: "#ffffff",
      border: "#e5e7eb",
      accent: "#f1c40f",
    };
  }
  return {
    bg: "#ffffff",
    border: "#d4d4d8",
    accent: "#e74c3c",
  };
}


export default function CheckoutScreen() {


  const router = useRouter();
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const shoppingItems = useAppSelector((s) => s.shoppingList.activeList?.items ?? []);
  const scoredStores = useAppSelector((s) => s.stores.scoredStores);
  const storedSignature = useAppSelector((s) => s.stores.signature);
  const radius = useAppSelector((s) => s.checkout.radius);
  const location = useAppSelector((s) => s.checkout.userLocation);
  const [resolveStores] = useResolveStoresMutation();

  const [isFetchingStores, setIsFetchingStores] = useState(false);


  useEffect(() => {
  if (!shoppingItems.length) {
    dispatch(clearStores());
  }
  }, [shoppingItems.length]);



  

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






  const allItemcodes = useMemo(() => {
    return shoppingItems
      .map((i) => i._id?.itemcode)
      .filter((c): c is string => Boolean(c));
  }, [shoppingItems]);






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

  setIsFetchingStores(true);

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
    .catch((error) => {
      console.error("❌ Failed to resolve stores:", error);

      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to load store prices. Please try again.";

      Alert.alert("Error Loading Stores", errorMessage, [
        { text: "OK" },
      ]);
    })
    .finally(() => {
      setIsFetchingStores(false);
    });
}, [
  isFocused,
  location,
  allItemcodes.join(","),
  listSignature,
  storedSignature,
  resolveStores,
  dispatch,
]);









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







return (
  <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      <TopNav />
      <Title text="Checkout" color={BRAND} />

      {/* Radius Control Card */}
      <View style={styles.radiusCard}>
        <View style={styles.radiusHeader}>
          <View style={styles.radiusIcon}>
            <MaterialCommunityIcons
              name="map-marker-radius"
              size={16}
              color={BRAND}
            />
          </View>
          <ItimText size={13} color="#71717a">
            Search Radius
          </ItimText>
          <ItimText size={15} weight="bold" color={BRAND}>
            {radius.toFixed(1)} km
          </ItimText>
        </View>
        <Slider
          value={radius}
          minimumValue={0.2}
          maximumValue={6}
          step={0.2}
          style={styles.slider}
          minimumTrackTintColor={BRAND}
          maximumTrackTintColor="#e5e7eb"
          thumbTintColor={BRAND}
          onValueChange={(v) => dispatch(setRadius(v))}
        />
      </View>

      {/* Map Section */}
      <View style={styles.mapContainer}>
        {location ? (
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
        ) : (
          <View style={styles.mapLoading}>
            <ActivityIndicator size="large" color={BRAND} />
            <ItimText size={14} color="#71717a" style={{ marginTop: 12 }}>
              Getting your location...
            </ItimText>
          </View>
        )}
      </View>

      {/* Stores Section Header */}
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name="store" size={20} color={BRAND} />
        <ItimText
          size={16}
          weight="600"
          color="#1a1a1a"
          style={{ marginLeft: 8 }}
        >
          Nearby Stores
        </ItimText>
        <View style={styles.storeCount}>
          <ItimText size={12} color={BRAND} weight="bold">
            {visibleStores.length}
          </ItimText>
        </View>
      </View>

      {/* Inline Fetching Indicator */}
      {isFetchingStores && (
        <View style={{ paddingVertical: 12, alignItems: "center" }}>
          <ActivityIndicator color={BRAND} />
          <ItimText size={12} color="#71717a" style={{ marginTop: 6 }}>
            Updating store prices…
          </ItimText>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {visibleStores.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="store-off"
              size={60}
              color="#d1d5db"
            />
            <ItimText
              size={16}
              color="#71717a"
              style={{ marginTop: 12, textAlign: "center" }}
            >
              No stores found in this area.
            </ItimText>
            <ItimText
              size={13}
              color="#9ca3af"
              style={{ marginTop: 4, textAlign: "center" }}
            >
              Try increasing the search radius.
            </ItimText>
          </View>
        ) : (
          visibleStores.map((s) => {
            const avail = qualityMeta(s.scoreBreakdown.availability);
            const price = qualityMeta(s.scoreBreakdown.price);
            const dist = qualityMeta(s.scoreBreakdown.distance);
            const cardStyle = getCardStyle(s.score);

            return (
              <Pressable
                key={s.storeId}
                style={[
                  styles.storeCard,
                  {
                    backgroundColor: cardStyle.bg,
                    borderColor: cardStyle.border,
                    borderLeftWidth: 4,
                    borderLeftColor: cardStyle.accent,
                  },
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
                <View style={styles.cardHeader}>
                  <View style={styles.storeTextContainer}>
                    <ItimText
                      weight="bold"
                      color="#18181b"
                      style={{ fontSize: 17, textAlign: "right" }}
                    >
                      {s.chain}
                    </ItimText>
                    <ItimText
                      color="#71717a"
                      style={{ fontSize: 13, textAlign: "right" }}
                    >
                      {s.address}
                    </ItimText>
                  </View>

                  <View style={styles.priceContainer}>
                    <ItimText
                      color="#18181b"
                      weight="bold"
                      style={{ fontSize: 20 }}
                    >
                      {s.totalPrice > 0
                        ? `₪${s.totalPrice.toFixed(2)}`
                        : "—"}
                    </ItimText>
                    <View
                      style={[
                        styles.scoreBadge,
                        { backgroundColor: cardStyle.accent },
                      ]}
                    >
                      <ItimText color="#fff" style={{ fontSize: 12 }}>
                        {s.score}
                      </ItimText>
                    </View>
                  </View>
                </View>

                <View style={styles.metricsRow}>
                  <View style={styles.metricItem}>
                    <ItimText color="#a1a1aa" style={{ fontSize: 11 }}>
                      Availability
                    </ItimText>
                    <ItimText color={avail.color} weight="bold">
                      {avail.label}
                    </ItimText>
                  </View>
                  <View style={styles.metricItem}>
                    <ItimText color="#a1a1aa" style={{ fontSize: 11 }}>
                      Price
                    </ItimText>
                    <ItimText color={price.color} weight="bold">
                      {price.label}
                    </ItimText>
                  </View>
                  <View style={styles.metricItem}>
                    <ItimText color="#a1a1aa" style={{ fontSize: 11 }}>
                      Distance
                    </ItimText>
                    <ItimText color={dist.color} weight="bold">
                      {dist.label}
                    </ItimText>
                  </View>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      <BottomNav />
    </View>
  </SafeAreaView>
);
}


 






const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  radiusCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  radiusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  radiusIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  slider: {
    width: "100%",
    height: 30,
  },
  mapContainer: {
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  storeCount: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: "auto",
  },
  storeCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceContainer: {
    alignItems: "flex-start",
    gap: 6,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f4f4f5",
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  storeTextContainer: {
  flex: 1,
  alignItems: "flex-end",
},
  loadingCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 40,
    paddingVertical: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
});


