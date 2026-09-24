"use client";

import { useEffect, useState } from "react";

const format = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZoneName: "short",
});

/** Live London time, e.g. "14:03:27 BST". Renders a placeholder until mounted. */
function LondonClock() {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setNow(format.format(new Date()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <time suppressHydrationWarning className="tabular-nums">
      {now ?? "--:--:-- ---"}
    </time>
  );
}

export default LondonClock;
