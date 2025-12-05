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
import Slider from "@react-native-community/slider";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux/state/store";

import {
  setStores,
  setUserLocation,
  setRadius,
} from "../../../redux/slices/checkoutSlice";

import { buildStores } from "../../../lib/buildStores";

// ⭐⭐ NEW — כדי להריץ מחדש בכל חזרה למסך
import { useFocusEffect } from "@react-navigation/native";


// ======================================================
// Distance formula — calculate km distance
// ======================================================
function distanceKm(lat1:number, lon1:number, lat2:number, lon2:number){
  const R = 6371;
  const dLat = (lat2-lat1) * Math.PI/180;
  const dLon = (lon2-lon1) * Math.PI/180;
  const a =
    Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180) *
    Math.cos(lat2*Math.PI/180) *
    Math.sin(dLon/2)**2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}


// ======================================================
// Reverse Geocode → convert GPS → City name
// ======================================================
async function reverseGeocode(lat:number, lon:number){
  try{
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      { headers:{ "User-Agent":"WiseBuyApp/1.0","Accept-Language":"he" } }
    );

    const data = await res.json();
    return data.address.city || data.address.town || data.address.village || "תל אביב";
  }
  catch{ return "תל אביב"; }
}


// ======================================================
// MAIN SCREEN
// ======================================================
export default function CheckoutScreen(){
  const router = useRouter();
  const dispatch = useDispatch();

  const shoppingList = useSelector((s:RootState)=>s.shoppingList.activeList?.items);
  const stores       = useSelector((s:RootState)=>s.checkout.stores);
  const radius       = useSelector((s:RootState)=>s.checkout.radius);
  const userLocation = useSelector((s:RootState)=>s.checkout.userLocation);

  const [loadingStores,setLoadingStores] = useState(false);


  // 📍 Load current GPS once
  useEffect(()=>{
    (async()=>{
      const {status} = await Location.requestForegroundPermissionsAsync();
      if(status!=="granted")return;

      const loc = await Location.getCurrentPositionAsync({});
      dispatch(setUserLocation({ lat:loc.coords.latitude, lon:loc.coords.longitude }));
    })();
  },[]);


  // 🧠 🚀 הכי חשוב — נטען מחדש בכל חזרה למסך
  useFocusEffect(
    React.useCallback(()=>{
      if(!userLocation || !shoppingList?.length) return;

      (async()=>{
        setLoadingStores(true);
        const city = await reverseGeocode(userLocation.lat,userLocation.lon);
        const result = await buildStores(shoppingList,city);
        dispatch(setStores(result));
        setLoadingStores(false);
      })();
    },[shoppingList,userLocation])
  );


  // Filtering by radius
  const filteredStores =
    userLocation
      ? stores.filter(s=>distanceKm(userLocation.lat,userLocation.lon,s.geo.lat,s.geo.lon)<=radius)
      : stores;


  return(
    <SafeAreaView style={{flex:1,backgroundColor:"#fff"}}>
      <View style={styles.container}>
        <TopNav/>

        <Title text="Checkout"/>
        <Title text="Your current location" icon="map-marker"/>

        {/* SLIDER */}
        <View style={{marginVertical:10,alignItems:"center"}}>
          <ItimText size={14}>Radius: {radius} km</ItimText>
          <Slider value={radius} minimumValue={1} maximumValue={5} step={1}
                  style={{width:"80%"}} onValueChange={(v)=>dispatch(setRadius(v))}/>
        </View>

        {/* MAP */}
        <View style={styles.mapContainer}>
          {!userLocation ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#197FF4"/>
              <Text>Loading location…</Text>
            </View>
          ):(
            <MapView style={styles.map}
              region={{
                latitude:userLocation.lat,longitude:userLocation.lon,
                latitudeDelta:0.05,longitudeDelta:0.05,
              }}
              showsUserLocation>
              
              <Circle center={{latitude:userLocation.lat,longitude:userLocation.lon}}
                radius={radius*1000}
                fillColor="rgba(25,127,244,0.1)"
                strokeColor="rgba(25,127,244,0.5)" strokeWidth={2}/>

              {filteredStores.map(store=>(
                <Marker key={store.id}
                        coordinate={{latitude:store.geo.lat,longitude:store.geo.lon}}
                        title={store.chain} description={store.address}
                        onPress={()=>router.replace({
                          pathname:"/main/checkout/storecheckout",
                          params:{store:JSON.stringify(store)}
                        })}/>
              ))}
            </MapView>
          )}
        </View>

        {/* STORE LIST */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {loadingStores ? (
            <View style={{paddingVertical:20}}>
              <ActivityIndicator size="large" color="#197FF4"/>
              <ItimText style={{textAlign:"center",marginTop:10}}>Loading stores…</ItimText>
            </View>
          ):(
            filteredStores.map(store=>(
              <Pressable key={store.id} style={styles.storeCard}
                onPress={()=>router.replace({
                  pathname:"/main/checkout/storecheckout",
                  params:{store:JSON.stringify(store)}
                })}>
                <View style={styles.priceInfo}>
                  <ItimText size={16} color="#197FF4" weight="bold">₪{store.score.toFixed(2)}</ItimText>
                  <ItimText size={12} color="#000">Total Price</ItimText>
                </View>
                <View style={styles.storeInfo}>
                  <ItimText size={16} weight="bold">{store.chain}</ItimText>
                  <ItimText size={12} color="#444">{store.address}</ItimText>
                </View>
              </Pressable>
            ))
          )}
          <View style={{height:120}}/>
        </ScrollView>

        <BottomNav/>
      </View>
    </SafeAreaView>
  );
}


// ======================================================
const styles = StyleSheet.create({
  container:{flex:1,paddingHorizontal:20},
  mapContainer:{height:250,width:"100%",borderRadius:15,overflow:"hidden",marginBottom:15},
  map:{width:"100%",height:"100%"},
  center:{flex:1,justifyContent:"center",alignItems:"center"},
  storeCard:{
    backgroundColor:"#fff",borderRadius:12,padding:12,marginBottom:10,
    shadowColor:"#000",shadowOpacity:0.1,shadowRadius:4,elevation:3,
    flexDirection:"row",justifyContent:"space-between",
  },
  priceInfo:{justifyContent:"center"},
  storeInfo:{justifyContent:"center",alignItems:"flex-end",flex:1},
});
