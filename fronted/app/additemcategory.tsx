import React, { useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Image,
    FlatList,
    Dimensions,
    Pressable,
    Animated,
    TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ItimText from '../components/Itimtext';
import Title from '../components/Title';
import SearchHeader from '../components/SearchHeader';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function AddItemScreen() {
    const router = useRouter();
    const { name } = useLocalSearchParams<{ name?: string }>();

    const [selectedItem, setSelectedItem] = useState<null | Item>(null);
    const slideAnim = useRef(new Animated.Value(screenHeight)).current; // start off-screen

    interface Item {
        id: string;
        name: string;
        price: string;
        weight: string;
        image: any;
    }

    const items: Item[] = [
        {
            id: '1',
            name: 'חזה עוף טרי',
            price: '52.40₪',
            weight: '648₪/kg',
            image: require('../assets/products/Chicken-breast.png'),
        },
        {
            id: '2',
            name: 'בשר טחון טרי',
            price: '68.90₪',
            weight: '850₪/kg',
            image: require('../assets/products/ground-beef.png'),
        },
        {
            id: '3',
            name: 'חלב תנובה',
            price: '11.00₪',
            weight: '12₪/kg',
            image: require('../assets/products/חלב תנובה.png'),
        },
    ];

    const openPopup = (item: Item) => {
        setSelectedItem(item);
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
        }).start();
    };

    const closePopup = () => {
        Animated.timing(slideAnim, {
            toValue: screenHeight,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setSelectedItem(null));
    };

    return (
        <SafeAreaView style={styles.container}>
            <SearchHeader
                placeholder="Search items..."
                backRoute="/product"
                onSearchChange={(text) => console.log('Searching:', text)}
            />
            <Title text={name ?? 'No category selected'} />

            <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <Pressable style={styles.itemCard} onPress={() => openPopup(item)}>
                        <Image source={item.image} style={styles.itemImage} />
                        <ItimText size={16} color="#000" weight="bold">
                            {item.name}
                        </ItimText>
                        <ItimText size={14} color="#197FF4">
                            {item.price}
                        </ItimText>
                        <ItimText size={12} color="#555">
                            {item.weight}
                        </ItimText>
                    </Pressable>
                )}
            />

            {/* 🪄 Popup card */}
            {selectedItem && (
                <TouchableWithoutFeedback onPress={closePopup}>
                    <View style={styles.overlay}>
                        <Animated.View
                            style={[
                                styles.popupCard,
                                { transform: [{ translateY: slideAnim }] },
                            ]}
                        >
                            <View style={styles.handleBar} />
                            <Image
                                source={selectedItem.image}
                                style={styles.popupImage}
                            />
                            <ItimText size={20} color="#000" weight="bold">
                                {selectedItem.name}
                            </ItimText>
                            <ItimText size={18} color="#197FF4">
                                {selectedItem.price}
                            </ItimText>
                            <ItimText size={14} color="#555">
                                {selectedItem.weight}
                            </ItimText>

                            <Pressable style={styles.closeButton} onPress={closePopup}>
                                <ItimText size={16} color="#fff" weight="bold">
                                    Close
                                </ItimText>
                            </Pressable>
                        </Animated.View>
                    </View>
                </TouchableWithoutFeedback>
            )}
        </SafeAreaView>
    );
}

// ✅ Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
    },
    list: {
        paddingVertical: 12,
        justifyContent: 'space-between',
    },
    itemCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        alignItems: 'center',
        margin: 8,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemImage: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
        marginBottom: 8,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    popupCard: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    handleBar: {
        width: 50,
        height: 5,
        backgroundColor: '#ccc',
        borderRadius: 2.5,
        marginBottom: 10,
    },
    popupImage: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
        marginBottom: 8,
    },
    closeButton: {
        marginTop: 16,
        backgroundColor: '#197FF4',
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
});
