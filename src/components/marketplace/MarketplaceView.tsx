"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  MKT_CATEGORIES,
  MKT_DATA,
  type MktCategoryKey,
  type MktItem,
  totalMarketplaceItems,
} from "@/data/marketplace-data";
import { ModalShell } from "@/components/modals/ModalShell";

function fmt(n: number): string {
  return `ETB ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function parseRating(r: string): number {
  const m = /^([\d.]+)/.exec(r);
  return m ? parseFloat(m[1]!) : 0;
}

function MktCard({
  item,
  inCart,
  onOrder,
  onToggleCart,
}: {
  item: MktItem;
  inCart: boolean;
  onOrder: (item: MktItem) => void;
  onToggleCart: (item: MktItem) => void;
}) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-loom-border bg-loom-surface shadow-loom-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-loom-md">
      <div
        className="relative flex h-[100px] items-center justify-center text-[40px]"
        style={{ background: item.bg }}
      >
        <span className="text-[42px] leading-none">{item.emoji}</span>
        {item.badge === "hot" ? (
          <span className="absolute right-2 top-2 rounded bg-loom-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
            🔥 HOT
          </span>
        ) : null}
        {item.badge === "new" ? (
          <span className="absolute right-2 top-2 rounded bg-loom-blue-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
            NEW
          </span>
        ) : null}
        {item.badge === "sale" ? (
          <span className="absolute right-2 top-2 rounded bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
            SALE
          </span>
        ) : null}
      </div>
      <div className="px-4 py-3.5">
        <div className="mb-1 text-[13.5px] font-bold text-loom-text-900">{item.name}</div>
        <div className="mb-2.5 text-xs leading-relaxed text-loom-text-400">{item.desc}</div>
        {item.eta ? (
          <div className="mb-2 text-[11.5px] font-semibold text-emerald-600">
            ⚡ {item.eta} availability
          </div>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          <div>
            <div className="font-mono text-sm font-bold text-loom-text-900">
              {fmt(item.price)}
              <span className="ml-0.5 text-[11px] font-normal text-loom-text-400">
                /{item.unit}
              </span>
            </div>
            <div className="text-[11.5px] font-semibold text-loom-amber-600">{item.rating}</div>
          </div>
          {inCart ? (
            <button
              type="button"
              onClick={() => onToggleCart(item)}
              className="min-h-11 w-full shrink-0 rounded-md border border-emerald-600 bg-emerald-600 px-3 py-2 text-[12px] font-semibold text-white shadow-loom-xs hover:bg-emerald-700 sm:min-h-0 sm:w-auto sm:px-2.5 sm:py-1.5"
            >
              ✓ In Cart
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOrder(item)}
              className="min-h-11 w-full shrink-0 rounded-md border border-loom-blue-600 bg-loom-blue-600 px-3 py-2 text-[12px] font-semibold text-white shadow-loom-xs hover:border-[#1d4ed8] hover:bg-[#1d4ed8] sm:min-h-0 sm:w-auto sm:px-2.5 sm:py-1.5"
            >
              Order Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function MarketplaceView() {
  const [activeCategory, setActiveCategory] = useState<MktCategoryKey>("materials");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [cart, setCart] = useState<MktItem[]>([]);
  const [orderItem, setOrderItem] = useState<MktItem | null>(null);
  const [qty, setQty] = useState(1);

  const filteredSorted = useMemo(() => {
    const baseItems = MKT_DATA[activeCategory] ?? [];
    const list = baseItems.filter(
      (i) =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.desc.toLowerCase().includes(search.toLowerCase())
    );
    const copy = [...list];
    if (sort === "price-asc") copy.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") copy.sort((a, b) => b.price - a.price);
    else if (sort === "rating") copy.sort((a, b) => parseRating(b.rating) - parseRating(a.rating));
    return copy;
  }, [activeCategory, search, sort]);

  const totalServices = totalMarketplaceItems();

  function addToCart(item: MktItem) {
    setCart((c) => (c.some((x) => x.id === item.id) ? c : [...c, item]));
    toast.success(`🛒 "${item.name}" added to cart`);
    setOrderItem(null);
  }

  function removeFromCart(item: MktItem) {
    setCart((c) => c.filter((x) => x.id !== item.id));
    toast.message(`Removed "${item.name}" from cart`);
  }

  function openOrder(item: MktItem) {
    setOrderItem(item);
    setQty(1);
  }

  const catLabel = MKT_CATEGORIES.find((c) => c.key === activeCategory)?.label ?? "";

  return (
    <div className="animate-loom-page-in space-y-6">
      <div className="relative overflow-hidden rounded-[18px] bg-gradient-to-br from-[#1e40af] via-[#2563eb] to-[#7c3aed] px-8 py-7 text-white shadow-loom-md">
        <div
          className="pointer-events-none absolute inset-0 opacity-100"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='200' viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='rgba(255,255,255,0.05)' stroke-width='1'%3E%3Ccircle cx='350' cy='100' r='120'/%3E%3Ccircle cx='350' cy='100' r='80'/%3E%3Ccircle cx='350' cy='100' r='40'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundPosition: "right center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="relative z-[1]">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-semibold">
            🏪 Building Services Marketplace
          </div>
          <h2 className="mb-1.5 text-[22px] font-extrabold leading-tight tracking-[-0.3px]">
            Everything your building needs,
            <br />
            in one place
          </h2>
          <p className="mb-5 text-sm opacity-80">
            Order supplies, book services, and hire crews — all tracked in your PMS
          </p>
          <div className="flex flex-wrap gap-6 md:gap-8">
            <div className="text-center">
              <div className="font-mono text-[22px] font-extrabold">{totalServices}+</div>
              <div className="mt-0.5 text-[11px] opacity-70">Services</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-[22px] font-extrabold">4</div>
              <div className="mt-0.5 text-[11px] opacity-70">Categories</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-[22px] font-extrabold">Same-day</div>
              <div className="mt-0.5 text-[11px] opacity-70">Availability</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-[22px] font-extrabold">★ 4.7</div>
              <div className="mt-0.5 text-[11px] opacity-70">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:gap-3.5 md:overflow-visible md:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
        {MKT_CATEGORIES.map((c) => {
          const count = MKT_DATA[c.key].length;
          const active = activeCategory === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setActiveCategory(c.key)}
              className={`shrink-0 snap-start rounded-[14px] border-[1.5px] px-4 py-5 text-center shadow-loom-sm transition-all duration-150 md:min-w-0 md:snap-none ${
                active
                  ? "min-w-[148px] border-loom-blue-500 bg-loom-blue-50 shadow-loom-md md:min-w-0"
                  : "min-w-[148px] border-loom-border bg-loom-surface hover:-translate-y-0.5 hover:border-loom-blue-500 hover:shadow-loom-md md:min-w-0"
              } `}
            >
              <div className="mb-2.5 text-[28px] leading-none">{c.icon}</div>
              <div className="mb-1 text-[13px] font-bold text-loom-text-900">{c.label}</div>
              <div className="text-[11.5px] text-loom-text-400">{count} available</div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-2.5">
        <div className="flex min-h-[36px] flex-1 items-center gap-2 rounded-md border-[1.5px] border-loom-border bg-loom-input px-3 py-1.5 shadow-loom-xs focus-within:border-loom-blue-500 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]">
          <svg
            className="h-[15px] w-[15px] shrink-0 stroke-loom-text-400"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="min-w-0 flex-1 border-0 bg-transparent py-1 font-sans text-[13px] text-loom-text-900 outline-none placeholder:text-loom-text-400"
            placeholder={`Search ${catLabel}…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-9 shrink-0 rounded-md border-[1.5px] border-loom-border bg-loom-input px-3 text-[13px] text-loom-text-900 shadow-loom-xs outline-none focus:border-loom-blue-500"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">Sort: Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
        {cart.length > 0 ? (
          <button
            type="button"
            onClick={() => toast.message(`Cart: ${cart.length} item(s) — checkout coming soon`)}
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-loom-blue-600 bg-loom-blue-600 px-4 text-[13px] font-semibold text-white shadow-loom-xs hover:border-[#1d4ed8] hover:bg-[#1d4ed8]"
          >
            🛒 Cart ({cart.length})
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSorted.map((item) => (
          <MktCard
            key={item.id}
            item={item}
            inCart={cart.some((c) => c.id === item.id)}
            onOrder={openOrder}
            onToggleCart={(i) => (cart.some((c) => c.id === i.id) ? removeFromCart(i) : addToCart(i))}
          />
        ))}
      </div>

      {filteredSorted.length === 0 ? (
        <p className="py-12 text-center text-sm text-loom-text-400">No items match your search.</p>
      ) : null}

      <ModalShell
        open={!!orderItem}
        onClose={() => setOrderItem(null)}
        title={orderItem ? `Order: ${orderItem.name}` : "Order"}
        subtitle="Complete your order details below"
        widthClassName="max-w-[520px]"
        footer={
          <>
            <button
              type="button"
              onClick={() => setOrderItem(null)}
              className="rounded-md border border-loom-border bg-loom-surface px-4 py-2 text-[13px] font-semibold text-loom-text-700 shadow-loom-xs hover:bg-loom-hover"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => orderItem && addToCart(orderItem)}
              className="rounded-md border border-loom-blue-600 bg-loom-blue-600 px-4 py-2 text-[13px] font-semibold text-white shadow-loom-xs hover:border-[#1d4ed8] hover:bg-[#1d4ed8]"
            >
              Place order
            </button>
          </>
        }
      >
        {orderItem ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[12.5px] font-medium text-loom-text-700">
                Assign to property
              </label>
              <select className="w-full rounded-md border-[1.5px] border-loom-border bg-loom-input px-3 py-2 text-[13.5px] shadow-loom-xs outline-none focus:border-loom-blue-500">
                <option>— Select on next step —</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-[12.5px] font-medium text-loom-text-700">
                  Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full rounded-md border-[1.5px] border-loom-border bg-loom-input px-3 py-2 font-mono text-[13.5px] shadow-loom-xs outline-none focus:border-loom-blue-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12.5px] font-medium text-loom-text-700">
                  Preferred date
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border-[1.5px] border-loom-border bg-loom-input px-3 py-2 text-[13.5px] shadow-loom-xs outline-none focus:border-loom-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[12.5px] font-medium text-loom-text-700">
                Special instructions
              </label>
              <textarea
                rows={3}
                placeholder="Access instructions, parking, etc."
                className="w-full resize-y rounded-md border-[1.5px] border-loom-border bg-loom-input px-3 py-2 text-[13.5px] shadow-loom-xs outline-none focus:border-loom-blue-500"
              />
            </div>
            <div className="rounded-md bg-loom-bg px-3.5 py-3.5">
              <div className="mb-1.5 flex justify-between text-[13px]">
                <span className="text-loom-text-500">Item</span>
                <span className="font-semibold text-loom-text-900">{orderItem.name}</span>
              </div>
              <div className="mb-1.5 flex justify-between text-[13px]">
                <span className="text-loom-text-500">Unit price</span>
                <span className="font-mono font-semibold">
                  {fmt(orderItem.price)}/{orderItem.unit}
                </span>
              </div>
              <div className="flex justify-between border-t border-loom-border pt-2 text-[13px]">
                <span className="font-bold text-loom-text-900">Total</span>
                <span className="font-mono text-base font-extrabold text-loom-blue-600">
                  {fmt(orderItem.price * qty)}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </ModalShell>
    </div>
  );
}
