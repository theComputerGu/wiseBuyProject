import { StyleSheet, Text, View } from "react-native";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>WiseBuy</Text>
      <Text style={styles.subtitle}>Shop smarter today 🛒</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container:{ flex:1, alignItems:"center", justifyContent:"center", backgroundColor:"#F8FAFC" },
  title:{ fontWeight:"bold", fontSize:28, color:"#2563EB", marginBottom:6 },
  subtitle:{ fontSize:16, color:"#6B7280" }
});
