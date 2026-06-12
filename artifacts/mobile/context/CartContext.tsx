import React, { createContext, useContext, useState } from "react";
import { useCartViewModel } from "@/viewmodels/CartViewModel";

interface CartContextValue extends ReturnType<typeof useCartViewModel> {
  isCartVisible: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [isCartVisible, setIsCartVisible] = useState(false);
  const cartVM = useCartViewModel();

  const openCart = () => setIsCartVisible(true);
  const closeCart = () => setIsCartVisible(false);

  return (
    <CartContext.Provider value={{ ...cartVM, isCartVisible, openCart, closeCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
