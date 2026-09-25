import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { brand } from "@/lib/brand";

/**
 * Link-preview cards (Teams, Slack, email, LinkedIn…), rendered at build
 * time by the opengraph-image files. One house style: white, a red rule
 * with a blue label, a large title ending in a red full stop, and the
 * glyph with the site's name and address along the bottom.
 */

export const ogSize = { width: 1200, height: 630 };

const INK = "#0a0a0a";
const BLUE = "#1a3ccf";
const RED = "#d42a3a";
const MUTED = "#6b6b6b";

const glyph = `data:image/png;base64,${readFileSync(path.join(process.cwd(), "public", brand.glyphSrc)).toString("base64")}`;

/** The site's font (Outfit, SIL Open Font License — see assets/fonts/OFL.txt), read at build time. */
const outfit = readFileSync(path.join(process.cwd(), "assets/fonts/Outfit-Medium.ttf"));

export function ogImage({ label, title, detail }: { label: string; title: string; detail?: string }) {
  const long = title.length > 60;
  const words = title.replace(/[.?!]$/, "").split(" ");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: "72px 80px",
          color: INK,
          fontFamily: "Outfit",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 30, color: BLUE }}>
            <div style={{ width: 56, height: 5, background: RED }} />
            {label}
          </div>
          {/* Word by word, so the red full stop sits right after the last word. */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              marginTop: 40,
              fontSize: long ? 64 : 80,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              maxWidth: 1000,
            }}
          >
            {words.map((word, i) => (
              <div key={i} style={{ display: "flex", marginRight: "0.24em" }}>
                {word}
                {i === words.length - 1 && <span style={{ color: RED }}>.</span>}
              </div>
            ))}
          </div>
          {detail && <div style={{ display: "flex", marginTop: 28, fontSize: 30, color: MUTED }}>{detail}</div>}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `2px solid ${INK}`,
            paddingTop: 28,
            fontSize: 28,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontWeight: 600 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- rendered to PNG, not the DOM */}
            <img src={glyph} width={48} height={48} alt="" />
            {brand.name}
          </div>
          <div style={{ display: "flex", color: MUTED }}>{brand.url.replace("https://", "")}</div>
        </div>
      </div>
    ),
    { ...ogSize, fonts: [{ name: "Outfit", data: outfit, weight: 500, style: "normal" }] }
  );
}
