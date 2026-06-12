import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import type { FurnitureItem } from "@workspace/api-client-react";

interface Props {
  item: FurnitureItem;
  inCart: boolean;
  onAddToCart: (id: string) => void;
  isAdding?: boolean;
}

export function FurnitureItemCard({ item, inCart, onAddToCart, isAdding }: Props) {
  const colors = useColors();

  const handleAdd = () => {
    if (inCart) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAddToCart(item.id);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      {!item.inStock && (
        <View style={[styles.soldOutBadge, { backgroundColor: colors.muted }]}>
          <Text style={[styles.soldOutText, { color: colors.mutedForeground }]}>Sold Out</Text>
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={[styles.brand, { color: colors.mutedForeground }]} numberOfLines={1}>
              {item.brand}
            </Text>
            <Text style={[styles.category, { color: colors.accent, backgroundColor: colors.goldLight }]}>
              {item.category}
            </Text>
          </View>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <View style={styles.footer}>
          <Text style={[styles.price, { color: colors.foreground }]}>
            ${item.price.toLocaleString()}
          </Text>
          <Pressable
            style={[
              styles.cartButton,
              {
                backgroundColor: inCart ? colors.secondary : colors.primary,
                borderColor: inCart ? colors.border : colors.primary,
              },
            ]}
            onPress={handleAdd}
            disabled={!item.inStock || inCart || isAdding}
          >
            {isAdding ? (
              <ActivityIndicator size="small" color={colors.primaryForeground} />
            ) : inCart ? (
              <Feather name="check" size={16} color={colors.primary} />
            ) : (
              <Feather name="plus" size={16} color={colors.primaryForeground} />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 180,
    backgroundColor: "#F0EDE8",
  },
  soldOutBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  soldOutText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  header: {
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  brand: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    flex: 1,
  },
  category: {
    fontSize: 10,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: "hidden",
    letterSpacing: 0.3,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});
