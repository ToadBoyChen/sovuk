"use client";

import { useState } from "react";
import { audiences } from "@/content/contact";
import { brand } from "@/lib/brand";

const FIELD =
  "mt-2 w-full border-b-2 border-line bg-transparent py-3 text-xl outline-none transition-colors placeholder:text-ink/25 focus:border-sovereign";

/**
 * Contact form. There's no mail backend yet, so sending opens the visitor's
 * email app with the message addressed and filled in.
 */
function ContactForm() {
  const [topic, setTopic] = useState<string>(audiences[0].title);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const get = (k: string) => String(form.get(k) ?? "").trim();
    const org = get("organisation");
    const body = [
      get("message"),
      "",
      "—",
      get("name"),
      org,
      get("email"),
    ]
      .filter((line, i) => i < 3 || line)
      .join("\n");
    const subject = `${topic}: ${get("name")}${org ? ` (${org})` : ""}`;
    window.location.href = `mailto:${brand.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-10">
      <fieldset>
        <legend className="text-lg font-medium">I&apos;m getting in touch as…</legend>
        <div className="mt-4 flex flex-wrap gap-2">
          {audiences.map((a) => (
            <label
              key={a.title}
              className={`cursor-pointer border px-4 py-2 text-base font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sovereign ${
                topic === a.title ? "border-sovereign bg-sovereign text-paper" : "border-line hover:border-ink"
              }`}
            >
              <input
                type="radio"
                name="topic"
                value={a.title}
                checked={topic === a.title}
                onChange={() => setTopic(a.title)}
                className="sr-only"
              />
              {a.title}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-10 md:grid-cols-2">
        <label className="block text-lg font-medium">
          Name
          <input name="name" required autoComplete="name" className={FIELD} placeholder="Your name" />
        </label>
        <label className="block text-lg font-medium">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={FIELD}
            placeholder="you@example.co.uk"
          />
        </label>
      </div>

      <label className="block text-lg font-medium">
        Organisation <span className="font-normal text-muted">(optional)</span>
        <input name="organisation" autoComplete="organization" className={FIELD} placeholder="Where you work" />
      </label>

      <label className="block text-lg font-medium">
        Message
        <textarea
          name="message"
          required
          rows={5}
          className={`${FIELD} resize-y`}
          placeholder="What would you like to talk about?"
        />
      </label>

      <div className="flex flex-wrap items-center gap-6">
        <button
          type="submit"
          className="group inline-flex items-center gap-3 bg-sovereign px-7 py-4 text-lg font-medium text-paper transition-colors duration-300 hover:bg-ink"
        >
          Send message
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </button>
        <p className="text-base text-muted">Opens your email app, addressed to {brand.email}.</p>
      </div>
    </form>
  );
}

export default ContactForm;
