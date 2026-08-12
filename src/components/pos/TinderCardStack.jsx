// src/components/pos/TinderCardStack.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

// Helper to format currency
const formatMoney = (value) => {
  const numeric = Number(value || 0);
  return numeric.toFixed(2);
};

function TinderCard({
  product,
  quantity,
  stockCount,
  onSwipe,
  index,
  totalCards,
  addToCart,
}) {
  const isTop = index === totalCards - 1;
  const isNext = index === totalCards - 2;

  // Swipe exit motion state
  const [exitDirection, setExitDirection] = useState(null);

  const x = useMotionValue(0);
  
  // Motion transformations for top card
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const opacityAdd = useTransform(x, [0, 80], [0, 1]);
  const opacitySkip = useTransform(x, [-80, 0], [1, 0]);
  const cardBg = useTransform(
    x,
    [-150, 0, 150],
    ["rgba(239, 68, 68, 0.08)", "rgba(255, 255, 255, 1)", "rgba(16, 185, 129, 0.08)"]
  );

  const currentStock = stockCount;
  const isOutOfStock = currentStock <= 0;

  const handleDragEnd = (event, info) => {
    if (!isTop || isOutOfStock) return;

    const swipeThreshold = 120;
    const velocityThreshold = 400;

    const dragX = info.offset.x;
    const velocityX = info.velocity.x;

    if (dragX > swipeThreshold || velocityX > velocityThreshold) {
      triggerSwipe("right");
    } else if (dragX < -swipeThreshold || velocityX < -velocityThreshold) {
      triggerSwipe("left");
    }
  };

  const triggerSwipe = (direction) => {
    setExitDirection(direction);
    // Exit animation duration is slightly faster (0.2s)
    setTimeout(() => {
      onSwipe(direction, product.id, product);
    }, 200);
  };

  // Stagger/delay between cards underneath
  const depth = totalCards - 1 - index; // 0 for top, 1 for next, etc.
  const scale = isTop ? 1 : isNext ? 0.95 : 0.9;
  const yOffset = isTop ? 0 : isNext ? 12 : 24;
  const opacity = isTop ? 1 : isNext ? 0.9 : 0.65;

  return (
    <motion.div
      style={{
        x: isTop && !exitDirection ? x : 0,
        rotate: isTop && !exitDirection ? rotate : 0,
        backgroundColor: isTop && !exitDirection ? cardBg : "rgb(255, 255, 255)",
        zIndex: index,
      }}
      drag={isTop && !isOutOfStock && !exitDirection ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={
        exitDirection
          ? {
              x: exitDirection === "right" ? 500 : -500,
              opacity: 0,
              rotate: exitDirection === "right" ? 30 : -30,
            }
          : {
              x: 0,
              rotate: 0,
              scale,
              y: yOffset,
              opacity,
            }
      }
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 22,
        // Premium easing for the underneath card scale/opacity animation
        ease: isTop ? undefined : [0.16, 1, 0.3, 1],
        duration: isTop ? undefined : 0.35,
        delay: !isTop ? depth * 0.05 : 0,
      }}
      className={`absolute w-full h-full rounded-3xl border border-[#ded9d3] p-6 shadow-xl flex flex-col justify-between select-none ${
        isTop ? "cursor-grab active:cursor-grabbing" : ""
      } ${isOutOfStock ? "bg-red-50 border-red-200" : "bg-white"}`}
    >
      {/* Visual Overlay Indicators */}
      {isTop && !isOutOfStock && (
        <>
          <motion.div
            style={{ opacity: opacityAdd }}
            className="absolute left-6 top-6 rounded-xl border-4 border-emerald-500 bg-emerald-50 px-4 py-2 text-xl font-extrabold uppercase tracking-widest text-emerald-600 rotate-[-10deg] pointer-events-none"
          >
            ADD
          </motion.div>
          <motion.div
            style={{ opacity: opacitySkip }}
            className="absolute right-6 top-6 rounded-xl border-4 border-rose-500 bg-rose-50 px-4 py-2 text-xl font-extrabold uppercase tracking-widest text-rose-600 rotate-[10deg] pointer-events-none"
          >
            SKIP
          </motion.div>
        </>
      )}

      {/* Card Header */}
      <div className="flex justify-between items-start">
        <span className="rounded-full bg-[#f8f3ec] border border-[#ded9d3] px-3 py-1 text-xs font-bold text-[#54433f] uppercase tracking-wide">
          {product.categoryName || "Product"}
        </span>
        {quantity > 0 && (
          <span className="flex h-7 min-w-[28px] items-center justify-center rounded-full bg-[#E8A020] px-2 text-xs font-bold text-white shadow-sm ring-2 ring-white">
            {quantity} in Cart
          </span>
        )}
      </div>

      {/* Card Main Info */}
      <div className="flex-1 flex flex-col justify-center items-center text-center my-4 space-y-3">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#3d0c02] to-[#feb234] flex items-center justify-center text-white text-4xl shadow-md">
          🍔
        </div>
        <div>
          <h3 className="text-2xl font-extrabold text-[#3d0c02] tracking-tight line-clamp-2">
            {product.name}
          </h3>
          {product.description ? (
            <p className="mt-2 text-sm text-[#54433f] line-clamp-3 leading-relaxed max-w-[240px]">
              {product.description}
            </p>
          ) : (
            <p className="mt-2 text-xs text-[#54433f]/40 italic">No description available</p>
          )}
        </div>
        <p className="text-3xl font-black text-[#E8A020] tracking-tight mt-1">
          ₹{formatMoney(product.price)}
        </p>
      </div>

      {/* Card Footer Status / Actions */}
      <div className="border-t border-[#f3eee8] pt-4 flex flex-col items-center gap-4">
        <div
          className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${
            isOutOfStock
              ? "bg-rose-100 text-rose-700"
              : currentStock <= 5
              ? "bg-amber-100 text-amber-700"
              : "bg-emerald-100 text-[#2E7D32]"
          }`}
        >
          {isOutOfStock
            ? "Out of Stock"
            : currentStock <= 5
            ? `Low Stock: ${currentStock} left`
            : `Stock: ${currentStock}`}
        </div>

        {/* Action Button Row */}
        {isTop && (
          <div className="flex gap-4 w-full justify-center">
            <button
              type="button"
              onClick={() => triggerSwipe("left")}
              className="w-14 h-14 rounded-full bg-white border border-[#ded9d3] flex items-center justify-center text-rose-500 shadow-md hover:bg-rose-50 hover:border-rose-300 transition-colors active:scale-90"
              title="Skip Item"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => triggerSwipe("right")}
              className="w-14 h-14 rounded-full bg-[#3d0c02] flex items-center justify-center text-white shadow-md hover:bg-[#5a1204] transition-colors active:scale-90 disabled:opacity-50 disabled:pointer-events-none"
              title="Add to Cart"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function TinderCardStack({
  products = [],
  cartQtyMap = {},
  inventoryMap = {},
  baseCartQtyMap = {},
  productToBaseId = {},
  addToCart,
}) {
  const [cards, setCards] = useState([]);

  // Sync products into local card stack state (in reverse order for stacked absolute layout rendering)
  useEffect(() => {
    setCards([...products].reverse());
  }, [products]);

  const handleSwipe = (direction, cardId, product) => {
    if (direction === "right") {
      addToCart(cardId, product);
    }
    setCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  const resetStack = () => {
    setCards([...products].reverse());
  };

  // Performance optimization: only render the top 3 cards in the stack
  const visibleCards = cards.slice(-3);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[440px]">
      <div className="relative w-full max-w-[340px] aspect-[4/5] sm:aspect-[3/4]">
        {visibleCards.length === 0 ? (
          <div className="absolute inset-0 rounded-3xl border border-dashed border-[#ded9d3] bg-[#f8f3ec]/40 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <span className="text-4xl">✨</span>
            <div>
              <h3 className="font-extrabold text-[#3d0c02] text-lg">No more items</h3>
              <p className="text-xs text-[#54433f] mt-1 max-w-[200px]">
                Swipe through all products in this category or switch categories to browse more.
              </p>
            </div>
            {products.length > 0 && (
              <button
                type="button"
                onClick={resetStack}
                className="h-10 px-5 bg-[#3d0c02] text-white rounded-xl text-xs font-bold hover:bg-[#5a1204] transition-colors"
              >
                ↺ Swipe Again
              </button>
            )}
          </div>
        ) : (
          visibleCards.map((product, idx) => {
            const baseId = productToBaseId[product.id];
            const ownCartQty = cartQtyMap[product.id] || 0;

            const displayStockCount = inventoryMap[product.id] || 0;

            return (
              <TinderCard
                key={product.id}
                product={product}
                quantity={ownCartQty}
                stockCount={displayStockCount}
                onSwipe={handleSwipe}
                index={idx}
                totalCards={visibleCards.length}
                addToCart={addToCart}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
