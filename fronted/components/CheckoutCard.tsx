import React from "react";
import { View, Image, StyleSheet } from "react-native";
import ItimText from "./Itimtext";

type Props = {
    name: string;
    price: string | number;
    quantity: number;
    image: any;
    missing?: boolean;   // ⭐ NEW — מציין מוצר שלא נמצא בחנות
};

export default function CheckoutCard({ name, price, quantity, image, missing }: Props) {

    const priceNumber = typeof price === "string"
        ? parseFloat(price.replace(/[^\d.]/g, ""))
        : price;

    const total = priceNumber > 0 ? (priceNumber * quantity).toFixed(2) : null;

    return (
        <View style={[styles.card, missing && styles.missingCard]}>
            
            <Image source={image} style={styles.img} />

            <View style={styles.text}>

                {/* שם מוצר */}
                <ItimText size={16} weight="bold">{name}</ItimText>

                {/* מחיר + כמות */}
                {missing ? (
                    <ItimText size={14} color="#d9534f" weight="bold" style={{marginTop:3}}>
                        ❌ לא נמכר בחנות זו
                    </ItimText>
                ) : (
                    <ItimText size={14} color="#555" style={{ marginTop: 2 }}>
                        {price} × {quantity}
                    </ItimText>
                )}

                {/* מחיר כולל */}
                {!missing && (
                    <ItimText size={16} weight="bold" style={{ marginTop: 4, color: "#197FF4" }}>
                        ₪{total}
                    </ItimText>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card:{
        flexDirection:"row",
        backgroundColor:"#fff",
        padding:12,
        borderRadius:14,
        alignItems:"center",
        marginBottom:12,
        shadowColor:"#000",
        shadowOpacity:0.05,
        shadowRadius:4,
        elevation:2,
    },
    missingCard:{
        opacity:0.45,         // ⭐ מוצרים חסרים דהויים
        borderWidth:1,
        borderColor:"#d9534f"
    },
    img:{
        width:60,
        height:60,
        borderRadius:10,
        marginRight:12,
        backgroundColor:"#ececec"
    },
    text:{ flex:1 }
});
