import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListCartItems,
  useAddCartItem,
  useRemoveCartItem,
  useCreateOrder,
  getListCartItemsQueryKey,
} from "@workspace/api-client-react";
import type { CartItem, FurnitureItem, Order } from "@workspace/api-client-react";

export function useCartViewModel() {
  const queryClient = useQueryClient();

  const {
    data: cartItems = [],
    isLoading: isLoadingCart,
    refetch: refetchCart,
  } = useListCartItems({ query: { queryKey: getListCartItemsQueryKey() } });

  const addMutation = useAddCartItem({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListCartItemsQueryKey() }),
    },
  });

  const removeMutation = useRemoveCartItem({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListCartItemsQueryKey() }),
    },
  });

  const orderMutation = useCreateOrder();

  const totalAmount = cartItems.reduce((sum: number, item: CartItem) => {
    const price = (item.furnitureItem as FurnitureItem).price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  const itemCount = cartItems.reduce(
    (sum: number, item: CartItem) => sum + item.quantity,
    0
  );

  const addItem = useCallback(
    (furnitureItemId: string) => {
      addMutation.mutate({ furnitureItemId, quantity: 1 });
    },
    [addMutation]
  );

  const removeItem = useCallback(
    (cartItemId: string) => {
      removeMutation.mutate(cartItemId);
    },
    [removeMutation]
  );

  const checkout = useCallback((): Promise<Order> => {
    return new Promise((resolve, reject) => {
      orderMutation.mutate(undefined, {
        onSuccess: (order) => {
          queryClient.setQueryData(getListCartItemsQueryKey(), []);
          resolve(order);
        },
        onError: reject,
      });
    });
  }, [orderMutation, queryClient]);

  const isInCart = useCallback(
    (furnitureItemId: string) => {
      return cartItems.some(
        (item: CartItem) => item.furnitureItemId === furnitureItemId
      );
    },
    [cartItems]
  );

  return {
    cartItems,
    isLoadingCart,
    totalAmount,
    itemCount,
    addItem,
    removeItem,
    checkout,
    refetchCart,
    isInCart,
    isAddingItem: addMutation.isPending,
    isRemovingItem: removeMutation.isPending,
    isCheckingOut: orderMutation.isPending,
  };
}
