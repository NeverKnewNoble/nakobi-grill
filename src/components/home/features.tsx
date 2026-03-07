import { ClipboardList, LayoutGrid, CreditCard, BarChart3, ShoppingCart, Package } from "lucide-react";

const features = [
  {
    icon: <ClipboardList className="h-7 w-7" />,
    title: "Smart Order Management",
    description:
      "Take dine-in, takeaway, and delivery orders from a single intuitive interface. Split bills, modify items, and apply discounts instantly.",
  },
  {
    icon: <LayoutGrid className="h-7 w-7" />,
    title: "Table Management",
    description:
      "Live floor map view of every table — available, occupied, or reserved. Seat guests, merge tables, and track turn times effortlessly.",
  },
  {
    icon: <CreditCard className="h-7 w-7" />,
    title: "Fast Checkout & Payments",
    description:
      "Accept cash, card, mobile pay, and QR in seconds. Auto-generate receipts and daily settlement reports with zero manual effort.",
  },
  {
    icon: <BarChart3 className="h-7 w-7" />,
    title: "Real-Time Analytics",
    description:
      "Track revenue, best-selling dishes, peak hours, and staff performance on a live dashboard. Make data-driven decisions every shift.",
  },
  {
    icon: <ShoppingCart className="h-7 w-7" />,
    title: "Kitchen Display System",
    description:
      "Orders fire straight to the kitchen screen the moment they're placed. Reduce errors and speed up service with colour-coded ticket queues.",
  },
  {
    icon: <Package className="h-7 w-7" />,
    title: "Inventory Tracking",
    description:
      "Monitor stock levels in real time. Get low-stock alerts, track ingredient usage per dish, and cut food waste with smart reorder suggestions.",
  },
];

export default function Features() {
  return (
    <section className="bg-zinc-950 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <span className="mb-3 inline-block rounded-full border border-orange-500/40 bg-orange-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-orange-400">
            Why Nakobi POS
          </span>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Everything you need,{" "}
            <span className="text-orange-400">nothing you don&apos;t</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
            Built specifically for high-volume grill restaurants. From the first
            seat to the final receipt, Nakobi POS keeps your kitchen and floor
            in perfect sync.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-white/5 bg-white/5 p-6 transition-all hover:border-orange-500/30 hover:bg-white/6"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 transition-colors group-hover:bg-orange-500/20">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-base font-semibold text-white">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
