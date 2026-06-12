import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Image,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import {
  useListFurnitureItems,
  getListFurnitureItemsQueryKey,
} from "@workspace/api-client-react";
import type { FurnitureItem } from "@workspace/api-client-react";
import { FurnitureItemCard } from "@/components/FurnitureItemCard";
import { CartSheet } from "@/components/CartSheet";
import { useCart } from "@/context/CartContext";

const AI_ROOM_IMAGES = [
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800",
];

export default function ResultsView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { projectId, stylePreference } = useLocalSearchParams<{
    projectId: string;
    stylePreference: string;
  }>();

  const { addItem, isInCart, itemCount, openCart } = useCart();

  const aiRoomImage =
    AI_ROOM_IMAGES[Math.abs((projectId ?? "").length) % AI_ROOM_IMAGES.length];

  const { data: furnitureItems = [], isLoading } = useListFurnitureItems(undefined, {
    query: { queryKey: getListFurnitureItemsQueryKey() },
  });

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 16;

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <View style={[styles.pageHeader, { paddingTop: topPadding }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: "rgba(255,255,255,0.15)" }]}
        >
          <Feather name="arrow-left" size={20} color="#FFF" />
        </Pressable>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openCart();
          }}
          style={[styles.cartBtn, { backgroundColor: "rgba(255,255,255,0.15)" }]}
        >
          <Feather name="shopping-bag" size={20} color="#FFF" />
          {itemCount > 0 && (
            <View style={[styles.cartBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.cartBadgeText}>{itemCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.heroContainer}>
        <Image
          source={{ uri: aiRoomImage }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={[styles.heroGradient, StyleSheet.absoluteFill]} />
        <View style={styles.heroContent}>
          <View style={[styles.aiBadge, { backgroundColor: "rgba(200,169,110,0.3)", borderColor: "rgba(200,169,110,0.6)" }]}>
            <Feather name="zap" size={12} color="#C9A96E" />
            <Text style={styles.aiBadgeText}>AI Generated</Text>
          </View>
          <Text style={styles.heroTitle}>Your Redesigned Room</Text>
          {stylePreference && (
            <Text style={styles.heroSubtitle}>{stylePreference} style · Personalized for you</Text>
          )}
        </View>
      </View>

      <View style={[styles.sectionHeader, { paddingHorizontal: 24, marginTop: 24 }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Recommended Furniture
        </Text>
        <Text style={[styles.sectionCount, { color: colors.mutedForeground }]}>
          {furnitureItems.length} items
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isLoading ? (
        <>
          {renderHeader()}
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
              Curating your recommendations...
            </Text>
          </View>
        </>
      ) : (
        <FlatList
          data={furnitureItems}
          keyExtractor={(item: FurnitureItem) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <FurnitureItemCard
                item={item}
                inCart={isInCart(item.id)}
                onAddToCart={(id) => addItem(id)}
              />
            </View>
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingBottom: bottomPadding + 16 }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!furnitureItems.length}
        />
      )}

      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          openCart();
        }}
      >
        <Feather name="shopping-bag" size={22} color={colors.primaryForeground} />
        {itemCount > 0 && (
          <View style={[styles.fabBadge, { backgroundColor: colors.card }]}>
            <Text style={[styles.fabBadgeText, { color: colors.primary }]}>{itemCount}</Text>
          </View>
        )}
      </Pressable>

      <CartSheet />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listHeader: {
    marginBottom: 8,
  },
  pageHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFF",
  },
  heroContainer: {
    height: 320,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  heroContent: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    gap: 6,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  aiBadgeText: {
    color: "#C9A96E",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.72)",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  sectionCount: {
    fontSize: 14,
  },
  cardWrapper: {
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
  },
  fab: {
    position: "absolute",
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  fabBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  fabBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
