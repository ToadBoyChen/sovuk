import type { Metadata } from "next";
import Button from "@/components/ui/Button";
import DotText from "@/components/ui/DotText";
import Eyebrow from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Page not found",
};

/** Full-height 404: the dot "404" fills the screen above a short message, like the hero. */
export default function NotFound() {
  return (
    <section className="flex min-h-svh flex-col pt-20">
      <div className="shell flex flex-1 flex-col">
        {/* Dot stage: the digits fit whatever space is left above the message. */}
        <div className="relative my-6 min-h-56 flex-1">
          <DotText
            text="404"
            cols={64}
            rows={24}
            label="404 — click to scatter the dots"
            className="absolute inset-0"
          />
        </div>

        <div className="grid gap-8 border-t border-ink py-8 md:grid-cols-12 md:items-end md:py-10">
          <div className="md:col-span-7">
            <Eyebrow>Page not found</Eyebrow>
            <h1 className="mt-5 text-4xl font-medium leading-[1.05] tracking-[-0.035em] text-balance md:text-6xl">
              This page isn&apos;t on our map — yet<span className="text-signal">.</span>
            </h1>
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <p className="text-lg leading-relaxed text-ink/70 md:text-xl">
              The link may be old, or the page may have moved.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/">Back to home</Button>
              <Button href="/research" variant="secondary">
                Research
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
