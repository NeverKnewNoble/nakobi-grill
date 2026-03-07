import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="/emerson-vieira-RO6Ke69Szhg-unsplash.jpg"
        alt="Nakobi Grill - meat sizzling on a charcoal grill"
        fill
        priority
        className="object-cover object-center"
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/50 to-black/80" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        {/* Badge */}
        <span className="mb-6 inline-block rounded-full border border-orange-400/60 bg-orange-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-orange-300">
          Point of Sale System
        </span>

        {/* Brand name */}
        <h1 className="mb-4 text-6xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-7xl lg:text-8xl">
          Nakobi{" "}
          <span className="text-orange-400">Grill</span>
        </h1>

        {/* Tagline */}
        <p className="mb-6 max-w-xl text-lg font-light leading-relaxed text-zinc-300 sm:text-xl">
          Authentic flavors, seamless service. Manage orders, tables, and
          payments — all from one place.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/login">
            <button className="rounded-full bg-orange-500 px-10 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:bg-orange-400 hover:shadow-orange-400/40 active:scale-95">
              Get Started
            </button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="absolute bottom-12 flex gap-12 text-center">
          <div>
            <p className="text-2xl font-bold text-orange-400">48</p>
            <p className="text-xs uppercase tracking-widest text-zinc-400">Tables</p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className="text-2xl font-bold text-orange-400">120+</p>
            <p className="text-xs uppercase tracking-widest text-zinc-400">Menu Items</p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className="text-2xl font-bold text-orange-400">Live</p>
            <p className="text-xs uppercase tracking-widest text-zinc-400">Orders</p>
          </div>
        </div>
      </div>
    </section>
  );
}
