import React from "react";
import { View, Image, StyleSheet } from "react-native";
import ItimText from "./Itimtext";

type Props = {
  name: string;
  price: string | number;
  quantity: number;
  image: any;
  missing?: boolean;
};

export default function CheckoutCard({
  name,
  price,
  quantity,
  image,
  missing,
}: Props) {

  const priceNumber =
    typeof price === "string"
      ? parseFloat(price.replace(/[^\d.]/g, ""))
      : price;

  const total =
    priceNumber > 0 ? (priceNumber * quantity).toFixed(1) : null;

  return (
    <View style={[styles.card, missing && styles.missingCard]}>

      {/* תמונה */}
      <Image source={image} style={styles.img} />

      {/* עטיפת טקסט (בלי RTL כאן!) */}
      <View style={styles.text}>

        {/* שם מוצר */}
        <ItimText size={16} weight="bold" style={styles.rtlText}>
          {name}
        </ItimText>

        {/* מחיר + כמות / הודעת חסר */}
        {missing ? (
          <ItimText
            size={14}
            color="#d9534f"
            weight="bold"
            style={[styles.rtlText, { marginTop: 3 }]}
          >
            ❌ לא נמכר בחנות זו
          </ItimText>
        ) : (
          <ItimText
            size={14}
            color="#555"
            style={[styles.rtlText, { marginTop: 2 }]}
          >
            {price} × {quantity}
          </ItimText>
        )}

        {/* מחיר כולל */}
        {!missing && total && (
          <ItimText
            size={16}
            weight="bold"
            style={[styles.rtlText, { marginTop: 4, color: "#197FF4" }]}
          >
            ₪{total}
          </ItimText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  missingCard: {
    opacity: 0.45,
    borderWidth: 1,
    borderColor: "#d9534f",
  },

  img: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 20,
    backgroundColor: "#ececec",
  },

  text: {
    flex: 1,
  },

  // 👇 RTL מותר רק ל-Text
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },
});
