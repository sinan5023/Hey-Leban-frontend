// src/store/cartStore.js
import { create } from "zustand";

export const useCartStore = create((set, get) => ({
  products: {},
  paymentMethod: "cash",
  cashReceived: "",
  orderType: "DINE_IN",
  orderNote: "",
  discountAmount: 0,
  currentOrderId: null,
  currentOrderNo: null,
  isOfflineOrder: false,
  isKotPrinted: false,

  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setCashReceived: (value) => set({ cashReceived: value }),
  setOrderType: (type) => set({ orderType: type }),
  setOrderNote: (value) => set({ orderNote: value }),

  setDiscountAmount: (value) =>
    set({ discountAmount: Math.max(0, Number(value) || 0) }),

  clearDiscount: () => set({ discountAmount: 0 }),

  setCurrentOrder: (order) =>
    set({
      currentOrderId: order?.id || null,
      currentOrderNo: order?.orderNo || null,
    }),

  clearCurrentOrder: () =>
    set({ currentOrderId: null, currentOrderNo: null, isOfflineOrder: false, isKotPrinted: false }),

  // ─── restore an existing order into the cart ─────────────────────────────
  hydrateFromOrder: (order) => {
    const products = {};
    (order.orderItems || []).forEach((item) => {
      const key = item.productId || item.id;
      products[key] = {
        id: key,
        productId: key,
        name: item.name,
        description: item.description || "",
        price: Number(item.price || 0),
        qty: Number(item.quantity || 0),
        note: item.note || "",
      };
    });

    set({
      products,
      orderType: order.orderType || "DINE_IN",
      orderNote: order.note || "",
      discountAmount: Number(order.discountAmount || 0),
      currentOrderId: order.id || null,
      currentOrderNo: order.orderNo || null,
      isOfflineOrder: !!order.isOffline,
      isKotPrinted: order.kotStatus === "PRINTED" || order.kotStatus === "REPRINTED",
    });
  },

  addToCart: (productId, product) => {
    set((state) => {
      const existing = state.products[productId];
      return {
        products: {
          ...state.products,
          [productId]: existing
            ? { ...existing, qty: existing.qty + 1 }
            : {
                id: product.id,
                productId: product.id,
                name: product.name,
                description: product.description || "",
                price: Number(product.price),
                qty: 1,
                note: "",
              },
        },
      };
    });
  },

  increaseQty: (productId) =>
    set((state) => {
      const existing = state.products[productId];
      if (!existing) return state;
      return {
        products: {
          ...state.products,
          [productId]: { ...existing, qty: existing.qty + 1 },
        },
      };
    }),

  decreaseQty: (productId) =>
    set((state) => {
      const existing = state.products[productId];
      if (!existing) return state;
      if (existing.qty <= 1) {
        // Bug fix: prevent removing the very last item of an existing order
        if (state.currentOrderId && Object.keys(state.products).length <= 1) {
          return state;
        }
        const updated = { ...state.products };
        delete updated[productId];
        return { products: updated };
      }
      return {
        products: {
          ...state.products,
          [productId]: { ...existing, qty: existing.qty - 1 },
        },
      };
    }),

  setItemNote: (productId, note) =>
    set((state) => {
      const existing = state.products[productId];
      if (!existing) return state;
      return {
        products: { ...state.products, [productId]: { ...existing, note } },
      };
    }),

  clearCart: () =>
    set({
      products: {},
      orderType: "DINE_IN",
      orderNote: "",
      discountAmount: 0,
      currentOrderId: null,
      currentOrderNo: null,
      isOfflineOrder: false,
      isKotPrinted: false,
    }),

  getCartItems: () => {
    const { products } = get();
    return Object.values(products).map((product) => ({
      id: product.id,
      productId: product.productId,
      name: product.name,
      description: product.description || "",
      total: product.qty * product.price,
      quantity: product.qty,
      price: product.price,
      note: product.note || "",
    }));
  },

  getSubtotal: () => {
    const { products } = get();
    return Object.values(products).reduce(
      (sum, p) => sum + p.price * p.qty,
      0
    );
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = Number(get().discountAmount || 0);
    return Math.max(0, subtotal - discount);
  },

  getChange: () => {
    const total = get().getTotal();
    const received = Number(get().cashReceived || 0);
    return Math.max(0, received - total);
  },

  resetAfterPayment: () =>
    set({
      products: {},
      paymentMethod: "cash",
      cashReceived: "",
      orderType: "DINE_IN",
      orderNote: "",
      discountAmount: 0,
      currentOrderId: null,
      currentOrderNo: null,
    }),
}));