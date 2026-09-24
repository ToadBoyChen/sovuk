"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Glyph from "@/components/Glyph";
import { brand, navLinks } from "@/lib/brand";

/** Fired by the ⌘K hint; the command palette listens for it. */
export const OPEN_PALETTE_EVENT = "open-command-palette";

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300 ${
        scrolled || open
          ? "border-b border-line bg-paper/95"
          : "border-b border-transparent"
      }`}
    >
      <nav
        aria-label="Primary"
        className={`shell flex items-center justify-between transition-[height] duration-300 ${
          scrolled ? "h-16" : "h-20"
        }`}
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 text-xl font-semibold tracking-tight"
          onClick={() => setOpen(false)}
        >
          <span aria-hidden className="size-9">
            <Glyph src={brand.glyphSrc} resolution={18} repel={0} flips={0} flickerMs={0} className="size-full" />
          </span>
          {brand.shortName}
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base text-ink/70 transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
            className="flex items-center gap-2 text-base text-muted transition-colors hover:text-ink"
            aria-label="Open command palette"
          >
            Search
            <kbd className="font-sans text-ink/40">⌘K</kbd>
          </button>
        </div>

        <button
          type="button"
          className="relative size-10 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className={`absolute left-2 right-2 h-px bg-ink transition-transform duration-300 ${
              open ? "top-1/2 rotate-45" : "top-[40%]"
            }`}
          />
          <span
            className={`absolute left-2 right-2 h-px bg-ink transition-transform duration-300 ${
              open ? "top-1/2 -rotate-45" : "top-[60%]"
            }`}
          />
        </button>
      </nav>

      {/* Mobile sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 top-20 bg-paper transition-[opacity,visibility] duration-300 md:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <ul className="shell flex flex-col pt-8">
          {navLinks.map((link) => (
            <li key={link.href} className="border-b border-line">
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-baseline justify-between py-5 text-5xl font-medium tracking-tight"
              >
                {link.label}
                <span aria-hidden className="text-2xl text-sovereign">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

export default Nav;
