import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import type { CartItem, FurnitureItem } from "@workspace/api-client-react";

interface OrderConfirmation {
  orderId: string;
  total: number;
  itemCount: number;
}

export function CartSheet() {
  const colors = useColors();
  const { cartItems, isCartVisible, closeCart, removeItem, totalAmount, itemCount, checkout, isCheckingOut } = useCart();
  const [orderConfirmed, setOrderConfirmed] = useState<OrderConfirmation | null>(null);

  const handleCheckout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const order = await checkout();
      setOrderConfirmed({
        orderId: order.id,
        total: totalAmount,
        itemCount,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert("Checkout Error", "Something went wrong. Please try again.");
    }
  };

  const handleClose = () => {
    setOrderConfirmed(null);
    closeCart();
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const furniture = item.furnitureItem as FurnitureItem;
    return (
      <View style={[styles.cartItem, { borderBottomColor: colors.border }]}>
        <Image
          source={{ uri: furniture.imageUrl }}
          style={[styles.itemImage, { backgroundColor: colors.muted }]}
          resizeMode="cover"
        />
        <View style={styles.itemDetails}>
          <Text style={[styles.itemBrand, { color: colors.mutedForeground }]}>
            {furniture.brand}
          </Text>
          <Text style={[styles.itemName, { color: colors.foreground }]} numberOfLines={2}>
            {furniture.name}
          </Text>
          <Text style={[styles.itemPrice, { color: colors.primary }]}>
            ${(furniture.price * item.quantity).toLocaleString()}
          </Text>
        </View>
        <Pressable
          style={[styles.removeBtn, { backgroundColor: colors.muted }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            removeItem(item.id);
          }}
        >
          <Feather name="trash-2" size={15} color={colors.mutedForeground} />
        </Pressable>
      </View>
    );
  };

  return (
    <Modal
      visible={isCartVisible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {orderConfirmed ? (
            <View style={styles.successContainer}>
              <View style={[styles.successIcon, { backgroundColor: colors.goldLight }]}>
                <Feather name="check-circle" size={48} color={colors.primary} />
              </View>
              <Text style={[styles.successTitle, { color: colors.foreground }]}>
                Order Confirmed
              </Text>
              <Text style={[styles.successOrderId, { color: colors.mutedForeground }]}>
                {orderConfirmed.orderId}
              </Text>
              <Text style={[styles.successDetail, { color: colors.mutedForeground }]}>
                {orderConfirmed.itemCount} items · ${orderConfirmed.total.toLocaleString()}
              </Text>
              <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
                Your designer will be in touch within 24 hours.
              </Text>
              <Pressable
                style={[styles.doneButton, { backgroundColor: colors.primary }]}
                onPress={handleClose}
              >
                <Text style={[styles.doneButtonText, { color: colors.primaryForeground }]}>
                  Done
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.sheetHeader}>
                <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
                  Your Cart
                </Text>
                <Text style={[styles.sheetCount, { color: colors.mutedForeground }]}>
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </Text>
              </View>

              {cartItems.length === 0 ? (
                <View style={styles.emptyState}>
                  <Feather name="shopping-bag" size={40} color={colors.border} />
                  <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                    Your cart is empty
                  </Text>
                  <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                    Add furniture from your results to get started
                  </Text>
                </View>
              ) : (
                <>
                  <FlatList
                    data={cartItems}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCartItem}
                    style={styles.list}
                    showsVerticalScrollIndicator={false}
                  />
                  <View style={[styles.footer, { borderTopColor: colors.border }]}>
                    <View style={styles.totalRow}>
                      <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>
                        Total
                      </Text>
                      <Text style={[styles.totalAmount, { color: colors.foreground }]}>
                        ${totalAmount.toLocaleString()}
                      </Text>
                    </View>
                    <Pressable
                      style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
                      onPress={handleCheckout}
                      disabled={isCheckingOut}
                    >
                      {isCheckingOut ? (
                        <ActivityIndicator color={colors.primaryForeground} />
                      ) : (
                        <Text style={[styles.checkoutText, { color: colors.primaryForeground }]}>
                          Checkout All
                        </Text>
                      )}
                    </Pressable>
                  </View>
                </>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(28, 24, 18, 0.5)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingBottom: 34,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  sheetCount: {
    fontSize: 14,
  },
  list: {
    paddingHorizontal: 24,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  itemDetails: {
    flex: 1,
    gap: 2,
  },
  itemBrand: {
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 19,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "700",
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 14,
    borderTopWidth: 1,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  totalAmount: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -1,
  },
  checkoutButton: {
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptySub: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  successContainer: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 32,
    gap: 12,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  successOrderId: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  successDetail: {
    fontSize: 15,
  },
  successSub: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 4,
  },
  doneButton: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
