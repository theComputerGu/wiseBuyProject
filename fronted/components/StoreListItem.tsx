import React from "react";
import { View,Text,StyleSheet,Pressable } from "react-native";
import ItimText from "./Itimtext";

type Props={
  name:string;
  address:string;
  price:number;
  stars:number;
  onPress:()=>void;
};

export default function StoreListItem({name,address,price,stars,onPress}:Props){

  return(
    <Pressable style={styles.card} onPress={onPress}>
      
      <View style={{flex:1}}>
        <ItimText size={17} weight="bold">{name}</ItimText>
        <ItimText size={13} color="#666">{address}</ItimText>
      </View>

      <View style={{alignItems:"flex-end"}}>
        <ItimText size={17} weight="bold" color="#197FF4">₪{price.toFixed(2)}</ItimText>
        <Text style={styles.starText}>{"⭐".repeat(stars)}</Text>
      </View>

    </Pressable>
  );
}

const styles=StyleSheet.create({
  card:{
    padding:14,
    backgroundColor:"#fff",
    borderRadius:14,
    marginBottom:12,
    flexDirection:"row",
    alignItems:"center",
    shadowOpacity:0.08,shadowRadius:4,elevation:3
  },
  starText:{fontSize:14,marginTop:3}
});
