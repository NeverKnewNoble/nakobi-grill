const quickLinks = ["Dashboard", "New Order", "Table Map", "Menu", "Reports", "Settings"];
const support = ["Help Center", "Contact Support", "System Status", "Privacy Policy", "Terms of Use"];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-zinc-950 px-6 pt-16 pb-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-base font-extrabold text-white">
                N
              </span>
              <span className="text-lg font-extrabold tracking-tight text-white">
                Nakobi <span className="text-orange-400">Grill</span>
              </span>
            </div>
            <p className="mb-5 text-sm leading-relaxed text-zinc-500">
              Authentic flavors, seamless service. Your all-in-one POS for
              modern restaurant management.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              {["facebook", "instagram", "twitter"].map((platform) => (
                <a
                  key={platform}
                  href="#"
                  aria-label={platform}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-zinc-500 transition-colors hover:border-orange-500/40 hover:text-orange-400"
                >
                  {platform === "facebook" && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  )}
                  {platform === "instagram" && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                    </svg>
                  )}
                  {platform === "twitter" && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-5 text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-zinc-500 transition-colors hover:text-orange-400"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-5 text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Support
            </h4>
            <ul className="space-y-3">
              {support.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-zinc-500 transition-colors hover:text-orange-400"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="mb-5 text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Opening Hours
            </h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li className="flex justify-between gap-4">
                <span>Monday – Friday</span>
                <span className="text-zinc-300">11am – 11pm</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Saturday</span>
                <span className="text-zinc-300">10am – 12am</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Sunday</span>
                <span className="text-zinc-300">12pm – 10pm</span>
              </li>
            </ul>
            <div className="mt-6 rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 py-3">
              <p className="text-xs text-zinc-400">
                <span className="font-semibold text-orange-400">Call us:</span>{" "}
                +233 20 000 0000
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                <span className="font-semibold text-orange-400">Email:</span>{" "}
                hello@nakobigrill.com
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} Nakobi Grill. All rights reserved.
          </p>
          <p className="text-xs text-zinc-600">
            POS v1.0 &nbsp;·&nbsp; Built with Next.js &amp; Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
