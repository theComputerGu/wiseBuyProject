import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Home = () => {
  return (
    <View style={styles.container}>

      <Text style={styles.title}>Wisebuy</Text>
      
      <Text>shop smarter today</Text>
      
    </View>
  )
}

export default Home

const styles = StyleSheet.create({
    container: {
        flex : 1,
        alignItems: 'center',
        justifyContent : 'center'
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18
    }
})