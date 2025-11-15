import React from 'react';
import { View, StyleSheet } from 'react-native';
import ItimText from './Itimtext';

interface BottomSummaryProps {
  amount: number | string;
  price: number | string;
  currency?: string;
  backgroundColor?: string;
}

export default function BottomSummary({
  amount,
  price,
  currency = '₪',
  backgroundColor = '#ffffffff',
}: BottomSummaryProps) {

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.item}>
        <ItimText size={18} color="#000">
          Amount
        </ItimText>
        <ItimText size={18} color="#000" weight="bold">
          {amount}
        </ItimText>
      </View>

      <View style={styles.item}>
        <ItimText size={18} color="#000">
          Price (Estimated)
        </ItimText>

        {/* ✔ FIX: Always pass a single string */}
        <ItimText size={18} color="#000" weight="bold">
          {`${price}${currency}`}
        </ItimText>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderColor: '#ffffffff',
  },
  item: {
    alignItems: 'center',
  },
});
