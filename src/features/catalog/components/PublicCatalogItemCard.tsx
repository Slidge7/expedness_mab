import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PublicItemDTO } from '../api/catalogService';
import { getItemImageSmallUri } from '../../items/utils/itemImageUtils';

interface Props {
  item: PublicItemDTO;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

export const PublicCatalogItemCard: React.FC<Props> = ({
  item,
  quantity,
  onIncrease,
  onDecrease,
}) => {
  const imageUri = getItemImageSmallUri(item.imageSmall);
  const lineTotal = item.unitPrice * quantity;

  return (
    <View style={styles.card}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={styles.placeholderText}>?</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.name}>{item.name}</Text>
        {item.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <Text style={styles.price}>
          {item.unitPrice.toFixed(2)}
          {item.unit ? ` / ${item.unit}` : ''}
        </Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity style={styles.qtyBtnWrap} onPress={onDecrease}>
            <Text style={styles.qtyBtn}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{quantity}</Text>
          <TouchableOpacity style={styles.qtyBtnWrap} onPress={onIncrease}>
            <Text style={styles.qtyBtn}>+</Text>
          </TouchableOpacity>
          {quantity > 0 ? (
            <Text style={styles.lineTotal}>{lineTotal.toFixed(2)}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: 12,
  },
  imagePlaceholder: {
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#94A3B8',
    fontSize: 24,
    fontWeight: '700',
  },
  body: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  description: { fontSize: 13, color: '#64748B', marginTop: 2 },
  price: { fontSize: 14, fontWeight: '600', color: '#2563EB', marginTop: 6 },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 12,
  },
  qtyBtnWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtn: {
    fontSize: 20,
    fontWeight: '700',
    color: '#334155',
  },
  qtyValue: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
    color: '#0F172A',
  },
  lineTotal: {
    marginLeft: 'auto',
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
});
