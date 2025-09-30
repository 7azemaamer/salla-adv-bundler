import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Pop‑out Checkout Bundle — Modern Boxy Demo (phone‑first)
 * - Minimal, modern, boxy UI (light greys)
 * - Bundles are primary offers (Starter / Friends / Family)
 * - Dynamic gifts + computed bundle value from MSRP
 * - Sticky summary (compact on small/short viewports) + 6:00:00 countdown
 * - Reviews carousel with smooth horizontal scroll (no viewport jump)
 * - Discount code gated by mobile sign‑in (<640px)
 * - Test harness exposed as window.__runCheckoutTests (no top-level code)
 */

// ===== Pure helpers (UI + testable) =====
function formatHMS(seconds) {
  const s = Math.max(0, seconds | 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":");
}

// Tick helper: counts down by 1; if at 0, auto-resets to initial
function tickDown(seconds, initial) {
  const s = Number(seconds) | 0;
  const init = Math.max(0, Number(initial) | 0);
  if (s <= 0) return init; // auto-reset
  return s - 1;
}

function calcProgress(remain, threshold) {
  const spent = Math.max(0, threshold - Math.max(0, remain));
  if (threshold <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((spent / threshold) * 100)));
}

function shouldRequireSignInForDiscount(width) { return width < 640; }
function wrapIndex(i, len) { return ((i % len) + len) % len; }
function isShortViewport(h) { return h < 760; }
function isMobileWidth(w) { return w < 640; }

// Compute a centered scrollLeft for a child inside a horizontal scroller
function computeCenterScrollLeft(containerWidth, childOffsetLeft, childWidth){
  const center = childOffsetLeft - (containerWidth - childWidth)/2;
  return Math.max(0, center);
}

// ----- Core product (same item as bundle jug)
const PRODUCT = {
  id: "tripod-bottle-27L",
  name: "The Tripod Jug - Matte",
  price: 199, // discounted SAR
  compareAt: 259, // original SAR
  variants: [
    { id: "black", name: "Matte Black" },
    { id: "stone", name: "Stone Grey" },
    { id: "ice", name: "Ice White" },
  ],
};

// Optional add-ons (not primary)
const ADDONS = [
  { id: "straw", name: "Wide Straw Lid", price: 29 },
  { id: "sleeve", name: "Neoprene Sleeve", price: 49 },
  { id: "filter", name: "Inline Filter", price: 39 },
];

// Gift catalog (values used to compute dynamic savings)
const GIFT_CATALOG = {
  ebook: { id: "ebook", name: "start now (e-book)", value: 199 },
  calculator: { id: "calculator", name: "The Hydration Calculator (E-tool)", value: 49 },
  tripodBottle: { id: "tripodBottle", name: "The Tripod Bottle", value: 159 },
  foldableBottle: { id: "foldableBottle", name: "The foldable bottle", value: 199 },
  jug27L: { id: "jug27L", name: "2.7L Jug", value: 259 },
};

// MSRP table for bundle value computation
const MSRP = { jug27L: 259, tripodBottle: 159, foldableBottle: 199, ebook: 199, calculator: 49 };

function bundleValue(b){
  // Harden against undefined/null input and missing fields
  if (!b || typeof b !== 'object') return 0;
  const jugCount = Number(b.jugCount) || 0;
  const jugVal = jugCount * MSRP.jug27L; // paid jugs only
  const gifts = Array.isArray(b.gifts) ? b.gifts : [];
  const giftsVal = gifts.reduce((s, id) => s + (MSRP[id] || (GIFT_CATALOG[id]?.value || 0)), 0);
  return jugVal + giftsVal;
}

// Bundles are the primary offers
const BUNDLES = [
  {
    id: "starter",
    name: "Starter bundle",
    price: 199,
    jugCount: 1,
    items: [
      "2.7L Jug",
      "start now (e-book) — FREE",
      "The Hydration Calculator (E-tool) — FREE",
    ],
    badge: "Save more",
    gifts: ["ebook", "calculator"],
  },
  {
    id: "friends",
    name: "Friends bundle",
    price: 398,
    jugCount: 2,
    items: [
      "2 × 2.7L Jug",
      "The Tripod Bottle — FREE",
      "The foldable bottle — FREE",
      "start now (e-book) — FREE",
      "The Hydration Calculator (E-tool) — FREE",
    ],
    badge: "Best value",
    gifts: ["tripodBottle", "foldableBottle", "ebook", "calculator"],
  },
  {
    id: "family",
    name: "Family bundle",
    price: 796,
    jugCount: 4,
    items: [
      "4 × 2.7L Jug",
      "+ 2.7L Jug — FREE",
      "The Tripod Bottle — FREE",
      "The foldable bottle — FREE",
      "start now (e-book) — FREE",
      "The Hydration Calculator (E-tool) — FREE",
    ],
    badge: "Max savings",
    gifts: ["jug27L", "tripodBottle", "foldableBottle", "ebook", "calculator"], // includes extra free jug
  },
];

const FREE_SHIPPING_THRESHOLD = 300; // SAR

export default function CheckoutDemo() {
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState(PRODUCT.variants[0].id);
  const [qty, setQty] = useState(1);
  const [addons, setAddons] = useState({}); // id -> qty
  const [selectedBundle, setSelectedBundle] = useState(null); // id | null

  // Expose test harness for devtools without top-level conditionals
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // attach once per session
      if (!window.__CHECKOUT_TESTS_ATTACHED) {
        window.__CHECKOUT_TESTS_ATTACHED = true;
        window.__runCheckoutTests = runUiHelperTests;
      }
    }
  }, []);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") setOpen(false); }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const lineItems = useMemo(() => {
    const base = [{ id: PRODUCT.id, name: PRODUCT.name, price: PRODUCT.price, compareAt: PRODUCT.compareAt, qty }];
    const addOnLines = Object.entries(addons)
      .filter(([, q]) => q > 0)
      .map(([id, q]) => {
        const a = ADDONS.find((x) => x.id === id);
        return { id: a.id, name: a.name, price: a.price, qty: q };
      });
    const bundleLine = selectedBundle ? (() => {
      const b = BUNDLES.find((x) => x.id === selectedBundle);
      const p = b && typeof b.price === 'number' ? b.price : 0;
      return b ? [{ id: `bundle:${b.id}`, name: b.name, price: p, qty: 1 }] : [];
    })() : [];
    return [...base, ...addOnLines, ...bundleLine];
  }, [qty, addons, selectedBundle]);

  const subtotal = lineItems.reduce((sum, l) => sum + l.price * l.qty, 0);
  const individualSavings = (PRODUCT.compareAt - PRODUCT.price) * qty;

  const selectedGifts = useMemo(() => {
    if (!selectedBundle) return null;
    const b = BUNDLES.find((x) => x.id === selectedBundle);
    if (!b) return null;
    return (b.gifts || []).map((gid) => GIFT_CATALOG[gid]).filter(Boolean);
  }, [selectedBundle]);

  const giftValue = useMemo(() => {
    if (!selectedGifts) return 0;
    return selectedGifts.reduce((s, g) => s + (typeof g.value === 'number' ? g.value : 0), 0);
  }, [selectedGifts]);

  const bundleSavings = individualSavings + giftValue;
  const remainToFreeShip = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  function incAddon(id) { setAddons((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 })); }
  function decAddon(id) { setAddons((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) })); }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-1)]">
      {/* Design tokens */}
      <style>{`
        :root{
          /* Conversion-first light grey palette */
          --bg-page:  #FAFBFC; /* app background */
          --bg-soft:  #F6F8FA; /* near-white grey */
          --bg-elev:  #F4F6F8; /* elevated surface */
          --bg-panel: #F2F4F7; /* slide-over chrome */
          --bg-card:  #FFFFFF; /* cards kept white for contrast */
          --bg-thumb: #EEF1F4; /* image placeholder */

          --border:   #E5E8EC; /* subtle hairline */
          --text-1:   #0E1012; /* primary text */
          --text-2:   #60646C; /* secondary text */

          --ok:       #2F3136; /* neutral emphasis */
          --brand:    #0E1012; /* CTA: near-black for contrast */

          --shadow-1: 0 1px 2px rgba(16,24,40,.06), 0 1px 1px rgba(16,24,40,.04);
          --shadow-2: 0 10px 28px rgba(15,17,19,.08);
        }
        .no-scrollbar{ scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar{ display: none; }
      `}</style>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight mb-3">Pop‑out Checkout Bundle — Modern Boxy Demo</h1>
        <p className="text-[15px] text-[var(--text-2)] mb-6">Bundles first, dynamic gifts, sticky summary, and phone‑first controls.</p>

        <div className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-elev)] p-6 flex items-center justify-between">
          <div>
            <div className="text-[15px] font-medium">Try the pop‑out checkout</div>
            <div className="text-[14px] text-[var(--text-2)]">Slide-over, modern dropdowns & buttons, sticky summary.</div>
          </div>
          <button onClick={() => setOpen(true)} className="h-12 px-5 rounded-[16px] bg-[var(--brand)] text-white font-medium tracking-[-0.01em] shadow-[var(--shadow-2)] hover:opacity-95 active:opacity-90">Open checkout</button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-40">
          <div onClick={() => setOpen(false)} className="absolute inset-0 bg-black/60" />
          <Panel
            variant={variant}
            setVariant={setVariant}
            qty={qty}
            setQty={setQty}
            addons={addons}
            incAddon={incAddon}
            decAddon={decAddon}
            selectedBundle={selectedBundle}
            setSelectedBundle={setSelectedBundle}
            lineItems={lineItems}
            subtotal={subtotal}
            bundleSavings={bundleSavings}
            remainToFreeShip={remainToFreeShip}
            onClose={() => setOpen(false)}
            selectedGifts={selectedGifts}
            giftValue={giftValue}
          />
        </div>
      )}
    </div>
  );
}

function Panel(props) {
  const { variant, setVariant, qty, setQty, addons, incAddon, decAddon, selectedBundle, setSelectedBundle, subtotal, bundleSavings, remainToFreeShip, onClose, selectedGifts, giftValue } = props;
  const panelRef = useRef(null);
  const [wide, setWide] = useState(false);
  const [compactSummary, setCompactSummary] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  // Section refs
  const baseRef = useRef(null);
  const bundlesRef = useRef(null);
  const giftsRef = useRef(null);
  const reviewsRef = useRef(null);
  const summaryRef = useRef(null);

  // Discount + sign-in state
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountMsg, setDiscountMsg] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  function handleApplyDiscount(){
    const code = discountCode.trim();
    if (!code){ setDiscountMsg("Enter a code"); return; }
    const needSignIn = shouldRequireSignInForDiscount(window.innerWidth) && !signedIn;
    if (needSignIn){ setShowSignIn(true); return; }
    setDiscountApplied(true);
    setDiscountMsg(`Code applied: ${code}`);
  }

  useEffect(() => { panelRef.current && panelRef.current.focus && panelRef.current.focus(); }, []);

  // Auto-tune chrome for short viewports / phones
  useEffect(() => {
    function apply(){
      const h = window.innerHeight || 0;
      const w = window.innerWidth || 0;
      const short = isShortViewport(h);
      const mobile = isMobileWidth(w);
      setCompactSummary(short || mobile);
      setShowQuick(!short && !mobile);
    }
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, []);

  function renderVariantOptions() {
    return PRODUCT.variants.map(function(v){
      return (<option key={v.id} value={v.id}>{v.name}</option>);
    });
  }

  function fmtPrice(p){ return typeof p === 'number' ? `‎SAR ${p}` : 'TBD'; }

  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-labelledby="bundle-title"
      ref={panelRef}
      tabIndex={-1}
      className={`absolute right-0 top-0 h-full w-full ${wide ? 'max-w-[960px]' : 'max-w-[720px]'} bg-[var(--bg-panel)] shadow-[var(--shadow-2)] border-l border-[var(--border)] rounded-l-none sm:rounded-l-[16px] overflow-hidden flex flex-col translate-x-0 will-change-transform transition-[transform,width] duration-200 ease-out`}
    >
      {/* Header */}
      <header className="px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-panel)]">
        <div className="flex items-center justify-between gap-2">
          <h2 id="bundle-title" className="text-[15px] font-semibold">Choose your bundle (best value)</h2>
          <div className="flex items-center gap-2">
            <button onClick={()=>setShowQuick(v=>!v)} aria-expanded={showQuick} className="h-8 px-3 rounded-[10px] border border-[var(--border)] bg-white hover:bg-[var(--bg-elev)] text-[12px]">{showQuick? 'Hide' : 'Quick setup'}</button>
            <button onClick={()=>setWide((w)=>!w)} aria-label="Toggle width" className="h-8 px-3 rounded-[10px] border border-[var(--border)] bg-white hover:bg-[var(--bg-elev)] text-[12px]">{wide ? 'Compact' : 'Expand'}</button>
            <button aria-label="Close" onClick={onClose} className="w-8 h-8 grid place-items-center rounded-[10px] border border-[var(--border)] hover:bg-[var(--bg-elev)]"><span className="text-[18px] leading-none">×</span></button>
          </div>
        </div>

        {/* Quick controls (collapsible) */}
        {showQuick && (
          <>
            <div className="mt-2 grid grid-cols-12 gap-2">
              <div className="col-span-7 sm:col-span-8">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <select aria-label="Variant" value={variant} onChange={(e)=>setVariant(e.target.value)} className="w-full h-11 sm:h-9 rounded-[12px] bg-white border border-[var(--border)] px-3 pr-8 text-[13px] outline-none focus:ring-2 focus:ring-black/5 appearance-none">
                      {renderVariantOptions()}
                    </select>
                    <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#7A7D86" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={()=>setQty(Math.max(1, qty-1))} className="w-11 h-11 sm:w-9 sm:h-9 rounded-[12px] border border-[var(--border)] hover:bg-[var(--bg-elev)]">−</button>
                    <div className="w-12 h-11 sm:w-10 sm:h-9 rounded-[12px] border border-[var(--border)] grid place-items-center text-[13px]">{qty}</div>
                    <button onClick={()=>setQty(qty+1)} className="w-11 h-11 sm:w-9 sm:h-9 rounded-[12px] border border-[var(--border)] hover:bg-[var(--bg-elev)]">+</button>
                  </div>
                </div>
              </div>
              <div className="col-span-5 sm:col-span-4">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={()=>summaryRef.current && summaryRef.current.scrollIntoView({behavior:'smooth'})} className="h-11 sm:h-9 px-3 rounded-[12px] border border-[var(--border)] bg-white hover:bg-[var(--bg-elev)] text-[13px]">Go to summary</button>
                </div>
              </div>
            </div>
            {/* Bundle quick-pick */}
            <div className="mt-2 flex flex-wrap gap-2">
              {BUNDLES.map(function(b){
                const active = selectedBundle === b.id;
                return (
                  <button key={b.id} onClick={()=>setSelectedBundle(active? null : b.id)} className={`h-8 px-3 rounded-[10px] border ${active? 'border-[var(--text-1)] bg-[var(--text-1)] text-white' : 'border-[var(--border)] bg-white hover:bg-[var(--bg-elev)]'} text-[12px]`}>{b.name}{active? ' ✓' : ''}</button>
                );
              })}
            </div>
          </>
        )}

        {/* Quick nav pills */}
        <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar scroll-px-1">
          {[{k:'Bundles',ref:bundlesRef},{k:'Base',ref:baseRef}, {k:'Gifts',ref:giftsRef}, {k:'Reviews',ref:reviewsRef}, {k:'Summary',ref:summaryRef}].map(function(item){
            return (
              <button key={item.k} onClick={()=>item.ref.current && item.ref.current.scrollIntoView({behavior:'smooth', block:'start'})} className="h-9 sm:h-8 px-3 rounded-[10px] border border-[var(--border)] bg-white hover:bg-[var(--bg-elev)] text-[12px] whitespace-nowrap">{item.k}</button>
            );
          })}
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 pb-24 sm:pb-3 bg-[var(--bg-soft)]">
        {/* Bundles (primary) */}
        <section ref={bundlesRef} className="rounded-[14px] border border-[var(--border)] bg-[var(--bg-card)] p-3 mb-3">
          <div className="mb-1.5 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold">Our bundles</h3>
            <div className="text-[12px] text-[var(--text-2)]">Best value picks — save more</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {BUNDLES.map(function(b){
              const active = selectedBundle === b.id;
              return (
                <article key={b.id} className={`rounded-[14px] border ${active ? 'border-[var(--text-1)]' : 'border-[var(--border)]'} bg-[var(--bg-card)] p-3 shadow-[var(--shadow-1)]`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-[14px] font-semibold leading-tight">{b.name}</div>
                      <div className="text-[12px] text-[var(--text-2)]">Value ‎SAR {bundleValue(b)}</div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full border border-[var(--border)] bg-[var(--bg-soft)]">{b.badge}</span>
                  </div>
                  <ul className="text-[13px] text-[var(--text-1)] space-y-1 mb-3 list-disc list-inside">
                    {b.items.map(function(it, i){ return <li key={i}>{it}</li>; })}
                  </ul>
                  <div className="flex items-center justify-between">
                    <div className="text-[14px]"><span className="font-semibold">{fmtPrice(b.price)}</span></div>
                    <button onClick={() => setSelectedBundle(active ? null : b.id)} className={`h-11 sm:h-9 px-3 rounded-[12px] border ${active ? 'bg-[var(--text-1)] text-white border-[var(--text-1)]' : 'bg-white text-[var(--text-1)] border-[var(--border)] hover:bg-[var(--bg-elev)]'}`}>{active ? 'Selected' : 'Choose'}</button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Base product (secondary) */}
        <section ref={baseRef} className="rounded-[14px] border border-[var(--border)] bg-[var(--bg-card)] p-3 mb-3">
          <div className="flex gap-3">
            <div className="w-20 h-20 rounded-[12px] bg-[var(--bg-soft)] border border-[var(--border)]" />
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-medium line-clamp-2">{PRODUCT.name}</div>
              <div className="mt-0.5 text-[14px] flex items-center gap-2">
                <span className="font-semibold">‎SAR {PRODUCT.price}</span>
                <span className="text-[13px] text-[var(--text-2)] line-through">‎SAR {PRODUCT.compareAt}</span>
              </div>
              {/* Variant select */}
              <div className="mt-2">
                <label className="block text-[12px] text-[var(--text-2)] mb-1">Color</label>
                <div className="relative">
                  <select value={variant} onChange={(e) => setVariant(e.target.value)} className="w-full h-12 sm:h-10 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] px-3 pr-10 text-[14px] text-[var(--text-1)] outline-none focus:ring-2 focus:ring-black/5 appearance-none">
                    {renderVariantOptions()}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#7A7D86" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>

              {/* Quantity stepper */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[12px] text-[var(--text-2)]">Quantity</span>
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-11 h-11 sm:w-9 sm:h-9 rounded-[12px] border border-[var(--border)] grid place-items-center hover:bg-[var(--bg-elev)]">−</button>
                  <div className="w-10 h-9 rounded-[12px] border border-[var(--border)] grid place-items-center text-[14px]">{qty}</div>
                  <button onClick={() => setQty(qty + 1)} className="w-11 h-11 sm:w-9 sm:h-9 rounded-[12px] border border-[var(--border)] grid place-items-center hover:bg-[var(--bg-elev)]">+</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gifts (dynamic) */}
        <section ref={giftsRef} className="rounded-[14px] border border-[var(--border)] bg-[var(--bg-elev)] p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[15px] font-semibold">Your free gifts</h3>
            {giftValue > 0 ? (
              <span className="text-[13px] text-[var(--text-2)]">You save ‎SAR {giftValue}</span>
            ) : null}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {!selectedGifts ? (
              <div className="text-[13px] text-[var(--text-2)] p-2">Select a bundle to see your included gifts.</div>
            ) : (
              <>
                {selectedGifts.slice(0,1).map(function(g){ return (
                  <GiftCard key={g.id} hero name={g.name} value={g.value} className="sm:col-span-2" />
                );})}
                {selectedGifts.slice(1).map(function(g){ return (
                  <GiftCard key={g.id} name={g.name} value={g.value} />
                );})}
              </>
            )}
          </div>
        </section>

        {/* Reviews carousel */}
        <section ref={reviewsRef} className="mt-3 rounded-[14px] border border-[var(--border)] bg-[var(--bg-card)] p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold">What customers say</h3>
            <div className="text-[13px] text-[var(--text-2)]">4.8 ★ average</div>
          </div>
          <ReviewsCarousel />
        </section>
      </div>

      {/* Sticky Summary (compactable) */}
      {compactSummary ? (
        <footer ref={summaryRef} className="p-2 pb-[env(safe-area-inset-bottom)] bg-[var(--bg-panel)] border-t border-[var(--border)] shadow-[var(--shadow-1)]">
          <div className="flex items-center gap-2">
            <button onClick={()=>setCompactSummary(false)} aria-label="Expand summary" className="w-9 h-10 rounded-[12px] border border-[var(--border)] bg-white hover:bg-[var(--bg-elev)] grid place-items-center">
              <svg width="16" height="16" viewBox="0 0 24 24"><path d="M8 10l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-[var(--text-2)]">Subtotal</div>
              <div className="text-[15px] font-semibold leading-tight">‎SAR {subtotal}</div>
            </div>
            <button className="h-12 sm:h-10 w-full sm:w-auto px-4 rounded-[12px] bg-[var(--brand)] text-white font-medium shadow-[var(--shadow-2)]">Checkout</button>
          </div>
        </footer>
      ) : (
        <footer ref={summaryRef} className="p-3 pb-[env(safe-area-inset-bottom)] bg-[var(--bg-panel)] border-t border-[var(--border)] shadow-[var(--shadow-1)]">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <TimerBar initialSeconds={21600} />
              <div className="mt-2"><FreeShippingBar remain={remainToFreeShip} threshold={FREE_SHIPPING_THRESHOLD} /></div>

              {/* Discount code */}
              <div className="mt-2 rounded-[12px] border border-[var(--border)] bg-[var(--bg-card)] p-2">
                <label className="block text-[12px] text-[var(--text-2)] mb-1">Discount code</label>
                <div className="flex gap-2">
                  <input value={discountCode} onChange={(e)=>setDiscountCode(e.target.value)} placeholder="Enter code" className="flex-1 h-10 rounded-[12px] bg-white border border-[var(--border)] px-3 text-[14px] outline-none focus:ring-2 focus:ring-black/5" />
                  <button onClick={handleApplyDiscount} className="h-10 px-3 rounded-[12px] bg-[var(--text-1)] text-white font-medium hover:opacity-95">Apply</button>
                </div>
                {discountMsg && (<div className={`mt-1 text-[12px] ${discountApplied ? 'text-[var(--ok)]' : 'text-[var(--text-2)]'}`}>{discountMsg}</div>)}
              </div>

              <div className="mt-2 text-[12px] text-[var(--text-2)]">Riyadh 1–2 d • KSA 2–4 d • VAT incl. • COD available</div>
              <div className="mt-2 flex items-center gap-2 opacity-80">
                <PayBadge label="Mada" />
                <PayBadge label="Apple Pay" />
                <PayBadge label="STC Pay" />
                <PayBadge label="Visa" />
                <PayBadge label="Mastercard" />
              </div>
            </div>
            <div className="w-[260px] shrink-0">
              <div className="mb-2 flex items-center justify-end">
                <button onClick={()=>setCompactSummary(true)} aria-label="Compact summary" className="w-9 h-10 rounded-[12px] border border-[var(--border)] bg-white hover:bg-[var(--bg-elev)] grid place-items-center">
                  <svg width="16" height="16" viewBox="0 0 24 24"><path d="M16 14l-4-4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                </button>
              </div>
              <div className="mb-2 flex items-center justify-between text-[13px]">
                <span className="text-[var(--text-2)]">Subtotal</span>
                <span className="font-semibold">‎SAR {subtotal}</span>
              </div>
              <div className="mb-2 flex items-center justify-between text-[13px]">
                <span className="text-[var(--text-2)]">Bundle savings</span>
                <span className="font-semibold text-[var(--ok)]">‎SAR {bundleSavings}</span>
              </div>
              <button className="w-full h-14 sm:h-12 rounded-[14px] bg-[var(--brand)] text-white font-medium tracking-[-0.01em] shadow-[var(--shadow-2)] hover:opacity-95 active:opacity-90">Complete — ‎SAR {subtotal}</button>
              <button onClick={onClose} className="mt-2 w-full h-10 rounded-[14px] bg-transparent text-[var(--text-1)] border border-[var(--border)] hover:bg-[var(--bg-elev)]">Keep browsing</button>
            </div>
          </div>
        </footer>
      )}

      {showSignIn && (
        <MobileSignInSheet
          onClose={()=>setShowSignIn(false)}
          onSuccess={()=>{ setSignedIn(true); setShowSignIn(false); setDiscountApplied(true); setDiscountMsg(`Code applied: ${discountCode.trim()}`); }}
        />
      )}
    </aside>
  );
}

function GiftCard({ hero = false, name, value, className = "" }) {
  return (
    <article className={`rounded-[14px] bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden ${className}`}>
      <div className={`aspect-square bg-[var(--bg-soft)]`} />
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[12px] px-2 py-0.5 rounded-full border border-[var(--border)] bg-[var(--bg-soft)]">Included gift</span>
          <span className="text-[12px] text-[var(--ok)] font-medium">FREE</span>
        </div>
        <div className="text-[14px] font-medium line-clamp-2">{name}</div>
        {typeof value === 'number' ? (
          <div className="text-[13px] text-[var(--text-2)] line-through">‎SAR {value}</div>
        ) : null}
      </div>
    </article>
  );
}

function TimerBar({ initialSeconds = 21600 }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => tickDown(s, initialSeconds)), 1000);
    return () => clearInterval(id);
  }, [initialSeconds]);
  const fmt = formatHMS(seconds);
  return (
    <div className="rounded-[12px] border border-[var(--border)] bg-[var(--bg-card)] p-3 flex items-center justify-between">
      <span className="text-[13px] text-[var(--text-2)]">Limited‑time bundle ends in</span>
      <span className="font-semibold tracking-wider tabular-nums">{fmt}</span>
    </div>
  );
}

function FreeShippingBar({ remain, threshold }) {
  const progress = calcProgress(remain, threshold);
  return (
    <div className="rounded-[12px] border border-[var(--border)] bg-[var(--bg-elev)] p-3">
      {remain > 0 ? (
        <div className="text-[13px] mb-2 flex items-center justify-between">
          <span>‎SAR {remain} to Free Shipping</span>
          <span className="text-[var(--text-2)]">{progress}%</span>
        </div>
      ) : (
        <div className="text-[13px] mb-2 text-[var(--ok)] font-medium">You unlocked Free Shipping</div>
      )}
      <div className="h-2 rounded-full bg-[#EDEEF0] overflow-hidden">
        <div className="h-full bg-[var(--text-1)]" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function PayBadge({ label }) {
  return (<div className="h-6 px-2 rounded-[8px] border border-[var(--border)] bg-[var(--bg-soft)] text-[12px] grid place-items-center">{label}</div>);
}

function MobileSignInSheet({ onClose, onSuccess }){
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState("phone");
  return (
    <div className="fixed inset-0 z-50">
      <div onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-x-0 bottom-0 bg-[var(--bg-card)] border-t border-[var(--border)] rounded-t-[16px] shadow-[var(--shadow-2)] p-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
        <div className="mx-auto h-1 w-10 rounded-full bg-[var(--border)] mb-3" />
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[15px] font-semibold">Sign in to use discounts</h4>
          <button aria-label="Close" onClick={onClose} className="w-8 h-8 grid place-items-center rounded-[10px] border border-[var(--border)]">×</button>
        </div>
        {stage === 'phone' ? (
          <div>
            <label className="block text-[13px] text-[var(--text-2)] mb-1">Mobile number (KSA)</label>
            <div className="flex gap-2">
              <div className="h-11 grid place-items-center px-3 rounded-[12px] border border-[var(--border)] bg-[var(--bg-card)] text-[14px]">+966</div>
              <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="5X XXX XXXX" className="flex-1 h-11 rounded-[12px] bg-white border border-[var(--border)] px-3 text-[14px] outline-none focus:ring-2 focus:ring-black/5" />
            </div>
            <button onClick={()=>setStage('code')} className="mt-3 w-full h-12 rounded-[12px] bg-[var(--text-1)] text-white font-medium">Send code</button>
          </div>
        ) : (
          <div>
            <label className="block text-[13px] text-[var(--text-2)] mb-1">Enter verification code</label>
            <input value={code} onChange={(e)=>setCode(e.target.value)} placeholder="6-digit code" className="w-full h-11 rounded-[12px] bg-white border border-[var(--border)] px-3 text-[14px] outline-none focus:ring-2 focus:ring-black/5" />
            <button onClick={onSuccess} className="mt-3 w-full h-12 rounded-[12px] bg-[var(--text-1)] text-white font-medium">Verify & apply</button>
          </div>
        )}
        <p className="mt-2 text-[12px] text-[var(--text-2)]">By continuing you agree to our Terms & Privacy.</p>
      </div>
    </div>
  );
}

// ---- Reviews Carousel ----
const REVIEWS = [
  { id: "r1", name: "Noura A.", rating: 5, text: "Sleek and practical. The MagSafe is a game changer at the gym.", date: "2025-08-12" },
  { id: "r2", name: "Abdulrahman", rating: 5, text: "Water stays cold the whole day. Build quality feels premium.", date: "2025-07-28" },
  { id: "r3", name: "Maha", rating: 4, text: "Love the matte finish. Would like more color options.", date: "2025-07-04" },
  { id: "r4", name: "Faisal", rating: 5, text: "Perfect size for long sessions. Phone holder is super useful.", date: "2025-06-19" },
  { id: "r5", name: "Sara", rating: 5, text: "Got it as a gift—now I bring it everywhere.", date: "2025-06-01" },
];

function Star({ filled }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" className={filled ? "fill-[var(--text-1)]" : "fill-none"}>
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" stroke="var(--text-1)" strokeWidth="1" />
    </svg>
  );
}

function ReviewCard({ r }) {
  return (
    <article className="min-w-[80%] sm:min-w-[260px] max-w-[320px] snap-center shrink-0 rounded-[14px] border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-1)]">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[14px] font-semibold truncate mr-3">{r.name}</div>
        <div className="text-[12px] text-[var(--text-2)]">{new Date(r.date).toLocaleDateString()}</div>
      </div>
      <div className="flex items-center gap-1 mb-2">
        {Array.from({ length: 5 }).map(function(_, i){ return <Star key={i} filled={i < r.rating} />; })}
      </div>
      <p className="text-[14px] text-[var(--text-1)] leading-6 line-clamp-4">{r.text}</p>
    </article>
  );
}

function ReviewsCarousel() {
  const trackRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const autoRef = useRef(null);

  useEffect(() => {
    autoRef.current = window.setInterval(() => move(1), 4000);
    return () => { if (autoRef.current) window.clearInterval(autoRef.current); };
  }, [idx]);

  function move(step) {
    const el = trackRef.current; if (!el) return;
    const next = wrapIndex(idx + step, REVIEWS.length);
    setIdx(next);
    const child = el.children[next];
    if (!child) return;
    // Center the child within the horizontal scroller WITHOUT affecting parent scroll
    const left = computeCenterScrollLeft(el.clientWidth, child.offsetLeft, child.clientWidth);
    try { el.scrollTo({ left, behavior: 'smooth' }); } catch { el.scrollLeft = left; }
  }

  useEffect(() => {
    const el = trackRef.current; if (!el) return;
    let startX = 0; let dx = 0; let isDown = false;
    function down(e){ isDown = true; startX = e.clientX; el.setPointerCapture && el.setPointerCapture(e.pointerId); }
    function movePtr(e){ if(!isDown) return; dx = e.clientX - startX; }
    function up(e){ if(!isDown) return; isDown = false; if(Math.abs(dx) > 40){ move(dx < 0 ? 1 : -1); } dx = 0; try{ el.releasePointerCapture && el.releasePointerCapture(e.pointerId); } catch(_){} }
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', movePtr); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    return () => { el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', movePtr); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); };
  }, []);

  return (
    <div className="relative">
      <div ref={trackRef} className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-1 py-1 overscroll-contain">
        {REVIEWS.map(function(r){ return <ReviewCard key={r.id} r={r} />; })}
      </div>
      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none">
        <button onClick={() => move(-1)} aria-label="Previous" className="pointer-events-auto ml-[-4px] w-9 h-9 grid place-items-center rounded-[12px] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-1)] hover:bg-[var(--bg-elev)]">
          <svg width="16" height="16" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
        </button>
        <button onClick={() => move(1)} aria-label="Next" className="pointer-events-auto mr-[-4px] w-9 h-9 grid place-items-center rounded-[12px] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-1)] hover:bg-[var(--bg-elev)]">
          <svg width="16" height="16" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
        </button>
      </div>
      <div className="mt-3 flex items-center justify-center gap-1.5">
        {REVIEWS.map(function(_, i){ return (<span key={i} className={`h-1.5 rounded-full transition-all ${i===idx? 'w-6 bg-[var(--text-1)]' : 'w-2 bg-[var(--border)]'}`}></span>); })}
      </div>
    </div>
  );
}

// ===== Lightweight test cases (moved into a callable function; no top-level code) =====
function runUiHelperTests(){
  try {
    console.group("UI helper tests");
    // formatHMS
    console.assert(formatHMS(21600) === "06:00:00", "formatHMS: 6h should be 06:00:00");
    console.assert(formatHMS(0) === "00:00:00", "formatHMS: 0 should be 00:00:00");
    console.assert(formatHMS(3661) === "01:01:01", "formatHMS: 3661 should be 01:01:01");
    console.assert(formatHMS(-5) === "00:00:00", "formatHMS: negative clamps to 00:00:00");
    console.assert(formatHMS(86399) === "23:59:59", "formatHMS: end-of-day edge");

    // tickDown auto-reset
    console.assert(tickDown(10, 6) === 9, "tickDown: decrements when >0");
    console.assert(tickDown(0, 6) === 6, "tickDown: resets to initial at zero");
    console.assert(tickDown(-1, 6) === 6, "tickDown: negative treated as reset");

    // calcProgress
    console.assert(calcProgress(300, 300) === 0, "calcProgress: full remain => 0% ");
    console.assert(calcProgress(150, 300) === 50, "calcProgress: half remain => 50% ");
    console.assert(calcProgress(0, 300) === 100, "calcProgress: zero remain => 100% ");
    console.assert(calcProgress(-10, 300) === 100, "calcProgress: over threshold => 100% ");

    // sign-in rule
    console.assert(shouldRequireSignInForDiscount(320) === true, "sign-in: mobile width should require");
    console.assert(shouldRequireSignInForDiscount(640) === false, "sign-in: sm and above should not require");

    // wrapIndex
    console.assert(wrapIndex(1, 5) === 1, "wrapIndex: positive index");
    console.assert(wrapIndex(-1, 5) === 4, "wrapIndex: negative wraps to end");
    console.assert(wrapIndex(7, 5) === 2, "wrapIndex: overflow wraps correctly");

    // viewport helpers
    console.assert(isShortViewport(500) === true, "isShortViewport: 500 is short");
    console.assert(isShortViewport(800) === false, "isShortViewport: 800 is not short");
    console.assert(isMobileWidth(375) === true, "isMobileWidth: 375 is mobile");
    console.assert(isMobileWidth(768) === false, "isMobileWidth: 768 is not mobile");

    // centering calc
    console.assert(computeCenterScrollLeft(300, 0, 100) === 0, "center calc: clamp to 0 at start");
    console.assert(computeCenterScrollLeft(300, 150, 100) === 100, "center calc: centered value");

    // bundleValue: value = paid jugs at MSRP + gifts at MSRP
    const starter = BUNDLES.find(b=>b.id==='starter');
    const friends = BUNDLES.find(b=>b.id==='friends');
    const family = BUNDLES.find(b=>b.id==='family');
    console.assert(bundleValue(starter) === 507, "bundleValue(starter) should be 507");
    console.assert(bundleValue(friends) === 1124, "bundleValue(friends) should be 1124");
    console.assert(bundleValue(family) === 1901, "bundleValue(family) should be 1901");

    // extra robustness
    console.assert(bundleValue(undefined) === 0, "bundleValue: undefined -> 0");
    console.assert(bundleValue({}) === 0, "bundleValue: empty object -> 0");
    console.assert(bundleValue({ jugCount: 0, gifts: [] }) === 0, "bundleValue: zero everything -> 0");

    console.log("All tests passed ✔");
  } catch (e) {
    console.error("Test failure:", e);
  } finally {
    console.groupEnd();
  }
}
