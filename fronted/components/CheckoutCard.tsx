import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ItimText from "./Itimtext";

const BRAND = "#197FF4";

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
      {/* Product Image */}
      <Image source={image} style={styles.img} />

      {/* Right Section */}
      <View style={styles.rightSection}>
        {/* Title */}
        <ItimText size={15} color="#1a1a1a" weight="600" style={styles.rtlText} numberOfLines={2}>
          {name}
        </ItimText>

        {/* Price & Quantity Row */}
        <View style={styles.bottomRow}>
          {missing ? (
            <View style={styles.missingBadge}>
              <MaterialCommunityIcons name="alert-circle" size={14} color="#ef4444" />
              <ItimText size={12} color="#ef4444" weight="600" style={{ marginLeft: 4 }}>
                Not available
              </ItimText>
            </View>
          ) : (
            <>
              <View style={styles.qtyBadge}>
                <MaterialCommunityIcons name="package-variant" size={14} color={BRAND} />
                <ItimText size={14} color={BRAND} weight="bold" style={{ marginLeft: 6 }}>
                  ×{quantity}
                </ItimText>
              </View>

              <View style={styles.priceContainer}>
                {total && (
                  <ItimText size={16} color={BRAND} weight="bold">
                    ₪{total}
                  </ItimText>
                )}
                <ItimText size={11} color="#9ca3af" style={{ marginTop: 2 }}>
                  {price} each
                </ItimText>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  missingCard: {
    opacity: 0.7,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
  },
  img: {
    width: 70,
    height: 70,
    borderRadius: 12,
    resizeMode: "contain",
  },
  rightSection: {
    flex: 1,
    marginLeft: 12,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  qtyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  missingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },
});
